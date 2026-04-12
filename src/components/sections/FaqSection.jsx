import { useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import useSectionReveal from '../../hooks/useSectionReveal'

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <article className={`faq-item ${isOpen ? 'is-open' : ''}`}>
      <button className="faq-trigger" type="button" onClick={onToggle} aria-expanded={isOpen}>
        <span className="type-title-small-size type-title-light">{item.question}</span>
        <span className="faq-icon" aria-hidden="true">
          +
        </span>
      </button>

      <div className="faq-answer-wrap" hidden={!isOpen}>
        <p className="faq-answer">{item.answer}</p>
      </div>
    </article>
  )
}

FaqItem.propTypes = {
  item: PropTypes.shape({
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
}

function FaqSection({ faqs }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const [openIndex, setOpenIndex] = useState(0)

  useSectionReveal(sectionRef, [faqs])

  const titleLines = useMemo(() => t('faqs.titleLines', { returnObjects: true }), [t])

  return (
    <section className="faq-section" ref={sectionRef}>
      <div className="page-shell faq-shell">
        <div className="faq-copy md:top-[120px]" data-reveal style={{ '--reveal-delay': '40ms' }}>
          <span className="type-subheadline-size type-subheadline-gray">{t('faqs.eyebrow')}</span>
          <h2 className="type-title-big-size type-title-light pt-6">
            {t('faqs.titleLines')}
          </h2>
        </div>

        <div className="faq-list" role="list" data-reveal style={{ '--reveal-delay': '120ms' }}>
          {faqs.map((item, index) => (
            <FaqItem
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex((current) => (current === index ? -1 : index))}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

FaqSection.propTypes = {
  faqs: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

export default FaqSection
