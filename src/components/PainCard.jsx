import PropTypes from 'prop-types'

function PainCard({ copy, tone, background, logoSrc, revealDelay, stackIndex, isMotionActive }) {
  return (
    <article
      className={`pain-card pain-card--${tone}`}
      data-reveal
      style={{
        '--reveal-delay': revealDelay,
        '--pain-background-image': background ? `url("${background}")` : 'none',
        '--pain-z-index': stackIndex,
      }}
    >
      <img className={`ticker-logo spin-loop h-12 w-12 mb-12 ${isMotionActive ? 'is-motion-active' : ''}`} src={logoSrc} alt="" />
      <h3 className="type-title-regular-size type-title-light">{copy}</h3>
    </article>
  )
}

PainCard.propTypes = {
  background: PropTypes.string,
  copy: PropTypes.string.isRequired,
  logoSrc: PropTypes.string,
  revealDelay: PropTypes.string.isRequired,
  stackIndex: PropTypes.number.isRequired,
  tone: PropTypes.string.isRequired,
  isMotionActive: PropTypes.bool.isRequired,
}

PainCard.defaultProps = {
  background: undefined,
  logoSrc: '/assets/logos/isotipo-red.svg',
}

export default PainCard
