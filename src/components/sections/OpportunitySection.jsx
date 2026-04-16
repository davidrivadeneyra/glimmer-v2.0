import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import useInViewport from '../../hooks/useInViewport'
import useSectionReveal from '../../hooks/useSectionReveal'
import useViewportVideo from '../../hooks/useViewportVideo'
import Button from '../Button'

const OPPORTUNITY_SCROLL_VH_PER_LINE = 90
const OPPORTUNITY_MIN_SCROLL_VH = 360

const getOpportunityScrollSpan = (lineCount) =>
  `${Math.max(lineCount * OPPORTUNITY_SCROLL_VH_PER_LINE, OPPORTUNITY_MIN_SCROLL_VH)}vh`

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

function OpportunitySection({ opportunityLines, onDemoRequest }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const progressRef = useRef(0)
  const activeLineRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useSectionReveal(sectionRef, [opportunityLines])
  useViewportVideo(videoRef)
  const isSectionInViewport = useInViewport(sectionRef, { threshold: 0.15 })

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
  const activeLineIndex = activeLine?.index ?? -1

  useLayoutEffect(() => {
    if (!activeLineRef.current || activeLineIndex < 0) {
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
  }, [activeLineIndex])

  return (
    <section
      className="opportunity-section"
      ref={sectionRef}
      style={{ '--opportunity-scroll-span': getOpportunityScrollSpan(opportunityLines.length) }}
    >
      <div className="opportunity-sticky">
        <div className="opportunity-media" aria-hidden="true">
          <video
            ref={videoRef}
            className="opportunity-video"
            loop
            muted
            playsInline
            preload="metadata"
          >
            <source src="/assets/video/opportunity-section.mp4" type="video/mp4" />
          </video>
          <div className="opportunity-media-wash" />
        </div>

        <div className="page-shell h-svh flex flex-col justify-center">
          <div className="opportunity-meta" data-reveal style={{ '--reveal-delay': '40ms' }}>
            <img
              className={`ticker-logo spin-loop h-12 w-12 mb-8 ${isSectionInViewport ? 'is-motion-active' : ''}`}
              src="/assets/logos/isotipo.svg"
              alt=""
            />
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
          <Button radius="full" background="white" className='w-fit' onClick={onDemoRequest}>
            {t('nav.cta')}
            
          </Button>
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
