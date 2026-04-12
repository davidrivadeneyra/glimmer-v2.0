import { useRef } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import useSectionReveal from '../../hooks/useSectionReveal'

function TestimonialCard({ item, delay }) {
  return (
    <article className="testimonial-card" data-reveal style={{ '--reveal-delay': delay }}>
      <img className="testimonial-quote" src="/assets/quote.svg" alt="" />
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
  const marqueeItems = [...testimonials, ...testimonials]

  return (
    <section className="testimonials-section" id="testimonios" ref={sectionRef}>
      <div className="page-shell">
        <div data-reveal style={{ '--reveal-delay': '40ms' }}>
          <div className="section-header section-header--center">
            <span className="type-subheadline-size type-subheadline-blue">
              {t('testimonials.eyebrow')}
            </span>
            <h2 className="type-title-big-size type-title-dark">{t('testimonials.title')}</h2>
          </div>
        </div>

        <div className="testimonials-marquee" data-reveal style={{ '--reveal-delay': '120ms' }}>
          <div className="testimonials-track">
            {marqueeItems.map((item, index) => (
              <TestimonialCard
                item={item}
                key={`${item.quote}-${index}`}
                delay={`${120 + (index % testimonials.length) * 70}ms`}
              />
            ))}
          </div>
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
