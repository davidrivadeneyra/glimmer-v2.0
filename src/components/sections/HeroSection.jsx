import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../Button'
import useInViewport from '../../hooks/useInViewport'
import useSectionReveal from '../../hooks/useSectionReveal'
import useViewportVideo from '../../hooks/useViewportVideo'
import { HERO_FRAME_COUNT, getHeroFrameSrc } from '../../lib/heroFrames'

// ─── Constantes de configuración ──────────────────────────────────────────────

// Cuántos frames se cargan antes/después del frame actual (ventana base)
const HERO_FRAME_WINDOW_BASE = 20

// Multiplicador máximo de ventana cuando el scroll es muy rápido
const HERO_FRAME_WINDOW_VELOCITY_MAX = 2.5

// Frames mínimos que siempre se pre-cargan hacia adelante (dirección base)
const HERO_FRAME_LOOKAHEAD_MIN = 8

// Máximo de frames en memoria simultáneamente (LRU cache acotada)
// ~120 WebP decodificados ≈ 60–90MB dependiendo del tamaño, manejable
const HERO_FRAME_CACHE_MAX = 120

// Frames críticos a cargar antes de permitir el preload de fondo
// (0 a N−1 para tener al menos el primer "tramo" del hero disponible)
const HERO_FRAME_CRITICAL_COUNT = 5

// Tamaño de batch para el preload de fondo (menor = menos presión en page load)
const HERO_BACKGROUND_PRELOAD_BATCH_SIZE = 6

// Delay entre batches de fondo — se ejecuta en idle, así que puede ser bajo
const HERO_BACKGROUND_PRELOAD_DELAY_MS = 80

// Ticker
const HERO_TICKER_START_FRAME = 340
const HERO_TICKER_FRAME_STEP = 66

// ─── Helpers sin cambios ───────────────────────────────────────────────────────

const clientLogos = [
  { name: '3IPunt', src: '/assets/logos-clientes/3IPunt.png' },
  { name: 'ARQ', src: '/assets/logos-clientes/ARQ.png' },
  { name: 'Delvy', src: '/assets/logos-clientes/Delvy.png' },
  { name: 'Grupo Lamadrid', src: '/assets/logos-clientes/Grupo%20Lamadrid.png' },
  { name: 'HOk Capital', src: '/assets/logos-clientes/HOk%20Capital.png' },
  { name: 'NexusClips', src: '/assets/logos-clientes/NexusClips.png' },
  { name: 'RSM', src: '/assets/logos-clientes/RSM.png' },
  { name: 'S4Gaming', src: '/assets/logos-clientes/S4-gaming.png' },
  { name: 'Top Cable', src: '/assets/logos-clientes/top%20cable.png' },
  { name: 'dilobonito', src: '/assets/logos-clientes/dilobonito.png' },
]

const HERO_TITLE_START_FRAMES = [0, 73, 147]

const getHeroTitleIndex = (frameIndex, titleCount) => {
  if (titleCount <= 1) return 0
  const lastConfiguredIndex = Math.min(titleCount, HERO_TITLE_START_FRAMES.length) - 1
  for (let i = lastConfiguredIndex; i >= 0; i--) {
    if (frameIndex >= HERO_TITLE_START_FRAMES[i]) return i
  }
  return 0
}

const getHeroTickerIndex = (frameIndex, tickerCount) => {
  if (tickerCount <= 1 || frameIndex < HERO_TICKER_START_FRAME) return 0
  return Math.min(
    Math.floor((frameIndex - HERO_TICKER_START_FRAME) / HERO_TICKER_FRAME_STEP),
    tickerCount - 1,
  )
}

const getHeroLogoScale = (frameIndex) => {
  const introEndFrame = 279
  const outroStartFrame = 280
  const outroEndFrame = 294
  const introScale = 1.08
  if (frameIndex <= introEndFrame) return 1 + (introScale - 1) * (frameIndex / introEndFrame)
  if (frameIndex <= outroEndFrame) {
    const p = (frameIndex - outroStartFrame) / (outroEndFrame - outroStartFrame)
    return Math.max(introScale * (1 - p), 0)
  }
  return 0
}

const getHeroContentStyle = (frameIndex) => {
  const fadeStartFrame = 280
  const fadeEndFrame = 294
  if (frameIndex < fadeStartFrame) return { opacity: 1, transform: 'translate3d(0, 0, 0)' }
  if (frameIndex > fadeEndFrame) return { opacity: 0, transform: 'translate3d(0, 32px, 0)' }
  const p = (frameIndex - fadeStartFrame) / (fadeEndFrame - fadeStartFrame)
  return { opacity: Math.max(1 - p, 0), transform: `translate3d(0, ${Math.round(p * 32)}px, 0)` }
}

const getHeroTickerStyle = (frameIndex) => {
  const tickerStartFrame = 340
  const tickerFadeSpan = 18
  if (frameIndex < tickerStartFrame) return { opacity: 0, transform: 'translate3d(0, 32px, 0)' }
  const p = Math.min((frameIndex - tickerStartFrame) / tickerFadeSpan, 1)
  return { opacity: p, transform: `translate3d(0, ${Math.round((1 - p) * 32)}px, 0)` }
}

// ─── LRU Cache acotada ────────────────────────────────────────────────────────
// Reemplaza el Map sin límite del código original.
// Cuando se supera HERO_FRAME_CACHE_MAX, expulsa el frame menos usado recientemente
// que esté más lejos del frame actual.

class LRUFrameCache {
  constructor(maxSize) {
    this.maxSize = maxSize
    // Map preserva orden de inserción → el primero es el más antiguo
    this.cache = new Map()
  }

  has(frameIndex) {
    return this.cache.has(frameIndex)
  }

  get(frameIndex) {
    if (!this.cache.has(frameIndex)) return undefined
    // Refrescar acceso: mover al final
    const img = this.cache.get(frameIndex)
    this.cache.delete(frameIndex)
    this.cache.set(frameIndex, img)
    return img
  }

  set(frameIndex, image, currentFrame) {
    if (this.cache.has(frameIndex)) {
      // Ya existe, solo refrescar posición
      this.cache.delete(frameIndex)
      this.cache.set(frameIndex, image)
      return
    }

    if (this.cache.size >= this.maxSize) {
      this._evict(currentFrame)
    }

    this.cache.set(frameIndex, image)
  }

  delete(frameIndex) {
    this.cache.delete(frameIndex)
  }

  forEach(callback) {
    this.cache.forEach(callback)
  }

  get size() {
    return this.cache.size
  }

  // Expulsa el frame más lejano al frame actual
  _evict(currentFrame) {
    let worstKey = null
    let worstDist = -1

    for (const key of this.cache.keys()) {
      const dist = Math.abs(key - currentFrame)
      if (dist > worstDist) {
        worstDist = dist
        worstKey = key
      }
    }

    if (worstKey !== null) {
      const img = this.cache.get(worstKey)
      if (img) {
        img.onload = null
        img.src = ''
      }
      this.cache.delete(worstKey)
    }
  }

  clear() {
    this.cache.forEach((img) => {
      img.onload = null
      img.src = ''
    })
    this.cache.clear()
  }
}

// ─── Componente ───────────────────────────────────────────────────────────────

function HeroSection() {
  const { t } = useTranslation()
  const heroRef = useRef(null)
  const heroCanvasRef = useRef(null)
  const heroVideoRef = useRef(null)

  // LRU cache acotada en lugar del Map sin límite
  const heroFrameCacheRef = useRef(new LRUFrameCache(HERO_FRAME_CACHE_MAX))
  const heroPendingFramesRef = useRef(new Set())
  const heroFrameIndexRef = useRef(0)
  const heroLastRequestedFrameRef = useRef(0)
  const heroLastDrawnFrameRef = useRef(-1)
  const heroFirstFramePaintedRef = useRef(false)
  const heroFullPreloadStartedRef = useRef(false)
  const heroTitleIndexRef = useRef(0)
  const heroTickerIndexRef = useRef(0)
  const isMobileRef = useRef(false)

  // Velocidad de scroll para ajustar la ventana dinámicamente
  const heroScrollVelocityRef = useRef(0)
  const heroLastScrollTimeRef = useRef(0)
  const heroLastFrameForVelocityRef = useRef(0)

  const [heroLogoScale, setHeroLogoScale] = useState(1)
  const [heroTitleIndex, setHeroTitleIndex] = useState(0)
  const [heroContentStyle, setHeroContentStyle] = useState(() => getHeroContentStyle(0))
  const [heroTickerStyle, setHeroTickerStyle] = useState(() => getHeroTickerStyle(0))
  const [heroTickerIndex, setHeroTickerIndex] = useState(0)
  const [hasHeroFirstFrame, setHasHeroFirstFrame] = useState(false)

  const heroTitles = t('hero.titles', { returnObjects: true })
  const tickerWords = t('ticker.words', { returnObjects: true })

  useSectionReveal(heroRef, [heroTitles])
  useViewportVideo(heroVideoRef)
  const isHeroInViewport = useInViewport(heroRef, { threshold: 0.15 })

  useEffect(() => {
    let frameId = 0
    let isDisposed = false
    let preloadTimeout = 0
    let idleCallbackId = 0
    const canvasContextRef = { current: null }
    const cache = heroFrameCacheRef.current
    const pendingFrames = heroPendingFramesRef.current

    // Cola para el preload de fondo, ordenada por distancia al frame 0
    // (los frames más cercanos al inicio tienen prioridad)
    const backgroundQueue = Array.from(
      { length: HERO_FRAME_COUNT - 1 },
      (_, i) => i + 1,
    )

    // ── Dibujo en canvas ────────────────────────────────────────────────────

    const drawFrame = (frameIndex) => {
      if (isMobileRef.current) return false
      const canvas = heroCanvasRef.current
      const image = cache.get(frameIndex)
      if (!canvas || !image?.complete) return false

      const ctx = canvasContextRef.current ?? canvas.getContext('2d')
      if (!ctx) return false
      canvasContextRef.current = ctx

      const cw = canvas.width
      const ch = canvas.height
      if (!cw || !ch) return false

      const iw = image.naturalWidth || image.width
      const ih = image.naturalHeight || image.height
      if (!iw || !ih) return false

      const scale = Math.max(cw / iw, ch / ih)
      const dw = iw * scale
      const dh = ih * scale
      const ox = (cw - dw) * 0.5
      const oy = (ch - dh) * 0.5

      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(image, ox, oy, dw, dh)
      heroLastDrawnFrameRef.current = frameIndex

      if (!heroFirstFramePaintedRef.current) {
        heroFirstFramePaintedRef.current = true
        setHasHeroFirstFrame(true)
      }

      return true
    }

    const drawBestAvailableFrame = (frameIndex) => {
      if (drawFrame(frameIndex)) return
      if (heroLastDrawnFrameRef.current >= 0) drawFrame(heroLastDrawnFrameRef.current)
    }

    // ── Carga de frames ─────────────────────────────────────────────────────

    const ensureFrameLoaded = (frameIndex, isUrgent = false) => {
      if (frameIndex < 0 || frameIndex >= HERO_FRAME_COUNT) return
      if (cache.has(frameIndex) || pendingFrames.has(frameIndex)) return

      // Si es urgente, sacarlo de la cola de fondo para no duplicar
      if (!isUrgent) {
        const queueIdx = backgroundQueue.indexOf(frameIndex)
        if (queueIdx >= 0) backgroundQueue.splice(queueIdx, 1)
      }

      const img = new Image()
      // fetchpriority: alto para frames urgentes (ventana activa), bajo para fondo
      img.fetchPriority = isUrgent ? 'high' : 'low'
      img.decoding = 'async'
      pendingFrames.add(frameIndex)
      img.src = getHeroFrameSrc(frameIndex)

      img.onload = () => {
        pendingFrames.delete(frameIndex)
        if (isDisposed) return

        cache.set(frameIndex, img, heroFrameIndexRef.current)

        if (frameIndex === heroFrameIndexRef.current || frameIndex === 0) {
          drawFrame(heroFrameIndexRef.current)
        }
      }

      img.onerror = () => {
        // Si falla una carga, remover del pending para que pueda reintentar
        pendingFrames.delete(frameIndex)
      }
    }

    // ── Preload de fondo — diferido al idle del browser ─────────────────────
    // Solo arranca cuando el LCP ya está pintado y el hilo está libre.
    // Usa requestIdleCallback si está disponible, sino setTimeout con delay alto.

    const startBackgroundPreload = () => {
      if (heroFullPreloadStartedRef.current) return
      heroFullPreloadStartedRef.current = true

      const loadNextBatch = (deadline) => {
        if (isDisposed || backgroundQueue.length === 0) return

        // Con deadline (requestIdleCallback): cargar mientras haya tiempo idle
        // Sin deadline (fallback): cargar el batch fijo
        const batchSize = deadline
          ? Math.min(HERO_BACKGROUND_PRELOAD_BATCH_SIZE, backgroundQueue.length)
          : HERO_BACKGROUND_PRELOAD_BATCH_SIZE

        let loaded = 0
        while (
          loaded < batchSize &&
          backgroundQueue.length > 0 &&
          (!deadline || deadline.timeRemaining() > 5)
        ) {
          const frameIndex = backgroundQueue.shift()
          ensureFrameLoaded(frameIndex, false)
          loaded++
        }

        if (backgroundQueue.length > 0) {
          if (typeof requestIdleCallback !== 'undefined') {
            idleCallbackId = requestIdleCallback(loadNextBatch, { timeout: 2000 })
          } else {
            preloadTimeout = window.setTimeout(() => loadNextBatch(null), HERO_BACKGROUND_PRELOAD_DELAY_MS)
          }
        }
      }

      // Diferir el arranque del preload de fondo:
      // esperamos a que el primer frame esté pintado + 300ms de margen
      const startDelay = 300
      preloadTimeout = window.setTimeout(() => {
        if (typeof requestIdleCallback !== 'undefined') {
          idleCallbackId = requestIdleCallback(loadNextBatch, { timeout: 2000 })
        } else {
          loadNextBatch(null)
        }
      }, startDelay)
    }

    // ── Ventana dinámica según velocidad de scroll ──────────────────────────

    const getAdaptiveWindow = (frameIndex) => {
      const now = performance.now()
      const dt = now - heroLastScrollTimeRef.current
      const df = Math.abs(frameIndex - heroLastFrameForVelocityRef.current)

      // frames por ms = velocidad de scroll en términos de secuencia
      const velocity = dt > 0 ? df / dt : 0
      heroScrollVelocityRef.current = velocity
      heroLastScrollTimeRef.current = now
      heroLastFrameForVelocityRef.current = frameIndex

      // Escalar la ventana según velocidad: a mayor velocidad, mayor lookahead
      // velocity 0 → multiplier 1.0, velocity alta → multiplier hasta 2.5
      const velocityMultiplier = Math.min(1 + velocity * 20, HERO_FRAME_WINDOW_VELOCITY_MAX)

      const scrollDir = frameIndex >= heroLastRequestedFrameRef.current ? 1 : -1
      const forward = Math.round(
        (HERO_FRAME_WINDOW_BASE + HERO_FRAME_LOOKAHEAD_MIN) * velocityMultiplier,
      )
      const backward = Math.round(HERO_FRAME_WINDOW_BASE / velocityMultiplier)

      return scrollDir >= 0
        ? { forward, backward }
        : { forward: backward, backward: forward }
    }

    const syncFrameWindow = (frameIndex) => {
      const { forward, backward } = getAdaptiveWindow(frameIndex)
      heroLastRequestedFrameRef.current = frameIndex

      for (let i = frameIndex - backward; i <= frameIndex + forward; i++) {
        ensureFrameLoaded(i, true) // urgente: dentro de la ventana activa
      }
    }

    // ── Canvas size ─────────────────────────────────────────────────────────

    const syncCanvasSize = () => {
      const canvas = heroCanvasRef.current
      isMobileRef.current = window.matchMedia('(max-width: 767px)').matches
      if (!canvas || isMobileRef.current) return

      const vw = window.innerWidth || 1
      const vh = window.innerHeight || 1
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(vw * dpr)
      canvas.height = Math.round(vh * dpr)
      canvas.style.width = `${vw}px`
      canvas.style.height = `${vh}px`

      ensureFrameLoaded(heroFrameIndexRef.current, true)
      syncFrameWindow(heroFrameIndexRef.current)
      drawBestAvailableFrame(heroFrameIndexRef.current)
    }

    // ── Loop principal de scroll ────────────────────────────────────────────

    const updateHeroProgress = () => {
      const hero = heroRef.current
      if (!hero) return

      const rect = hero.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const scrollable = Math.max(rect.height - vh, 1)
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1)
      const frameIndex = Math.min(
        HERO_FRAME_COUNT - 1,
        Math.round(progress * (HERO_FRAME_COUNT - 1)),
      )

      setHeroLogoScale(getHeroLogoScale(frameIndex))
      setHeroContentStyle(getHeroContentStyle(frameIndex))
      setHeroTickerStyle(getHeroTickerStyle(frameIndex))

      if (heroFrameIndexRef.current !== frameIndex) {
        heroFrameIndexRef.current = frameIndex
        syncFrameWindow(frameIndex)
        drawBestAvailableFrame(frameIndex)
      }

      const nextTitle = getHeroTitleIndex(frameIndex, heroTitles.length)
      if (heroTitleIndexRef.current !== nextTitle) {
        heroTitleIndexRef.current = nextTitle
        setHeroTitleIndex(nextTitle)
      }

      const nextTicker = getHeroTickerIndex(frameIndex, tickerWords.length)
      if (heroTickerIndexRef.current !== nextTicker) {
        heroTickerIndexRef.current = nextTicker
        setHeroTickerIndex(nextTicker)
      }

      // Arrancar el preload de fondo una vez que el primer frame esté pintado
      if (heroFirstFramePaintedRef.current) {
        startBackgroundPreload()
      }
    }

    const requestUpdate = () => {
      cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(updateHeroProgress)
    }

    // ── Arranque ────────────────────────────────────────────────────────────
    // Orden crítico:
    // 1. Tamaño del canvas
    // 2. Frame 0 urgente (LCP)
    // 3. Frames críticos iniciales (0–4) para el primer tramo
    // 4. Preload de fondo diferido al idle (se arranca desde updateHeroProgress)

    syncCanvasSize()
    ensureFrameLoaded(0, true)

    // Cargar los frames críticos iniciales con fetchPriority alto
    for (let i = 1; i < HERO_FRAME_CRITICAL_COUNT; i++) {
      ensureFrameLoaded(i, true)
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', syncCanvasSize, { passive: true })
    window.addEventListener('resize', requestUpdate, { passive: true })

    return () => {
      isDisposed = true
      cancelAnimationFrame(frameId)
      window.clearTimeout(preloadTimeout)
      if (typeof cancelIdleCallback !== 'undefined') {
        cancelIdleCallback(idleCallbackId)
      }
      cache.clear()
      pendingFrames.clear()
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', syncCanvasSize)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [heroTitles, tickerWords.length])

  // JSX sin cambios — toda la lógica está en el efecto
  return (
    <section className="hero-section" ref={heroRef}>
      <div className="hero-sticky">
        <div className="hero-media" aria-hidden="true">
          <img
            className={`hero-frame-fallback ${hasHeroFirstFrame ? 'is-hidden' : ''}`}
            src="/assets/video-frames/hero-sequence/frame-0001.webp"
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <canvas ref={heroCanvasRef} className="hero-canvas" />
          <video
            ref={heroVideoRef}
            className="hero-video"
            loop
            muted
            playsInline
            preload="metadata"
          >
            <source src="/assets/video/video-glimmer-extended.webm" type="video/webm" />
          </video>
        </div>
        <div className="hero-isotipo" aria-hidden="true">
          <img
            className={`hero-isotipo__image ${isHeroInViewport ? 'spin-loop is-motion-active' : 'spin-loop'}`}
            src="/assets/isotipo-blur.svg"
            alt=""
            width="88"
            height="88"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{ '--spin-scale': heroLogoScale }}
          />
        </div>
        <div
          className="hero-ticker-stage"
          aria-hidden="true"
          style={{
            ...heroTickerStyle,
            pointerEvents: 'none',
            transition: 'opacity 140ms linear, transform 140ms linear',
          }}
        >
          <div className="hero-ticker-stage__viewport">
            <span className="hero-ticker-mask">
              <span
                key={heroTickerIndex}
                className="hero-ticker-text ticker-word type-title-bigger-size type-title-light is-active"
              >
                {tickerWords[heroTickerIndex]}
              </span>
            </span>
          </div>
        </div>
        <div className="page-shell">
          <div
            className="hero-grid"
            id="top"
            style={{
              ...heroContentStyle,
              pointerEvents: heroContentStyle.opacity <= 0 ? 'none' : undefined,
              transition: 'opacity 120ms linear, transform 120ms linear',
            }}
          >
            <div data-reveal style={{ '--reveal-delay': '140ms' }} className='w-full'>
              <h1 className="hero-title type-title-bigger-size type-title-light pb-6 w-full">
                <span className="hero-title-mask">
                  <span key={heroTitleIndex} className="hero-title-text">
                    {heroTitles[heroTitleIndex].map((line) => (
                      <span key={line} className="hero-title-line">{line}</span>
                    ))}
                  </span>
                </span>
              </h1>
              <p className='type-description-size w-full'>{t('hero.description')}</p>
            </div>
            <div className="hero-actions" data-reveal style={{ '--reveal-delay': '220ms' }}>
              <div className="hero-trust">
                <p>{t('hero.trust')}</p>
                <div className="hero-logo-row">
                  <div className={`hero-logo-track ${isHeroInViewport ? 'is-motion-active' : ''}`}>
                    {[...clientLogos, ...clientLogos].map((logo, index) => (
                      <span
                        key={`${logo.name}-${index}`}
                        className="hero-logo-item"
                        aria-hidden={index >= clientLogos.length}
                      >
                        <img src={logo.src} alt={index < clientLogos.length ? logo.name : ''} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="hero-button-row">
                <Button href="mailto:hola@glimmer.ai" radius="full" background="white">
                  {t('nav.cta')}
                </Button>
                <Button href="#producto" className="hero-nav-cta" radius="full" background="transparentBlack">
                  {t('hero.secondaryCta')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection