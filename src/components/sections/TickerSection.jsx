import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import Button from '../Button'
import useSectionReveal from '../../hooks/useSectionReveal'

function TickerSection({ words }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const wordRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [trackOffset, setTrackOffset] = useState(0)

  useSectionReveal(sectionRef, [words])

  useEffect(() => {
    let frameId = 0

    const updateTicker = () => {
      const section = sectionRef.current
      const track = trackRef.current
      if (!section || !track || wordRefs.current.length === 0) {
        return
      }

      const sectionRect = section.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const scrollableDistance = Math.max(sectionRect.height - viewportHeight, 1)
      const nextProgress = Math.min(
        Math.max(-sectionRect.top / scrollableDistance, 0),
        1,
      )

      const viewportWidth = window.innerWidth
      const viewportCenter = viewportWidth / 2
      const firstWord = wordRefs.current[0]
      const lastWord = wordRefs.current[wordRefs.current.length - 1]

      if (!firstWord || !lastWord) {
        return
      }

      const startOffset =
        firstWord.offsetLeft + firstWord.offsetWidth / 2 - viewportCenter
      const endOffset =
        lastWord.offsetLeft + lastWord.offsetWidth / 2 - viewportCenter
      const currentOffset = startOffset + (endOffset - startOffset) * nextProgress

      setTrackOffset(currentOffset)

      let closestIndex = 0
      let closestDistance = Number.POSITIVE_INFINITY

      wordRefs.current.forEach((node, index) => {
        if (!node) {
          return
        }

        const wordCenter = node.offsetLeft + node.offsetWidth / 2 - currentOffset
        const distance = Math.abs(wordCenter - viewportCenter)

        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      setActiveIndex(closestIndex)
    }

    const requestUpdate = () => {
      cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(updateTicker)
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [words])

  return (
    <section
      className="ticker-section"
      ref={sectionRef}
      style={{ '--ticker-steps': words.length }}
    >
      <div className="ticker-sticky">
        <div className="page-shell ticker-shell">
          <div className="ticker-top">
            <img
              className="ticker-logo spin-loop"
              src="/assets/logos/isotipo-dark.svg"
              alt=""
              data-reveal
              style={{ '--reveal-delay': '40ms' }}
            />
            <p className="ticker-copy" data-reveal style={{ '--reveal-delay': '120ms' }}>
              {t('ticker.copy')}
            </p>
          </div>

          <div className="ticker-stage">
            <div
              className="ticker-track"
              ref={trackRef}
              style={{ transform: `translate3d(${-trackOffset}px, 0, 0)` }}
              aria-label={t('ticker.ariaLabel')}
            >
              {words.map((word, index) => (
                <span
                  key={word}
                  ref={(node) => {
                    wordRefs.current[index] = node
                  }}
                  className={`ticker-word type-title-bigger-size type-title-light ${index === activeIndex ? 'is-active' : ''}`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="ticker-bottom" data-reveal style={{ '--reveal-delay': '200ms' }}>
            <Button href="mailto:hola@glimmer.ai" radius="full" background="blue">
              {t('ticker.cta')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

TickerSection.propTypes = {
  words: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default TickerSection
