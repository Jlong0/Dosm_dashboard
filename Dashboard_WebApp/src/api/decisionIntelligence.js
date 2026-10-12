const API_BASE =
  import.meta.env.VITE_AI_API_URL ?? '';


export async function requestInsight(payload) {
    const response = await fetch(
      `${API_BASE}/api/insight`,
      {
        method: 'POST',
  
        headers: {
          'Content-Type':
            'application/json'
        },
  
        body:
          JSON.stringify(payload)
      }
    );
  
    if (!response.ok) {
      const body =
        await response.json()
          .catch(() => ({}));
  
      throw new Error(
        body.error ??
        `Request failed: ${response.status}`
      );
    }
  
    return response.json();
}