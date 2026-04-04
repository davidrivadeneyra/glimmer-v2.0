import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'

const radiusClassName = {
  full: 'ui-button--radius-full',
  sharp: 'ui-button--radius-sharp',
}

const backgroundClassName = {
  white: 'ui-button--bg-white',
  blue: 'ui-button--bg-blue',
  transparentWhite: 'ui-button--bg-transparent-white',
  transparentBlack: 'ui-button--bg-transparent-black',
}

function Button({
  href,
  children,
  radius = 'full',
  background = 'white',
  fullWidth = false,
  className = '',
  style,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...rest
}) {
  const [cycle, setCycle] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    if (!isResetting) {
      return
    }

    let frameId = 0
    frameId = window.requestAnimationFrame(() => {
      setIsResetting(false)
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [isResetting])

  const advanceTrack = () => {
    if (!isActive && !isAnimating) {
      setIsAnimating(true)
      setIsActive(true)
    }
  }

  const handleMouseEnter = (event) => {
    advanceTrack()
    onMouseEnter?.(event)
  }

  const handleFocus = (event) => {
    advanceTrack()
    onFocus?.(event)
  }

  const handleDeactivate = () => {
    setIsActive(false)
  }

  const handleMouseLeave = (event) => {
    handleDeactivate()
    onMouseLeave?.(event)
  }

  const handleBlur = (event) => {
    handleDeactivate()
    onBlur?.(event)
  }

  const classes = [
    'ui-button',
    radiusClassName[radius],
    backgroundClassName[background],
    fullWidth ? 'ui-button--full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <span className="ui-button__sizer" aria-hidden="true">
        {children}
      </span>
      <span className="ui-button__text-window">
      <span
        className="ui-button__text-track"
        onTransitionEnd={(event) => {
          if (event.propertyName !== 'transform' || !isAnimating) {
            return
          }

          setIsAnimating(false)
          setIsResetting(true)
          setCycle((current) => current + 1)
        }}
        style={{
          transform: isAnimating ? 'translateY(-50%)' : 'translateY(0)',
          transition: isResetting ? 'none' : undefined,
        }}
      >
        <span className="ui-button__text-line" key={cycle}>
          {children}
        </span>
        <span className="ui-button__text-line" aria-hidden="true" key={cycle + 1}>
          {children}
        </span>
      </span>
      </span>
    </>
  )

  if (href) {
    return (
      <a
        className={classes}
        href={href}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={style}
        {...rest}
      >
        {content}
      </a>
    )
  }

  return (
      <button
      className={classes}
      type="button"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={style}
      {...rest}
    >
      {content}
    </button>
  )
}

Button.propTypes = {
  href: PropTypes.string,
  children: PropTypes.node.isRequired,
  radius: PropTypes.oneOf(['full', 'sharp']),
  background: PropTypes.oneOf(['white', 'blue', 'transparentWhite', 'transparentBlack']),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
}

export default Button
