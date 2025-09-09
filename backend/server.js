const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// Mock data - In production, this would come from a database
const diagnoses = [
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine' },
  { code: 'I10', description: 'Essential hypertension', category: 'Cardiovascular' },
  { code: 'J44.1', description: 'Chronic obstructive pulmonary disease with acute exacerbation', category: 'Respiratory' },
  { code: 'M79.3', description: 'Panniculitis, unspecified', category: 'Musculoskeletal' },
  { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified', category: 'Mental Health' },
  { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis', category: 'Digestive' },
  { code: 'N18.6', description: 'End stage renal disease', category: 'Genitourinary' },
  { code: 'Z51.11', description: 'Encounter for antineoplastic chemotherapy', category: 'Factors' }
];

const treatments = {
  'E11.9': [
    {
      id: 1,
      medication: 'Metformin',
      dosage: '500mg twice daily',
      duration: 'Long-term',
      priority: 'high',
      insuranceCovered: true,
      requiresSpecialist: false,
      evidenceLevel: 'A',
      sideEffects: 'GI upset, lactic acidosis (rare)',
      contraindications: 'Severe kidney disease, metabolic acidosis'
    },
    {
      id: 2,
      medication: 'Insulin glargine',
      dosage: '10-20 units at bedtime',
      duration: 'Long-term',
      priority: 'medium',
      insuranceCovered: true,
      requiresSpecialist: true,
      evidenceLevel: 'A',
      sideEffects: 'Hypoglycemia, weight gain',
      contraindications: 'Hypoglycemia'
    }
  ],
  'I10': [
    {
      id: 3,
      medication: 'Lisinopril',
      dosage: '10mg once daily',
      duration: 'Long-term',
      priority: 'high',
      insuranceCovered: true,
      requiresSpecialist: false,
      evidenceLevel: 'A',
      sideEffects: 'Dry cough, hyperkalemia',
      contraindications: 'Pregnancy, angioedema history'
    },
    {
      id: 4,
      medication: 'Amlodipine',
      dosage: '5mg once daily',
      duration: 'Long-term',
      priority: 'medium',
      insuranceCovered: true,
      requiresSpecialist: false,
      evidenceLevel: 'A',
      sideEffects: 'Peripheral edema, flushing',
      contraindications: 'Severe aortic stenosis'
    }
  ]
};

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/diagnoses', (req, res) => {
  const { search } = req.query;
  let filteredDiagnoses = diagnoses;
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredDiagnoses = diagnoses.filter(diagnosis => 
      diagnosis.code.toLowerCase().includes(searchLower) ||
      diagnosis.description.toLowerCase().includes(searchLower) ||
      diagnosis.category.toLowerCase().includes(searchLower)
    );
  }
  
  res.json(filteredDiagnoses);
});

app.get('/api/treatments/:diagnosisCode', (req, res) => {
  const { diagnosisCode } = req.params;
  const diagnosisTreatments = treatments[diagnosisCode] || [];
  
  res.json(diagnosisTreatments);
});

app.get('/api/export/:diagnosisCode', (req, res) => {
  const { diagnosisCode } = req.params;
  const { format } = req.query;
  
  const diagnosis = diagnoses.find(d => d.code === diagnosisCode);
  const diagnosisTreatments = treatments[diagnosisCode] || [];
  
  if (!diagnosis) {
    return res.status(404).json({ error: 'Diagnosis not found' });
  }
  
  const exportData = {
    diagnosis,
    treatments: diagnosisTreatments,
    exportedAt: new Date().toISOString()
  };
  
  if (format === 'csv') {
    // Simple CSV format
    let csv = 'Diagnosis Code,Description,Category,Medication,Dosage,Duration,Priority,Insurance Covered,Requires Specialist,Evidence Level\n';
    
    diagnosisTreatments.forEach(treatment => {
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;