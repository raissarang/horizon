import { useState, useRef, useEffect } from 'react'
import { SYSTEM_PROMPT } from '../data.js'

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)',
    zIndex: 50, display: 'flex', justifyContent: 'flex-end',
  },
  drawer: {
    width: 320, background: 'var(--bg)', borderLeft: '0.5px solid var(--bd2)',
    display: 'flex', flexDirection: 'column', height: '100%',
    animation: 'slideIn 0.2s ease',
  },
  hdr: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderBottom: '0.5px solid var(--bd)', flexShrink: 0,
  },
  hdrLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)', boxShadow: '0 0 0 3px var(--bluebg)' },
  title: { fontSize: 13, fontWeight: 500 },
  close: {
    width: 26, height: 26, borderRadius: 6, border: '0.5px solid var(--bd)',
    background: 'none', cursor: 'pointer', color: 'var(--tx3)', fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  msgs: { flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  msg: (ai) => ({
    maxWidth: '88%', padding: '9px 11px', fontSize: 12, lineHeight: 1.5,
    background: ai ? 'var(--bg2)' : 'var(--blue)',
    border: ai ? '0.5px solid var(--bd)' : 'none',
    color: ai ? 'var(--tx)' : '#fff',
    alignSelf: ai ? 'flex-start' : 'flex-end',
    borderRadius: ai ? '3px 10px 10px 10px' : '10px 3px 10px 10px',
  }),
  footer: { padding: '10px 12px', borderTop: '0.5px solid var(--bd)', flexShrink: 0 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  chip: {
    padding: '3px 8px', borderRadius: 20, border: '0.5px solid var(--bd2)',
    background: 'var(--bg2)', fontSize: 10.5, cursor: 'pointer', color: 'var(--tx2)',
  },
  inputRow: { display: 'flex', gap: 6 },
  input: {
    flex: 1, padding: '8px 10px', borderRadius: 6, border: '0.5px solid var(--bd2)',
    background: 'var(--bg2)', color: 'var(--tx)', fontSize: 12, fontFamily: 'inherit', outline: 'none',
  },
  send: {
    width: 30, height: 30, borderRadius: 6, background: 'var(--blue)',
    border: 'none', cursor: 'pointer', color: '#fff', fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
}

const QUICK = ['What is most urgent?', 'What is blocked?', 'Airbnb status?', 'Focus this week?']

export default function ChatDrawer({ onClose, systemPrompt = SYSTEM_PROMPT }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Ask me anything about your Dwellsy IQ projects, campaigns, and tasks.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const msgsRef = useRef(null)

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const send = async (text) => {
    const q = text || input.trim()
    if (!q || loading) return
    setInput('')
    const newMessages = [...messages, { role: 'user', content: q }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY
      if (!apiKey) throw new Error('No API key')

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 300,
          messages: [
            { role: 'system', content: systemPrompt },
            ...newMessages.filter(m => m.role !== 'system'),
          ],
        }),
      })

      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || 'No response.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.message === 'No API key'
          ? 'Add your OpenAI API key as VITE_OPENAI_API_KEY in Vercel environment variables.'
          : 'Could not reach OpenAI. Check your API key in Vercel settings.',
      }])
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`@keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
      <div style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
        <div style={s.drawer}>
          <div style={s.hdr}>
            <div style={s.hdrLeft}><div style={s.dot}/><div style={s.title}>Horizon AI</div></div>
            <button style={s.close} onClick={onClose}>✕</button>
          </div>
          <div style={s.msgs} ref={msgsRef}>
            {messages.map((m, i) => (
              <div key={i} style={s.msg(m.role === 'assistant')}>{m.content}</div>
            ))}
            {loading && (
              <div style={s.msg(true)}>
                <span style={{ opacity: 0.5 }}>Thinking…</span>
              </div>
            )}
          </div>
          <div style={s.footer}>
            <div style={s.chips}>
              {QUICK.map(q => (
                <div key={q} style={s.chip} onClick={() => send(q)}
                  onMouseEnter={e => { e.target.style.background='var(--bluebg)'; e.target.style.color='var(--bluetx)'; e.target.style.borderColor='var(--blue)' }}
                  onMouseLeave={e => { e.target.style.background='var(--bg2)'; e.target.style.color='var(--tx2)'; e.target.style.borderColor='var(--bd2)' }}
                >{q}</div>
              ))}
            </div>
            <div style={s.inputRow}>
              <input style={s.input} value={input} onChange={e => setInput(e.target.value)}
                placeholder="Ask about your projects…"
                onKeyDown={e => { if (e.key === 'Enter') send() }} />
              <button style={s.send} onClick={() => send()}>↑</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
