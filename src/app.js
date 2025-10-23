import express from "express";
import cors from "cors";
const app = express();

// Middleware for parsing JSON and urlencoded data
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({ extended: true , limit: '16kb' }));
// Public folder data access
app.use(express.static('public'));

// cors configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

                                                                                                              
// import routes
import healthcheckRoutes from "./routes/healthcheck.routes.js";

import authRouter from "./routes/auth.routes.js";


app.use('/api/v1/healthcheck', healthcheckRoutes);
app.use('/api/v1/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/v1', (req, res) => {
  res.send('Hello from API v1')
})

export default app;
