-- Drug Database Schema
-- Create drugs table with comprehensive drug information

CREATE TABLE IF NOT EXISTS drugs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drug_name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    category TEXT NOT NULL,
    strength TEXT NOT NULL,
    dosage_form TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    ndc TEXT UNIQUE,
    price REAL,
    indications TEXT,
    contraindications TEXT,
    side_effects TEXT,
    interactions TEXT,
    pregnancy_category TEXT,
    breastfeeding_safe BOOLEAN,
    controlled_substance BOOLEAN,
    requires_prescription BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create drug categories table for better organization
CREATE TABLE IF NOT EXISTS drug_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create manufacturers table
CREATE TABLE IF NOT EXISTS manufacturers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    country TEXT,
    website TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create drug interactions table
CREATE TABLE IF NOT EXISTS drug_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drug_id INTEGER,
    interacting_drug_id INTEGER,
    interaction_type TEXT,
    severity TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (drug_id) REFERENCES drugs(id),
    FOREIGN KEY (interacting_drug_id) REFERENCES drugs(id)
);

-- Create drug side effects table
CREATE TABLE IF NOT EXISTS drug_side_effects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drug_id INTEGER,
    side_effect TEXT,
    frequency TEXT,
    severity TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (drug_id) REFERENCES drugs(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drugs_name ON drugs(drug_name);
CREATE INDEX IF NOT EXISTS idx_drugs_generic ON drugs(generic_name);
CREATE INDEX IF NOT EXISTS idx_drugs_category ON drugs(category);
CREATE INDEX IF NOT EXISTS idx_drugs_ndc ON drugs(ndc);
CREATE INDEX IF NOT EXISTS idx_drugs_manufacturer ON drugs(manufacturer); 