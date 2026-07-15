// A small experiment. Pick an element, propose a change, iterate, accept.
import { useState, useEffect } from 'react'
import { AUTH_LABEL } from './auth/login-widget.jsx'

const HEADLINE = 'Welcome to the store v0'
const BASE = 'http://localhost:8788'

// Next Saturday at 09:00 local time. If today is Saturday, target the Saturday a week out.
function nextSaturday() {
  const now = new Date()
  const target = new Date(now)
  const daysUntilSat = ((6 - now.getDay()) + 7) % 7 || 7
  target.setDate(now.getDate() + daysUntilSat)
  target.setHours(9, 0, 0, 0)
  return target
}

function formatCountdown(ms) {
  if (ms <= 0) return "It's open! See you at the Grand Opening."
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

export default function App() {
  const [status, setStatus] = useState('Pick an element (top-right), then propose a change.')
  const [staged, setStaged] = useState(false)   // a draft is staged (proposed, not yet accepted)
  const [remaining, setRemaining] = useState(() => nextSaturday().getTime() - Date.now())

  // Tick the Grand Opening countdown once per second.
  useEffect(() => {
    const target = nextSaturday().getTime()
    const id = setInterval(() => setRemaining(target - Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  async function post(path, body) {
    const res = await fetch(BASE + path, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    return { ok: res.ok, body: await res.json() }
  }

  async function accept() {
    setStatus('Accepting -- opening a real draft PR and assessing risk...')
    const { ok, body } = await post('/accept')
    setStaged(false)
    setStatus(ok
      ? `Done: ${body.pr_url}\nResult: ${JSON.stringify(body)}`
      : `accept failed: ${body.message || 'error'}`)
  }

  async function discard() {
    await post('/discard'); setStaged(false)
    setStatus('Draft discarded. Pick an element to start over.')
  }

  // Wire the selector's change-request event to /propose (iterate); expose accept/discard.
  if (typeof window !== 'undefined' && !window.__awcBridge) {
    window.__awcBridge = true
    window.addEventListener('awc:change-request', async (ev) => {
      const req = ev.detail
      setStatus(`Proposing on ${req.const}... (headless CC edits live; NO PR yet -- you sign off first)`)
      const { ok, body } = await post('/propose', req)
      if (!ok) { setStatus(`propose failed: ${body.message || 'error'}`); return }
      setStaged(true)
      setStatus(`Draft staged (revision ${body.revision}). The element re-rendered live via HMR.\n`
        + `ACCEPT to open a real PR, or pick the element again to REVISE with new feedback.`)
    })
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', maxWidth: 720 }}>
      <h1 id="headline" data-awc-src="src/App.jsx" data-awc-const="HEADLINE"
        style={{ fontSize: '2.5rem', color: '#1f6feb' }}>{HEADLINE}</h1>

      <button id="auth-btn" data-awc-src="src/auth/login-widget.jsx" data-awc-const="AUTH_LABEL"
        style={{ fontSize: '1.1rem', padding: '0.6rem 1.2rem' }}>{AUTH_LABEL}</button>

      <div id="grand-opening-banner" style={{
        marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: 8,
        background: 'linear-gradient(90deg, #1f6feb, #2ea043)', color: 'white',
      }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Grand Opening this Saturday</div>
        <div style={{ fontSize: '1.6rem', fontVariantNumeric: 'tabular-nums', marginTop: '0.25rem' }}>
          {formatCountdown(remaining)}
        </div>
      </div>

      <p style={{ marginTop: '1.5rem', color: '#555' }}>
        Pick an element and propose a change. It edits live (HMR) with NO PR yet. Iterate by
        picking the same element again with new feedback. Only ACCEPT opens a real draft PR,
        risk-assessed by the platform (headline low / auth high).
      </p>

      {staged && (
        <div style={{ margin: '1rem 0' }}>
          <button onClick={accept} style={{ fontSize: '1rem', padding: '0.6rem 1.2rem', background: '#2ea043', color: 'white', border: 'none', borderRadius: 6, marginRight: 8 }}>
            Accept and open PR
          </button>
          <button onClick={discard} style={{ fontSize: '1rem', padding: '0.6rem 1.2rem' }}>
            Discard draft
          </button>
        </div>
      )}

      <pre id="awc-status" style={{ marginTop: '1rem', background: '#f4f4f4', padding: '1rem', whiteSpace: 'pre-wrap' }}>
        {status}
      </pre>
    </main>
  )
}
