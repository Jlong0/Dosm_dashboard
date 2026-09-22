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
    process.env.OPENROUTER_MODEL;

  if (!model) {
    throw new Error(
      'OPENROUTER_MODEL is not configured.'
    );
  }


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

          max_tokens: 8000
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


/*
 * Useful diagnostics when using
 * OpenRouter's free router because the
 * actual underlying model may change.
 */
console.log(
  'OpenRouter model:',
  data?.model ?? model
);

console.log(
  'OpenRouter finish reason:',
  finishReason
);

console.log(
  'OpenRouter usage:',
  data?.usage ?? null
);


/*
 * Check truncation FIRST.
 *
 * A model can consume its available
 * completion tokens before producing
 * visible JSON content.
 */
if (
  finishReason === 'length'
) {
  console.error(
    'OpenRouter response was truncated.',
    {
      model:
        data?.model ?? model,

      usage:
        data?.usage ?? null,

      contentLength:
        typeof content === 'string'
          ? content.length
          : 0
    }
  );

  throw new Error(
    'The AI model exhausted its output-token limit before completing the response. Please try again.'
  );
}


if (!content) {
  console.error(
    'OpenRouter returned no content.',
    {
      model:
        data?.model ?? model,

      finishReason,

      message:
        choice?.message ?? null
    }
  );

  throw new Error(
    'OpenRouter returned no model content.'
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