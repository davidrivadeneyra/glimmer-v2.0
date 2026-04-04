import PropTypes from 'prop-types'

function SectionHeader({ eyebrow, title, description, centered = false }) {
  return (
    <div className={`section-header ${centered ? 'section-header--center' : ''}`}>
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="section-title">{title}</h2>
      {description ? <p className="section-copy">{description}</p> : null}
    </div>
  )
}

SectionHeader.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  centered: PropTypes.bool,
}

export default SectionHeader
