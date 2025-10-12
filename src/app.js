import express from "express";

const app = express();


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/v1', (req, res) => {
  res.send('Hello from API v1')
})




export default app;
