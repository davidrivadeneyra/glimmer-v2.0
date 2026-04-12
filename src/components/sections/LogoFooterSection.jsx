import { useEffect, useState } from 'react'

function LogoFooterSection() {
  const [shouldRenderLogo, setShouldRenderLogo] = useState(false)

  useEffect(() => {
    let frameId = 0

    const updateVisibility = () => {
      frameId = 0

      const doc = document.documentElement
      const scrollTop = window.scrollY || doc.scrollTop || 0
      const viewportHeight = window.innerHeight || 0
      const remainingScroll = Math.max(doc.scrollHeight - (scrollTop + viewportHeight), 0)
      const footerRevealDistance = Math.max(viewportHeight * 0.75, 240)

      setShouldRenderLogo((current) =>
        current === (remainingScroll <= footerRevealDistance)
          ? current
          : remainingScroll <= footerRevealDistance,
      )
    }

    const requestUpdate = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(updateVisibility)
      }
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  return (
    <footer className="logo-footer-section" aria-label="Glimmer">
      <div className="logo-footer-shell">
        {shouldRenderLogo ? (
          <img
            className="logo-footer-mark"
            src="/assets/isologotipo-dark.svg"
            alt="Glimmer"
            loading="eager"
            decoding="async"
          />
        ) : null}
      </div>
    </footer>
  )
}

export default LogoFooterSection
