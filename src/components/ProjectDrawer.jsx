import { useState, useEffect } from 'react'
import { STATUSES, STATUS_ORDER } from '../data.js'

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)',
    zIndex: 50, display: 'flex', justifyContent: 'flex-end',
  },
  drawer: {
    width: 360, background: 'var(--bg)', borderLeft: '0.5px solid var(--bd2)',
    display: 'flex', flexDirection: 'column', height: '100%',
    animation: 'slideIn 0.2s ease',
  },
  hdr: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '0.5px solid var(--bd)', flexShrink: 0,
  },
  title: { fontSize: 14, fontWeight: 500 },
  close: {
    width: 28, height: 28, borderRadius: 6, border: '0.5px solid var(--bd)',
    background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: 'var(--tx3)', fontSize: 15,
  },
  body: { flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 11, fontWeight: 500, color: 'var(--tx2)' },
  input: {
    padding: '8px 10px', borderRadius: 6, border: '0.5px solid var(--bd2)',
    background: 'var(--bg2)', color: 'var(--tx)', fontSize: 13,
    fontFamily: 'inherit', outline: 'none', width: '100%',
  },
  select: {
    padding: '8px 10px', borderRadius: 6, border: '0.5px solid var(--bd2)',
    background: 'var(--bg2)', color: 'var(--tx)', fontSize: 13,
    fontFamily: 'inherit', outline: 'none', width: '100%', cursor: 'pointer',
  },
  progRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footer: {
    padding: '14px 20px', borderTop: '0.5px solid var(--bd)',
    display: 'flex', gap: 8, flexShrink: 0,
  },
  btn: (primary) => ({
    flex: 1, padding: 9, borderRadius: 6, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
    border: primary ? 'none' : '0.5px solid var(--bd2)',
    background: primary ? 'var(--blue)' : 'var(--bg2)',
    color: primary ? '#fff' : 'var(--tx2)',
  }),
}

export default function ProjectDrawer({ project, onSave, onClose }) {
  const getInitialDueDate = (value) => {
    if (!value) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return ''
    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, '0')
    const day = String(parsed.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [name, setName]     = useState(project?.name || '')
  const [status, setStatus] = useState(project?.status || 'todo')
  const [prog, setProg]     = useState(project?.prog ?? 0)
  const [next, setNext]     = useState(project?.next || '')
  const [due, setDue]       = useState(getInitialDueDate(project?.due))

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), status, prog: Number(prog), next: next.trim(), due: due || '' })
  }

  return (
    <>
      <style>{`@keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
      <div style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
        <div style={s.drawer}>
          <div style={s.hdr}>
            <div style={s.title}>{project ? 'Edit project' : 'Add project'}</div>
            <button style={s.close} onClick={onClose}>✕</button>
          </div>
          <div style={s.body}>
            <div style={s.field}>
              <div style={s.label}>Project name</div>
              <input style={s.input} value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Airbnb campaign" autoFocus />
            </div>
            <div style={s.field}>
              <div style={s.label}>Status</div>
              <select style={s.select} value={status} onChange={e => setStatus(e.target.value)}>
                {STATUS_ORDER.map(v => <option key={v} value={v}>{STATUSES[v]}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <div style={s.progRow}>
                <div style={s.label}>Progress</div>
                <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{prog}%</div>
              </div>
              <input type="range" min="0" max="100" step="1" value={prog}
                onChange={e => setProg(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
            </div>
            <div style={s.field}>
              <div style={s.label}>Next action</div>
              <input style={s.input} value={next} onChange={e => setNext(e.target.value)}
                placeholder="What needs to happen next" />
            </div>
            <div style={s.field}>
              <div style={s.label}>Due date</div>
              <input
                type="date"
                style={s.input}
                value={due}
                onChange={e => setDue(e.target.value)}
              />
            </div>
          </div>
          <div style={s.footer}>
            <button style={s.btn(false)} onClick={onClose}>Cancel</button>
            <button style={s.btn(true)} onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </>
  )
}
