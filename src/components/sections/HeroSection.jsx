import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../Button'
import useInViewport from '../../hooks/useInViewport'
import useSectionReveal from '../../hooks/useSectionReveal'
import useViewportVideo from '../../hooks/useViewportVideo'
import { HERO_FRAME_COUNT, getHeroFrameSrc } from '../../lib/heroFrames'

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

const HERO_TITLE_START_FRAMES = [
  0,
  73,
  147,
]

const getHeroTitleIndex = (frameIndex, titleCount) => {
  if (titleCount <= 1) {
    return 0
  }

  const lastConfiguredIndex = Math.min(titleCount, HERO_TITLE_START_FRAMES.length) - 1

  for (let index = lastConfiguredIndex; index >= 0; index -= 1) {
    if (frameIndex >= HERO_TITLE_START_FRAMES[index]) {
      return index
    }
  }

  return 0
}

const HERO_TICKER_START_FRAME = 340
const HERO_TICKER_FRAME_STEP = 66
const HERO_BACKGROUND_PRELOAD_BATCH_SIZE = 48
const HERO_BACKGROUND_PRELOAD_DELAY_MS = 30
const HERO_FRAME_PRIORITY_RADIUS = 350
const HERO_FRAME_DIRECTIONAL_FORWARD = 350
const HERO_FRAME_DIRECTIONAL_BACKWARD = 350
const HERO_FRAME_CACHE_RADIUS = HERO_FRAME_COUNT

const getHeroTickerIndex = (frameIndex, tickerCount) => {
  if (tickerCount <= 1 || frameIndex < HERO_TICKER_START_FRAME) {
    return 0
  }

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

  if (frameIndex <= introEndFrame) {
    return 1 + (introScale - 1) * (frameIndex / introEndFrame)
  }

  if (frameIndex <= outroEndFrame) {
    const outroProgress = (frameIndex - outroStartFrame) / (outroEndFrame - outroStartFrame)
    return Math.max(introScale * (1 - outroProgress), 0)
  }

  return 0
}

const getHeroContentStyle = (frameIndex) => {
  const fadeStartFrame = 280
  const fadeEndFrame = 294

  if (frameIndex < fadeStartFrame) {
    return {
      opacity: 1,
      transform: 'translate3d(0, 0, 0)',
    }
  }

  if (frameIndex > fadeEndFrame) {
    return {
      opacity: 0,
      transform: 'translate3d(0, 32px, 0)',
    }
  }

  const fadeProgress = (frameIndex - fadeStartFrame) / (fadeEndFrame - fadeStartFrame)

  return {
    opacity: Math.max(1 - fadeProgress, 0),
    transform: `translate3d(0, ${Math.round(fadeProgress * 32)}px, 0)`,
  }
}

const getHeroTickerStyle = (frameIndex) => {
  const tickerStartFrame = 340
  const tickerFadeSpan = 18

  if (frameIndex < tickerStartFrame) {
    return {
      opacity: 0,
      transform: 'translate3d(0, 32px, 0)',
    }
  }

  const revealProgress = Math.min((frameIndex - tickerStartFrame) / tickerFadeSpan, 1)

  return {
    opacity: revealProgress,
    transform: `translate3d(0, ${Math.round((1 - revealProgress) * 32)}px, 0)`,
  }
}

function HeroSection() {
  const { t } = useTranslation()
  const heroRef = useRef(null)
  const heroCanvasRef = useRef(null)
  const heroVideoRef = useRef(null)
  const heroFrameImagesRef = useRef(new Map())
  const heroPendingFramesRef = useRef(new Set())
  const heroFrameIndexRef = useRef(0)
  const heroLastRequestedFrameRef = useRef(0)
  const heroLastDrawnFrameRef = useRef(-1)
  const heroFirstFramePaintedRef = useRef(false)
  const heroFullPreloadStartedRef = useRef(false)
  const heroTitleIndexRef = useRef(0)
  const heroTickerIndexRef = useRef(0)
  const isMobileRef = useRef(false)
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
    const canvasContextRef = { current: null }
    const loadedFrames = heroFrameImagesRef.current
    const pendingFrames = heroPendingFramesRef.current
    const preloadQueue = Array.from({ length: HERO_FRAME_COUNT - 1 }, (_, index) => index + 1)

    const drawFrame = (frameIndex) => {
      if (isMobileRef.current) {
        return false
      }

      const canvas = heroCanvasRef.current
      const image = loadedFrames.get(frameIndex)
      if (!canvas || !image || !image.complete) {
        return false
      }

      const context = canvasContextRef.current ?? canvas.getContext('2d')
      if (!context) {
        return false
      }

      canvasContextRef.current = context

      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      if (!canvasWidth || !canvasHeight) {
        return false
      }

      const imageWidth = image.naturalWidth || image.width
      const imageHeight = image.naturalHeight || image.height
      if (!imageWidth || !imageHeight) {
        return false
      }

      const scale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight)
      const drawWidth = imageWidth * scale
      const drawHeight = imageHeight * scale
      const offsetX = (canvasWidth - drawWidth) * 0.5
      const offsetY = (canvasHeight - drawHeight) * 0.5

      context.clearRect(0, 0, canvasWidth, canvasHeight)
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)

      heroLastDrawnFrameRef.current = frameIndex

      if (!heroFirstFramePaintedRef.current) {
        heroFirstFramePaintedRef.current = true
        setHasHeroFirstFrame(true)
      }

      return true
    }

    const drawBestAvailableFrame = (frameIndex) => {
      if (drawFrame(frameIndex)) {
        return
      }

      if (heroLastDrawnFrameRef.current >= 0) {
        drawFrame(heroLastDrawnFrameRef.current)
      }
    }

    const unloadFrame = (frameIndex) => {
      const image = loadedFrames.get(frameIndex)
      if (!image) {
        return
      }

      image.onload = null
      image.src = ''
      loadedFrames.delete(frameIndex)
      pendingFrames.delete(frameIndex)
    }

    const ensureFrameLoaded = (frameIndex) => {
      if (frameIndex < 0 || frameIndex >= HERO_FRAME_COUNT) {
        return
      }

      if (
        loadedFrames.has(frameIndex) ||
        pendingFrames.has(frameIndex)
      ) {
        return
      }

      const preloadQueueIndex = preloadQueue.indexOf(frameIndex)
      if (preloadQueueIndex >= 0) {
        preloadQueue.splice(preloadQueueIndex, 1)
      }

      const image = new Image()
      pendingFrames.add(frameIndex)
      image.decoding = 'async'
      image.src = getHeroFrameSrc(frameIndex)
      image.onload = () => {
        pendingFrames.delete(frameIndex)

        if (isDisposed) {
          return
        }

        loadedFrames.set(frameIndex, image)

        if (frameIndex === heroFrameIndexRef.current || frameIndex === 0) {
          drawFrame(heroFrameIndexRef.current)
        }
      }
    }

    const startFullFramePreload = () => {
      if (heroFullPreloadStartedRef.current) {
        return
      }

      heroFullPreloadStartedRef.current = true

      const loadNextBatch = () => {
        if (isDisposed || preloadQueue.length === 0) {
          return
        }

        const nextBatch = preloadQueue.splice(0, HERO_BACKGROUND_PRELOAD_BATCH_SIZE)
        nextBatch.forEach((frameIndex) => {
          ensureFrameLoaded(frameIndex)
        })

        preloadTimeout = window.setTimeout(loadNextBatch, HERO_BACKGROUND_PRELOAD_DELAY_MS)
      }

      loadNextBatch()
    }

    const syncFrameWindow = (frameIndex) => {
      const previousFrameIndex = heroLastRequestedFrameRef.current
      const scrollDirection = frameIndex >= previousFrameIndex ? 1 : -1
      const backwardRadius =
        scrollDirection >= 0
          ? HERO_FRAME_PRIORITY_RADIUS + HERO_FRAME_DIRECTIONAL_BACKWARD
          : HERO_FRAME_PRIORITY_RADIUS + HERO_FRAME_DIRECTIONAL_FORWARD
      const forwardRadius =
        scrollDirection >= 0
          ? HERO_FRAME_PRIORITY_RADIUS + HERO_FRAME_DIRECTIONAL_FORWARD
          : HERO_FRAME_PRIORITY_RADIUS + HERO_FRAME_DIRECTIONAL_BACKWARD

      heroLastRequestedFrameRef.current = frameIndex

      for (
        let preloadIndex = frameIndex - backwardRadius;
        preloadIndex <= frameIndex + forwardRadius;
        preloadIndex += 1
      ) {
        ensureFrameLoaded(preloadIndex)
      }

      loadedFrames.forEach((_, loadedFrameIndex) => {
        if (Math.abs(loadedFrameIndex - frameIndex) > HERO_FRAME_CACHE_RADIUS) {
          unloadFrame(loadedFrameIndex)
        }
      })
    }

    const syncCanvasSize = () => {
      const canvas = heroCanvasRef.current
      isMobileRef.current = window.matchMedia('(max-width: 767px)').matches

      if (!canvas) {
        return
      }

      if (isMobileRef.current) {
        return
      }

      const viewportWidth = window.innerWidth || 1
      const viewportHeight = window.innerHeight || 1
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(viewportWidth * pixelRatio)
      canvas.height = Math.round(viewportHeight * pixelRatio)
      canvas.style.width = `${viewportWidth}px`
      canvas.style.height = `${viewportHeight}px`

      ensureFrameLoaded(heroFrameIndexRef.current)
      syncFrameWindow(heroFrameIndexRef.current)
      drawBestAvailableFrame(heroFrameIndexRef.current)
    }

    const updateHeroProgress = () => {
      const hero = heroRef.current
      if (!hero) {
        return
      }

      const rect = hero.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 1
      const scrollableDistance = Math.max(rect.height - viewportHeight, 1)
      const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1)

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

      const nextTitleIndex = getHeroTitleIndex(frameIndex, heroTitles.length)
      if (heroTitleIndexRef.current !== nextTitleIndex) {
        heroTitleIndexRef.current = nextTitleIndex
        setHeroTitleIndex(nextTitleIndex)
      }

      const nextTickerIndex = getHeroTickerIndex(frameIndex, tickerWords.length)
      if (heroTickerIndexRef.current !== nextTickerIndex) {
        heroTickerIndexRef.current = nextTickerIndex
        setHeroTickerIndex(nextTickerIndex)
      }
    }

    const requestUpdate = () => {
      cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(updateHeroProgress)
    }

    syncCanvasSize()
    ensureFrameLoaded(0)
    startFullFramePreload()
    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', syncCanvasSize)
    window.addEventListener('resize', requestUpdate)

    return () => {
      isDisposed = true
      cancelAnimationFrame(frameId)
      window.clearTimeout(preloadTimeout)
      loadedFrames.forEach((image) => {
        image.onload = null
        image.src = ''
      })
      loadedFrames.clear()
      pendingFrames.clear()
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', syncCanvasSize)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [heroTitles, tickerWords.length])

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
                      <span key={line} className="hero-title-line">
                        {line}
                      </span>
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
                <Button
                  href="#producto"
                  className="hero-nav-cta"
                  radius="full"
                  background="transparentBlack"
                >
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
