import app from './index.js';


const PORT =
  process.env.PORT ?? 3001;


app.listen(
  PORT,
  () => {
    console.log(
      `Decision Intelligence API running on port ${PORT}`
    );
  }
);