import { API_BASE_URL } from '../config'

// POSTs a website form submission to the backend, which emails info@pinservex.com.
// `endpoint` is one of: subscribe | quote | contact | product-inquiry
export async function sendMessage(endpoint, data) {
  const res = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    let message = 'Something went wrong. Please try again.'
    try {
      const body = await res.json()
      if (body?.message) message = body.message
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new Error(message)
  }

  return res.json().catch(() => ({}))
}
