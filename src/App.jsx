import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import OverviewPanel from './components/OverviewPanel.jsx'
import CampaignsPanel from './components/CampaignsPanel.jsx'
import { TimelinePanel, CalendarPanel } from './components/Panels.jsx'
import ChatDrawer from './components/ChatDrawer.jsx'
import { INITIAL_PROJECTS } from './data.js'

export default function App() {
  const [view, setView]         = useState('overview')
  const [projects, setProjects] = useState(INITIAL_PROJECTS)
  const [chatOpen, setChatOpen] = useState(false)

  const panels = {
    overview:  <OverviewPanel projects={projects} setProjects={setProjects} />,
    campaigns: <CampaignsPanel />,
    timeline:  <TimelinePanel />,
    calendar:  <CalendarPanel />,
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
              Apr 7, 2026
            </div>
            <AskAIBtn onClick={() => setChatOpen(true)} />
          </div>
        </div>

        {/* BODY */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <Sidebar view={view} setView={setView} />
          <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: 'var(--bg)', minWidth: 0 }}>
            {panels[view]}
          </main>
        </div>
      </div>

      {chatOpen && <ChatDrawer onClose={() => setChatOpen(false)} />}
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
