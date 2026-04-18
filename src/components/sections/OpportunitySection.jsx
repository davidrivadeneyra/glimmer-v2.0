import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import useInViewport from '../../hooks/useInViewport'
import useSectionReveal from '../../hooks/useSectionReveal'
import useViewportVideo from '../../hooks/useViewportVideo'
import Button from '../Button'

function OpportunitySection({ opportunityLines, onDemoRequest }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const [videoOffset, setVideoOffset] = useState(0)

  useSectionReveal(sectionRef, [opportunityLines])
  useViewportVideo(videoRef)
  const isSectionInViewport = useInViewport(sectionRef, { threshold: 0.15 })

  useEffect(() => {
    let animationFrameId = 0

    const updateVideoOffset = () => {
      const section = sectionRef.current
      if (!section) {
        return
      }

      const rect = section.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 1
      const distanceToCenter = rect.top + rect.height / 2 - viewportHeight / 2
      const nextOffset = Math.max(Math.min(distanceToCenter * -0.16, 96), -96)

      setVideoOffset(nextOffset)
    }

    const requestUpdate = () => {
      window.cancelAnimationFrame(animationFrameId)
      animationFrameId = window.requestAnimationFrame(updateVideoOffset)
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  return (
    <section className="opportunity-section" ref={sectionRef}>
      <div className="opportunity-media" aria-hidden="true">
        <video
          ref={videoRef}
          className="opportunity-video"
          loop
          muted
          playsInline
          preload="metadata"
          style={{ transform: `translate3d(0, ${videoOffset}px, 0) scale(1.14)` }}
        >
          <source src="/assets/video/opportunity-section.mp4" type="video/mp4" />
        </video>
        <div className="opportunity-media-wash" />
      </div>

      <div className="page-shell opportunity-shell">
        <div className="opportunity-header">
          <img
            className={`ticker-logo spin-loop ${isSectionInViewport ? 'is-motion-active' : ''}`}
            src="/assets/logos/isotipo.svg"
            alt=""
          />
          <span className="type-subheadline-size opacity-40">{t('opportunity.eyebrow')}</span>
          <h2 className="opportunity-title type-title-big-size type-title-light">
            {t('opportunity.lead')}
          </h2>
          <Button radius="full" background="white" className="w-fit" onClick={onDemoRequest}>
            {t('nav.cta')}
          </Button>
        </div>

        <div className="opportunity-cards">
          {opportunityLines.map((line, index) => (
            <article
              className="opportunity-card"
              data-reveal
              key={line}
              style={{ '--reveal-delay': `${120 + index * 70}ms` }}
            >
              <img
                className={`ticker-logo spin-loop ${isSectionInViewport ? 'is-motion-active' : ''}`}
                src="/assets/logos/isotipo.svg"
                alt=""
              />
              <p className="opportunity-card__text type-title-regular-size type-title-light">
                {line}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

OpportunitySection.propTypes = {
  opportunityLines: PropTypes.arrayOf(PropTypes.string).isRequired,
  onDemoRequest: PropTypes.func.isRequired,
}

export default OpportunitySection
