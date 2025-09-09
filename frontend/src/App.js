import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, User, Pill, Stethoscope, ShieldCheck, Star, ChevronRight, FileText, BarChart3 } from 'lucide-react';

const PharmacistSaaSApp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [filters, setFilters] = useState({
    priority: 'all',
    insurance: 'all',
    specialist: 'all'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  // Mock ICD-10 Data
  const mockICD10Data = [
    {
      code: 'E11.9',
      shortTitle: 'Type 2 diabetes mellitus without complications',
      longTitle: 'Type 2 diabetes mellitus without complications - Non-insulin-dependent diabetes mellitus (NIDDM)',
      chapter: 'E00-E89 - Endocrine, nutritional and metabolic diseases',
      block: 'E10-E14 - Diabetes mellitus',
      category: 'E11 - Type 2 diabetes mellitus'
    },
    {
      code: 'I10',
      shortTitle: 'Essential hypertension',
      longTitle: 'Essential (primary) hypertension - High blood pressure without known cause',
      chapter: 'I00-I99 - Diseases of the circulatory system',
      block: 'I10-I16 - Hypertensive diseases',
      category: 'I10 - Essential hypertension'
    },
    {
      code: 'J44.1',
      shortTitle: 'COPD with acute exacerbation',
      longTitle: 'Chronic obstructive pulmonary disease with acute exacerbation',
      chapter: 'J00-J99 - Diseases of the respiratory system',
      block: 'J40-J47 - Chronic lower respiratory diseases',
      category: 'J44 - Other chronic obstructive pulmonary disease'
    },
    {
      code: 'F32.9',
      shortTitle: 'Major depressive disorder, single episode',
      longTitle: 'Major depressive disorder, single episode, unspecified',
      chapter: 'F01-F99 - Mental and behavioural disorders',
      block: 'F30-F39 - Mood [affective] disorders',
      category: 'F32 - Depressive episode'
    },
    {
      code: 'M79.3',
      shortTitle: 'Panniculitis, unspecified',
      longTitle: 'Panniculitis, unspecified - Inflammation of subcutaneous fat tissue',
      chapter: 'M00-M99 - Diseases of the musculoskeletal system',
      block: 'M70-M79 - Other soft tissue disorders',
      category: 'M79 - Other and unspecified soft tissue disorders'
    },
    {
      code: 'K21.0',
      shortTitle: 'Gastro-esophageal reflux disease with esophagitis',
      longTitle: 'Gastro-esophageal reflux disease with esophagitis - GERD with inflammation',
      chapter: 'K00-K95 - Diseases of the digestive system',
      block: 'K20-K31 - Diseases of esophagus, stomach and duodenum',
      category: 'K21 - Gastro-esophageal reflux disease'
    },
    {
      code: 'N18.6',
      shortTitle: 'End stage renal disease',
      longTitle: 'End stage renal disease - Chronic kidney disease requiring dialysis',
      chapter: 'N00-N99 - Diseases of the genitourinary system',
      block: 'N17-N19 - Acute kidney failure and chronic kidney disease',
      category: 'N18 - Chronic kidney disease'
    },
    {
      code: 'G43.909',
      shortTitle: 'Migraine, unspecified, not intractable, without status migrainosus',
      longTitle: 'Migraine, unspecified, not intractable, without status migrainosus',
      chapter: 'G00-G99 - Diseases of the nervous system',
      block: 'G43-G44 - Episodic and paroxysmal disorders',
      category: 'G43 - Migraine'
    }
  ];

  // Mock Treatment Data
  const mockTreatmentData = {
    'E11.9': [
      {
        id: 1,
        brandName: 'Metformin XR',
        genericName: 'Metformin',
        activeIngredient: 'Metformin hydrochloride',
        dosage: '500mg twice daily',
        priority: 'first_line',
        insuranceStatus: 'covered',
        specialist: 'Endocrinologist',
        evidenceLevel: 'A',
        sideEffects: 'Nausea, diarrhea, metallic taste',
        price: '$15-25/month'
      },
      {
        id: 2,
        brandName: 'Januvia',
        genericName: 'Sitagliptin',
        activeIngredient: 'Sitagliptin phosphate',
        dosage: '100mg once daily',
        priority: 'second_line',
        insuranceStatus: 'partial',
        specialist: 'Endocrinologist',
        evidenceLevel: 'A',
        sideEffects: 'Upper respiratory infection, headache',
        price: '$450-500/month'
      },
      {
        id: 3,
        brandName: 'Lantus',
        genericName: 'Insulin glargine',
        activeIngredient: 'Insulin glargine',
        dosage: '10-20 units subcutaneous',
        priority: 'alternative',
        insuranceStatus: 'covered',
        specialist: 'Endocrinologist',
        evidenceLevel: 'A',
        sideEffects: 'Hypoglycemia, injection site reactions',
        price: '$300-400/month'
      }
    ],
    'I10': [
      {
        id: 4,
        brandName: 'Lisinopril',
        genericName: 'Lisinopril',
        activeIngredient: 'Lisinopril',
        dosage: '10mg once daily',
        priority: 'first_line',
        insuranceStatus: 'covered',
        specialist: 'Cardiologist',
        evidenceLevel: 'A',
        sideEffects: 'Dry cough, hyperkalemia',
        price: '$10-15/month'
      },
      {
        id: 5,
        brandName: 'Norvasc',
        genericName: 'Amlodipine',
        activeIngredient: 'Amlodipine besylate',
        dosage: '5mg once daily',
        priority: 'first_line',
        insuranceStatus: 'covered',
        specialist: 'Cardiologist',
        evidenceLevel: 'A',
        sideEffects: 'Ankle edema, flushing',
        price: '$8-12/month'
      }
    ],
    'J44.1': [
      {
        id: 6,
        brandName: 'Symbicort',
        genericName: 'Budesonide/Formoterol',
        activeIngredient: 'Budesonide + Formoterol fumarate',
        dosage: '2 puffs twice daily',
        priority: 'first_line',
        insuranceStatus: 'covered',
        specialist: 'Pulmonologist',
        evidenceLevel: 'A',
        sideEffects: 'Oral thrush, hoarseness',
        price: '$350-400/month'
      }
    ],
    'F32.9': [
      {
        id: 7,
        brandName: 'Zoloft',
        genericName: 'Sertraline',
        activeIngredient: 'Sertraline hydrochloride',
        dosage: '50mg once daily',
        priority: 'first_line',
        insuranceStatus: 'covered',
        specialist: 'Psychiatrist',
        evidenceLevel: 'A',
        sideEffects: 'Nausea, sexual dysfunction',
        price: '$25-35/month'
      }
    ],
    'K21.0': [
      {
        id: 8,
        brandName: 'Nexium',
        genericName: 'Esomeprazole',
        activeIngredient: 'Esomeprazole magnesium',
        dosage: '20mg once daily',
        priority: 'first_line',
        insuranceStatus: 'covered',
        specialist: 'Gastroenterologist',
        evidenceLevel: 'A',
        sideEffects: 'Headache, nausea, diarrhea',
        price: '$200-250/month'
      }
    ],
    'G43.909': [
      {
        id: 9,
        brandName: 'Sumatriptan',
        genericName: 'Sumatriptan',
        activeIngredient: 'Sumatriptan succinate',
        dosage: '50mg as needed',
        priority: 'first_line',
        insuranceStatus: 'covered',
        specialist: 'Neurologist',
        evidenceLevel: 'A',
        sideEffects: 'Chest tightness, dizziness',
        price: '$80-120/month'
      }
    ]
  };

  // Search functionality
  const handleSearch = (query) => {
    setSearchTerm(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const results = mockICD10Data.filter(item => 
        item.shortTitle.toLowerCase().includes(query.toLowerCase()) ||
        item.longTitle.toLowerCase().includes(query.toLowerCase()) ||
        item.code.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setLoading(false);
    }, 300);
  };

  const selectDiagnosis = (diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setTreatments(mockTreatmentData[diagnosis.code] || []);
    setActiveTab('treatments');
  };

  // Filter treatments
  const filteredTreatments = useMemo(() => {
    return treatments.filter(treatment => {
      if (filters.priority !== 'all' && treatment.priority !== filters.priority) return false;
      if (filters.insurance !== 'all' && treatment.insuranceStatus !== filters.insurance) return false;
      if (filters.specialist !== 'all' && !treatment.specialist.toLowerCase().includes(filters.specialist.toLowerCase())) return false;
      return true;
    });
  }, [treatments, filters]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'first_line': return 'bg-green-100 text-green-800';
      case 'second_line': return 'bg-yellow-100 text-yellow-800';
      case 'alternative': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsuranceColor = (status) => {
    switch (status) {
      case 'covered': return 'text-green-600';
      case 'partial': return 'text-yellow-600';
      case 'not_covered': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const exportData = (format) => {
    const data = {
      diagnosis: selectedDiagnosis,
      treatments: filteredTreatments,
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `treatment_plan_${selectedDiagnosis?.code}.json`;
      a.click();
    } else if (format === 'csv') {
      const csvContent = [
        ['Brand Name', 'Generic Name', 'Dosage', 'Priority', 'Insurance', 'Specialist', 'Price'],
        ...filteredTreatments.map(t => [
          t.brandName, t.genericName, t.dosage, t.priority, t.insuranceStatus, t.specialist, t.price
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `treatment_plan_${selectedDiagnosis?.code}.csv`;
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PharmAssist Pro</h1>
                <p className="text-sm text-gray-600">ICD-10 to Treatment Mapping System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">Dr. Ahmed Hassan</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Search className="h-4 w-4 inline mr-2" />
              Diagnosis Search
            </button>
            <button
              onClick={() => setActiveTab('treatments')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'treatments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              disabled={!selectedDiagnosis}
            >
              <Pill className="h-4 w-4 inline mr-2" />
              Treatment Plan
              {treatments.length > 0 && (
                <span className="ml-1 bg-blue-100 text-blue-800 py-1 px-2 rounded-full text-xs">
                  {treatments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Analytics
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Search ICD-10 Diagnosis</h2>
              
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by code, diagnosis, or symptoms..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
              </div>

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Searching...</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-medium text-gray-900">Search Results:</h3>
                  {searchResults.map((result) => (
                    <div
                      key={result.code}
                      onClick={() => selectDiagnosis(result)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="bg-blue-100 text-blue-800 text-sm font-mono px-3 py-1 rounded">
                              {result.code}
                            </span>
                            <h4 className="font-medium text-gray-900">{result.shortTitle}</h4>
                          </div>
                          <p className="text-gray-600 mt-1 text-sm">{result.longTitle}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            <span>{result.chapter}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchTerm.length > 2 && searchResults.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No results found for "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Treatments Tab */}
        {activeTab === 'treatments' && selectedDiagnosis && (
          <div className="space-y-6">
            {/* Selected Diagnosis Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Selected Diagnosis</h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="bg-blue-100 text-blue-800 font-mono px-3 py-1 rounded">
                      {selectedDiagnosis.code}
                    </span>
                    <span className="font-medium">{selectedDiagnosis.shortTitle}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{selectedDiagnosis.longTitle}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => exportData('json')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export JSON</span>
                  </button>
                  <button
                    onClick={() => exportData('csv')}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">
                <Filter className="h-5 w-5 inline mr-2" />
                Filter Treatments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="first_line">First Line</option>
                    <option value="second_line">Second Line</option>
                    <option value="alternative">Alternative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance</label>
                  <select
                    value={filters.insurance}
                    onChange={(e) => setFilters({...filters, insurance: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Coverage</option>
                    <option value="covered">Covered</option>
                    <option value="partial">Partial Coverage</option>
                    <option value="not_covered">Not Covered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialist</label>
                  <input
                    type="text"
                    placeholder="Filter by specialist"
                    value={filters.specialist}
                    onChange={(e) => setFilters({...filters, specialist: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Treatment List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">
                Recommended Treatments ({filteredTreatments.length})
              </h3>
              {filteredTreatments.map((treatment, index) => (
                <div key={treatment.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Pill className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{treatment.brandName}</h4>
                        <p className="text-gray-600">Generic: {treatment.genericName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(treatment.priority)}`}>
                        {treatment.priority.replace('_', ' ')}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              treatment.evidenceLevel === 'A' && i < 5 ? 'text-yellow-400 fill-current' :
                              treatment.evidenceLevel === 'B' && i < 4 ? 'text-yellow-400 fill-current' :
                              treatment.evidenceLevel === 'C' && i < 3 ? 'text-yellow-400 fill-current' :
                              'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Dosage</p>
                      <p className="text-sm text-gray-900">{treatment.dosage}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Insurance</p>
                      <p className={`text-sm font-medium ${getInsuranceColor(treatment.insuranceStatus)}`}>
                        <ShieldCheck className="h-4 w-4 inline mr-1" />
                        {treatment.insuranceStatus.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Specialist</p>
                      <p className="text-sm text-gray-900">{treatment.specialist}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Price Range</p>
                      <p className="text-sm text-gray-900">{treatment.price}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Side Effects</p>
                    <p className="text-sm text-gray-900">{treatment.sideEffects}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">Total Diagnoses</h3>
                <p className="text-2xl font-bold text-blue-600">{mockICD10Data.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900">Available Treatments</h3>
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(mockTreatmentData).flat().length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900">Coverage Rate</h3>
                <p className="text-2xl font-bold text-purple-600">95%</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PharmacistSaaSApp;