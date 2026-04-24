import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  INITIAL_PROJECTS,
  INITIAL_CAMPAIGNS,
  TIMELINE_ROWS,
  CALENDAR_EVENTS,
  SYSTEM_PROMPT,
} from './data.js'

const REFRESH_MS = Number(import.meta.env.VITE_WEBHOOK_POLL_MS || 24 * 60 * 60 * 1000)

function normalizeName(name) {
  return String(name || '').trim().toLowerCase()
}

function logDeletedProject(project, deletedBy) {
  return {
    id: Date.now() + Math.random(),
    deletedAt: new Date().toISOString(),
    deletedBy,
    project,
  }
}

function sanitizeProjects(projects) {
  if (!Array.isArray(projects)) return INITIAL_PROJECTS
  return projects.map((p, idx) => ({
    id: p.id ?? Date.now() + idx,
    name: p.name ?? `Project ${idx + 1}`,
    color: p.color ?? '#185FA5',
    status: p.status ?? 'todo',
    prog: Number.isFinite(p.prog) ? p.prog : 0,
    next: p.next ?? '',
    due: p.due ?? 'TBD',
    subtasks: Array.isArray(p.subtasks)
      ? p.subtasks.map((s, sIdx) => ({
        id: s.id ?? Date.now() + sIdx,
        title: s.title ?? `Subtask ${sIdx + 1}`,
        status: s.status === 'done' ? 'done' : 'todo',
      }))
      : [],
  }))
}

function hasProjectChanged(existingProject, incomingProject) {
  const a = JSON.stringify({
    name: existingProject.name,
    color: existingProject.color,
    status: existingProject.status,
    prog: existingProject.prog,
    next: existingProject.next,
    due: existingProject.due,
    subtasks: existingProject.subtasks || [],
  })
  const b = JSON.stringify({
    name: incomingProject.name,
    color: incomingProject.color,
    status: incomingProject.status,
    prog: incomingProject.prog,
    next: incomingProject.next,
    due: incomingProject.due,
    subtasks: incomingProject.subtasks || [],
  })
  return a !== b
}

function reconcileProjectsFromWebhook(existingProjects, incomingProjects) {
  const existing = Array.isArray(existingProjects) ? existingProjects : []
  const incoming = Array.isArray(incomingProjects) ? incomingProjects : []
  const existingByName = new Map(existing.map((project) => [normalizeName(project.name), project]))
  const incomingByName = new Map(incoming.map((project) => [normalizeName(project.name), project]))

  const nextProjects = []
  const deletedLogs = []

  incoming.forEach((incomingProject) => {
    const key = normalizeName(incomingProject.name)
    const existingProject = existingByName.get(key)

    if (existingProject && hasProjectChanged(existingProject, incomingProject)) {
      deletedLogs.push(logDeletedProject(existingProject, 'api'))
    }

    nextProjects.push(existingProject ? { ...incomingProject, id: existingProject.id } : incomingProject)
  })

  existing.forEach((existingProject) => {
    const key = normalizeName(existingProject.name)
    if (!incomingByName.has(key)) {
      deletedLogs.push(logDeletedProject(existingProject, 'api'))
    }
  })

  return { nextProjects, deletedLogs }
}

function sanitizeCampaigns(campaigns) {
  if (!Array.isArray(campaigns)) return INITIAL_CAMPAIGNS
  return campaigns.map((c, cIdx) => ({
    id: c.id ?? Date.now() + cIdx,
    name: c.name ?? `Campaign ${cIdx + 1}`,
    tasks: Array.isArray(c.tasks) ? c.tasks.map((t, tIdx) => ({
      id: t.id ?? Date.now() + tIdx,
      title: t.title ?? `Task ${tIdx + 1}`,
      status: t.status ?? 'todo',
      notes: t.notes ?? '',
      date: t.date ?? '',
    })) : [],
  }))
}

function sanitizeTimelineRows(rows) {
  if (!Array.isArray(rows)) return TIMELINE_ROWS
  return rows.map((r, idx) => ({
    name: r.name ?? `Item ${idx + 1}`,
    color: r.color ?? '#185FA5',
    l: Number.isFinite(r.l) ? r.l : 0,
    w: Number.isFinite(r.w) ? r.w : 20,
  }))
}

function sanitizeCalendarEvents(events) {
  if (!Array.isArray(events)) return CALENDAR_EVENTS
  return events.map((e, idx) => ({
    day: Number.isFinite(e.day) ? e.day : 1,
    color: e.color ?? 'var(--bluetx)',
    dc: e.dc ?? 'TBD',
    label: e.label ?? `Event ${idx + 1}`,
    sub: e.sub ?? '',
  }))
}

const fallbackData = {
  projects: INITIAL_PROJECTS,
  deletedProjects: [],
  campaigns: INITIAL_CAMPAIGNS,
  timelineRows: TIMELINE_ROWS,
  calendarEvents: CALENDAR_EVENTS,
  systemPrompt: SYSTEM_PROMPT,
}

export function useLiveData() {
  const [data, setData] = useState(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastSync, setLastSync] = useState(null)

  const endpoint = useMemo(() => import.meta.env.VITE_WEBHOOK_URL || '', [])

  const fetchData = useCallback(async () => {
    if (!endpoint) {
      setLoading(false)
      setError('VITE_WEBHOOK_URL is not configured.')
      return
    }

    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Webhook request failed (${res.status})`)

      const payload = await res.json()
      const hasProjects = Array.isArray(payload.projects)
      const incomingProjects = hasProjects ? sanitizeProjects(payload.projects) : []
      setData((prev) => ({
        ...(() => {
          if (!hasProjects) {
            return {
              projects: prev.projects,
              deletedProjects: prev.deletedProjects || [],
            }
          }
          const { nextProjects, deletedLogs } = reconcileProjectsFromWebhook(prev.projects, incomingProjects)
          return {
            projects: nextProjects,
            deletedProjects: [...(prev.deletedProjects || []), ...deletedLogs],
          }
        })(),
        campaigns: sanitizeCampaigns(payload.campaigns),
        timelineRows: sanitizeTimelineRows(payload.timelineRows),
        calendarEvents: sanitizeCalendarEvents(payload.calendarEvents),
        systemPrompt: payload.systemPrompt || SYSTEM_PROMPT,
      }))
      setError('')
      setLastSync(new Date())
    } catch (err) {
      setError(err.message || 'Failed to sync from webhook.')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    let timer = null
    fetchData()
    timer = window.setInterval(fetchData, REFRESH_MS)
    return () => {
      if (timer) window.clearInterval(timer)
    }
  }, [fetchData])

  return { data, setData, loading, error, lastSync, refresh: fetchData }
}
