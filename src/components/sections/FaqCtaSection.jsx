import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import Button from '../Button'
import HeroNavLink from '../HeroNavLink'
import useInViewport from '../../hooks/useInViewport'
import useSectionReveal from '../../hooks/useSectionReveal'
import { useRef } from 'react'
import useViewportVideo from '../../hooks/useViewportVideo'

const clientLogos = [
  { name: 'avanade', src: '/assets/logos-partners/avanade.png' },
  { name: 'enisa', src: '/assets/logos-partners/enisa.png' },
  { name: 'LSTECHNOVA', src: '/assets/logos-partners/LSTECHNOVA.jpg' },
  { name: 'Grupo wayra_logo', src: '/assets/logos-partners/wayra_logo.jpeg' },
]

function FaqCtaSection({ onDemoRequest }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const isSectionInViewport = useInViewport(sectionRef, { threshold: 0.15 })
  const footerLinks = t('faqCta.links', { returnObjects: true })

  useSectionReveal(sectionRef)
  useViewportVideo(videoRef)

  return (
    <section className="faq-cta-section" ref={sectionRef}>
      <div className="">
        <div className="faq-cta-card" data-reveal style={{ '--reveal-delay': '60ms' }}>
          <div className="faq-cta-media" aria-hidden="true">
            <video
              ref={videoRef}
              className="faq-cta-video"
              loop
              muted
              playsInline
              preload="metadata"
            >
              <source src="/assets/video/final-video-hero-limmer.mp4" type="video/mp4" />
            </video>
            <div className="faq-cta-media-wash" />
          </div>

          <div className="faq-cta-content">
            <h2 className="faq-cta-title type-title-big-size type-title-light text-center">{t('faqCta.title')}</h2>
            <p className="faq-cta-description text-center">{t('faqCta.description')}</p>
            <Button radius="full" background="white" onClick={onDemoRequest}>
              {t('nav.cta')}
            </Button>
            <div
              className="faq-cta-trust mt-8 hero-trust"
              aria-label="Clientes"
            >
              <p className="type-description-size text-description-dark pb-4 text-center">{t('faqCta.partnersLabel')}</p>
              <div className="faq-cta-logo-row">
                <div className={`cta-logo-track  ${isSectionInViewport ? 'is-motion-active' : ''}`}>
                  {[0, 1, 2].map((copyIndex) => (
                    <span
                      key={`faq-cta-logo-set-${copyIndex}`}
                      className="hero-logo-set"
                      aria-hidden={copyIndex > 0}
                    >
                      {clientLogos.map((logo) => (
                        <span
                          key={`${logo.name}-${copyIndex}`}
                          className="hero-logo-item"
                        >
                          <img src={logo.src} alt={copyIndex === 0 ? logo.name : ''} />
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="faq-cta-links" aria-label="Enlaces legales y redes">
              {footerLinks.map((link) => (
                <HeroNavLink
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                >
                  {link.label}
                </HeroNavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

FaqCtaSection.propTypes = {
  onDemoRequest: PropTypes.func.isRequired,
}

export default FaqCtaSection
