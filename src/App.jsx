import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DeliverySection from './components/sections/DeliverySection'
import FaqCtaSection from './components/sections/FaqCtaSection'
import FaqSection from './components/sections/FaqSection'
import HeroSection from './components/sections/HeroSection'
import LogoFooterSection from './components/sections/LogoFooterSection'
import OpportunitySection from './components/sections/OpportunitySection'
import ProblemSectionNew from './components/sections/ProblemSectionNew'
import ProblemSection from './components/sections/ProblemSection'
import StatsSection from './components/sections/StatsSection'
import TestimonialsSection from './components/sections/TestimonialsSection'
import UseCasesSectionStack from './components/sections/UseCasesSectionStack'
import WorkflowSection from './components/sections/WorkflowSection'

function App() {
  const { t, i18n } = useTranslation()
  const stats = t('stats.items', { returnObjects: true })
  const painPoints = t('problem.painPoints', { returnObjects: true })
  const workflowItems = t('workflow.items', { returnObjects: true })
  const opportunityLines = t('opportunity.lines', { returnObjects: true })
  const useCases = t('useCases.items', { returnObjects: true })
  const deliveryModes = t('delivery.items', { returnObjects: true })
  const faqs = t('faqs.items', { returnObjects: true })
  const testimonials = t('testimonials.items', { returnObjects: true })

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage || 'es'
    document.title = t('meta.title')
  }, [i18n.resolvedLanguage, t])

  return (
    <>
      <main className="glimmer-page">
        <HeroSection />
        <StatsSection stats={stats} />
        <ProblemSectionNew painPoints={painPoints} />
        {/* <ProblemSection painPoints={painPoints} /> */}
        <WorkflowSection workflowItems={workflowItems} />
        <OpportunitySection opportunityLines={opportunityLines} />
        <UseCasesSectionStack useCases={useCases} />
        <DeliverySection deliveryModes={deliveryModes} />
        <TestimonialsSection testimonials={testimonials} />
        <FaqSection faqs={faqs} />
        <FaqCtaSection />
      </main>
      <LogoFooterSection />
    </>
  )
}

export default App
