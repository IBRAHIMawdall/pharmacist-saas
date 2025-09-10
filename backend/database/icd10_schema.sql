-- Create chapters table (main categories)
CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    start_code TEXT,
    end_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table (subcategories within chapters)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    chapter_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

-- Create subcategories table (more specific groupings)
CREATE TABLE IF NOT EXISTS subcategories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Create codes table (individual ICD-10 codes)
CREATE TABLE IF NOT EXISTS codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    subcategory_id INTEGER NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT,
    is_billable BOOLEAN DEFAULT 0,
    is_header BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
);

-- Create drugs table
CREATE TABLE IF NOT EXISTS drugs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    generic_name TEXT,
    brand_name TEXT,
    drug_class TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create drug_codes table (mapping drugs to ICD-10 codes)
CREATE TABLE IF NOT EXISTS drug_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drug_id INTEGER NOT NULL,
    code_id INTEGER NOT NULL,
    is_primary_code BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (drug_id) REFERENCES drugs(id),
    FOREIGN KEY (code_id) REFERENCES codes(id)
);

-- Create insurance table
CREATE TABLE IF NOT EXISTS insurances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create insurance_requirements table
CREATE TABLE IF NOT EXISTS insurance_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    insurance_id INTEGER NOT NULL,
    code_id INTEGER NOT NULL,
    is_approved BOOLEAN DEFAULT 0,
    approval_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (insurance_id) REFERENCES insurances(id),
    FOREIGN KEY (code_id) REFERENCES codes(id)
);

-- Create code relationships table (for related codes)
CREATE TABLE IF NOT EXISTS code_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_id INTEGER NOT NULL,
    related_code_id INTEGER NOT NULL,
    relationship_type TEXT NOT NULL, -- e.g., 'includes', 'excludes', 'see also'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (code_id) REFERENCES codes(id),
    FOREIGN KEY (related_code_id) REFERENCES codes(id)
);

-- Create code notes table (for additional information)
CREATE TABLE IF NOT EXISTS code_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_id INTEGER NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (code_id) REFERENCES codes(id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_codes_code ON codes(code);
CREATE INDEX idx_codes_billable ON codes(is_billable);
CREATE INDEX idx_codes_header ON codes(is_header);
CREATE INDEX idx_chapters_code ON chapters(code);
CREATE INDEX idx_drugs_name ON drugs(name);
CREATE INDEX idx_insurance_requirements_code ON insurance_requirements(code_id);

-- Triggers
CREATE TRIGGER IF NOT EXISTS set_billable_flag
AFTER INSERT ON codes
BEGIN
    UPDATE codes
    SET is_billable = CASE 
        WHEN NEW.code LIKE '%.%' THEN 1
        ELSE 0
    END
    WHERE id = NEW.id;
END;

-- Example drug-to-code search view
CREATE VIEW drug_code_search AS
SELECT 
    d.id as drug_id,
    d.name as drug_name,
    c.code as icd_code,
    c.short_description,
    c.long_description,
    i.name as insurance_name,
    ir.is_approved,
    ir.approval_notes
FROM drugs d
JOIN drug_codes dc ON d.id = dc.drug_id
JOIN codes c ON dc.code_id = c.id
LEFT JOIN insurance_requirements ir ON c.id = ir.code_id
LEFT JOIN insurances i ON ir.insurance_id = i.id;
