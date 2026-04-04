import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'

function ProblemSection({ painPoints }) {
  const { t } = useTranslation()

  return (
    <section className="problem-section" id="casos">
      <div className="page-shell problem-shell">
        <SectionHeader eyebrow={t('problem.eyebrow')} title={t('problem.title')} centered />

        <div className="pain-stack">
          {painPoints.map((item) => (
            <article className={`pain-card pain-card--${item.tone}`} key={item.title}>
              <span className="pain-dot" />
              <p>{item.title}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

ProblemSection.propTypes = {
  painPoints: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      tone: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

export default ProblemSection
