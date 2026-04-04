import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

function OpportunitySection({ opportunityLines }) {
  const { t } = useTranslation()

  return (
    <section className="opportunity-section">
      <div className="page-shell opportunity-shell">
        <div className="opportunity-meta">
          <span className="section-eyebrow">{t('opportunity.eyebrow')}</span>
          <p>{t('opportunity.lead')}</p>
          <img src="/glimmer/logo-glimmer.svg" alt="" />
        </div>

        <div className="opportunity-lines">
          {opportunityLines.map((line, index) => (
            <p key={line} className={index === 0 ? 'opportunity-lines__lead' : ''}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

OpportunitySection.propTypes = {
  opportunityLines: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default OpportunitySection
