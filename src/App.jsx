import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import OverviewPanel from './components/OverviewPanel.jsx'
import CampaignsPanel from './components/CampaignsPanel.jsx'
import { TimelinePanel, CalendarPanel, TrashPanel } from './components/Panels.jsx'
import ChatDrawer from './components/ChatDrawer.jsx'
import { useLiveData } from './liveData.js'
import { INITIAL_PROJECTS } from './data.js'
import { supabase } from './supabase.js'

export default function App() {
  const expectedPassword = import.meta.env.VITE_APP_PASSWORD || ''
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [view, setView]         = useState('overview')
  const [chatOpen, setChatOpen] = useState(false)
  const { data, setData, error, lastSync } = useLiveData()

  useEffect(() => {
    const saved = sessionStorage.getItem('horizon-authenticated') === 'true'
    if (saved) setIsAuthenticated(true)
  }, [])

  const mapProjectToDb = (project, overrides = {}) => ({
    id: project.id,
    name: project.name,
    color: project.color,
    status: project.status,
    prog: project.prog,
    next: project.next,
    due: project.due,
    subtasks: project.subtasks || [],
    deleted: false,
    deleted_by: null,
    deleted_at: null,
    ...overrides,
  })

  const mapDbRowToProject = (row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    status: row.status,
    prog: Number.isFinite(row.prog) ? row.prog : 0,
    next: row.next || '',
    due: row.due || 'TBD',
    subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
  })

  const mapDbRowToTrashEntry = (row) => ({
    id: row.id,
    deletedAt: row.deleted_at || new Date().toISOString(),
    deletedBy: row.deleted_by || 'api',
    project: mapDbRowToProject(row),
  })

  const loadProjectsFromSupabase = async () => {
    if (!supabase) return

    const [{ data: activeRows, error: activeError }, { data: trashRows, error: trashError }] = await Promise.all([
      supabase.from('projects').select('*').eq('deleted', false).order('id', { ascending: true }),
      supabase.from('projects').select('*').eq('deleted', true).order('deleted_at', { ascending: false }),
    ])

    if (activeError || trashError) return

    const activeProjects = Array.isArray(activeRows) && activeRows.length > 0
      ? activeRows.map(mapDbRowToProject)
      : INITIAL_PROJECTS

    setData((prev) => ({
      ...prev,
      projects: activeProjects,
      deletedProjects: Array.isArray(trashRows) ? trashRows.map(mapDbRowToTrashEntry) : [],
    }))
  }

  useEffect(() => {
    loadProjectsFromSupabase()
  }, [])

  useEffect(() => {
    if (!supabase || !Array.isArray(data.projects) || data.projects.length === 0) return
    const payload = data.projects.map((project) => mapProjectToDb(project))
    supabase.from('projects').upsert(payload, { onConflict: 'id' })
  }, [data.projects])

  const handleLogin = () => {
    if (!expectedPassword) {
      setAuthError('Password is not configured')
      return
    }

    if (passwordInput === expectedPassword) {
      sessionStorage.setItem('horizon-authenticated', 'true')
      setIsAuthenticated(true)
      setAuthError('')
      return
    }

    setAuthError('Incorrect password')
  }

  const setProjects = (updater) => {
    setData((prev) => ({
      ...prev,
      projects: typeof updater === 'function' ? updater(prev.projects) : updater,
    }))
  }

  const setCampaigns = (updater) => {
    setData((prev) => ({
      ...prev,
      campaigns: typeof updater === 'function' ? updater(prev.campaigns) : updater,
    }))
  }

  const handleUpsertProject = async (project) => {
    if (!supabase || !project) return
    await supabase.from('projects').upsert([mapProjectToDb(project)], { onConflict: 'id' })
  }

  const handleDeleteProject = async (project, deletedBy = 'user') => {
    if (supabase) {
      await supabase
        .from('projects')
        .upsert(
          [mapProjectToDb(project, { deleted: true, deleted_by: deletedBy, deleted_at: new Date().toISOString() })],
          { onConflict: 'id' },
        )
      await loadProjectsFromSupabase()
      return
    }

    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== project.id),
      deletedProjects: [
        ...(prev.deletedProjects || []),
        {
          id: Date.now() + Math.random(),
          deletedAt: new Date().toISOString(),
          deletedBy,
          project,
        },
      ],
    }))
  }

  const handleRestoreProject = async (trashEntryId) => {
    if (supabase) {
      await supabase
        .from('projects')
        .update({ deleted: false, deleted_by: null, deleted_at: null })
        .eq('id', trashEntryId)
      await loadProjectsFromSupabase()
      return
    }

    setData((prev) => {
      const entry = (prev.deletedProjects || []).find((item) => item.id === trashEntryId)
      if (!entry) return prev
      return {
        ...prev,
        projects: [...prev.projects, entry.project],
        deletedProjects: prev.deletedProjects.filter((item) => item.id !== trashEntryId),
      }
    })
  }

  const handleEmptyTrash = () => {
    if (!window.confirm('Permanently delete all items in Trash? This cannot be undone.')) return
    if (supabase) {
      supabase.from('projects').delete().eq('deleted', true).then(() => loadProjectsFromSupabase())
      return
    }
    setData((prev) => ({ ...prev, deletedProjects: [] }))
  }

  const nowLabel = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

  const panels = {
    overview:  <OverviewPanel projects={data.projects} setProjects={setProjects} onDeleteProject={handleDeleteProject} onUpsertProject={handleUpsertProject} />,
    campaigns: <CampaignsPanel campaigns={data.campaigns} setCampaigns={setCampaigns} onConfirm={() => setView('overview')} />,
    timeline:  <TimelinePanel rows={data.timelineRows} />,
    calendar:  <CalendarPanel events={data.calendarEvents} />,
    trash: <TrashPanel deletedProjects={data.deletedProjects} onRestoreProject={handleRestoreProject} onEmptyTrash={handleEmptyTrash} />,
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        background: 'var(--bg3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}>
        <div style={{
          width: '100%',
          maxWidth: 380,
          borderRadius: 12,
          border: '0.5px solid var(--bd2)',
          background: 'var(--bg)',
          padding: 24,
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--blue)', boxShadow: '0 0 0 4px var(--bluebg)' }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)' }}>Horizon</div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--tx2)', marginBottom: 8 }}>Enter password to continue</div>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value)
              if (authError) setAuthError('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLogin()
            }}
            style={{
              width: '100%',
              padding: '9px 10px',
              borderRadius: 8,
              border: '0.5px solid var(--bd2)',
              background: 'var(--bg2)',
              color: 'var(--tx)',
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          {authError && (
            <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--red)' }}>{authError}</div>
          )}

          <button
            onClick={handleLogin}
            style={{
              marginTop: 14,
              width: '100%',
              border: 'none',
              borderRadius: 8,
              padding: '9px 10px',
              fontSize: 13,
              fontWeight: 500,
              background: 'var(--blue)',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg3)', padding: 16 }}>
      <div style={{
        display: 'flex', flexDirection: 'column', borderRadius: 14, overflow: 'hidden',
        border: '0.5px solid var(--bd2)', background: 'var(--bg)', flex: 1, minHeight: 0,
      }}>
        {/* TOP BAR */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0, padding: '0 16px',
          height: 52, borderBottom: '0.5px solid var(--bd)', background: 'var(--bg)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 500, marginRight: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', boxShadow: '0 0 0 3px var(--bluebg)' }} />
            Horizon
          </div>

          <nav style={{ display: 'flex', gap: 2 }}>
            {['overview','campaigns','timeline','calendar'].map(v => (
              <NavTab key={v} active={view === v} onClick={() => setView(v)}>
                {{ overview: 'Overview', campaigns: 'Campaigns', timeline: 'Timeline', calendar: 'Calendar' }[v]}
              </NavTab>
            ))}
          </nav>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--tx3)', padding: '4px 10px', borderRadius: 20, border: '0.5px solid var(--bd)' }}>
              {nowLabel}
            </div>
            <AskAIBtn onClick={() => setChatOpen(true)} />
          </div>
        </div>

        {/* BODY */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <Sidebar view={view} setView={setView} trashCount={data.deletedProjects?.length || 0} />
          <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: 'var(--bg)', minWidth: 0 }}>
            {panels[view]}
          </main>
        </div>
      </div>

      {(error || lastSync) && (
        <div style={{ fontSize: 11, color: error ? 'var(--red)' : 'var(--tx3)', marginTop: 8, padding: '0 2px' }}>
          {error ? `Live sync: ${error}` : `Last synced: ${lastSync?.toLocaleTimeString()}`}
        </div>
      )}

      {chatOpen && <ChatDrawer onClose={() => setChatOpen(false)} systemPrompt={data.systemPrompt} />}
    </div>
  )
}

function NavTab({ active, onClick, children }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
        cursor: 'pointer', border: 'none', fontFamily: 'inherit', transition: 'all .15s',
        background: active ? 'var(--blue)' : hov ? 'var(--bg2)' : 'none',
        color: active ? '#fff' : hov ? 'var(--tx)' : 'var(--tx2)',
      }}
    >{children}</button>
  )
}

function AskAIBtn({ onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '5px 13px',
        borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
        fontFamily: 'inherit', transition: 'all .15s',
        border: hov ? '0.5px solid var(--blue)' : '0.5px solid var(--bd2)',
        background: hov ? 'var(--bluebg)' : 'var(--bg2)',
        color: hov ? 'var(--bluetx)' : 'var(--tx2)',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1"/>
        <path d="M6.5 4v5M4 6.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      Ask AI
    </button>
  )
}
