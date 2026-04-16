import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from './Button'
import HeroNavLink from './HeroNavLink'

const LIGHT_SECTION_SELECTORS = ['#impacto', '#casos-de-uso', '#testimonios']

function LanguageSwitch({ isEnglishActive, englishHref, spanishHref, isOnLightSection, onSelect, className = '' }) {
  return (
    <nav
      className={`hero-language-switch ${isOnLightSection ? 'hero-language-switch--light-section' : ''} ${className}`.trim()}
      aria-label="Language selector"
    >
      <HeroNavLink
        href={englishHref}
        className={`hero-language-switch__option ${isEnglishActive ? 'is-active-language' : ''}`}
        onClick={onSelect}
      >
        EN
      </HeroNavLink>
      <HeroNavLink
        href={spanishHref}
        className={`hero-language-switch__option ${!isEnglishActive ? 'is-active-language' : ''}`}
        onClick={onSelect}
      >
        ES
      </HeroNavLink>
    </nav>
  )
}

LanguageSwitch.propTypes = {
  isEnglishActive: PropTypes.bool.isRequired,
  englishHref: PropTypes.string.isRequired,
  spanishHref: PropTypes.string.isRequired,
  isOnLightSection: PropTypes.bool.isRequired,
  onSelect: PropTypes.func,
  className: PropTypes.string,
}

function HeroNav({ onDemoRequest }) {
  const { t } = useTranslation()
  const currentPath = window.location.pathname
  const isEnglishActive = currentPath.startsWith('/en')
  const englishHref = '/en'
  const spanishHref = '/'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isOnLightSection, setIsOnLightSection] = useState(false)

  useEffect(() => {
    const sections = LIGHT_SECTION_SELECTORS
      .map((selector) => document.querySelector(selector))
      .filter(Boolean)

    if (sections.length === 0) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const hasVisibleLightSection = entries.some((entry) => entry.isIntersecting)
        setIsOnLightSection(hasVisibleLightSection)
      },
      {
        rootMargin: '-72px 0px -70% 0px',
        threshold: [0, 0.15, 0.35],
      },
    )

    sections.forEach((section) => observer.observe(section))

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <header className="hero-nav-shell">
      <div className="hero-nav-frame">
        <LanguageSwitch
          isEnglishActive={isEnglishActive}
          englishHref={englishHref}
          spanishHref={spanishHref}
          isOnLightSection={isOnLightSection}
          className="hero-language-switch--desktop"
        />
        <div className={`hero-nav ${isOnLightSection ? 'hero-nav--light-section' : ''}`}>
          <a className="hero-brand" href="#top" aria-label="Glimmer">
            <img
              src={isOnLightSection ? '/assets/logos/isologotipo-dark.svg' : '/assets/logos/isologotipo.svg'}
              alt="Glimmer"
            />
          </a>
          <button
            className="hero-nav-toggle"
            type="button"
            aria-expanded={isMobileMenuOpen}
            aria-controls="hero-nav-menu"
            aria-label={isMobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            <Menu size={20} strokeWidth={2.25} aria-hidden="true" />
          </button>
          <div
            className={`hero-nav-menu ${isMobileMenuOpen ? 'is-open' : ''} ${isOnLightSection ? 'hero-nav-menu--light-section' : ''}`}
            id="hero-nav-menu"
          >
            <nav className="hero-links">
              <HeroNavLink href="#producto" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.solution')}
              </HeroNavLink>
              <HeroNavLink href="#casos-de-uso" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.casos')}
              </HeroNavLink>
              <HeroNavLink href="#faq" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.faq')}
              </HeroNavLink>
            </nav>
            <LanguageSwitch
              isEnglishActive={isEnglishActive}
              englishHref={englishHref}
              spanishHref={spanishHref}
              isOnLightSection={isOnLightSection}
              className="hero-language-switch--mobile"
              onSelect={() => setIsMobileMenuOpen(false)}
            />
            <Button
              className="hero-nav-cta"
              radius="full"
              background="transparentBlack"
              onClick={() => {
                setIsMobileMenuOpen(false)
                onDemoRequest()
              }}
            >
              {t('nav.cta')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

HeroNav.propTypes = {
  onDemoRequest: PropTypes.func.isRequired,
}

export default HeroNav
