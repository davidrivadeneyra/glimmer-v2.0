import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DemoRequestModal from './components/DemoRequestModal'
import HeroNav from './components/HeroNav'
import DeliverySection from './components/sections/DeliverySection'
import FaqCtaSection from './components/sections/FaqCtaSection'
import FaqMiddleSection from './components/sections/FaqMiddleSection'
import FaqSection from './components/sections/FaqSection'
import HeroSection from './components/sections/HeroSection'
import LegalPage from './components/LegalPage'
import LogoFooterSection from './components/sections/LogoFooterSection'
import OpportunitySection from './components/sections/OpportunitySection'
import ProblemSectionNew from './components/sections/ProblemSectionNew'
import StatsSection from './components/sections/StatsSection'
import TestimonialsSection from './components/sections/TestimonialsSection'
import UseCasesSectionStack from './components/sections/UseCasesSectionStack'
import WorkflowSection from './components/sections/WorkflowSection'
import { getLegalDocumentByPath, getPathLanguage } from './legal/content'

const siteOrigin = 'https://itsglimmer.com'

const openGraphImages = {
  en: '/assets/open-graph/Open graph-English.png',
  es: '/assets/open-graph/Open graph-Spanish.png',
}

const openGraphLocales = {
  en: 'en_US',
  es: 'es_ES',
}

const setMetaContent = (selector, content, attributeName = 'content') => {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')

    if (selector.startsWith('meta[property="')) {
      element.setAttribute('property', selector.match(/meta\[property="([^"]+)"\]/)?.[1] ?? '')
    } else if (selector.startsWith('meta[name="')) {
      element.setAttribute('name', selector.match(/meta\[name="([^"]+)"\]/)?.[1] ?? '')
    }

    document.head.appendChild(element)
  }

  element.setAttribute(attributeName, content)
}

const setLinkHref = (selector, href) => {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', selector.match(/link\[rel="([^"]+)"\]/)?.[1] ?? '')
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

function App() {
  const { t, i18n } = useTranslation()
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  const pathname = window.location.pathname
  const pathLanguage = getPathLanguage(pathname)
  const legalDocument = getLegalDocumentByPath(pathname)
  const stats = t('stats.items', { returnObjects: true })
  const painPoints = t('problem.painPoints', { returnObjects: true })
  const workflowItems = t('workflow.items', { returnObjects: true })
  const opportunityLines = t('opportunity.lines', { returnObjects: true })
  const useCases = t('useCases.items', { returnObjects: true })
  const deliveryModes = t('delivery.items', { returnObjects: true })
  const faqs = t('faqs.items', { returnObjects: true })
  const testimonials = t('testimonials.items', { returnObjects: true })

  useEffect(() => {
    if (i18n.resolvedLanguage !== pathLanguage) {
      i18n.changeLanguage(pathLanguage)
    }
  }, [i18n, i18n.resolvedLanguage, pathLanguage])

  useEffect(() => {
    const resolvedLanguage = i18n.resolvedLanguage || pathLanguage
    const pageTitle = legalDocument ? `Glimmer | ${legalDocument.title}` : t('meta.title')
    const pageDescription = legalDocument?.description || t('meta.description')
    const imagePath = openGraphImages[resolvedLanguage] || openGraphImages.es
    const imageUrl = new URL(imagePath, siteOrigin).href
    const pageUrl = new URL(pathname, siteOrigin).href

    document.documentElement.lang = resolvedLanguage
    document.title = pageTitle

    setLinkHref('link[rel="canonical"]', pageUrl)
    setMetaContent('meta[name="description"]', pageDescription)
    setMetaContent('meta[property="og:type"]', 'website')
    setMetaContent('meta[property="og:site_name"]', 'Glimmer')
    setMetaContent('meta[property="og:title"]', pageTitle)
    setMetaContent('meta[property="og:description"]', pageDescription)
    setMetaContent('meta[property="og:url"]', pageUrl)
    setMetaContent('meta[property="og:image"]', imageUrl)
    setMetaContent('meta[property="og:image:secure_url"]', imageUrl)
    setMetaContent('meta[property="og:image:type"]', 'image/png')
    setMetaContent('meta[property="og:image:width"]', '1200')
    setMetaContent('meta[property="og:image:height"]', '630')
    setMetaContent('meta[property="og:image:alt"]', 'Glimmer')
    setMetaContent('meta[property="og:locale"]', openGraphLocales[resolvedLanguage] || openGraphLocales.es)
    setMetaContent('meta[name="twitter:card"]', 'summary_large_image')
    setMetaContent('meta[name="twitter:title"]', pageTitle)
    setMetaContent('meta[name="twitter:description"]', pageDescription)
    setMetaContent('meta[name="twitter:image"]', imageUrl)
    setMetaContent('meta[name="twitter:image:alt"]', 'Glimmer')
  }, [i18n.resolvedLanguage, legalDocument, pathLanguage, pathname, t])

  if (legalDocument) {
    return <LegalPage document={legalDocument} />
  }

  return (
    <>
      <HeroNav onDemoRequest={() => setIsDemoModalOpen(true)} />
      <main className="glimmer-page">
        <HeroSection onDemoRequest={() => setIsDemoModalOpen(true)} />
        <StatsSection stats={stats} />
        <ProblemSectionNew painPoints={painPoints} />
        <WorkflowSection workflowItems={workflowItems} />
        <OpportunitySection
          opportunityLines={opportunityLines}
          onDemoRequest={() => setIsDemoModalOpen(true)}
        />
        <UseCasesSectionStack useCases={useCases} />
        <DeliverySection deliveryModes={deliveryModes} />
        <TestimonialsSection testimonials={testimonials} />
        <FaqSection faqs={faqs} />
        <FaqMiddleSection />
        <FaqCtaSection onDemoRequest={() => setIsDemoModalOpen(true)} />
      </main>
      <LogoFooterSection />
      <DemoRequestModal open={isDemoModalOpen} onOpenChange={setIsDemoModalOpen} />
    </>
  )
}

export default App
