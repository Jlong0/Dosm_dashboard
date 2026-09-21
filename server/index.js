import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import {
  buildSystemPrompt,
  buildUserPrompt
} from './prompt.js';

import {
  validateInsight
} from './validateInsight.js';

import {
    callOpenRouter
  } from './openrouter.js';


dotenv.config();

const app = express();

const PORT =
  process.env.PORT || 3001;


app.use(
  cors({
    origin: [
      'http://localhost:5173'
    ]
  })
);


app.use(
  express.json({
    limit: '1mb'
  })
);


/*
 * Health check
 */
app.get(
  '/api/health',
  (req, res) => {

    res.json({
      ok: true,

      service:
        'MarineWatch Decision Intelligence API'
    });
  }
);


/*
 * Guided Decision Intelligence request
 */
app.post(
  '/api/insight',

  async (req, res) => {

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

          detail:
            process.env.NODE_ENV ===
            'development'
              ? error.message
              : undefined
        });
    }
  }
);


app.listen(
  PORT,
  () => {

    console.log(
      `Decision Intelligence API running on http://localhost:${PORT}`
    );
  }
);