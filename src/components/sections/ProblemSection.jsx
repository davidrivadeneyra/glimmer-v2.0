import { useRef } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'
import useSectionReveal from '../../hooks/useSectionReveal'

function ProblemSection({ painPoints }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)

  useSectionReveal(sectionRef, [painPoints])

  return (
    <section className="problem-section" id="casos" ref={sectionRef}>
      <div className="page-shell problem-shell">
        <div data-reveal style={{ '--reveal-delay': '40ms' }}>
          <SectionHeader eyebrow={t('problem.eyebrow')} title={t('problem.title')} centered />
        </div>

        <div className="pain-stack">
          {painPoints.map((item, index) => (
            <article
              className={`pain-card pain-card--${item.tone}`}
              key={item.title}
              data-reveal
              style={{ '--reveal-delay': `${120 + index * 70}ms` }}
            >
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
