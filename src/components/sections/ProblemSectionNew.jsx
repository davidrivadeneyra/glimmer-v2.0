import { useLayoutEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PainCard from '../PainCard'
import useInViewport from '../../hooks/useInViewport'
import useSectionReveal from '../../hooks/useSectionReveal'

const painCardBackgrounds = [
  '/assets/card-bg/01.svg',
  '/assets/card-bg/02.svg',
  '/assets/card-bg/03.svg',
  '/assets/card-bg/04.svg',
  '/assets/card-bg/05.svg',
]

const painCardLogos = [
  '/assets/logos/isotipo-red.svg',
  '/assets/logos/isotipo-blue.svg',
  '/assets/logos/isotipo-magenta.svg',
  '/assets/logos/isotipo-yellow.svg',
  '/assets/logos/isotipo-violet.svg',
]

function splitProblemText(titleNode) {
  const words = titleNode.textContent?.trim().split(/\s+/).filter(Boolean) ?? []
  titleNode.innerHTML = words
    .map((word) => `<span class="problem-title-word">${word}</span>`)
    .join(' ')

  return titleNode.querySelectorAll('.problem-title-word')
}

function ProblemSection({ painPoints }) {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const titleShellRef = useRef(null)
  const titleRef = useRef(null)
  const isSectionInViewport = useInViewport(sectionRef, {
    threshold: 0.15,
    rootMargin: '240px 0px',
  })

  useSectionReveal(sectionRef, [painPoints])

  useLayoutEffect(() => {
    const shell = titleShellRef.current
    const title = titleRef.current

    if (!shell || !title) {
      return undefined
    }

    gsap.registerPlugin(ScrollTrigger)

    const originalTitle = title.textContent ?? ''
    const ctx = gsap.context(() => {
      const splitWords = splitProblemText(title)

      gsap.set(splitWords, {
        color: 'rgba(255, 255, 255, 0.16)',
        willChange: 'color',
      })

      gsap.to(splitWords, {
        color: '#fff',
        stagger: 0.1,
        scrollTrigger: {
          trigger: title,
          start: 'top center',
          end: 'bottom center',
          scrub: true,
        },
      })
    }, shell)

    return () => {
      ctx.revert()
      title.textContent = originalTitle
    }
  }, [t])

  return (
    <section className="relative problem-section-new" id="casos" ref={sectionRef}>
      <div className='fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none z-0 opacity-40'>
        <img
          className={`max-w-none spin-loop-slow w-[1500px] h-[1500px] md:w-[2500px] md:h-[2500px] ${isSectionInViewport ? 'is-motion-active' : ''}`}
          src={isSectionInViewport ? '/assets/logos/logo-outline-white-bigger.svg' : undefined}
          alt=""
          width="2500"
          height="2500"
          loading="lazy"
          decoding="async"
        />

      </div>
      <div className="page-shell page-shell--problem-intro" ref={titleShellRef}>
        <div className="problem-header-shell-new">
          <div className="section-header section-header--center problem-section-header-new">
            <span className="type-subheadline-size type-subheadline-gray">
              {t('problem.eyebrow')}
            </span>
            <h2
              ref={titleRef}
              className="type-title-bigger-size type-title-light text-center problem-title-new text"
            >
              {t('problem.title')}
            </h2>
          </div>
        </div>
      </div>

      <div className="page-shell page-shell--problem-stack">
        <div className="pain-stack pain-stack-new">
          {painPoints.map((item, index) => (
            <PainCard
              key={item.title}
              copy={item.copy ?? item.title}
              tone={item.tone}
              background={item.background ?? painCardBackgrounds[index % painCardBackgrounds.length]}
              logoSrc={item.logoSrc ?? painCardLogos[index % painCardLogos.length]}
              revealDelay={`${120 + index * 70}ms`}
              stackIndex={index + 1}
              isMotionActive={isSectionInViewport}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

ProblemSection.propTypes = {
  painPoints: PropTypes.arrayOf(
    PropTypes.shape({
      background: PropTypes.string,
      copy: PropTypes.string,
      logoSrc: PropTypes.string,
      title: PropTypes.string.isRequired,
      tone: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

export default ProblemSection
