import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DeliverySection from './components/sections/DeliverySection'
import HeroSection from './components/sections/HeroSection'
import OpportunitySection from './components/sections/OpportunitySection'
import ProblemSection from './components/sections/ProblemSection'
import StatsSection from './components/sections/StatsSection'
import TestimonialsSection from './components/sections/TestimonialsSection'
import TickerSection from './components/sections/TickerSection'
import UseCasesSection from './components/sections/UseCasesSection'
import WorkflowSection from './components/sections/WorkflowSection'

function App() {
  const { t, i18n } = useTranslation()
  const signalWords = t('ticker.words', { returnObjects: true })
  const stats = t('stats.items', { returnObjects: true })
  const painPoints = t('problem.painPoints', { returnObjects: true })
  const workflowItems = t('workflow.items', { returnObjects: true })
  const opportunityLines = t('opportunity.lines', { returnObjects: true })
  const useCases = t('useCases.items', { returnObjects: true })
  const deliveryModes = t('delivery.items', { returnObjects: true })
  const testimonials = t('testimonials.items', { returnObjects: true })

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage || 'es'
    document.title = t('meta.title')
  }, [i18n.resolvedLanguage, t])

  return (
    <main className="glimmer-page">
      <HeroSection />
      <TickerSection words={signalWords} />
      <StatsSection stats={stats} />
      <ProblemSection painPoints={painPoints} />
      <WorkflowSection workflowItems={workflowItems} />
      <OpportunitySection opportunityLines={opportunityLines} />
      <UseCasesSection useCases={useCases} />
      <DeliverySection deliveryModes={deliveryModes} />
      <TestimonialsSection testimonials={testimonials} />
    </main>
  )
}

export default App
