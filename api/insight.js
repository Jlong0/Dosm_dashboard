import {
    buildSystemPrompt,
    buildUserPrompt
  } from '../server/prompt.js';
  
  import {
    validateInsight
  } from '../server/validateInsight.js';
  
  import {
      callOpenRouter
    } from '../server/openrouter.js';
  
  /*
   * Guided Decision Intelligence request
   */
  export default async function handler(
    req,
    res
  ) {
  
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  
      try {
  
        const payload =
          req.body;
  
  
        if (!payload) {
          return res
            .status(400)
            .json({
              error:
                'Missing request payload.'
            });
        }
  
  
        if (!payload.query?.id) {
          return res
            .status(400)
            .json({
              error:
                'Missing query ID.'
            });
        }
  
  
        if (
          payload.query.allowed === false
        ) {
          return res
            .status(400)
            .json({
              error:
                payload.query
                  .unavailableReason ??
                'This guided query is unavailable.'
            });
        }
  
  
        if (
          !payload.evidence ||
          !payload.evidenceIndex
        ) {
          return res
            .status(400)
            .json({
              error:
                'Missing evidence package.'
            });
        }
  
  
        const systemPrompt =
          buildSystemPrompt();
  
  
        const userPrompt =
          buildUserPrompt(
            payload
          );
  
  
        const modelResponse =
          await callOpenRouter({
              systemPrompt,
              userPrompt
          });
  
  
        const rawResult =
          modelResponse.result;
  
  
        const validatedResult =
          validateInsight(
            rawResult,
  
            payload.evidenceIds ??
            []
          );
  
  
        /*
         * -----------------------------
         * RESPONSE
         * -----------------------------
         */
  
        return res.json({
          success: true,
        
          queryId:
            payload.query.id,
        
          context:
            payload.context,
        
          model: {
            id:
              modelResponse.model,
        
            usage:
              modelResponse.usage
          },
        
          result:
            validatedResult
        });
  
  
      } catch (error) {
  
        console.error(
          'Decision Intelligence error:',
          error
        );
  
  
        return res
          .status(500)
          .json({
            error:
              'Decision Intelligence request failed.',
          });
      }
    }
