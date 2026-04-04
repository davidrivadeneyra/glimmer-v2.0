import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'

function UseCasesSection({ useCases }) {
  const { t } = useTranslation()

  return (
    <section className="use-cases-section">
      <div className="page-shell">
        <SectionHeader
          eyebrow={t('useCases.eyebrow')}
          title={t('useCases.title')}
          description={t('useCases.description')}
          centered
        />

        <div className="use-cases-orbit">
          <div className="use-cases-core">
            <span>{t('useCases.core')}</span>
          </div>
          {useCases.map((item, index) => (
            <article className={`use-case-card use-case-card--${index + 1}`} key={item}>
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
