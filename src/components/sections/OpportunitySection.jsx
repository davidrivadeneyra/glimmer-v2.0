import { useRef } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import useSectionReveal from '../../hooks/useSectionReveal'

function OpportunitySection({ opportunityLines }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)

  useSectionReveal(sectionRef, [opportunityLines])

  return (
    <section className="opportunity-section" ref={sectionRef}>
      <div className="page-shell opportunity-shell">
        <div className="opportunity-meta" data-reveal style={{ '--reveal-delay': '40ms' }}>
          <span className="section-eyebrow">{t('opportunity.eyebrow')}</span>
          <p>{t('opportunity.lead')}</p>
          <img src="/glimmer/logo-glimmer.svg" alt="" />
        </div>

        <div className="opportunity-lines">
          {opportunityLines.map((line, index) => (
            <p
              key={line}
              className={index === 0 ? 'opportunity-lines__lead' : ''}
              data-reveal
              style={{ '--reveal-delay': `${120 + index * 70}ms` }}
            >
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
