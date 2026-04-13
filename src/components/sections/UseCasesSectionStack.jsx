import { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useInViewport from '../../hooks/useInViewport'
import useSectionReveal from '../../hooks/useSectionReveal'

const useCaseCardBackgrounds = [
  '/assets/card-bg/use-01.svg',
  '/assets/card-bg/use-02.svg',
  '/assets/card-bg/use-03.svg',
  '/assets/card-bg/use-04.svg',
  '/assets/card-bg/use-05.svg',
  '/assets/card-bg/use-06.svg',
  '/assets/card-bg/use-07.svg',
]

const stackSlots = [
  { opacity: 1, rotate: 0, scale: 1, x: 0, y: 0, zIndex: 5 },
  { opacity: 1, rotate: 5, scale: 0.9, x: 25, y: 5, zIndex: 4 },
  { opacity: 1, rotate: 10, scale: 0.75, x: 45, y: 7, zIndex: 3 },
  { opacity: 1, rotate: 15, scale: 0.6, x: 55, y: 5, zIndex: 2 },
  { opacity: 1, rotate: -15, scale: 0.6, x: -55, y: 5, zIndex: 2 },
  { opacity: 1, rotate: -10, scale: 0.75, x: -45, y: 7, zIndex: 3 },
]
const slotOrderByOffset = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  '-2': 4,
  '-1': 5,
}
const slotCentersPx = [
  { x: 0, y: 0 },
  { x: 180, y: 28 },
  { x: 320, y: 42 },
  { x: 390, y: 28 },
  { x: -390, y: 28 },
  { x: -320, y: 42 },
]
const hiddenSlot = { opacity: 0, rotate: 0, scale: 0.45, x: 0, y: 10, zIndex: 1 }
const DRAG_SWIPE_THRESHOLD_PX = 72

function wrapIndex(index, length) {
  return ((index % length) + length) % length
}

function getStackOffset(index, activeIndex, total) {
  const rawOffset = index - activeIndex

  if (rawOffset > total / 2) {
    return rawOffset - total
  }

  if (rawOffset < -total / 2) {
    return rawOffset + total
  }

  return rawOffset
}

function getSlotForOffset(offset) {
  const slotIndex = slotOrderByOffset[offset]
  return slotIndex == null ? hiddenSlot : stackSlots[slotIndex]
}

function UseCasesSectionStack({ useCases }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const cardRefs = useRef([])
  const dragStateRef = useRef({
    pointerId: null,
    startX: 0,
  })
  const [activeIndex, setActiveIndex] = useState(0)
  const [cardHeight, setCardHeight] = useState(null)
  const isSectionInViewport = useInViewport(sectionRef, { threshold: 0.15 })
  const preventNativeDrag = (event) => {
    event.preventDefault()
  }
  const shiftStack = (direction) => {
    setActiveIndex((currentIndex) => wrapIndex(currentIndex + direction, useCases.length))
  }
  const showPreviousCase = () => {
    shiftStack(-1)
  }
  const showNextCase = () => {
    shiftStack(1)
  }

  useEffect(() => {
    const handleWindowPointerMove = (event) => {
      if (dragStateRef.current.pointerId == null || dragStateRef.current.pointerId !== event.pointerId) {
        return
      }
    }

    const handleWindowPointerEnd = (event) => {
      if (dragStateRef.current.pointerId == null || dragStateRef.current.pointerId !== event.pointerId) {
        return
      }

      const deltaX = event.clientX - dragStateRef.current.startX

      if (Math.abs(deltaX) >= DRAG_SWIPE_THRESHOLD_PX) {
        shiftStack(deltaX < 0 ? 1 : -1)
      }

      dragStateRef.current = {
        pointerId: null,
        startX: 0,
      }

      stageRef.current?.releasePointerCapture?.(event.pointerId)
    }

    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', handleWindowPointerEnd)
    window.addEventListener('pointercancel', handleWindowPointerEnd)

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerEnd)
      window.removeEventListener('pointercancel', handleWindowPointerEnd)
    }
  }, [useCases.length])

  useSectionReveal(sectionRef, [useCases])

  useEffect(() => {
    const measureCards = () => {
      const nextHeight = cardRefs.current.reduce((maxHeight, card) => {
        if (!card) {
          return maxHeight
        }

        const previousHeight = card.style.height
        card.style.height = 'auto'
        const measuredHeight = card.getBoundingClientRect().height
        card.style.height = previousHeight

        return Math.max(maxHeight, Math.ceil(measuredHeight))
      }, 0)

      setCardHeight(nextHeight || null)
    }

    measureCards()

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => {
        measureCards()
      })

    cardRefs.current.forEach((card) => {
      if (card && resizeObserver) {
        resizeObserver.observe(card)
      }
    })

    window.addEventListener('resize', measureCards)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', measureCards)
    }
  }, [useCases, activeIndex])

  const cards = useMemo(() => {
    const total = useCases.length || 1

    return useCases.map((item, index) => {
      const stackOffset = getStackOffset(index, activeIndex, total)
      const slot = getSlotForOffset(stackOffset)
      const transform = `translate(-50%, -50%) translate(${slot.x}%, ${slot.y}%) rotate(${slot.rotate}deg) scale(${slot.scale})`
      const isActive = index === activeIndex

      return {
        ...item,
        backgroundImage: useCaseCardBackgrounds[index % useCaseCardBackgrounds.length],
        index,
        isActive,
        style: {
          opacity: slot.opacity,
          transform,
          zIndex: slot.zIndex,
          pointerEvents: index === activeIndex ? 'auto' : 'none',
        },
      }
    })
  }, [activeIndex, useCases])

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return
    }

    if (dragStateRef.current.pointerId != null) {
      return
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
    }

    stageRef.current?.setPointerCapture?.(event.pointerId)
    event.preventDefault()
  }

  return (
    <section className="use-cases-stack-section" id="casos-de-uso" ref={sectionRef}>
      <div className="page-shell use-cases-stack-shell">
        <div className="use-cases-stack-header-shell" data-reveal style={{ '--reveal-delay': '40ms' }}>
          <div className="section-header section-header--center">
            <span className="type-subheadline-size type-subheadline-blue">
              {t('useCases.eyebrow')}
            </span>
            <h2 className="type-title-big-size type-title-dark">{t('useCases.title')}</h2>
            <p className="type-description-size max-w-[655px] text-[rgba(12,22,42,0.68)]">
              {t('useCases.description')}
            </p>
          </div>
          
        </div>
         <div
            className="use-cases-stack-controls text-description-light-surface text-center flex items-center gap-3 justify-center"
            aria-live="polite"
          >
            <button
              type="button"
              className="use-cases-stack-arrow"
              aria-label="Caso anterior"
              onPointerDown={(event) => {
                event.stopPropagation()
              }}
              onClick={(event) => {
                event.stopPropagation()
                showPreviousCase()
              }}
            >
              <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.25} />
            </button>
            <strong>{String(activeIndex + 1).padStart(2, '0')}</strong>
            <span>/</span>
            <span>{String(useCases.length).padStart(2, '0')}</span>
            <button
              type="button"
              className="use-cases-stack-arrow"
              aria-label="Siguiente caso"
              onPointerDown={(event) => {
                event.stopPropagation()
              }}
              onClick={(event) => {
                event.stopPropagation()
                showNextCase()
              }}
            >
              <ArrowRight aria-hidden="true" size={16} strokeWidth={2.25} />
            </button>
          </div>

        <div
          ref={stageRef}
          className="use-cases-stack-stage"
          data-reveal
          style={{ '--reveal-delay': '120ms' }}
          onPointerDown={handlePointerDown}
        >

          <div
            className="use-cases-stack-deck"
            onDragStart={preventNativeDrag}
          >
            {cards.map((item) => (
              <article
                className={`use-case-stack-card flex flex-col justify-between ${item.isActive ? 'is-active' : ''}`}
                key={`${item.title}-${item.index}`}
                ref={(node) => {
                  cardRefs.current[item.index] = node
                }}
                draggable={false}
                onDragStart={preventNativeDrag}
                style={{
                  ...item.style,
                  height: cardHeight ? `${cardHeight}px` : undefined,
                  '--use-case-background-image': `url("${item.backgroundImage}")`,
                }}
              >
                <img
                  className={`ticker-logo spin-loop h-12 w-12 ${isSectionInViewport ? 'is-motion-active' : ''}`}
                  draggable={false}
                  onDragStart={preventNativeDrag}
                  src="/assets/isotipo.svg"
                  alt=""
                />
                <div>
                  <h3 className="type-title-regular-size type-title-dark">{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
                
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

UseCasesSectionStack.propTypes = {
  useCases: PropTypes.arrayOf(
    PropTypes.shape({
      copy: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

export default UseCasesSectionStack
