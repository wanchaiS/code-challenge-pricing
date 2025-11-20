export interface PricingProfile {
  _id: string
  name: string
  selectionType: 'one' | 'multiple' | 'all'
  updatedAt: string
  createdAt: string
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(errorBody || res.statusText)
  }

  return res.json() as Promise<T>
}

export function fetchProfiles() {
  return request<PricingProfile[]>('/api/pricing-profiles')
}

export function createProfile(name: string) {
  return request<PricingProfile>('/api/pricing-profiles', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}
