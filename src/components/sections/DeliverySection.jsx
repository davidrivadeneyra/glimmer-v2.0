import { useRef } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import useSectionReveal from '../../hooks/useSectionReveal'

function DeliverySection({ deliveryModes }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)

  useSectionReveal(sectionRef, [deliveryModes])

  return (
    <section className="delivery-section" ref={sectionRef}>
      <div className="page-shell delivery-shell">
        <div className="delivery-copy">
          <div data-reveal style={{ '--reveal-delay': '40ms' }}>
            <div className="section-header">
              <span className="type-subheadline-size type-subheadline-gray">
                {t('delivery.eyebrow')}
              </span>
              <h2 className="type-title-big-size type-title-light">{t('delivery.title')}</h2>
            </div>
          </div>

          <div className="delivery-list">
            {deliveryModes.map((item, index) => (
              <article
                key={item.title}
                data-reveal
                style={{ '--reveal-delay': `${120 + index * 70}ms` }}
              >
                <h3 className="type-title-smaller-size type-title-light">{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="delivery-visual" data-reveal style={{ '--reveal-delay': '180ms' }}>
          <div className="absolute aspect-square top-0 left-0 right-0 w-100% md:left-0 md:w-[1200px]" aria-hidden="true">
            <img
              className="delivery-orbit-layer delivery-orbit-layer--outer"
              src="/assets/orbit/ultimo.svg"
              alt=""
            />
            <img
              className="delivery-orbit-layer delivery-orbit-layer--middle"
              src="/assets/orbit/medio.svg"
              alt=""
            />
            <img
              className="delivery-orbit-layer delivery-orbit-layer--center"
              src="/assets/orbit/centro.svg"
              alt=""
            />
          </div>
        </div>
      </div>
    </section>
  )
}

DeliverySection.propTypes = {
  deliveryModes: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      copy: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

export default DeliverySection
