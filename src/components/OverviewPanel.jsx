import { useEffect, useMemo, useRef, useState } from 'react'
import Badge from './Badge.jsx'
import ProjectDrawer from './ProjectDrawer.jsx'
import { STATUSES, STATUS_TAG, STATUS_ORDER, COLORS_POOL } from '../data.js'

function MetricCard({ label, value, color, sub }) {
  return (
    <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, color: 'var(--tx2)', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-.5px', lineHeight: 1, marginBottom: 3, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--tx3)', lineHeight: 1.4 }}>{sub}</div>
    </div>
  )
}

function ProgressBar({ prog, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden', width: 72, flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${prog}%`, background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{prog}%</span>
    </div>
  )
}

const RABtn = ({ onClick, danger, children }) => {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px',
        borderRadius: 6, fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
        fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all .15s',
        border: hov && danger ? '0.5px solid var(--red)' : '0.5px solid var(--bd)',
        background: hov ? (danger ? 'var(--redbg)' : 'var(--bg3)') : 'var(--bg)',
        color: hov && danger ? 'var(--red)' : 'var(--tx2)',
      }}
    >{children}</button>
  )
}

export default function OverviewPanel({ projects, setProjects, onDeleteProject, onUpsertProject }) {
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [deletingId, setDeletingId]   = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [thisWeekOnly, setThisWeekOnly] = useState(false)
  const [sortBy, setSortBy] = useState('project')
  const [sortDir, setSortDir] = useState('asc')
  const [openStatusMenuId, setOpenStatusMenuId] = useState(null)
  const [expandedProjectIds, setExpandedProjectIds] = useState([])
  const statusMenuRef = useRef(null)

  const openAdd  = () => { setEditProject(null); setDrawerOpen(true) }
  const openEdit = (p) => { setEditProject(p); setDrawerOpen(true) }
  const closeDrawer = () => { setDrawerOpen(false); setEditProject(null) }

  const handleSave = (data) => {
    if (editProject) {
      const updatedProject = { ...editProject, ...data, subtasks: editProject.subtasks || [] }
      setProjects(prev => prev.map(p => p.id === editProject.id ? updatedProject : p))
      if (onUpsertProject) onUpsertProject(updatedProject)
    } else {
      const color = COLORS_POOL[projects.length % COLORS_POOL.length]
      const newProject = { id: Date.now(), color, subtasks: [], ...data }
      setProjects(prev => [...prev, newProject])
      if (onUpsertProject) onUpsertProject(newProject)
    }
    closeDrawer()
  }

  const handleDelete = (id) => {
    const project = projects.find((p) => p.id === id)
    if (project && onDeleteProject) {
      onDeleteProject(project, 'user')
    } else {
      setProjects(prev => prev.filter(p => p.id !== id))
    }
    setDeletingId(null)
  }

  const getProgressFromSubtasks = (project) => {
    const subtasks = Array.isArray(project.subtasks) ? project.subtasks : []
    if (subtasks.length === 0) return Number(project.prog) || 0
    const completed = subtasks.filter((s) => s.status === 'done').length
    return Math.round((completed / subtasks.length) * 100)
  }

  const applySubtaskState = (project, subtasks) => {
    const normalized = Array.isArray(subtasks) ? subtasks : []
    if (normalized.length === 0) {
      return { ...project, subtasks: normalized }
    }
    const completed = normalized.filter((s) => s.status === 'done').length
    const prog = Math.round((completed / normalized.length) * 100)
    const status = completed === normalized.length ? 'done' : project.status
    return { ...project, subtasks: normalized, prog, status }
  }

  const toggleExpanded = (id) => {
    setExpandedProjectIds((prev) => (
      prev.includes(id) ? prev.filter((projectId) => projectId !== id) : [...prev, id]
    ))
  }

  const addSubtask = (projectId) => {
    setProjects((prev) => prev.map((project) => {
      if (project.id !== projectId) return project
      const subtasks = Array.isArray(project.subtasks) ? project.subtasks : []
      const nextSubtasks = [
        ...subtasks,
        { id: Date.now(), title: 'New subtask', status: 'todo' },
      ]
      return applySubtaskState(project, nextSubtasks)
    }))
  }

  const updateSubtask = (projectId, subtaskId, updates) => {
    setProjects((prev) => prev.map((project) => {
      if (project.id !== projectId) return project
      const subtasks = Array.isArray(project.subtasks) ? project.subtasks : []
      const nextSubtasks = subtasks.map((subtask) => (
        subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
      ))
      return applySubtaskState(project, nextSubtasks)
    }))
  }

  const setProjectStatus = (id, status) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
    setOpenStatusMenuId(null)
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!statusMenuRef.current) return
      if (!statusMenuRef.current.contains(event.target)) {
        setOpenStatusMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const getDueDate = (value) => {
    if (!value) return null
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number)
      return new Date(year, month - 1, day)
    }
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const formatDue = (value) => {
    const date = getDueDate(value)
    if (!date) return value || 'TBD'
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  const isThisWeek = (value) => {
    const date = getDueDate(value)
    if (!date) return false
    const today = new Date()
    const start = new Date(today)
    start.setHours(0, 0, 0, 0)
    start.setDate(today.getDate() - today.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 7)
    return date >= start && date < end
  }

  const filteredAndSortedProjects = useMemo(() => {
    const filtered = projects.filter((project) => {
      if (statusFilter !== 'all' && project.status !== statusFilter) return false
      if (thisWeekOnly) return isThisWeek(project.due) || project.status === 'in-progress'
      return true
    })

    const sorted = [...filtered].sort((a, b) => {
      let left
      let right

      if (sortBy === 'project') {
        left = String(a.name || '').toLowerCase()
        right = String(b.name || '').toLowerCase()
      } else if (sortBy === 'status') {
        left = STATUS_ORDER.indexOf(a.status)
        right = STATUS_ORDER.indexOf(b.status)
      } else if (sortBy === 'progress') {
        left = getProgressFromSubtasks(a)
        right = getProgressFromSubtasks(b)
      } else {
        left = getDueDate(a.due)?.getTime() ?? Number.MAX_SAFE_INTEGER
        right = getDueDate(b.due)?.getTime() ?? Number.MAX_SAFE_INTEGER
      }

      if (left < right) return sortDir === 'asc' ? -1 : 1
      if (left > right) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [projects, statusFilter, thisWeekOnly, sortBy, sortDir])

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortBy(column)
    setSortDir('asc')
  }

  const onTrack  = projects.filter(p => ['in-progress'].includes(p.status)).length
  const blocked  = projects.filter(p => ['blocked'].includes(p.status)).length
  const dueThis  = projects.filter(p => isThisWeek(p.due) || p.due === 'This week').length

  const th = { padding: '8px 12px', fontSize: 10.5, fontWeight: 500, color: 'var(--tx3)', letterSpacing: '.04em', textTransform: 'uppercase', borderBottom: '0.5px solid var(--bd)', textAlign: 'left', whiteSpace: 'nowrap' }
  const td = { padding: '11px 12px', borderBottom: '0.5px solid var(--bd)', verticalAlign: 'middle' }
  const filterBtn = (active) => ({
    padding: '5px 10px',
    borderRadius: 16,
    fontSize: 11.5,
    fontWeight: 500,
    border: active ? '0.5px solid var(--blue)' : '0.5px solid var(--bd2)',
    background: active ? 'var(--bluebg)' : 'var(--bg)',
    color: active ? 'var(--bluetx)' : 'var(--tx2)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  })

  const renderSortArrow = (column) => {
    if (sortBy !== column) return '↕'
    return sortDir === 'asc' ? '↑' : '↓'
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10, marginBottom: 20 }}>
        <MetricCard label="Active campaigns"   value={4}        color="var(--blue)"  sub="Airbnb, Crexi, Purrrmitted, User Journey" />
        <MetricCard label="Due this week"       value={dueThis}  color="var(--amber)" sub="Apr 6–13 tasks" />
        <MetricCard label="Overdue / blocked"   value={blocked}  color="var(--red)"   sub="Newsroom, Ads, Partnerships" />
        <MetricCard label="Active workstreams"  value={onTrack}  color="var(--green)" sub="Currently in progress" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>All workstreams</div>
        <AddBtn onClick={openAdd}>+ Add project</AddBtn>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'in-progress', label: 'In Progress' },
          { key: 'blocked', label: 'Blocked' },
          { key: 'todo', label: 'To do' },
          { key: 'backlog', label: 'Backlog' },
          { key: 'postponed', label: 'Postponed' },
          { key: 'done', label: 'Done' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            style={filterBtn(statusFilter === item.key)}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={() => setThisWeekOnly((prev) => !prev)}
          style={filterBtn(thisWeekOnly)}
        >
          This week only
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ ...th, width: '4%' }} />
              <th style={{ ...th, width: '20%', cursor: 'pointer' }} onClick={() => toggleSort('project')}>Project / campaign {renderSortArrow('project')}</th>
              <th style={{ ...th, width: '13%', cursor: 'pointer' }} onClick={() => toggleSort('status')}>Status {renderSortArrow('status')}</th>
              <th style={{ ...th, width: '13%', cursor: 'pointer' }} onClick={() => toggleSort('progress')}>Progress {renderSortArrow('progress')}</th>
              <th style={{ ...th, width: '23%' }}>Next action</th>
              <th style={{ ...th, width: '11%', cursor: 'pointer' }} onClick={() => toggleSort('due')}>Due {renderSortArrow('due')}</th>
              <th style={{ ...th, width: '16%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProjects.map(p => {
              const isDue = p.due === 'Overdue'
              const isExpanded = expandedProjectIds.includes(p.id)
              const subtasks = Array.isArray(p.subtasks) ? p.subtasks : []
              return [
                <tr key={p.id}
                  onMouseEnter={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = 'var(--bg2)')}
                  onMouseLeave={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = '')}
                >
                  <td style={{ ...td, width: 28 }}>
                    <button
                      onClick={() => toggleExpanded(p.id)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--tx3)',
                        cursor: 'pointer',
                        fontSize: 11,
                        padding: 0,
                        lineHeight: 1,
                      }}
                      title={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                      {p.name}
                    </div>
                  </td>
                  <td style={td}>
                    <div style={{ position: 'relative', display: 'inline-block' }} ref={openStatusMenuId === p.id ? statusMenuRef : null}>
                      <Badge
                        color={STATUS_TAG[p.status] || 'gray'}
                        onClick={() => setOpenStatusMenuId((prev) => (prev === p.id ? null : p.id))}
                        style={{ cursor: 'pointer' }}
                        title="Set status"
                      >
                        {STATUSES[p.status] || p.status}
                      </Badge>
                      {openStatusMenuId === p.id && (
                        <div style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          left: 0,
                          minWidth: 160,
                          background: 'var(--bg)',
                          border: '0.5px solid var(--bd2)',
                          borderRadius: 8,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          zIndex: 5,
                          padding: 4,
                        }}>
                          {STATUS_ORDER.map((status) => (
                            <button
                              key={status}
                              onClick={() => setProjectStatus(p.id, status)}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                border: 'none',
                                background: p.status === status ? 'var(--bg2)' : 'transparent',
                                color: 'var(--tx)',
                                padding: '7px 8px',
                                borderRadius: 6,
                                fontSize: 12,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              {STATUSES[status]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={td}><ProgressBar prog={getProgressFromSubtasks(p)} color={p.color} /></td>
                  <td style={{ ...td, color: 'var(--tx2)' }}>{p.next}</td>
                  <td style={{ ...td, fontSize: 12, color: isDue ? 'var(--red)' : 'var(--tx2)', fontWeight: isDue ? 500 : 400 }}>{formatDue(p.due)}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <RABtn onClick={() => openEdit(p)}>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M7.5 1l2.5 2.5-6 6-3 .5.5-3 6-6z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Edit
                      </RABtn>
                      <RABtn danger onClick={() => setDeletingId(deletingId === p.id ? null : p.id)}>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 3h8M4 3V2h3v1M3.5 3l.5 6h3.5l.5-6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Delete
                      </RABtn>
                    </div>
                  </td>
                </tr>,
                isExpanded && (
                  <tr key={`subtasks-${p.id}`}>
                    <td colSpan={7} style={{ padding: 0, borderBottom: '0.5px solid var(--bd)' }}>
                      <div style={{ background: 'var(--bg2)', padding: '10px 12px 12px 36px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ fontSize: 11.5, color: 'var(--tx3)', fontWeight: 500 }}>Subtasks</div>
                          <button
                            onClick={() => addSubtask(p.id)}
                            style={{
                              border: '0.5px solid var(--bd2)',
                              background: 'var(--bg)',
                              color: 'var(--tx2)',
                              borderRadius: 6,
                              padding: '3px 8px',
                              fontSize: 11.5,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            + Add subtask
                          </button>
                        </div>
                        {subtasks.length === 0 && (
                          <div style={{ fontSize: 12, color: 'var(--tx3)' }}>No subtasks yet.</div>
                        )}
                        {subtasks.map((subtask) => (
                          <div key={subtask.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <input
                              type="checkbox"
                              checked={subtask.status === 'done'}
                              onChange={(e) => updateSubtask(p.id, subtask.id, { status: e.target.checked ? 'done' : 'todo' })}
                            />
                            <input
                              value={subtask.title}
                              onChange={(e) => updateSubtask(p.id, subtask.id, { title: e.target.value })}
                              style={{
                                flex: 1,
                                border: '0.5px solid var(--bd2)',
                                borderRadius: 6,
                                background: 'var(--bg)',
                                color: 'var(--tx)',
                                padding: '6px 8px',
                                fontSize: 12,
                                fontFamily: 'inherit',
                                textDecoration: subtask.status === 'done' ? 'line-through' : 'none',
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ),
                deletingId === p.id && (
                  <tr key={`del-${p.id}`}>
                    <td colSpan={7} style={{ padding: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--redbg)', borderBottom: '0.5px solid var(--bd)' }}>
                        <span style={{ fontSize: 12.5, color: 'var(--red)', flex: 1 }}>
                          Delete <strong>"{p.name}"</strong>? This cannot be undone.
                        </span>
                        <button onClick={() => handleDelete(p.id)} style={{ padding: '4px 12px', borderRadius: 6, background: 'var(--red)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                        <button onClick={() => setDeletingId(null)} style={{ padding: '4px 12px', borderRadius: 6, background: 'var(--bg)', color: 'var(--tx2)', border: '0.5px solid var(--bd2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                )
              ]
            })}
          </tbody>
        </table>
      </div>

      {drawerOpen && (
        <ProjectDrawer project={editProject} onSave={handleSave} onClose={closeDrawer} />
      )}
    </div>
  )
}

function AddBtn({ onClick, children }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px',
        borderRadius: 6, fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
        border: '0.5px solid var(--bd2)', fontFamily: 'inherit', transition: 'all .15s',
        background: hov ? 'var(--bluebg)' : 'var(--bg2)',
        color: hov ? 'var(--bluetx)' : 'var(--tx2)',
        borderColor: hov ? 'var(--blue)' : 'var(--bd2)',
      }}
    >{children}</button>
  )
}
