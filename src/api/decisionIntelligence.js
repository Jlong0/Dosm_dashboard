const API_BASE =
  import.meta.env
    .VITE_AI_API_URL ??
  'http://localhost:3001';


export async function requestInsight(
  payload
) {
  if (!payload) {
    throw new Error(
      'Missing guided query payload.'
    );
  }

  const response =
    await fetch(
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


  let data;

  try {
    data =
      await response.json();
  } catch {
    throw new Error(
      'AI service returned an invalid response.'
    );
  }


  if (!response.ok) {
    throw new Error(
      data.error ??
      'Decision Intelligence request failed.'
    );
  }


  return data;
}