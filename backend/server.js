const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { query, param, validationResult } = require('express-validator');
const swaggerUi = require('swagger-ui-express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const dbPath = __dirname + '/database/drugs_scalable.db';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(limiter);

// Validation helper
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Minimal OpenAPI spec for Swagger UI
const openapiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'PharmAssist Pro API',
    version: '1.0.0',
    description: 'API for ICD-10 to Treatment Mapping',
  },
  servers: [
    { url: `http://localhost:${PORT}` },
    { url: 'https://pharmassist-pro-backend.onrender.com' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'OK' } }
      }
    },
    '/api/diagnoses': {
      get: {
        summary: 'List diagnoses',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, required: false }
        ],
        responses: { '200': { description: 'List of diagnoses' } }
      }
    },
    '/api/treatments/{diagnosisCode}': {
      get: {
        summary: 'List treatments for a diagnosis',
        parameters: [
          { name: 'diagnosisCode', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'List of treatments' }, '404': { description: 'Diagnosis not found' } }
      }
    },
    '/api/export/{diagnosisCode}': {
      get: {
        summary: 'Export diagnosis and treatments',
        parameters: [
          { name: 'diagnosisCode', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'format', in: 'query', required: false, schema: { type: 'string', enum: ['json', 'csv'] } }
        ],
        responses: { '200': { description: 'Exported file' }, '404': { description: 'Diagnosis not found' } }
      }
    }
  }
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Routes
app.get('/health', (req, res) => {
  db.get('SELECT name FROM sqlite_master', (err) => {
    const dbStatus = err ? 'disconnected' : 'connected';
    res.json({ status: 'OK', timestamp: new Date().toISOString(), db: dbStatus });
  });
});

app.get(
  '/api/diagnoses',
  [query('search').optional().isString().trim().isLength({ max: 200 })],
  handleValidation,
  (req, res) => {
  const { search } = req.query;
  let sql = `SELECT icd10_code as code, description, category FROM icd10`;
  const params = [];
  if (search) {
    sql += ` WHERE icd10_code LIKE ? OR description LIKE ? OR category LIKE ?`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get(
  '/api/treatments/:diagnosisCode',
  [param('diagnosisCode').isString().trim().isLength({ min: 1, max: 20 })],
  handleValidation,
  (req, res) => {
  const { diagnosisCode } = req.params;
  const sql = `SELECT * FROM treatments WHERE icd10_code = ?`;
  db.all(sql, [diagnosisCode], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get(
  '/api/export/:diagnosisCode',
  [
    param('diagnosisCode').isString().trim().isLength({ min: 1, max: 20 }),
    query('format').optional().isIn(['json', 'csv'])
  ],
  handleValidation,
  (req, res) => {
  const { diagnosisCode } = req.params;
  const { format } = req.query;
  
  const diagnosisSql = `SELECT icd10_code as code, description, category FROM icd10 WHERE icd10_code = ?`;
  db.get(diagnosisSql, [diagnosisCode], (err, diagnosis) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!diagnosis) {
      res.status(404).json({ error: 'Diagnosis not found' });
      return;
    }

    const treatmentsSql = `SELECT * FROM treatments WHERE icd10_code = ?`;
    db.all(treatmentsSql, [diagnosisCode], (err, treatments) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const exportData = {
        diagnosis,
        treatments: treatments,
        exportedAt: new Date().toISOString()
      };
      
      if (format === 'csv') {
        // Simple CSV format
        let csv = 'Diagnosis Code,Description,Category,Medication,Dosage,Duration,Priority,Insurance Covered,Requires Specialist,Evidence Level\n';
        
        treatments.forEach(treatment => {
          csv += `${diagnosis.code},"${diagnosis.description}",${diagnosis.category},"${treatment.medication}","${treatment.dosage}","${treatment.duration}",${treatment.priority},${treatment.insuranceCovered},${treatment.requiresSpecialist},${treatment.evidenceLevel}\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${diagnosisCode}_treatments.csv"`);
        res.send(csv);
      } else {
        // JSON format
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${diagnosisCode}_treatments.json"`);
        res.json(exportData);
      }
    });
  });
}
)

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the PharmAssist Pro API!' });
});
