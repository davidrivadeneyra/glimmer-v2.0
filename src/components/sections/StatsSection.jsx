import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

function StatsSection({ stats }) {
  const { t } = useTranslation()
  const leftCard = stats[0]
  const rightCard = stats[1]

  return (
    <section className="stats-section" id="impacto">
      <div className="page-shell">
        <div className="section-header section-header--center">
          <span className="section-eyebrow text-accent">{t('stats.eyebrow')}</span>
          <h2 className="section-title text-title-darker">{t('stats.title')}</h2>
          
        </div>

        <div className="stats-grid pb-10">
          <article className="stat-card bg-background-white-surface">
            <img className="ticker-logo spin-loop h-12 w-12 mb-12" src="/assets/isotipo-dark.svg" alt="" />
            <strong className='text-title-darker'>{leftCard.value}</strong>
            <p className='text-description-light-surface'>{leftCard.description}</p>
          </article>

          <article className="stat-card stat-card--right bg-accent">
            <img className="ticker-logo spin-loop h-12 w-12 mb-12" src="/assets/isotipo.svg" alt="" />
            <strong>{rightCard.value}</strong>
            <p>{rightCard.description}</p>
          </article>
        </div>
        <div className='flex justify-center'> <p className="section-copy text-title-darker text-center">{t('stats.description')}</p></div>
       
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
