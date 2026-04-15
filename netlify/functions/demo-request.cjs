const jsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const normalizePipedriveDomain = (value) => {
  const domain = value
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .trim()

  return domain.endsWith('.pipedrive.com') ? domain : `${domain}.pipedrive.com`
}

const getPipedriveUrl = (path) => {
  const apiToken = process.env.PIPEDRIVE_API_TOKEN
  const companyDomain = process.env.PIPEDRIVE_COMPANY_DOMAIN

  if (!apiToken || !companyDomain) {
    throw new Error('Missing Pipedrive environment variables')
  }

  const url = new URL(`https://${normalizePipedriveDomain(companyDomain)}${path}`)
  url.searchParams.set('api_token', apiToken)

  return url
}

const requestPipedrive = async (path, options = {}) => {
  const response = await fetch(getPipedriveUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || `Pipedrive request failed with ${response.status}`)
  }

  return payload
}

const findPersonByEmail = async (email) => {
  const url = getPipedriveUrl('/v1/persons/search')
  url.searchParams.set('term', email)
  url.searchParams.set('fields', 'email')
  url.searchParams.set('exact_match', 'true')

  const response = await fetch(url)
  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || 'Could not search Pipedrive person')
  }

  const match = payload.data?.items?.[0]
  return match?.item?.id || match?.id || null
}

const createPerson = async ({ fullName, email, phone }) => {
  const body = {
    name: fullName,
    email: [{ value: email, primary: true, label: 'work' }],
  }

  if (phone) {
    body.phone = [{ value: phone, primary: true, label: 'work' }]
  }

  const payload = await requestPipedrive('/v1/persons', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return payload.data?.id
}

const createLead = async ({ fullName, personId }) => {
  const body = {
    title: `Solicitud de demo - ${fullName}`,
    person_id: personId,
  }

  if (process.env.PIPEDRIVE_OWNER_ID) {
    body.owner_id = Number(process.env.PIPEDRIVE_OWNER_ID)
  }

  const payload = await requestPipedrive('/v1/leads', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return payload.data?.id
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(204, {})
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' })
  }

  let body

  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' })
  }

  const fullName = String(body.fullName || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const phone = String(body.phone || '').trim()

  if (!fullName || !isValidEmail(email)) {
    return jsonResponse(400, { error: 'Invalid demo request data' })
  }

  try {
    const existingPersonId = await findPersonByEmail(email)
    const personId = existingPersonId || await createPerson({ fullName, email, phone })

    if (!personId) {
      throw new Error('Could not resolve Pipedrive person')
    }

    const leadId = await createLead({ fullName, personId })

    return jsonResponse(200, {
      ok: true,
      personId,
      leadId,
    })
  } catch (error) {
    console.error('Demo request failed:', error.message)
    return jsonResponse(502, { error: 'Could not create Pipedrive lead' })
  }
}
