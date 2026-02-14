const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const projectRoutes = require('./routes/projects');
const questionnaireRoutes = require('./routes/questionnaire');
const moduleRoutes = require('./routes/modules');
const codegenRoutes = require('./routes/codegen');
const deploymentRoutes = require('./routes/deployments');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const templateRoutes = require('./routes/templates');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Raw body for Razorpay webhook signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/questionnaire', questionnaireRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/codegen', codegenRoutes);
app.use('/api/deployments', deploymentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/templates', templateRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
