import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../Button'
import useSectionReveal from '../../hooks/useSectionReveal'

const HERO_FRAME_COUNT = 626

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

const getHeroFrameSrc = (index) =>
  `/assets/video-frames/hero-sequence/frame-${String(index + 1).padStart(4, '0')}.webp`

const getHeroTitleIndex = (frameIndex, titleCount) => {
  if (titleCount <= 1) {
    return 0
  }

  return Math.min(
    titleCount - 1,
    Math.floor((frameIndex / HERO_FRAME_COUNT) * titleCount),
  )
}

function HeroSection() {
  const { t } = useTranslation()
  const heroRef = useRef(null)
  const heroCanvasRef = useRef(null)
  const heroFrameImagesRef = useRef([])
  const heroFrameIndexRef = useRef(0)
  const heroTitleIndexRef = useRef(0)
  const [heroLogoScale, setHeroLogoScale] = useState(1)
  const [heroTitleIndex, setHeroTitleIndex] = useState(0)

  const heroTitles = t('hero.titles', { returnObjects: true })

  useSectionReveal(heroRef, [heroTitles])

  useEffect(() => {
    let frameId = 0
    let isDisposed = false

    const drawFrame = (frameIndex) => {
      const canvas = heroCanvasRef.current
      const image = heroFrameImagesRef.current[frameIndex]
      if (!canvas || !image || !image.complete) {
        return
      }

      const context = canvas.getContext('2d')
      if (!context) {
        return
      }

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

    const syncCanvasSize = () => {
      const canvas = heroCanvasRef.current
      if (!canvas) {
        return
      }

      const viewportWidth = window.innerWidth || 1
      const viewportHeight = window.innerHeight || 1
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(viewportWidth * pixelRatio)
      canvas.height = Math.round(viewportHeight * pixelRatio)
      canvas.style.width = `${viewportWidth}px`
      canvas.style.height = `${viewportHeight}px`

      drawFrame(heroFrameIndexRef.current)
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

      setHeroLogoScale(1 + progress)

      const frameIndex = Math.min(
        HERO_FRAME_COUNT - 1,
        Math.round(progress * (HERO_FRAME_COUNT - 1)),
      )

      if (heroFrameIndexRef.current !== frameIndex) {
        heroFrameIndexRef.current = frameIndex
        drawFrame(frameIndex)
      }

      const nextTitleIndex = getHeroTitleIndex(frameIndex, heroTitles.length)
      if (heroTitleIndexRef.current !== nextTitleIndex) {
        heroTitleIndexRef.current = nextTitleIndex
        setHeroTitleIndex(nextTitleIndex)
      }
    }

    const requestUpdate = () => {
      cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(updateHeroProgress)
    }

    heroFrameImagesRef.current = Array.from({ length: HERO_FRAME_COUNT }, (_, index) => {
      const image = new Image()
      image.decoding = 'async'
      image.src = getHeroFrameSrc(index)
      image.onload = () => {
        if (isDisposed) {
          return
        }

        if (index === 0 || index === heroFrameIndexRef.current) {
          drawFrame(heroFrameIndexRef.current)
        }
      }
      return image
    })

    syncCanvasSize()
    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', syncCanvasSize)

    return () => {
      isDisposed = true
      cancelAnimationFrame(frameId)
      heroFrameImagesRef.current.forEach((image) => {
        image.onload = null
      })
      heroFrameImagesRef.current = []
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', syncCanvasSize)
    }
  }, [heroTitles])

  return (
    <section className="hero-section" ref={heroRef}>
      <div className="hero-sticky">
        <div className="hero-media" aria-hidden="true">
          <canvas ref={heroCanvasRef} className="hero-canvas" />
        </div>
        <div className="hero-isotipo" aria-hidden="true">
          <img
            className="spin-loop hero-isotipo__image"
            src="/assets/isotipo-blur.svg"
            alt=""
            style={{ '--spin-scale': heroLogoScale }}
          />
        </div>
        <div className="page-shell">
          <header className="hero-nav" data-reveal style={{ '--reveal-delay': '60ms' }}>
            <a className="hero-brand" href="#top" aria-label="Glimmer">
              <img src="/assets/isologotipo.svg" alt="Glimmer" />
            </a>
            <nav className="hero-links">
              <a href="#casos">{t('nav.casos')}</a>
              <a href="#producto">{t('nav.producto')}</a>
              <a href="#impacto">{t('nav.impacto')}</a>
            </nav>
            <Button
              href="mailto:hola@glimmer.ai"
              className="hero-nav-cta"
              radius="sharp"
              background="transparentBlack"
            >
              {t('nav.cta')}
            </Button>
          </header>

          <div className="hero-grid" id="top">
            <div className="hero-copy" data-reveal style={{ '--reveal-delay': '140ms' }}>
              <h1 className="hero-title">
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
              <p>{t('hero.description')}</p>
            </div>

            <div className="hero-actions" data-reveal style={{ '--reveal-delay': '220ms' }}>
              <div className="hero-trust">
                <p>{t('hero.trust')}</p>
                <div className="hero-logo-row">
                  <div className="hero-logo-track">
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
                <Button
                  href="mailto:hola@glimmer.ai"
                  radius="full"
                  background="white"
                  fullWidth
                >
                  {t('nav.cta')}
                </Button>
                <Button
                  href="#producto"
                  radius="sharp"
                  background="transparentWhite"
                  fullWidth
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
