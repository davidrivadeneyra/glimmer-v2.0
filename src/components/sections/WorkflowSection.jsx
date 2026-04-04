import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'

const workflowMedia = [
  { image: '/glimmer/deteccion.png', imageSide: 'right' },
  { image: '/glimmer/interpretacion.png', imageSide: 'left' },
  { image: '/glimmer/activacion.png', imageSide: 'right' },
]

function WorkflowCard({ item }) {
  const content = (
    <>
      <div className="workflow-copy">
        <p className="workflow-title">
          {item.id} - {item.title}
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

WorkflowCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    bullets: PropTypes.arrayOf(PropTypes.string).isRequired,
    image: PropTypes.string.isRequired,
    imageSide: PropTypes.string.isRequired,
  }).isRequired,
}

function WorkflowSection({ workflowItems }) {
  const { t } = useTranslation()
  const workflow = workflowItems.map((item, index) => ({
    ...item,
    ...workflowMedia[index],
  }))

  return (
    <section className="workflow-section" id="producto">
      <div className="workflow-light" />
      <div className="page-shell">
        <SectionHeader
          eyebrow={t('workflow.eyebrow')}
          title={t('workflow.title')}
          description={t('workflow.description')}
          centered
        />

        <div className="workflow-stack">
          {workflow.map((item) => (
            <WorkflowCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  )
}

WorkflowSection.propTypes = {
  workflowItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      bullets: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ).isRequired,
}

export default WorkflowSection
