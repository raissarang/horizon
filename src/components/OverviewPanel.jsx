import { useState } from 'react'
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

export default function OverviewPanel({ projects, setProjects }) {
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [deletingId, setDeletingId]   = useState(null)

  const openAdd  = () => { setEditProject(null); setDrawerOpen(true) }
  const openEdit = (p) => { setEditProject(p); setDrawerOpen(true) }
  const closeDrawer = () => { setDrawerOpen(false); setEditProject(null) }

  const handleSave = (data) => {
    if (editProject) {
      setProjects(prev => prev.map(p => p.id === editProject.id ? { ...p, ...data } : p))
    } else {
      const color = COLORS_POOL[projects.length % COLORS_POOL.length]
      setProjects(prev => [...prev, { id: Date.now(), color, ...data }])
    }
    closeDrawer()
  }

  const handleDelete = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    setDeletingId(null)
  }

  const cycleStatus = (id) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p
      const idx = STATUS_ORDER.indexOf(p.status)
      return { ...p, status: STATUS_ORDER[(idx + 1) % STATUS_ORDER.length] }
    }))
  }

  const onTrack  = projects.filter(p => ['in-progress','scheduled','published'].includes(p.status)).length
  const blocked  = projects.filter(p => ['blocked','overdue'].includes(p.status)).length
  const dueThis  = projects.filter(p => p.due === 'Apr 13' || p.due === 'This week' || p.due === 'Apr 6').length

  const th = { padding: '8px 12px', fontSize: 10.5, fontWeight: 500, color: 'var(--tx3)', letterSpacing: '.04em', textTransform: 'uppercase', borderBottom: '0.5px solid var(--bd)', textAlign: 'left', whiteSpace: 'nowrap' }
  const td = { padding: '11px 12px', borderBottom: '0.5px solid var(--bd)', verticalAlign: 'middle' }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10, marginBottom: 20 }}>
        <MetricCard label="Active campaigns"   value={4}        color="var(--blue)"  sub="Airbnb, Crexi, Purrrmitted, User Journey" />
        <MetricCard label="Due this week"       value={dueThis}  color="var(--amber)" sub="Apr 6–13 tasks" />
        <MetricCard label="Overdue / blocked"   value={blocked}  color="var(--red)"   sub="Newsroom, Ads, Partnerships" />
        <MetricCard label="Active workstreams"  value={onTrack}  color="var(--green)" sub="In progress or scheduled" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>All workstreams</div>
        <AddBtn onClick={openAdd}>+ Add project</AddBtn>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ ...th, width: '24%' }}>Project / campaign</th>
              <th style={{ ...th, width: '13%' }}>Status</th>
              <th style={{ ...th, width: '13%' }}>Progress</th>
              <th style={{ ...th, width: '23%' }}>Next action</th>
              <th style={{ ...th, width: '11%' }}>Due</th>
              <th style={{ ...th, width: '16%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => {
              const isDue = p.due === 'Overdue' || p.due === 'Apr 6'
              return [
                <tr key={p.id}
                  onMouseEnter={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = 'var(--bg2)')}
                  onMouseLeave={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = '')}
                >
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                      {p.name}
                    </div>
                  </td>
                  <td style={td}>
                    <Badge color={STATUS_TAG[p.status] || 'gray'} onClick={() => cycleStatus(p.id)} style={{ cursor: 'pointer' }} title="Click to change status">
                      {STATUSES[p.status] || p.status}
                    </Badge>
                  </td>
                  <td style={td}><ProgressBar prog={p.prog} color={p.color} /></td>
                  <td style={{ ...td, color: 'var(--tx2)' }}>{p.next}</td>
                  <td style={{ ...td, fontSize: 12, color: isDue ? 'var(--red)' : 'var(--tx2)', fontWeight: isDue ? 500 : 400 }}>{p.due}</td>
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
                deletingId === p.id && (
                  <tr key={`del-${p.id}`}>
                    <td colSpan={6} style={{ padding: 0 }}>
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
