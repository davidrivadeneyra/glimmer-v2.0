import { useRef } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import useInViewport from '../../hooks/useInViewport'
import useSectionReveal from '../../hooks/useSectionReveal'

function StatsSection({ stats }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const isSectionInViewport = useInViewport(sectionRef, { threshold: 0.2 })
  const leftCard = stats[0]
  const rightCard = stats[1]

  useSectionReveal(sectionRef, [stats])

  return (
    <section className="stats-section" id="impacto" ref={sectionRef}>
      <div className="page-shell">
        <div
          className="section-header section-header--center"
          data-reveal
          style={{ '--reveal-delay': '40ms' }}
        >
          <span className="type-subheadline-size type-subheadline-blue">{t('stats.eyebrow')}</span>
          <h2 className="type-title-big-size type-title-dark">
            {t('stats.title')}
          </h2>
          
        </div>

        <div className="stats-grid pb-10">
       
          <article
            className="stat-card bg-background-white-surface"
            data-reveal
            style={{ '--reveal-delay': '120ms' }}
          >
            <img className='absolute w-[480px] h-[480px] top-[-50%] right-[-25%]' src="/assets/logos/logo-outline-blue.svg" alt="" />
            <img className={`ticker-logo spin-loop h-12 w-12 mb-12 ${isSectionInViewport ? 'is-motion-active' : ''}`} src="/assets/logos/isotipo-dark.svg" alt="" />
            <strong className='type-title-big-size type-title-dark'>{leftCard.value}</strong>
            <p className='type-description-size text-description-light'>{leftCard.description}</p>
          </article>

          <article
            className="stat-card stat-card--right bg-accent"
            data-reveal
            style={{ '--reveal-delay': '200ms' }}
          >
            <img className='absolute w-[480px] h-[480px] top-[-50%] right-[-25%]' src="/assets/logos/logo-outline-white.svg" alt="" />
            <img className={`ticker-logo spin-loop h-12 w-12 mb-12 ${isSectionInViewport ? 'is-motion-active' : ''}`} src="/assets/logos/isotipo.svg" alt="" />
            <strong className='type-title-big-size'>{rightCard.value}</strong>
            <p className='type-description-size'>{rightCard.description}</p>
          </article>
        </div>
        <div
          className='flex justify-center'
          data-reveal
          style={{ '--reveal-delay': '260ms' }}
        >
          <p className="type-description-size max-w-[655px] text-title-darker text-center">
            {t('stats.description')}
          </p>
        </div>
       
      </div>
    </section>
  )
}

StatsSection.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

export default StatsSection
