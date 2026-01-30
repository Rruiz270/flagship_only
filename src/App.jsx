import React, { useState, useMemo, useEffect } from 'react';
import { School, Calendar, Settings, BarChart3, RotateCcw, TrendingUp } from 'lucide-react';
import { FlagshipFinancialModel, DEFAULT_PARAMETERS, SCENARIO_PRESETS } from './utils/financialModel';
import Dashboard from './components/Dashboard';
import ParameterEditor from './components/ParameterEditor';
import YearByYearEditor from './components/YearByYearEditor';
import ExportButton from './components/ExportButton';
import './index.css';

// localStorage key for saving parameters
const PARAMS_STORAGE_KEY = 'flagship-financial-params';
const SCENARIO_STORAGE_KEY = 'flagship-current-scenario';

function App() {
  // Load saved parameters from localStorage
  const [parameters, setParameters] = useState(() => {
    try {
      const saved = localStorage.getItem(PARAMS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PARAMETERS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading saved parameters:', e);
    }
    return DEFAULT_PARAMETERS;
  });

  const [currentScenario, setCurrentScenario] = useState(() => {
    try {
      return localStorage.getItem(SCENARIO_STORAGE_KEY) || 'realistic';
    } catch (e) {
      return 'realistic';
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  // Create financial model and calculate projections
  const model = useMemo(() => new FlagshipFinancialModel(parameters), [parameters]);
  const financialData = useMemo(() => model.getFinancialSummary(), [model]);

  // Save parameters to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(PARAMS_STORAGE_KEY, JSON.stringify(parameters));
    } catch (e) {
      console.error('Error saving parameters:', e);
    }
  }, [parameters]);

  // Save scenario to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SCENARIO_STORAGE_KEY, currentScenario);
    } catch (e) {
      console.error('Error saving scenario:', e);
    }
  }, [currentScenario]);

  const handleParameterChange = (newParams) => {
    setParameters(prev => ({ ...prev, ...newParams }));
  };

  const handleScenarioChange = (scenarioKey, scenarioParams) => {
    setCurrentScenario(scenarioKey);
    setParameters({ ...scenarioParams, yearlyOverrides: parameters.yearlyOverrides || {} });
  };

  const resetToDefaults = () => {
    if (window.confirm('Reset all parameters to default values? This cannot be undone.')) {
      setParameters(DEFAULT_PARAMETERS);
      setCurrentScenario('realistic');
      localStorage.removeItem(PARAMS_STORAGE_KEY);
      localStorage.removeItem(SCENARIO_STORAGE_KEY);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'yearly', name: 'Year-by-Year', icon: <Calendar className="w-5 h-5" /> },
    { id: 'parameters', name: 'Parameters', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <School className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Flagship School</h1>
                  <p className="text-sm text-gray-600">10-Year Financial Model</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6 text-sm">
                <div className="text-center px-4 py-2 bg-gray-100 rounded-lg">
                  <div className="font-semibold text-gray-700 text-xs">Scenario</div>
                  <div className="text-primary-600 font-bold capitalize">{currentScenario}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{formatCurrency(financialData.summary.year10Revenue)}</div>
                  <div className="text-gray-600">Y10 Revenue</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{formatPercentage(financialData.summary.irr)}</div>
                  <div className="text-gray-600">IRR</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">{financialData.summary.year10Students.toLocaleString()}</div>
                  <div className="text-gray-600">Students</div>
                </div>
              </div>

              {/* Export Button */}
              <ExportButton
                financialData={financialData}
                currentScenario={currentScenario}
              />

              {/* Reset Button */}
              <button
                onClick={resetToDefaults}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                title="Reset all to default values"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset All</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Dashboard
                financialData={financialData}
                onScenarioChange={handleScenarioChange}
                currentScenario={currentScenario}
              />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <ParameterEditor
                  parameters={parameters}
                  onParameterChange={handleParameterChange}
                  onReset={resetToDefaults}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'yearly' && (
          <YearByYearEditor
            financialData={financialData}
            parameters={parameters}
            onParameterChange={handleParameterChange}
            currentScenario={currentScenario}
          />
        )}

        {activeTab === 'parameters' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ParameterEditor
                parameters={parameters}
                onParameterChange={handleParameterChange}
                onReset={resetToDefaults}
              />
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Results</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Year 10 Revenue</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(financialData.summary.year10Revenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Year 10 EBITDA</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(financialData.summary.year10Ebitda)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">IRR</span>
                  <span className="font-semibold text-purple-600">
                    {formatPercentage(financialData.summary.irr)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">NPV</span>
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(financialData.summary.npv)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Students (Y10)</span>
                  <span className="font-semibold text-gray-900">
                    {financialData.summary.year10Students.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Payback Period</span>
                  <span className="font-semibold text-gray-900">
                    {financialData.summary.paybackPeriod} years
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Investment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Investment</span>
                    <span className="font-medium">{formatCurrency(financialData.summary.totalInvestment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">10-Year EBITDA</span>
                    <span className="font-medium text-green-600">{formatCurrency(financialData.summary.cumulativeEbitda)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">10-Year FCF</span>
                    <span className="font-medium text-blue-600">{formatCurrency(financialData.summary.cumulativeFcf)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Funding Structure</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bridge Loan</span>
                    <span className="font-medium">{formatCurrency(financialData.summary.fundingStructure.bridgeLoan)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Desenvolve SP</span>
                    <span className="font-medium">{formatCurrency(financialData.summary.fundingStructure.desenvolveSP)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prefeitura Subsidy</span>
                    <span className="font-medium">{formatCurrency(financialData.summary.fundingStructure.prefeituraSubsidy)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-700">Total Funding</span>
                    <span className="font-bold text-primary-600">{formatCurrency(financialData.summary.fundingStructure.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Flagship School - 10 Year Financial Model &copy; 2024</p>
              <p>Standalone business plan for the premium AI-powered school</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Real-time calculations</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
