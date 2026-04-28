export async function fetchJsonWithFallback(requests, fallbackMessage) {
  let lastResponse = null
  let lastError = null

  for (const request of requests) {
    let response

    try {
      response = await fetch(request.url, request.options)
      lastResponse = response
    } catch (error) {
      lastError = error
      continue
    }

    if (response.ok) {
      return parseJsonResponse(response)
    }

    if (!shouldFallback(response)) {
      throw new Error(await getResponseError(response, fallbackMessage))
    }
  }

  if (lastError && !lastResponse) {
    throw new Error(lastError.message || fallbackMessage)
  }

  throw new Error(await getResponseError(lastResponse, fallbackMessage))
}

export function normalizeCollection(data, keys = []) {
  if (Array.isArray(data)) return data

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key]
  }

  return []
}

export function normalizeItem(data, keys = []) {
  if (Array.isArray(data)) return data[0] || null

  for (const key of keys) {
    if (data?.[key]) return data[key]
  }

  return data || null
}

export async function getResponseError(response, fallbackMessage) {
  if (!response) return fallbackMessage

  const error = await response.json().catch(() => ({}))
  return error.error_description || error.msg || error.message || error.error || fallbackMessage
}

function shouldFallback(response) {
  return [404, 405].includes(response.status)
}

async function parseJsonResponse(response) {
  if (response.status === 204) return null

  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}
