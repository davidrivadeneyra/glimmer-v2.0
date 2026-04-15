import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from './Button'

const initialFormState = {
  fullName: '',
  company: '',
  email: '',
  phone: '',
}

const demoRequestEndpoint = import.meta.env.VITE_DEMO_REQUEST_ENDPOINT || '/api/demo-request'
const modalExitAnimationMs = 320

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

function DemoRequestModal({ open, onOpenChange }) {
  const { t } = useTranslation()
  const dialogRef = useRef(null)
  const fullNameInputRef = useRef(null)
  const [isRendered, setIsRendered] = useState(open)
  const [formValues, setFormValues] = useState(initialFormState)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitStatus, setSubmitStatus] = useState('idle')
  const isClosing = isRendered && !open

  useEffect(() => {
    if (open) {
      setIsRendered(true)
      return undefined
    }

    const closeTimer = window.setTimeout(() => {
      setIsRendered(false)
    }, modalExitAnimationMs)

    return () => {
      window.clearTimeout(closeTimer)
    }
  }, [open])

  useEffect(() => {
    if (!isRendered) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isRendered])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const focusTimer = window.setTimeout(() => {
      fullNameInputRef.current?.focus()
    }, 60)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onOpenChange, open])

  useEffect(() => {
    if (!open) {
      setFormValues(initialFormState)
      setFieldErrors({})
      setSubmitStatus('idle')
    }
  }, [open])

  if (!isRendered) {
    return null
  }

  const validateForm = () => {
    const nextErrors = {}
    const fullName = formValues.fullName.trim()
    const company = formValues.company.trim()
    const email = formValues.email.trim()

    if (!fullName) {
      nextErrors.fullName = t('demoModal.errors.fullName')
    }

    if (!company) {
      nextErrors.company = t('demoModal.errors.company')
    }

    if (!email || !isValidEmail(email)) {
      nextErrors.email = t('demoModal.errors.email')
    }

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))

    if (fieldErrors[name]) {
      setFieldErrors((current) => {
        const nextErrors = { ...current }
        delete nextErrors[name]
        return nextErrors
      })
    }

    if (submitStatus !== 'idle') {
      setSubmitStatus('idle')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitStatus('submitting')

    try {
      const response = await fetch(demoRequestEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formValues.fullName.trim(),
          company: formValues.company.trim(),
          email: formValues.email.trim(),
          phone: formValues.phone.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Demo request failed')
      }

      setSubmitStatus('success')
      setFormValues(initialFormState)
    } catch {
      setSubmitStatus('error')
    }
  }

  const closeModal = () => {
    if (submitStatus !== 'submitting' && open) {
      onOpenChange(false)
    }
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeModal()
    }
  }

  return (
    <div
      className={`demo-modal ${isClosing ? 'is-closing' : ''}`.trim()}
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="demo-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-hidden={isClosing || undefined}
        aria-labelledby="demo-modal-title"
        aria-describedby="demo-modal-description"
      >
        <button
          className="demo-modal__close"
          type="button"
          aria-label={t('demoModal.close')}
          onClick={closeModal}
          disabled={submitStatus === 'submitting'}
        >
          <span aria-hidden="true">x</span>
        </button>

        <div className="demo-modal__header">
          <p className="demo-modal__eyebrow">{t('demoModal.eyebrow')}</p>
          <h2 id="demo-modal-title" className="type-title-regular-size">
            {t('demoModal.title')}
          </h2>
          <p id="demo-modal-description" className="demo-modal__description">
            {t('demoModal.description')}
          </p>
        </div>

        <form className="demo-modal__form" onSubmit={handleSubmit} noValidate>
          <label
            className="demo-modal__field"
            data-invalid={Boolean(fieldErrors.fullName) || undefined}
          >
            <span className="demo-modal__field-label">{t('demoModal.fields.fullName')}</span>
            <input
              ref={fullNameInputRef}
              className="demo-modal__field-control"
              type="text"
              name="fullName"
              value={formValues.fullName}
              onChange={handleFieldChange}
              autoComplete="name"
              aria-invalid={Boolean(fieldErrors.fullName)}
              aria-describedby={fieldErrors.fullName ? 'demo-full-name-error' : undefined}
              disabled={submitStatus === 'submitting' || submitStatus === 'success'}
            />
          </label>
          {fieldErrors.fullName ? (
            <span id="demo-full-name-error" className="demo-modal__error">
              {fieldErrors.fullName}
            </span>
          ) : null}

          <label
            className="demo-modal__field"
            data-invalid={Boolean(fieldErrors.company) || undefined}
          >
            <span className="demo-modal__field-label">{t('demoModal.fields.company')}</span>
            <input
              className="demo-modal__field-control"
              type="text"
              name="company"
              value={formValues.company}
              onChange={handleFieldChange}
              autoComplete="organization"
              aria-invalid={Boolean(fieldErrors.company)}
              aria-describedby={fieldErrors.company ? 'demo-company-error' : undefined}
              disabled={submitStatus === 'submitting' || submitStatus === 'success'}
            />
          </label>
          {fieldErrors.company ? (
            <span id="demo-company-error" className="demo-modal__error">
              {fieldErrors.company}
            </span>
          ) : null}

          <label
            className="demo-modal__field"
            data-invalid={Boolean(fieldErrors.email) || undefined}
          >
            <span className="demo-modal__field-label">{t('demoModal.fields.email')}</span>
            <input
              className="demo-modal__field-control"
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleFieldChange}
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'demo-email-error' : undefined}
              disabled={submitStatus === 'submitting' || submitStatus === 'success'}
            />
          </label>
          {fieldErrors.email ? (
            <span id="demo-email-error" className="demo-modal__error">
              {fieldErrors.email}
            </span>
          ) : null}

          <label className="demo-modal__field">
            <span className="demo-modal__field-label">{t('demoModal.fields.phone')}</span>
            <input
              className="demo-modal__field-control"
              type="tel"
              name="phone"
              value={formValues.phone}
              onChange={handleFieldChange}
              autoComplete="tel"
              disabled={submitStatus === 'submitting' || submitStatus === 'success'}
            />
          </label>

          <div className="demo-modal__actions">
            <Button
              radius="full"
              background="blue"
              fullWidth
              type="submit"
              disabled={submitStatus === 'submitting' || submitStatus === 'success'}
            >
              {submitStatus === 'submitting'
                ? t('demoModal.submitting')
                : t('demoModal.submit')}
            </Button>
          </div>

          <div className="demo-modal__status" aria-live="polite">
            {submitStatus === 'success' ? (
              <p className="demo-modal__success">{t('demoModal.success')}</p>
            ) : null}
            {submitStatus === 'error' ? (
              <p className="demo-modal__error">{t('demoModal.error')}</p>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  )
}

DemoRequestModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
}

export default DemoRequestModal
