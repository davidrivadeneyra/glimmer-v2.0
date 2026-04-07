import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'
import useSectionReveal from '../../hooks/useSectionReveal'

const useCaseCardBackgrounds = [
  '/assets/card-bg/use-01.svg',
  '/assets/card-bg/use-02.svg',
  '/assets/card-bg/use-03.svg',
  '/assets/card-bg/use-04.svg',
  '/assets/card-bg/use-05.svg',
  '/assets/card-bg/use-06.svg',
]

function UseCasesSection({ useCases }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const endHoldVh = 48

  useSectionReveal(sectionRef, [useCases])

  useEffect(() => {
    let frameId = 0

    const updateProgress = () => {
      frameId = 0

      const section = sectionRef.current

      if (!section) {
        return
      }

      const viewportHeight = window.innerHeight || 1
      const scrollableDistance = Math.max(section.offsetHeight - viewportHeight, 1)
      const endHoldDistance = viewportHeight * (endHoldVh / 100)
      const effectiveScrollableDistance = Math.max(scrollableDistance - endHoldDistance, 1)
      const { top } = section.getBoundingClientRect()
      const traveled = Math.min(Math.max(-top, 0), scrollableDistance)
      const nextProgress =
        useCases.length > 1
          ? (Math.min(traveled, effectiveScrollableDistance) / effectiveScrollableDistance) *
            (useCases.length - 1)
          : 0

      setScrollProgress((current) =>
        Math.abs(current - nextProgress) < 0.001 ? current : nextProgress,
      )
    }

    const requestUpdate = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(updateProgress)
      }
    }

    updateProgress()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)

      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [useCases])

  const activeIndex = Math.max(0, Math.min(useCases.length - 1, Math.round(scrollProgress)))
  const wheelRotation = -(scrollProgress * 360) / Math.max(useCases.length, 1)

  return (
    <section
      className="use-cases-section"
      ref={sectionRef}
      style={{ '--use-cases-scroll-span': `${Math.max(280, useCases.length * 56 + endHoldVh)}vh` }}
    >
      <div className="use-cases-sticky">
        <div className="page-shell use-cases-shell">
          <div className="use-cases-header-shell" data-reveal style={{ '--reveal-delay': '40ms' }}>
            <SectionHeader
              eyebrow={t('useCases.eyebrow')}
              title={t('useCases.title')}
              description={t('useCases.description')}
              centered
              theme="dark"
            />
          </div>

          <div className="use-cases-stage" data-reveal style={{ '--reveal-delay': '120ms' }}>
            <div className="use-cases-count" aria-live="polite">
              <strong>{String(activeIndex + 1).padStart(2, '0')}</strong>
              <span>/{String(useCases.length).padStart(2, '0')}</span>
            </div>

            <div className="use-cases-wheel" style={{ '--wheel-rotate': `${wheelRotation}deg` }}>
              {useCases.map((item, index) => {
                const angle = (index * 360) / useCases.length - 90
                const angleInRadians = (angle * Math.PI) / 180
                const translateX = Math.cos(angleInRadians) * 520
                const translateY = Math.sin(angleInRadians) * 520
                const isActive = index === activeIndex

                return (
                  <article
                    className={`use-case-card ${isActive ? 'is-active' : ''}`}
                    key={item.title}
                    style={{
                      '--card-translate-x': `${translateX}px`,
                      '--card-translate-y': `${translateY}px`,
                      '--card-rotate': `${angle + 90}deg`,
                      '--card-z-index': isActive ? '20' : '10',
                      '--use-case-background-image': `url("${useCaseCardBackgrounds[index % useCaseCardBackgrounds.length]}")`,
                    }}
                  >
                    <span className="use-case-card__index">{String(index + 1).padStart(2, '0')}</span>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

UseCasesSection.propTypes = {
  useCases: PropTypes.arrayOf(
    PropTypes.shape({
      copy: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

export default UseCasesSection
