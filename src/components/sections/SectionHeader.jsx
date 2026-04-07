import PropTypes from 'prop-types'

function SectionHeader({ eyebrow, title, description, centered = false, theme = 'default' }) {
  return (
    <div
      className={`section-header ${centered ? 'section-header--center' : ''} ${
        theme === 'dark' ? 'section-header--dark' : ''
      }`}
    >
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
  theme: PropTypes.oneOf(['default', 'dark']),
}

export default SectionHeader
