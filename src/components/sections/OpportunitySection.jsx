import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import useSectionReveal from '../../hooks/useSectionReveal'
import { HERO_FRAME_COUNT, getHeroFrameSrc } from '../../lib/heroFrames'

const getOpportunityScrollSpan = (lineCount) => `${Math.max(lineCount * 55, 220)}vh`

const getOpportunityLineProgress = (frameIndex, lineIndex, lineCount) => {
  if (lineCount <= 0) {
    return { opacity: 0, translateY: 56 }
  }

  const segmentSize = HERO_FRAME_COUNT / lineCount
  const segmentStart = lineIndex * segmentSize
  const localProgress = Math.min(
    Math.max((frameIndex - segmentStart) / Math.max(segmentSize, 1), 0),
    1,
  )

  let opacity = 0
  let translateY = 56

  if (localProgress >= 0.12 && localProgress < 0.32) {
    const revealProgress = (localProgress - 0.12) / 0.2
    opacity = revealProgress
    translateY = Math.round((1 - revealProgress) * 56)
  } else if (localProgress >= 0.32 && localProgress < 0.68) {
    opacity = 1
    translateY = 0
  } else if (localProgress >= 0.68 && localProgress < 0.9) {
    const exitProgress = (localProgress - 0.68) / 0.22
    opacity = 1 - exitProgress
    translateY = Math.round(exitProgress * -40)
  }

  return { opacity, translateY }
}

function OpportunitySection({ opportunityLines }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const frameImagesRef = useRef([])
  const frameIndexRef = useRef(0)
  const [frameIndex, setFrameIndex] = useState(0)

  useSectionReveal(sectionRef, [opportunityLines])

  useEffect(() => {
    let animationFrameId = 0
    let isDisposed = false

    const drawFrame = (nextFrameIndex) => {
      const canvas = canvasRef.current
      const image = frameImagesRef.current[nextFrameIndex]
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
      const canvas = canvasRef.current
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

      drawFrame(frameIndexRef.current)
    }

    const updateOpportunityProgress = () => {
      const section = sectionRef.current
      if (!section) {
        return
      }

      const rect = section.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 1
      const scrollableDistance = Math.max(rect.height - viewportHeight, 1)
      const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1)
      const nextFrameIndex = Math.min(
        HERO_FRAME_COUNT - 1,
        Math.round(progress * (HERO_FRAME_COUNT - 1)),
      )

      if (frameIndexRef.current !== nextFrameIndex) {
        frameIndexRef.current = nextFrameIndex
        setFrameIndex(nextFrameIndex)
        drawFrame(nextFrameIndex)
      }
    }

    const requestUpdate = () => {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = window.requestAnimationFrame(updateOpportunityProgress)
    }

    frameImagesRef.current = Array.from({ length: HERO_FRAME_COUNT }, (_, index) => {
      const image = new Image()
      image.decoding = 'async'
      image.src = getHeroFrameSrc(index)
      image.onload = () => {
        if (isDisposed) {
          return
        }

        if (index === 0 || index === frameIndexRef.current) {
          drawFrame(frameIndexRef.current)
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
      cancelAnimationFrame(animationFrameId)
      frameImagesRef.current.forEach((image) => {
        image.onload = null
      })
      frameImagesRef.current = []
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', syncCanvasSize)
    }
  }, [])

  return (
    <section
      className="opportunity-section"
      ref={sectionRef}
      style={{ '--opportunity-scroll-span': getOpportunityScrollSpan(opportunityLines.length) }}
    >
      <div className="opportunity-sticky">
        <div className="opportunity-media" aria-hidden="true">
          <canvas ref={canvasRef} className="opportunity-canvas" />
          <div className="opportunity-media-wash" />
        </div>

        <div className="page-shell opportunity-shell">
          <div className="opportunity-meta" data-reveal style={{ '--reveal-delay': '40ms' }}>
            <span className="section-eyebrow">{t('opportunity.eyebrow')}</span>
            <p>{t('opportunity.lead')}</p>
            <img className="ticker-logo spin-loop h-12 w-12 mb-12" src="/assets/isotipo.svg" alt="" />
          </div>

          <div className="opportunity-lines">
            {opportunityLines.map((line, index) => {
              const lineState = getOpportunityLineProgress(
                frameIndex,
                index,
                opportunityLines.length,
              )

              return (
                <p
                  key={line}
                  className={index === 0 ? 'opportunity-lines__lead' : ''}
                  style={{
                    '--line-opacity': lineState.opacity,
                    '--line-translate-y': `${lineState.translateY}px`,
                  }}
                >
                  {line}
                </p>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

OpportunitySection.propTypes = {
  opportunityLines: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default OpportunitySection
