import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { mountSelector } from './selector.js'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// The front-door library mounts its element-selector overlay onto the running app.
// In the real product this is what the embeddable library injects; here it is wired
// directly so the demo is self-contained.
mountSelector()
