import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../Button'
import useInViewport from '../../hooks/useInViewport'
import useSectionReveal from '../../hooks/useSectionReveal'
import useViewportVideo from '../../hooks/useViewportVideo'

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
const HERO_TIMELINE_FRAME_COUNT = 626

const getHeroTickerIndex = (frameIndex, tickerCount) => {
  if (tickerCount <= 1 || frameIndex < HERO_TICKER_START_FRAME) {
    return 0
  }

  return Math.min(
    Math.floor((frameIndex - HERO_TICKER_START_FRAME) / HERO_TICKER_FRAME_STEP),
    tickerCount - 1,
  )
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
  const heroVideoRef = useRef(null)
  const heroFrameIndexRef = useRef(0)
  const heroTitleIndexRef = useRef(0)
  const heroTickerIndexRef = useRef(0)
  const [heroTitleIndex, setHeroTitleIndex] = useState(0)
  const [heroContentStyle, setHeroContentStyle] = useState(() => getHeroContentStyle(0))
  const [heroTickerStyle, setHeroTickerStyle] = useState(() => getHeroTickerStyle(0))
  const [heroTickerIndex, setHeroTickerIndex] = useState(0)

  const heroTitles = t('hero.titles', { returnObjects: true })
  const tickerWords = t('ticker.words', { returnObjects: true })

  useSectionReveal(heroRef, [heroTitles])
  useViewportVideo(heroVideoRef)
  const isHeroInViewport = useInViewport(heroRef, { threshold: 0.15 })

  useEffect(() => {
    let frameId = 0

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
        HERO_TIMELINE_FRAME_COUNT - 1,
        Math.round(progress * (HERO_TIMELINE_FRAME_COUNT - 1)),
      )

      setHeroContentStyle(getHeroContentStyle(frameIndex))
      setHeroTickerStyle(getHeroTickerStyle(frameIndex))

      if (heroFrameIndexRef.current !== frameIndex) {
        heroFrameIndexRef.current = frameIndex
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

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [heroTitles, tickerWords.length])

  return (
    <section className="hero-section" ref={heroRef}>
      <div className="hero-sticky">
        <div className="hero-media" aria-hidden="true">
          <video
            ref={heroVideoRef}
            className="hero-video"
            loop
            muted
            playsInline
            autoPlay
            preload="none"
            poster="/assets/video/Final Video Hero Glimmer.png"
          >
            <source src="/assets/video/Final Video Hero Glimmer.mp4" type="video/mp4" />
          </video>
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
