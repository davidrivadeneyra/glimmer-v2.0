function LegalSection({ section }) {
  return (
    <section className="legal-section">
      {section.title ? <h2 className="legal-section-title">{section.title}</h2> : null}

      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="legal-paragraph">
          {paragraph}
        </p>
      ))}

      {section.list?.length ? (
        <ul className="legal-list">
          {section.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      {section.groups?.map((group) => (
        <div key={group.title} className="legal-group">
          <h3 className="legal-group-title">{group.title}</h3>

          {group.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="legal-paragraph">
              {paragraph}
            </p>
          ))}

          {group.list?.length ? (
            <ul className="legal-list">
              {group.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}

      {section.closing ? <p className="legal-paragraph legal-closing">{section.closing}</p> : null}
    </section>
  )
}

function LegalPage({ document }) {
  const isEnglishDocument = document.slug.startsWith('/en/')
  const backHref = isEnglishDocument ? '/en' : '/'
  const backLabel = isEnglishDocument ? 'Back' : 'Volver'

  return (
    <main className="legal-page">
      <section className="legal-hero">
        <div className="legal-shell">
          <a className="legal-back-link" href={backHref}>
            {backLabel}
          </a>
          <span className="legal-eyebrow">Itsglimmer S.L.</span>
          <h1 className="legal-title">{document.title}</h1>
          <p className="legal-summary">{document.summary}</p>
        </div>
      </section>

      <section className="legal-body">
        <div className="legal-shell">
          <div className="legal-card">
            {document.sections.map((section) => (
              <LegalSection key={section.title || section.paragraphs?.[0]} section={section} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default LegalPage
