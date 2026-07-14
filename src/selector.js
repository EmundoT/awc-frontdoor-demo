// A small experiment: a click-to-pick element selector.
export function mountSelector() {
  let picking = false
  let hovered = null

  const btn = document.createElement('button')
  btn.textContent = 'Pick element'
  Object.assign(btn.style, {
    position: 'fixed', top: '12px', right: '12px', zIndex: 99999,
    padding: '0.5rem 0.9rem', fontFamily: 'system-ui', fontSize: '0.95rem',
    background: '#1f6feb', color: 'white', border: 'none', borderRadius: '6px',
    cursor: 'pointer',
  })
  document.body.appendChild(btn)

  const outline = (el, on) => {
    if (!el) return
    el.style.outline = on ? '2px solid #f39c12' : ''
    el.style.outlineOffset = on ? '2px' : ''
  }

  function selectable(el) {
    // Only elements the app has marked with a source location are pickable.
    return el && el.closest ? el.closest('[data-awc-src]') : null
  }

  function onMove(e) {
    if (!picking) return
    const el = selectable(e.target)
    if (el === hovered) return
    outline(hovered, false)
    hovered = el
    outline(hovered, true)
  }

  function onClick(e) {
    if (!picking) return
    const el = selectable(e.target)
    if (!el) return
    e.preventDefault()
    e.stopPropagation()
    stop()
    const konst = el.getAttribute('data-awc-const')
    const src = el.getAttribute('data-awc-src')
    const instruction = window.prompt(
      `Change "${el.textContent.trim()}" to what? (plain language)`,
      'Make it more welcoming',
    )
    if (!instruction) return
    window.dispatchEvent(new CustomEvent('awc:change-request', {
      detail: { const: konst, src, instruction, element_text: el.textContent.trim() },
    }))
  }

  function start() {
    picking = true
    btn.textContent = 'Cancel pick'
    btn.style.background = '#c0392b'
    document.addEventListener('mousemove', onMove, true)
    document.addEventListener('click', onClick, true)
  }

  function stop() {
    picking = false
    btn.textContent = 'Pick element'
    btn.style.background = '#1f6feb'
    outline(hovered, false)
    hovered = null
    document.removeEventListener('mousemove', onMove, true)
    document.removeEventListener('click', onClick, true)
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    picking ? stop() : start()
  })
}
