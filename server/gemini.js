import { GoogleGenAI } from '@google/genai';


const API_KEYS = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5
  ].filter(Boolean);
  
  
  if (API_KEYS.length === 0) {
    throw new Error(
      'No Gemini API keys configured.'
    );
  }

const MODEL =
  process.env.GEMINI_MODEL ?? 'gemini-3.8-flash';

const keyState =
  API_KEYS.map((apiKey, index) => ({
    apiKey,

    id:
      `key-${index + 1}`,

    cooldownUntil:
      0,

    disabled:
      false
  }));


let nextKeyIndex = 0;


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


function getAvailableKey() {
    const now =
      Date.now();
  
  
    for (
      let attempt = 0;
      attempt < keyState.length;
      attempt++
    ) {
  
      const index =
        (
          nextKeyIndex +
          attempt
        ) % keyState.length;
  
  
      const state =
        keyState[index];
  
  
      if (
        !state.disabled &&
        state.cooldownUntil <= now
      ) {
  
        nextKeyIndex =
          (index + 1) %
          keyState.length;
  
        return state;
      }
    }
  
  
    return null;
  }


function markRateLimited(
    state,
    milliseconds = 60_000
  ) {
    state.cooldownUntil =
      Date.now() +
      milliseconds;
  
    console.warn(
      `[Gemini] ${state.id} rate limited; ` +
      `cooling down for ${
        milliseconds / 1000
      }s`
    );
  }


function disableKey(
    state,
    reason
  ) {
    state.disabled = true;
  
    console.error(
      `[Gemini] ${state.id} disabled:`,
      reason
    );
  }


export async function callGemini({
  systemPrompt,
  userPrompt
}) {

  let lastError;


  for (
    let attempt = 0;
    attempt < keyState.length;
    attempt++
  ) {

    const key =
      getAvailableKey();


    if (!key) {
      throw new Error(
        'All Gemini API keys are currently unavailable or cooling down.'
      );
    }


    const ai =
      new GoogleGenAI({
        apiKey:
          key.apiKey
      });


    try {

      console.log(
        `[Gemini] Using ${key.id}`
      );


      const response =
        await ai.models.generateContent({
          model:
            MODEL,

          contents:
            userPrompt,

          config: {
            systemInstruction:
              systemPrompt,

            maxOutputTokens:
              8000,

            responseMimeType:
              'application/json',

            responseSchema:
              INSIGHT_SCHEMA
          }
        });


      if (!response.text) {
        throw new Error(
          'Gemini returned no response text'
        );
      }


      let result;


      try {
        result =
          JSON.parse(
            response.text
          );

      } catch {
        throw new Error(
          'Gemini returned invalid JSON'
        );
      }


      return {
        model:
          MODEL,

        usage:
          response.usageMetadata ??
          null,

        result
      };


    } catch (error) {

      lastError =
        error;


      /*
       * Rate limit.
       */
      if (
        error?.status === 429
      ) {

        markRateLimited(
          key,
          60_000
        );

        continue;
      }


      /*
       * Invalid / unauthorized key.
       */
      if (
        error?.status === 401 ||
        error?.status === 403
      ) {

        disableKey(
          key,
          `HTTP ${error.status}`
        );

        continue;
      }


      /*
       * Temporary Gemini outage.
       */
      if (
        error?.status === 503
      ) {

        markRateLimited(
          key,
          15_000
        );

        continue;
      }


      /*
       * Don't rotate keys for things
       * such as invalid prompts/schema.
       */
      throw error;
    }
  }


  throw (
    lastError ??
    new Error(
      'All Gemini requests failed.'
    )
  );
}