import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'

function DeliverySection({ deliveryModes }) {
  const { t } = useTranslation()

  return (
    <section className="delivery-section">
      <div className="page-shell delivery-shell">
        <div className="delivery-copy">
          <SectionHeader eyebrow={t('delivery.eyebrow')} title={t('delivery.title')} />

          <div className="delivery-list">
            {deliveryModes.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="delivery-visual">
          <img className="delivery-orbit" src="/glimmer/orbit.svg" alt="" />
          <img className="delivery-icon delivery-icon--gmail" src="/glimmer/gmail-bg.svg" alt="" />
          <img className="delivery-icon delivery-icon--gmail-mark" src="/glimmer/gmail.svg" alt="" />
          <img className="delivery-icon delivery-icon--slack" src="/glimmer/slack.svg" alt="" />
          <img className="delivery-icon delivery-icon--teams" src="/glimmer/teams.svg" alt="" />
          <img className="delivery-icon delivery-icon--discord" src="/glimmer/discord-bg.svg" alt="" />
          <img className="delivery-icon delivery-icon--discord-mark" src="/glimmer/discord.svg" alt="" />
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
