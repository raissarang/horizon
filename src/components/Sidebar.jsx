import { useState } from 'react'

const s = {
  sidebar: (open) => ({
    width: open ? 220 : 44,
    borderRight: '0.5px solid var(--bd)',
    background: 'var(--bg2)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.2s ease',
    overflow: 'hidden',
    flexShrink: 0,
  }),
  toggle: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: 40, cursor: 'pointer', borderBottom: '0.5px solid var(--bd)',
    color: 'var(--tx3)', flexShrink: 0, transition: 'color .15s',
  },
  nav: { overflowY: 'auto', flex: 1, padding: '8px 6px' },
  list: { display: 'flex', flexDirection: 'column', gap: 2 },
  item: (active) => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px',
    borderRadius: 6, fontSize: 12.5, cursor: 'pointer', border: 'none',
    background: active ? 'var(--bg)' : 'none', color: active ? 'var(--blue)' : 'var(--tx2)',
    fontWeight: active ? 500 : 400, width: '100%', textAlign: 'left',
    transition: 'all .15s', whiteSpace: 'nowrap', overflow: 'hidden',
  }),
  dot: (color) => ({ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }),
  badge: {
    marginLeft: 'auto', padding: '1px 6px', borderRadius: 10, fontSize: 10,
    fontWeight: 500, background: 'var(--redbg)', color: 'var(--red)', flexShrink: 0,
  },
}

const ITEMS = [
  { label: 'Dashboard', dot: '#185FA5', view: 'overview' },
  { label: 'Campaigns', dot: '#3B6D11', view: 'campaigns' },
  { label: 'Timeline', dot: '#534AB7', view: 'timeline' },
  { label: 'Calendar', dot: '#0F6E56', view: 'calendar' },
  { label: 'Urgent', dot: '#A32D2D', view: 'overview', badge: '3' },
]

export default function Sidebar({ view, setView }) {
  const [open, setOpen] = useState(true)
  const [active, setActive] = useState('Dashboard')

  return (
    <div style={s.sidebar(open)}>
      <div
        style={s.toggle}
        onClick={() => setOpen(o => !o)}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
          style={{ transform: open ? 'none' : 'rotate(180deg)', transition: 'transform .2s' }}>
          <path d="M5 3l5 4.5L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={s.nav}>
        <div style={s.list}>
          {ITEMS.map(item => (
            <button
              key={item.label}
              style={s.item(active === item.label)}
              onClick={() => { setActive(item.label); setView(item.view) }}
              onMouseEnter={e => { if (active !== item.label) { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--tx)' }}}
              onMouseLeave={e => { if (active !== item.label) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--tx2)' }}}
            >
              <div style={s.dot(item.dot)} />
              {open && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{item.label}</span>}
              {open && item.badge && <span style={s.badge}>{item.badge}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
