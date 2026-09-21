const OPENROUTER_URL =
  'https://openrouter.ai/api/v1/chat/completions';


const INSIGHT_SCHEMA = {
  type: 'object',

  properties: {
    title: {
      type: 'string',
      description:
        'Short descriptive title for the decision-intelligence response.'
    },

    summary: {
      type: 'string',
      description:
        'Concise summary grounded only in the supplied evidence.'
    },

    findings: {
        type: 'array',
      
        minItems: 2,
        maxItems: 5,
      
        items: {
          type: 'object',
      
          properties: {
            text: {
              type: 'string',
              description:
                'One concise evidence-grounded finding.'
            },
      
            evidenceIds: {
              type: 'array',
      
              minItems: 1,
              maxItems: 5,
      
              items: {
                type: 'string'
              },
      
              description:
                'Evidence IDs supplied in the request that support this finding.'
            }
          },
      
          required: [
            'text',
            'evidenceIds'
          ],
      
          additionalProperties: false
        }
      },

      limitations: {
        type: 'array',
      
        maxItems: 4,
      
        items: {
          type: 'string'
        },
      
        description:
          'Only the most important limitations relevant to this answer.'
      }
  },

  required: [
    'title',
    'summary',
    'findings',
    'limitations'
  ],

  additionalProperties: false
};


export async function callOpenRouter({
  systemPrompt,
  userPrompt
}) {

  const apiKey =
    process.env.OPENROUTER_API_KEY;


  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not configured.'
    );
  }


  const model =
    process.env.OPENROUTER_MODEL ??
    'google/gemini-3.8-flash';


  const response =
    await fetch(
      OPENROUTER_URL,
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          'Content-Type':
            'application/json',

          /*
           * Optional OpenRouter attribution.
           *
           * Fine to keep localhost while
           * developing.
           */
          'HTTP-Referer':
            process.env.APP_URL ??
            'http://localhost:5173',

          'X-OpenRouter-Title':
            'MarineWatch Decision Intelligence'
        },

        body: JSON.stringify({
          model,

          messages: [
            {
              role: 'system',
              content:
                systemPrompt
            },

            {
              role: 'user',
              content:
                userPrompt
            }
          ],


          /*
           * Require a provider capable of
           * honoring parameters such as
           * structured output.
           */
          provider: {
            require_parameters: true
          },


          /*
           * OpenRouter structured output.
           */
          response_format: {
            type:
              'json_schema',

            json_schema: {
              name:
                'decision_intelligence',

              strict:
                true,

              schema:
                INSIGHT_SCHEMA
            }
          },


          temperature: 0.2,

          max_tokens: 4000
        })
      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    console.error(
      'OpenRouter API error:',
      JSON.stringify(
        data,
        null,
        2
      )
    );

    throw new Error(
      data?.error?.message ??
      `OpenRouter request failed with status ${response.status}.`
    );
  }


  const choice =
  data?.choices?.[0];

    const content =
    choice?.message?.content;

    const finishReason =
    choice?.finish_reason;


    console.log(
    'OpenRouter finish reason:',
    finishReason
    );


    if (!content) {
    throw new Error(
        'OpenRouter returned no model content.'
    );
    }


    /*
    * If the model hit the output-token
    * limit, JSON may be incomplete.
    */
    if (
    finishReason === 'length'
    ) {
    console.error(
        'OpenRouter response was truncated.'
    );

    throw new Error(
        'OpenRouter response exceeded the output-token limit.'
    );
    }


  let result;

  try {
    result =
      typeof content === 'string'
        ? JSON.parse(content)
        : content;

  } catch (error) {

    console.error(
      'Raw OpenRouter content:',
      content
    );

    throw new Error(
      'OpenRouter returned invalid JSON.'
    );
  }


  return {
    result,

    usage:
      data.usage ?? null,

    model:
      data.model ?? model
  };
}