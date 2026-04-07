import { useRef } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'
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
            <SectionHeader eyebrow={t('delivery.eyebrow')} title={t('delivery.title')} />
          </div>

          <div className="delivery-list">
            {deliveryModes.map((item, index) => (
              <article
                key={item.title}
                data-reveal
                style={{ '--reveal-delay': `${120 + index * 70}ms` }}
              >
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="delivery-visual" data-reveal style={{ '--reveal-delay': '180ms' }}>
          <img className="delivery-animation" src="/assets/card-bg/animacion.svg" alt="" />
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
