import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'

function TestimonialCard({ item }) {
  return (
    <article className="testimonial-card">
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
}

function TestimonialsSection({ testimonials }) {
  const { t } = useTranslation()

  return (
    <section className="testimonials-section">
      <div className="page-shell">
        <SectionHeader
          eyebrow={t('testimonials.eyebrow')}
          title={t('testimonials.title')}
          centered
        />

        <div className="testimonials-grid">
          {testimonials.map((item) => (
            <TestimonialCard item={item} key={item.quote} />
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
