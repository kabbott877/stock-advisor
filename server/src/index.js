import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import earningsRoutes from './routes/earnings.js';
import scanRoutes from './routes/scan.js';
import researchRoutes from './routes/research.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://192.168.1.189:5173',
  'http://100.73.91.28:5173'
].filter(Boolean);

app.use(helmet());
app.use(cors({ origin: (origin, cb) => {
  if (!origin || allowedOrigins.includes(origin)) {
    cb(null, true);
  } else {
    cb(new Error('Not allowed by CORS'));
  }
}}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/research', researchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Stock Advisor API running on port ${PORT}`);
});

export default app;
