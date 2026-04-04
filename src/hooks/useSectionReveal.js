import { useEffect } from 'react'

function useSectionReveal(sectionRef, deps = []) {
  useEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return
    }

    const revealNodes = Array.from(section.querySelectorAll('[data-reveal]'))
    if (revealNodes.length === 0) {
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealNodes.forEach((node) => {
        node.classList.add('is-visible')
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -10% 0px',
      },
    )

    revealNodes.forEach((node) => {
      observer.observe(node)
    })

    return () => {
      observer.disconnect()
    }
  }, [sectionRef, ...deps])
}

export default useSectionReveal
