import { useEffect, useRef, useState } from 'react'

const HERO_FRAME_COUNT = 361
const HERO_TITLES = [
  ['Detecta lo que importa.', 'Decide mejor.'],
  ['Sin busqueda.', 'Sin ruido.'],
  ['Sin cambiar de', 'herramientas.'],
]

const getHeroFrameSrc = (index) =>
  `/assets/video-frames/hero-sequence/frame-${String(index + 1).padStart(4, '0')}.webp`

const clientLogos = [
  { name: '3IPunt', src: '/assets/logos-clientes/3IPunt.png' },
  { name: 'ARQ', src: '/assets/logos-clientes/ARQ.png' },
  { name: 'Delvy', src: '/assets/logos-clientes/Delvy.png' },
  { name: 'Grupo Lamadrid', src: '/assets/logos-clientes/Grupo%20Lamadrid.png' },
  { name: 'HOk Capital', src: '/assets/logos-clientes/HOk%20Capital.png' },
  { name: 'NexusClips', src: '/assets/logos-clientes/NexusClips.png' },
  { name: 'RSM', src: '/assets/logos-clientes/RSM.png' },
  { name: 'S4Gaming', src: '/assets/logos-clientes/S4Gaming%20Logo.png' },
  { name: 'Top Cable', src: '/assets/logos-clientes/top%20cable.png' },
  { name: 'dilobonito', src: '/assets/logos-clientes/dilobonito.png' },
]

const signalWords = [
  'Competidores',
  'Regulacion',
  'Tecnologia',
  'Riesgos',
  'Oportunidades',
]

const stats = [
  {
    value: '19%',
    description:
      'del tiempo de perfiles con alta responsabilidad se dedica a buscar, supervisar e interpretar informacion de mercado. Casi un dia a la semana.',
  },
  {
    value: '45k€',
    description:
      'coste anual visible en procesos manuales de inteligencia de mercado por perfil directivo. Sin contar el coste de las senales no detectadas.',
  },
]

const painPoints = [
  { title: 'Decenas de fuentes dispersas.', tone: 'red' },
  { title: 'Horas de busqueda manual', tone: 'blue' },
  { title: 'Senales fragmentadas.', tone: 'cyan' },
  { title: 'Informacion sin contexto', tone: 'yellow' },
  { title: 'Nadie es responsable de actuar', tone: 'pink' },
]

const workflow = [
  {
    id: '01',
    title: 'Deteccion',
    description:
      'Monitorizamos continuamente fuentes, bases de datos y senales del mercado en tiempo real.',
    bullets: [
      'Competidores, adquisiciones y cambios de posicionamiento.',
      'Clientes, expansion y necesidades emergentes.',
      'Regulacion, normativas y politicas que impactan la industria.',
      'Tecnologia, innovaciones y nuevos modelos de negocio.',
      'Financiacion, ayudas y nuevas oportunidades.',
      'Ecosistema, startups, alianzas e inversiones.',
    ],
    image: '/glimmer/deteccion.png',
    imageSide: 'right',
  },
  {
    id: '02',
    title: 'Interpretacion',
    description:
      'Contextualizamos la senal del mercado en un caso de negocio para tu empresa.',
    bullets: ['Que ha ocurrido', 'Por que importa', 'Que impacto puede tener'],
    image: '/glimmer/interpretacion.png',
    imageSide: 'left',
  },
  {
    id: '03',
    title: 'Activacion',
    description:
      'Las senales dejan de ser informacion y se convierten en decisiones accionables desde la plataforma.',
    bullets: [
      'Responsable asignado',
      'Siguiente paso definido',
      'Seguimiento activado',
    ],
    image: '/glimmer/activacion.png',
    imageSide: 'right',
  },
]

const opportunityLines = [
  'Es la senal de mercado que no se detecta.',
  'Una regulacion que cambia el mercado.',
  'Un competidor que se posiciona antes.',
  'Una tecnologia que reduce costes.',
  'Una oportunidad que nadie vio.',
  'Las empresas que controlan lo que ocurre en su industria ganan.',
  'Las que no, pagan el precio.',
]

const useCases = [
  'Direccion general',
  'Desarrollo de negocio',
  'Compliance',
  'Marketing',
  'Innovacion',
  'Producto',
]

const deliveryModes = [
  {
    title: '01 — Web App',
    copy:
      'Accede a la plataforma desde cualquier dispositivo y consulta las senales detectadas, su contexto y las acciones recomendadas.',
  },
  {
    title: '02 — Microsoft Teams & Slack',
    copy:
      'Recibe alertas directamente en tus canales de trabajo para que el equipo pueda evaluar impacto y decidir sin salir de su workflow.',
  },
  {
    title: '03 — Gmail',
    copy:
      'Notificaciones claras cuando aparece una senal relevante, para mantener visibilidad incluso fuera de la plataforma.',
  },
  {
    title: '04 — Integraciones avanzadas',
    copy:
      'En planes avanzados, Glimmer puede integrarse con el ecosistema tecnologico de la empresa para adaptar la entrega de alertas y senales a los flujos de trabajo existentes.',
  },
]

const testimonials = [
  {
    quote:
      'Glimmer nos permite detectar movimientos de competidores mucho antes y reaccionar con tiempo de cara a nuevas estrategias de posicionamiento.',
    role: 'Director de Estrategia',
  },
  {
    quote:
      'Antes soliamos perseguir de forma constante las tendencias que afectan a nuestros clientes. Con Glimmer, hemos eliminado todo ese proceso manual.',
    role: 'Director de Marketing',
  },
  {
    quote:
      'Nos ayuda a identificar que tecnologias realmente pueden impactar nuestro negocio.',
    role: 'Director de Tecnologia',
  },
  {
    quote:
      'Nos permite detectar cambios regulatorios relevantes con tiempo suficiente para anticipar impacto.',
    role: 'Director de Compliance',
  },
  {
    quote:
      'El valor esta en el contexto y la personalizacion que antes solo te podia aportar un consultor tradicional. Las senales ya llegan interpretadas para tomar decisiones.',
    role: 'Director de Operaciones e Innovacion',
  },
  {
    quote:
      'Detectamos licitaciones relevantes antes que muchos competidores.',
    role: 'Director de Desarrollo de Negocio',
  },
]

function SectionHeader({ eyebrow, title, description, centered = false }) {
  return (
    <div className={`section-header ${centered ? 'section-header--center' : ''}`}>
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="section-title">{title}</h2>
      {description ? <p className="section-copy">{description}</p> : null}
    </div>
  )
}

function WorkflowCard({ item }) {
  const content = (
    <>
      <div className="workflow-copy">
        <p className="workflow-title">
          {item.id} — {item.title}
        </p>
        <p className="workflow-description">{item.description}</p>
      </div>
      <ul className="workflow-list">
        {item.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </>
  )

  const media = (
    <div className="workflow-media">
      <img src={item.image} alt={item.title} />
    </div>
  )

  return (
    <article className="workflow-card">
      {item.imageSide === 'left' ? (
        <>
          {media}
          <div className="workflow-panel">{content}</div>
        </>
      ) : (
        <>
          <div className="workflow-panel">{content}</div>
          {media}
        </>
      )}
    </article>
  )
}

function TestimonialCard({ item }) {
  return (
    <article className="testimonial-card">
      <img className="testimonial-quote" src="/glimmer/quote.svg" alt="" />
      <div className="testimonial-body">
        <p>{item.quote}</p>
        <span>{item.role}</span>
      </div>
    </article>
  )
}

function TickerSection({ words }) {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const wordRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [trackOffset, setTrackOffset] = useState(0)

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
      const currentOffset =
        startOffset + (endOffset - startOffset) * nextProgress

      setTrackOffset(currentOffset)

      let closestIndex = 0
      let closestDistance = Number.POSITIVE_INFINITY

      wordRefs.current.forEach((node, index) => {
        if (!node) {
          return
        }

        const wordCenter =
          node.offsetLeft + node.offsetWidth / 2 - currentOffset
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
            <img className="ticker-logo spin-loop" src="/assets/isotipo-dark.svg" alt="" />
              <p className="ticker-copy">
              Glimmer nació para ayudarte con... </p>            
          </div>

          <div className="ticker-stage">
            <div
              className="ticker-track"
              ref={trackRef}
              style={{ transform: `translate3d(${-trackOffset}px, 0, 0)` }}
              aria-label="Senales"
            >
              {words.map((word, index) => (
                <span
                  key={word}
                  ref={(node) => {
                    wordRefs.current[index] = node
                  }}
                  className={`ticker-word ${index === activeIndex ? 'is-active' : ''}`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="ticker-bottom">
            <a className="button button--primary" href="mailto:hola@glimmer.ai">
              Solicitar demo
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function App() {
  const heroRef = useRef(null)
  const heroCanvasRef = useRef(null)
  const heroFrameImagesRef = useRef([])
  const heroFrameIndexRef = useRef(0)
  const heroTitleIndexRef = useRef(0)
  const [heroLogoScale, setHeroLogoScale] = useState(1)
  const [heroTitleIndex, setHeroTitleIndex] = useState(0)

  useEffect(() => {
    let frameId = 0
    let isDisposed = false

    const drawFrame = (frameIndex) => {
      const canvas = heroCanvasRef.current
      const image = heroFrameImagesRef.current[frameIndex]
      if (!canvas || !image || !image.complete) {
        return
      }

      const context = canvas.getContext('2d')
      if (!context) {
        return
      }

      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      if (!canvasWidth || !canvasHeight) {
        return
      }

      const imageWidth = image.naturalWidth || image.width
      const imageHeight = image.naturalHeight || image.height
      if (!imageWidth || !imageHeight) {
        return
      }

      const scale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight)
      const drawWidth = imageWidth * scale
      const drawHeight = imageHeight * scale
      const offsetX = (canvasWidth - drawWidth) * 0.5
      const offsetY = (canvasHeight - drawHeight) * 0.5

      context.clearRect(0, 0, canvasWidth, canvasHeight)
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
    }

    const syncCanvasSize = () => {
      const canvas = heroCanvasRef.current
      if (!canvas) {
        return
      }

      const viewportWidth = window.innerWidth || 1
      const viewportHeight = window.innerHeight || 1
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(viewportWidth * pixelRatio)
      canvas.height = Math.round(viewportHeight * pixelRatio)
      canvas.style.width = `${viewportWidth}px`
      canvas.style.height = `${viewportHeight}px`

      drawFrame(heroFrameIndexRef.current)
    }

    const updateHeroProgress = () => {
      const hero = heroRef.current
      if (!hero) {
        return
      }

      const rect = hero.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 1
      const scrollableDistance = Math.max(rect.height - viewportHeight, 1)
      const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1)
      const scale = 1 + progress

      setHeroLogoScale(scale)
      const frameIndex = Math.min(
        HERO_FRAME_COUNT - 1,
        Math.round(progress * (HERO_FRAME_COUNT - 1)),
      )

      if (heroFrameIndexRef.current !== frameIndex) {
        heroFrameIndexRef.current = frameIndex
        drawFrame(frameIndex)
      }

      const nextTitleIndex = frameIndex >= 180 ? 2 : frameIndex >= 90 ? 1 : 0
      if (heroTitleIndexRef.current !== nextTitleIndex) {
        heroTitleIndexRef.current = nextTitleIndex
        setHeroTitleIndex(nextTitleIndex)
      }
    }

    const requestUpdate = () => {
      cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(updateHeroProgress)
    }

    heroFrameImagesRef.current = Array.from({ length: HERO_FRAME_COUNT }, (_, index) => {
      const image = new Image()
      image.decoding = 'async'
      image.src = getHeroFrameSrc(index)
      image.onload = () => {
        if (isDisposed) {
          return
        }

        if (index === 0 || index === heroFrameIndexRef.current) {
          drawFrame(heroFrameIndexRef.current)
        }
      }
      return image
    })

    syncCanvasSize()
    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', syncCanvasSize)

    return () => {
      isDisposed = true
      cancelAnimationFrame(frameId)
      heroFrameImagesRef.current.forEach((image) => {
        image.onload = null
      })
      heroFrameImagesRef.current = []
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', syncCanvasSize)
    }
  }, [])

  return (
    <main className="glimmer-page">
      <section className="hero-section" ref={heroRef}>
        <div className="hero-sticky">
          <div className="hero-media" aria-hidden="true">
            <canvas ref={heroCanvasRef} className="hero-canvas" />
          </div>
          <div className="hero-isotipo" aria-hidden="true">
            <img
              className="spin-loop hero-isotipo__image"
              src="/assets/isotipo-blur.svg"
              alt=""
              style={{ '--spin-scale': heroLogoScale }}
            />
          </div>
          <div className="page-shell">
            <header className="hero-nav">
              <a className="hero-brand" href="#top" aria-label="Glimmer">
                <img src="/assets/isologotipo.svg" alt="Glimmer" />
              </a>
              <nav className="hero-links">
                <a href="#casos">Casos</a>
                <a href="#producto">Producto</a>
                <a href="#impacto">Impacto</a>
              </nav>
              <a className="hero-nav-cta" href="mailto:hola@glimmer.ai">
                Solicitar demo
              </a>
            </header>

            <div className="hero-grid" id="top">
              <div className="hero-copy">
                <h1 className="hero-title">
                  <span className="hero-title-mask">
                    <span key={heroTitleIndex} className="hero-title-text">
                      {HERO_TITLES[heroTitleIndex].map((line) => (
                        <span key={line} className="hero-title-line">
                          {line}
                        </span>
                      ))}
                    </span>
                  </span>
                </h1>
                <p>
                  Glimmer es una plataforma de inteligencia de mercado impulsada por
                  IA que transforma el ruido en senales estrategicas para la alta
                  direccion.
                </p>
              </div>

              <div className="hero-actions">
                <div className="hero-trust">
                  <p>Empresas que ya confian en nosotros</p>
                  <div className="hero-logo-row">
                    <div className="hero-logo-track">
                      {[...clientLogos, ...clientLogos].map((logo, index) => (
                        <span
                          key={`${logo.name}-${index}`}
                          className="hero-logo-item"
                          aria-hidden={index >= clientLogos.length}
                        >
                          <img src={logo.src} alt={index < clientLogos.length ? logo.name : ''} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hero-button-row">
                  <a className="button button--light w-full" href="mailto:hola@glimmer.ai">
                    Solicitar demo
                  </a>
                  <a className="button button--glass w-full" href="#producto">
                    Ver como funciona
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TickerSection words={signalWords} />

      <section className="stats-section" id="impacto">
        <div className="page-shell">
          <SectionHeader
            eyebrow="El coste oculto"
            title="Detecta lo que importa."
            description="El coste real no es el software. Es la senal que nunca se detecta, la oportunidad perdida o el riesgo no mitigado."
            centered
          />

          <div className="stats-grid">
            {stats.map((item) => (
              <article className="stat-card" key={item.value}>
                <span className="stat-chip">Impacto</span>
                <strong>{item.value}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="problem-section" id="casos">
        <div className="page-shell problem-shell">
          <SectionHeader
            eyebrow="El problema"
            title="Las empresas no tienen un sistema de inteligencia de mercado centralizado para entender lo que ocurre en su industria."
            centered
          />

          <div className="pain-stack">
            {painPoints.map((item) => (
              <article
                className={`pain-card pain-card--${item.tone}`}
                key={item.title}
              >
                <span className="pain-dot" />
                <p>{item.title}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="workflow-section" id="producto">
        <div className="workflow-light" />
        <div className="page-shell">
          <SectionHeader
            eyebrow="Como funciona"
            title="El radar inteligente que transforma senales criticas en decisiones accionables y medibles"
            description="Una unidad de inteligencia de mercado impulsada por agentes de IA que trabajan para tu equipo 24/7."
            centered
          />

          <div className="workflow-stack">
            {workflow.map((item) => (
              <WorkflowCard item={item} key={item.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="opportunity-section">
        <div className="page-shell opportunity-shell">
          <div className="opportunity-meta">
            <span className="section-eyebrow">Coste de oportunidad</span>
            <p>El mayor coste para una empresa no es el software.</p>
            <img src="/glimmer/logo-glimmer.svg" alt="" />
          </div>

          <div className="opportunity-lines">
            {opportunityLines.map((line, index) => (
              <p key={line} className={index === 0 ? 'opportunity-lines__lead' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="use-cases-section">
        <div className="page-shell">
          <SectionHeader
            eyebrow="Donde aplica"
            title="Casos de uso"
            description="Equipos que operan en entornos complejos utilizan Glimmer para monitorizar el mercado, competidores, detectar oportunidades y anticipar riesgos."
            centered
          />

          <div className="use-cases-orbit">
            <div className="use-cases-core">
              <span>Una tecnologia que reduce costes</span>
            </div>
            {useCases.map((item, index) => (
              <article
                className={`use-case-card use-case-card--${index + 1}`}
                key={item}
              >
                {item}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="delivery-section">
        <div className="page-shell delivery-shell">
          <div className="delivery-copy">
            <SectionHeader
              eyebrow="Donde opera"
              title="Donde lo necesitas, cuando lo necesitas."
            />

            <div className="delivery-list">
              {deliveryModes.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="delivery-visual">
            <img className="delivery-orbit" src="/glimmer/orbit.svg" alt="" />
            <img className="delivery-icon delivery-icon--gmail" src="/glimmer/gmail-bg.svg" alt="" />
            <img className="delivery-icon delivery-icon--gmail-mark" src="/glimmer/gmail.svg" alt="" />
            <img className="delivery-icon delivery-icon--slack" src="/glimmer/slack.svg" alt="" />
            <img className="delivery-icon delivery-icon--teams" src="/glimmer/teams.svg" alt="" />
            <img className="delivery-icon delivery-icon--discord" src="/glimmer/discord-bg.svg" alt="" />
            <img className="delivery-icon delivery-icon--discord-mark" src="/glimmer/discord.svg" alt="" />
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="page-shell">
          <SectionHeader
            eyebrow="Testimonios"
            title="Lo que dicen nuestros clientes"
            centered
          />

          <div className="testimonials-grid">
            {testimonials.map((item) => (
              <TestimonialCard item={item} key={item.quote} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
