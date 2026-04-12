import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import useSectionReveal from '../../hooks/useSectionReveal'

const getOpportunityScrollSpan = (lineCount) => `${Math.max(lineCount * 55, 220)}vh`

const getActiveOpportunityLine = (scrollProgress, opportunityLines) => {
  const lineCount = opportunityLines.length

  if (lineCount === 0) {
    return null
  }

  const boundedProgress = Math.min(Math.max(scrollProgress, 0), 0.999999)
  const index = Math.min(lineCount - 1, Math.floor(boundedProgress * lineCount))

  return {
    index,
    line: opportunityLines[index],
  }
}

function OpportunitySection({ opportunityLines }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const progressRef = useRef(0)
  const activeLineRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useSectionReveal(sectionRef, [opportunityLines])

  useEffect(() => {
    let animationFrameId = 0

    const updateOpportunityProgress = () => {
      const section = sectionRef.current
      if (!section) {
        return
      }

      const rect = section.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 1
      const scrollableDistance = Math.max(rect.height - viewportHeight, 1)
      const nextProgress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1)

      if (progressRef.current !== nextProgress) {
        progressRef.current = nextProgress
        setScrollProgress(nextProgress)
      }
    }

    const requestUpdate = () => {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = window.requestAnimationFrame(updateOpportunityProgress)
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  const activeLine = getActiveOpportunityLine(scrollProgress, opportunityLines)

  useLayoutEffect(() => {
    if (!activeLineRef.current || !activeLine) {
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(activeLineRef.current, { clearProps: 'opacity,transform' })
      return
    }

    const animation = gsap.from(activeLineRef.current, {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'power2.out',
    })

    return () => {
      animation.kill()
    }
  }, [activeLine?.index])

  return (
    <section
      className="opportunity-section"
      ref={sectionRef}
      style={{ '--opportunity-scroll-span': getOpportunityScrollSpan(opportunityLines.length) }}
    >
      <div className="opportunity-sticky">
        <div className="opportunity-media" aria-hidden="true">
          <video
            className="opportunity-video"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src="/assets/video/opportunity-section.webm" type="video/webm" />
          </video>
          <div className="opportunity-media-wash" />
        </div>

        <div className="page-shell h-svh flex flex-col justify-center">
          <div className="opportunity-meta" data-reveal style={{ '--reveal-delay': '40ms' }}>
            <img className="ticker-logo spin-loop h-12 w-12 mb-8" src="/assets/isotipo.svg" alt="" />
            <span className="type-subheadline-size opacity-40">{t('opportunity.eyebrow')}</span>
            <p>{t('opportunity.lead')}</p>
            
          </div>

          <div className="opportunity-lines">
            {activeLine ? (
              <div className="opportunity-line-stage">
                <div className="opportunity-line-stage__viewport">
                  <span className="opportunity-line-mask">
                    <span
                      key={activeLine.index}
                      ref={activeLineRef}
                      className={`opportunity-line-text text type-title-big-size type-title-light ${activeLine.index === 0 ? 'opportunity-line-text--lead' : ''}`}
                    >
                      {activeLine.line}
                    </span>
                  </span>
                </div>
              </div>
            ) : null}
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
