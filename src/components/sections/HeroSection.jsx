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
  35,
  75,
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

const HERO_TICKER_START_FRAME = 170
const HERO_TICKER_FRAME_STEP = 33
const HERO_FRAME_PRELOAD_RADIUS = 150
const HERO_FRAME_CACHE_RADIUS = 150
const MOBILE_BREAKPOINT_MEDIA_QUERY = '(max-width: 767px)'
const MOBILE_TITLE_TYPE_SPEED = 42
const MOBILE_TITLE_HOLD_SPEED = 1250
const MOBILE_TITLE_DELETE_SPEED = 22
const MOBILE_TITLE_GAP_SPEED = 220

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
  const introEndFrame = 279/2
  const outroStartFrame = 280/2
  const outroEndFrame = 294/2
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
  const fadeStartFrame = 280/2
  const fadeEndFrame = 294/2

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
  const tickerStartFrame = 170
  const tickerFadeSpan = 9

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
  const heroTitleIndexRef = useRef(0)
  const heroTickerIndexRef = useRef(0)
  const isMobileRef = useRef(false)
  const [isMobile, setIsMobile] = useState(false)
  const [heroLogoScale, setHeroLogoScale] = useState(1)
  const [heroTitleIndex, setHeroTitleIndex] = useState(0)
  const [heroContentStyle, setHeroContentStyle] = useState(() => getHeroContentStyle(0))
  const [heroTickerStyle, setHeroTickerStyle] = useState(() => getHeroTickerStyle(0))
  const [heroTickerIndex, setHeroTickerIndex] = useState(0)
  const [mobileTerminalText, setMobileTerminalText] = useState('')

  const heroTitles = t('hero.titles', { returnObjects: true })
  const tickerWords = t('ticker.words', { returnObjects: true })
  const heroTitlesKey = JSON.stringify(heroTitles)

  useSectionReveal(heroRef, [heroTitles])
  useViewportVideo(heroVideoRef)
  const isHeroInViewport = useInViewport(heroRef, { threshold: 0.15 })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_MEDIA_QUERY)

    const syncMobileState = () => {
      const matches = mediaQuery.matches
      isMobileRef.current = matches
      setIsMobile(matches)
    }

    syncMobileState()
    mediaQuery.addEventListener('change', syncMobileState)

    return () => {
      mediaQuery.removeEventListener('change', syncMobileState)
    }
  }, [])

  useEffect(() => {
    if (!isMobile || !heroTitles.length) {
      setMobileTerminalText('')
      return undefined
    }

    const sequences = heroTitles.map((title) => title.join('\n'))
    let timeoutId = 0
    let sequenceIndex = 0
    let charIndex = 0
    let deleting = false

    const renderFrame = () => {
      const visibleText = sequences[sequenceIndex].slice(0, charIndex)
      setMobileTerminalText(visibleText)
    }

    const step = () => {
      const activeSequence = sequences[sequenceIndex]

      if (!deleting && charIndex < activeSequence.length) {
        charIndex += 1
        renderFrame()
        timeoutId = window.setTimeout(step, MOBILE_TITLE_TYPE_SPEED)
        return
      }

      if (!deleting) {
        deleting = true
        timeoutId = window.setTimeout(step, MOBILE_TITLE_HOLD_SPEED)
        return
      }

      if (charIndex > 0) {
        charIndex -= 1
        renderFrame()
        timeoutId = window.setTimeout(step, MOBILE_TITLE_DELETE_SPEED)
        return
      }

      deleting = false
      sequenceIndex = (sequenceIndex + 1) % sequences.length
      timeoutId = window.setTimeout(step, MOBILE_TITLE_GAP_SPEED)
    }

    setMobileTerminalText('')
    timeoutId = window.setTimeout(step, MOBILE_TITLE_GAP_SPEED)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [heroTitlesKey, isMobile])

  useEffect(() => {
    if (isMobile) {
      setHeroLogoScale(1)
      setHeroContentStyle({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
      })
      setHeroTickerStyle({
        opacity: 0,
        transform: 'translate3d(0, 32px, 0)',
      })
      return undefined
    }

    let frameId = 0
    let isDisposed = false
    const canvasContextRef = { current: null }
    const loadedFrames = heroFrameImagesRef.current
    const pendingFrames = heroPendingFramesRef.current

    const drawFrame = (frameIndex) => {
      if (isMobileRef.current) {
        return
      }

      const canvas = heroCanvasRef.current
      const image = loadedFrames.get(frameIndex)
      if (!canvas || !image || !image.complete) {
        return
      }

      const context = canvasContextRef.current ?? canvas.getContext('2d')
      if (!context) {
        return
      }

      canvasContextRef.current = context

      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      if (!canvasWidth || !canvasHeight) {
        return
      }

      const imageWidth = image.naturalWidth || image.width
      const imageHeight = image.naturalHeight || image.height
      if (!imageWidth || !imageHeight) {
        return
      }

      const scale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight)
      const drawWidth = imageWidth * scale
      const drawHeight = imageHeight * scale
      const offsetX = (canvasWidth - drawWidth) * 0.5
      const offsetY = (canvasHeight - drawHeight) * 0.5

      context.clearRect(0, 0, canvasWidth, canvasHeight)
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
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

    const syncFrameWindow = (frameIndex) => {
      for (
        let preloadIndex = frameIndex - HERO_FRAME_PRELOAD_RADIUS;
        preloadIndex <= frameIndex + HERO_FRAME_PRELOAD_RADIUS;
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
      isMobileRef.current = window.matchMedia(MOBILE_BREAKPOINT_MEDIA_QUERY).matches

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
      drawFrame(heroFrameIndexRef.current)
    }

    const updateHeroProgress = () => {
      if (isMobileRef.current) {
        setHeroLogoScale(1)
        setHeroContentStyle({
          opacity: 1,
          transform: 'translate3d(0, 0, 0)',
        })
        setHeroTickerStyle({
          opacity: 0,
          transform: 'translate3d(0, 32px, 0)',
        })
        return
      }

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
        drawFrame(frameIndex)
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
    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', syncCanvasSize)
    window.addEventListener('resize', requestUpdate)

    return () => {
      isDisposed = true
      cancelAnimationFrame(frameId)
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
  }, [heroTitlesKey, isMobile, tickerWords.length])

  return (
    <section className="hero-section" ref={heroRef}>
      <div className="hero-sticky">
        <div className="hero-media" aria-hidden="true">
          <canvas ref={heroCanvasRef} className="hero-canvas" />
          <video
            ref={heroVideoRef}
            className="hero-video"
            loop
            muted
            playsInline
            preload="metadata"
          >
            <source src="/assets/video/final-video-hero-limmer.mp4" type="video/mp4" />
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
            data-mobile={isMobile ? 'true' : 'false'}
            id="top"
            style={{
              ...(isMobile
                ? {
                    opacity: 1,
                    transform: 'translate3d(0, 0, 0)',
                    pointerEvents: undefined,
                    transition: 'none',
                  }
                : {
                    ...heroContentStyle,
                    pointerEvents: heroContentStyle.opacity <= 0 ? 'none' : undefined,
                    transition: 'opacity 120ms linear, transform 120ms linear',
                  }),
            }}
          >
            <div data-reveal style={{ '--reveal-delay': '140ms' }} className='w-full'>
              <h1 className="hero-title type-title-bigger-size type-title-light pb-6 w-full">
                <span className="hero-title-mask">
                  <span
                    key={heroTitleIndex}
                    className={`hero-title-text ${isMobile ? 'hero-title-text--mobile-hidden' : ''}`}
                  >
                    {heroTitles[heroTitleIndex].map((line) => (
                      <span key={line} className="hero-title-line">
                        {line}
                      </span>
                    ))}
                  </span>
                  <span className={`hero-title-terminal ${isMobile ? 'is-mobile-visible' : ''}`} aria-live="polite">
                    <span className="hero-title-terminal__line">
                      <span className="hero-title-terminal__text">{mobileTerminalText}</span>
                      <span className="hero-title-terminal__cursor" aria-hidden="true">|</span>
                    </span>
                  </span>
                </span>
              </h1>
              <div className="hero-mobile-title-ticker opacity-75" aria-hidden="true">
                <div className="hero-mobile-title-ticker__viewport">
                  <span className="hero-mobile-title-ticker__mask">
                    {[...tickerWords, ...tickerWords].map((word, index) => (
                      <span
                        key={`${word}-${index}`}
                        className="hero-mobile-title-ticker__text ticker-word type-title-regular-size type-title-light"
                      >
                        {word}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
              <p className='type-description-size w-full'>{t('hero.description')}</p>
            </div>

            <div className="hero-actions" data-reveal style={{ '--reveal-delay': '220ms' }}>
              <div className="hero-trust">
                <p className='type-description-size text-description-dark pb-6 md:pb-4'>{t('hero.trust')}</p>
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
