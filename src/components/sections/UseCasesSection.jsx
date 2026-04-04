import { useRef } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'
import useSectionReveal from '../../hooks/useSectionReveal'

function UseCasesSection({ useCases }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)

  useSectionReveal(sectionRef, [useCases])

  return (
    <section className="use-cases-section" ref={sectionRef}>
      <div className="page-shell">
        <div data-reveal style={{ '--reveal-delay': '40ms' }}>
          <SectionHeader
            eyebrow={t('useCases.eyebrow')}
            title={t('useCases.title')}
            description={t('useCases.description')}
            centered
          />
        </div>

        <div className="use-cases-orbit">
          <div className="use-cases-core" data-reveal style={{ '--reveal-delay': '120ms' }}>
            <span>{t('useCases.core')}</span>
          </div>
          {useCases.map((item, index) => (
            <article
              className={`use-case-card use-case-card--${index + 1}`}
              key={item}
              data-reveal
              style={{ '--reveal-delay': `${180 + index * 60}ms` }}
            >
              {item}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

UseCasesSection.propTypes = {
  useCases: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default UseCasesSection
