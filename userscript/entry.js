import { elementToSVG } from '../src/index.js'

// ---- styles ----
const style = document.createElement('style')
style.textContent = `
  #d2s-float-btn {
    position: fixed;
    z-index: 2147483647;
    bottom: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: #1a1a2e;
    color: #e0e0e0;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transition: transform 0.15s, background 0.15s;
  }
  #d2s-float-btn:hover {
    transform: scale(1.1);
    background: #16213e;
  }
  #d2s-float-btn.active {
    background: #e94560;
    animation: d2s-pulse 1.5s infinite;
  }
  @keyframes d2s-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(233,69,96,0.4); }
    50% { box-shadow: 0 0 0 8px rgba(233,69,96,0); }
  }

  #d2s-tooltip {
    position: fixed;
    z-index: 2147483647;
    background: #1a1a2eee;
    color: #e0e0e0;
    padding: 4px 10px;
    border-radius: 4px;
    font: 12px/1.4 -apple-system, BlinkMacSystemFont, sans-serif;
    pointer-events: none;
    display: none;
    white-space: nowrap;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .d2s-highlight {
    outline: 2px solid #e94560 !important;
    outline-offset: 2px !important;
    background: rgba(233,69,96,0.08) !important;
  }

  #d2s-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    z-index: 2147483646;
    background: transparent;
    cursor: crosshair;
  }
`
document.head.appendChild(style)

// ---- button ----
const btn = document.createElement('button')
btn.id = 'd2s-float-btn'
btn.title = 'Save element as SVG'
btn.textContent = 'SVG'
document.body.appendChild(btn)

// ---- tooltip ----
const tooltip = document.createElement('div')
tooltip.id = 'd2s-tooltip'
document.body.appendChild(tooltip)

// ---- overlay ----
const overlay = document.createElement('div')
overlay.id = 'd2s-overlay'
overlay.style.display = 'none'
document.body.appendChild(overlay)

// ---- state ----
let selecting = false
/** @type {Element | null} */
let highlighted = null

function findTargetUnderOverlay(clientX, clientY) {
  // elementsFromPoint returns all elements at the point; skip our own overlay/button
  for (const el of document.elementsFromPoint(clientX, clientY)) {
    if (el === overlay || el === btn || btn.contains(el) || el === tooltip) continue
    return el
  }
  return null
}

function enterSelecting() {
  selecting = true
  btn.classList.add('active')
  btn.textContent = '✕'
  overlay.style.display = 'block'
}

function exitSelecting() {
  selecting = false
  btn.classList.remove('active')
  btn.textContent = 'SVG'
  overlay.style.display = 'none'
  unhighlight()
  tooltip.style.display = 'none'
}

function highlight(el) {
  if (el === highlighted) return
  unhighlight()
  highlighted = el
  highlighted.classList.add('d2s-highlight')
}

function unhighlight() {
  if (highlighted) {
    highlighted.classList.remove('d2s-highlight')
    highlighted = null
  }
}

function tagName(el) {
  let s = el.tagName.toLowerCase()
  if (el.id) s += '#' + el.id
  const cls = el.className
  if (typeof cls === 'string' && cls.trim()) s += '.' + cls.trim().split(/\s+/).slice(0, 2).join('.')
  return s
}

function downloadSVG(svgDoc, tag) {
  const serializer = new XMLSerializer()
  let source = serializer.serializeToString(svgDoc)
  // pretty-print
  source = source.replace(/></g, '>\n<')
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = (tag.replace(/[<>#\.]/g, '_') || 'element') + '.svg'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

// ---- events ----
btn.addEventListener('click', function (e) {
  e.stopPropagation()
  selecting ? exitSelecting() : enterSelecting()
})

overlay.addEventListener('mousemove', function (e) {
  const target = findTargetUnderOverlay(e.clientX, e.clientY)
  if (!target) return
  highlight(target)
  tooltip.textContent = tagName(target)
  tooltip.style.display = 'block'
  tooltip.style.left = (e.clientX + 12) + 'px'
  tooltip.style.top = (e.clientY + 12) + 'px'
})

overlay.addEventListener('click', function (e) {
  e.preventDefault()
  e.stopPropagation()
  const target = findTargetUnderOverlay(e.clientX, e.clientY) || highlighted
  if (!target) return
  // Remove highlight before capturing, so red overlay doesn't get into SVG
  unhighlight()
  try {
    const svgDoc = elementToSVG(target)
    downloadSVG(svgDoc, tagName(target))
  } catch (err) {
    alert('Failed to convert element to SVG:\n' + err.message)
  }
  exitSelecting()
})

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && selecting) {
    exitSelecting()
  }
})
