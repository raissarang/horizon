import { CALENDAR_EVENTS, TIMELINE_ROWS } from '../data.js'

export function TimelinePanel({ rows = TIMELINE_ROWS }) {
  const td = { padding: '9px 14px', borderBottom: '0.5px solid var(--bd)', fontSize: 13 }
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Q1–Q2 2026 — project timeline</div>
      <div style={{ border: '0.5px solid var(--bd)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', background: 'var(--bg2)', borderBottom: '0.5px solid var(--bd)', fontSize: 10.5, color: 'var(--tx3)', fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase' }}>
          <div style={{ padding: '7px 14px', borderRight: '0.5px solid var(--bd)' }}>Project</div>
          <div style={{ padding: '7px 14px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            <span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>
        {rows.map((r, i) => (
          <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', borderBottom: i < rows.length - 1 ? '0.5px solid var(--bd)' : 'none' }}>
            <div style={{ ...td, borderRight: '0.5px solid var(--bd)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderBottom: 'none' }}>{r.name}</div>
            <div style={{ padding: '9px 14px' }}>
              <div style={{ position: 'relative', height: 20 }}>
                <div style={{ position: 'absolute', height: 12, top: 4, left: `${r.l}%`, width: `${r.w}%`, background: r.color, opacity: .85, borderRadius: 3 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Key milestones</div>
      {[
        { bg: 'var(--redbg)', tx: 'var(--red)', icon: '!', title: 'Newsroom update — overdue', desc: 'Add Crexi, Airbnb, Censai, Local Logic. Was due Apr 6.', badge: 'Overdue', bbg: 'var(--redbg)', btx: 'var(--red)' },
        { bg: 'var(--amberbg)', tx: 'var(--amber)', icon: 'N', title: 'Newsletter + thought leadership', desc: 'Content: Crexi whitepaper, Airbnb, Dewey. Proptech segment.', badge: 'Apr 13', bbg: 'var(--amberbg)', btx: 'var(--amber)' },
        { bg: 'var(--bluebg)', tx: 'var(--bluetx)', icon: 'E', title: 'Airbnb B2C email', desc: 'Pending Nikolay confirmation on Sendgrid.', badge: 'TBD', bbg: 'var(--bluebg)', btx: 'var(--bluetx)' },
        { bg: 'var(--purplebg)', tx: 'var(--purple)', icon: 'B', title: 'Blog publish', desc: 'Scheduled publication.', badge: 'May 9', bbg: 'var(--purplebg)', btx: 'var(--purple)' },
      ].map((m, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, padding: '11px 14px', borderRadius: 10, border: '0.5px solid var(--bd)', marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: m.bg, color: m.tx, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{m.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 3 }}>{m.title}</div>
            <div style={{ fontSize: 11.5, color: 'var(--tx2)' }}>{m.desc}</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: 20, fontSize: 10.5, fontWeight: 500, background: m.bbg, color: m.btx, flexShrink: 0, alignSelf: 'flex-start' }}>{m.badge}</span>
        </div>
      ))}
    </div>
  )
}

export function CalendarPanel({ events = CALENDAR_EVENTS }) {
  const dayNames = ['S','M','T','W','T','F','S']
  const eventDays = new Set(events.map(e => e.day))
  const blanks = 2
  const days = Array.from({ length: 30 }, (_, i) => i + 1)

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>April 2026</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 16, maxWidth: 380 }}>
        {dayNames.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 500, color: 'var(--tx3)', padding: '3px 0' }}>{d}</div>
        ))}
        {Array.from({ length: blanks }, (_, i) => (
          <div key={`b${i}`} style={{ aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, color: 'var(--tx3)' }}>{30 + i}</div>
        ))}
        {days.map(d => {
          const isToday = d === 7
          const hasEv = eventDays.has(d)
          return (
            <div key={d} style={{
              aspectRatio: 1, borderRadius: 6, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', fontSize: 11.5, cursor: 'pointer',
              position: 'relative', background: isToday ? 'var(--blue)' : 'transparent',
              color: isToday ? '#fff' : 'var(--tx)', fontWeight: isToday ? 500 : 400,
            }}>
              {d}
              {hasEv && <div style={{ position: 'absolute', bottom: 2, width: 4, height: 4, borderRadius: '50%', background: isToday ? '#fff' : '#EF9F27' }} />}
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Upcoming events</div>
      {events.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 12px', borderRadius: 6, border: '0.5px solid var(--bd)', marginBottom: 7 }}>
          <div style={{ fontSize: 9.5, fontWeight: 500, color: e.color, minWidth: 36, marginTop: 1 }}>{e.dc}</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>{e.label}</div>
            <div style={{ fontSize: 11.5, color: 'var(--tx2)' }}>{e.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TrashPanel({ deletedProjects = [], onRestoreProject, onEmptyTrash }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Trash</div>
        <button
          onClick={onEmptyTrash}
          disabled={deletedProjects.length === 0}
          style={{
            border: '0.5px solid var(--bd2)',
            borderRadius: 6,
            padding: '5px 10px',
            background: deletedProjects.length === 0 ? 'var(--bg2)' : 'var(--redbg)',
            color: deletedProjects.length === 0 ? 'var(--tx3)' : 'var(--red)',
            fontSize: 12,
            cursor: deletedProjects.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Empty Trash
        </button>
      </div>

      {deletedProjects.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--tx3)' }}>Trash is empty.</div>
      )}

      {deletedProjects.map((entry) => (
        <div
          key={entry.id}
          style={{
            border: '0.5px solid var(--bd)',
            borderRadius: 10,
            padding: 12,
            marginBottom: 8,
            background: 'var(--bg2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>{entry.project?.name || 'Untitled project'}</div>
            <div style={{ fontSize: 11.5, color: 'var(--tx3)', marginTop: 2 }}>
              Deleted {new Date(entry.deletedAt).toLocaleString()} by {entry.deletedBy}
            </div>
          </div>
          <button
            onClick={() => onRestoreProject(entry.id)}
            style={{
              border: '0.5px solid var(--bd2)',
              borderRadius: 6,
              padding: '5px 10px',
              background: 'var(--bg)',
              color: 'var(--tx2)',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Restore
          </button>
        </div>
      ))}
    </div>
  )
}
