import { useRef } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'
import useSectionReveal from '../../hooks/useSectionReveal'

function TestimonialCard({ item, delay }) {
  return (
    <article className="testimonial-card" data-reveal style={{ '--reveal-delay': delay }}>
      <img className="testimonial-quote" src="/glimmer/quote.svg" alt="" />
      <div className="testimonial-body">
        <p>{item.quote}</p>
        <span>{item.role}</span>
      </div>
    </article>
  )
}

TestimonialCard.propTypes = {
  item: PropTypes.shape({
    quote: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
  delay: PropTypes.string.isRequired,
}

function TestimonialsSection({ testimonials }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)

  useSectionReveal(sectionRef, [testimonials])

  return (
    <section className="testimonials-section" ref={sectionRef}>
      <div className="page-shell">
        <div data-reveal style={{ '--reveal-delay': '40ms' }}>
          <SectionHeader
            eyebrow={t('testimonials.eyebrow')}
            title={t('testimonials.title')}
            centered
          />
        </div>

        <div className="testimonials-grid">
          {testimonials.map((item, index) => (
            <TestimonialCard item={item} key={item.quote} delay={`${120 + index * 70}ms`} />
          ))}
        </div>
      </div>
    </section>
  )
}

TestimonialsSection.propTypes = {
  testimonials: PropTypes.arrayOf(
    PropTypes.shape({
      quote: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

export default TestimonialsSection
