import React, { useState, useMemo } from 'react';
import { Edit2, Save, X, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'flagship-yearly-overrides';

const YearByYearEditor = ({ financialData, parameters, onParameterChange, currentScenario }) => {
  const [editingYear, setEditingYear] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [expandedYears, setExpandedYears] = useState({ 1: true, 2: true, 3: true });

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  const formatCurrencyFull = (value) => {
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

  const projection = financialData?.projection || [];
  const yearData = projection.slice(0, 11); // Years 0-10

  const hasOverrides = useMemo(() => {
    const overrides = parameters.yearlyOverrides || {};
    return Object.keys(overrides).length > 0;
  }, [parameters.yearlyOverrides]);

  const toggleYear = (year) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const startEditing = (year, data) => {
    setEditValues({
      students: data.students,
      tuition: data.pricing.tuition,
      kitCost: data.pricing.kitCost,
      technology: data.costs.technology,
      staffCosts: data.costs.staff,
      marketing: data.costs.marketing,
      facilities: data.costs.facilities,
      capex: data.capex,
    });
    setEditingYear(year);
  };

  const cancelEditing = () => {
    setEditingYear(null);
    setEditValues({});
  };

  const saveEditing = () => {
    const newOverrides = {
      ...parameters.yearlyOverrides,
      [editingYear]: { ...editValues },
    };
    onParameterChange({ yearlyOverrides: newOverrides });
    setEditingYear(null);
    setEditValues({});

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOverrides));
    } catch (e) {
      console.error('Error saving overrides:', e);
    }
  };

  const clearYearOverride = (year) => {
    const newOverrides = { ...parameters.yearlyOverrides };
    delete newOverrides[year];
    onParameterChange({ yearlyOverrides: newOverrides });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOverrides));
    } catch (e) {
      console.error('Error saving overrides:', e);
    }
  };

  const clearAllOverrides = () => {
    if (window.confirm('Reset all year-by-year overrides? This cannot be undone.')) {
      onParameterChange({ yearlyOverrides: {} });
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleInputChange = (field, value) => {
    setEditValues(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const YearRow = ({ year, data }) => {
    const isExpanded = expandedYears[year];
    const isEditing = editingYear === year;
    const hasYearOverride = parameters.yearlyOverrides?.[year];

    return (
      <div className={`border rounded-lg ${hasYearOverride ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`}>
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => !isEditing && toggleYear(year)}
        >
          <div className="flex items-center space-x-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">
                  Year {year} ({data.calendarYear})
                </span>
                {hasYearOverride && (
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                    Modified
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {data.students.toLocaleString()} students | Revenue: {formatCurrency(data.revenue.total)} | EBITDA: {formatCurrency(data.ebitda)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            {hasYearOverride && !isEditing && (
              <button
                onClick={() => clearYearOverride(year)}
                className="p-1.5 text-amber-600 hover:bg-amber-100 rounded"
                title="Clear year overrides"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            {isEditing ? (
              <>
                <button
                  onClick={saveEditing}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                  title="Save changes"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelEditing}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => startEditing(year, data)}
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                title="Edit year values"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {/* Students */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase">Students</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editValues.students}
                    onChange={(e) => handleInputChange('students', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500"
                  />
                ) : (
                  <div className="text-lg font-semibold text-gray-900">
                    {data.students.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Tuition */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase">Monthly Tuition</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editValues.tuition}
                    onChange={(e) => handleInputChange('tuition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500"
                  />
                ) : (
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrencyFull(data.pricing.tuition)}
                  </div>
                )}
              </div>

              {/* Revenue */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase">Total Revenue</label>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(data.revenue.total)}
                </div>
                <div className="text-xs text-gray-500">
                  Tuition: {formatCurrency(data.revenue.tuition)} | Kits: {formatCurrency(data.revenue.kits)}
                </div>
              </div>

              {/* EBITDA */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase">EBITDA</label>
                <div className={`text-lg font-semibold ${data.ebitda >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(data.ebitda)}
                </div>
                <div className="text-xs text-gray-500">
                  Margin: {formatPercentage(data.ebitdaMargin)}
                </div>
              </div>
            </div>

            {/* Costs Section */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Costs Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Technology</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.technology}
                      onChange={(e) => handleInputChange('technology', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                    />
                  ) : (
                    <div className="font-medium text-gray-900">{formatCurrency(data.costs.technology)}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Staff</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.staffCosts}
                      onChange={(e) => handleInputChange('staffCosts', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                    />
                  ) : (
                    <div className="font-medium text-gray-900">{formatCurrency(data.costs.staff)}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Facilities</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.facilities}
                      onChange={(e) => handleInputChange('facilities', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                    />
                  ) : (
                    <div className="font-medium text-gray-900">{formatCurrency(data.costs.facilities)}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Marketing</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.marketing}
                      onChange={(e) => handleInputChange('marketing', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                    />
                  ) : (
                    <div className="font-medium text-gray-900">{formatCurrency(data.costs.marketing)}</div>
                  )}
                </div>
              </div>
            </div>

            {/* CAPEX Section */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">CAPEX</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.capex}
                      onChange={(e) => handleInputChange('capex', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                    />
                  ) : (
                    <div className="font-medium text-orange-600">{formatCurrency(data.capex)}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Total Costs</label>
                  <div className="font-medium text-red-600">{formatCurrency(data.costs.total)}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Net Income</label>
                  <div className={`font-medium ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(data.netIncome)}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Free Cash Flow</label>
                  <div className={`font-medium ${data.freeCashFlow >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    {formatCurrency(data.freeCashFlow)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Year-by-Year Financial Editor</h2>
            <p className="text-sm text-gray-600 mt-1">
              Click on any year to expand and edit individual values. Changes persist across sessions.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Scenario: <span className="font-medium capitalize">{currentScenario}</span>
            </p>
          </div>
          {hasOverrides && (
            <button
              onClick={clearAllOverrides}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Overrides</span>
            </button>
          )}
        </div>

        {hasOverrides && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <strong>Note:</strong> Some years have custom overrides applied. These are indicated with the "Modified" badge.
          </div>
        )}
      </div>

      {/* Year 0 (Pre-Launch) */}
      <div className="border border-gray-300 rounded-lg bg-gray-50">
        <div className="px-4 py-3">
          <div className="font-semibold text-gray-700">Year 0 (2026) - Pre-Launch</div>
          <div className="text-sm text-gray-500 mt-1">
            Initial CAPEX: {formatCurrency(yearData[0]?.capex || 0)} | No students or revenue
          </div>
        </div>
      </div>

      {/* Years 1-10 */}
      <div className="space-y-3">
        {yearData.slice(1, 11).map((data) => (
          <YearRow key={data.year} year={data.year} data={data} />
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">10-Year Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600">Cumulative Revenue</div>
            <div className="text-xl font-bold text-green-700">
              {formatCurrency(yearData.slice(1).reduce((sum, y) => sum + y.revenue.total, 0))}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600">Cumulative EBITDA</div>
            <div className="text-xl font-bold text-blue-700">
              {formatCurrency(financialData.summary.cumulativeEbitda)}
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm text-orange-600">Total CAPEX</div>
            <div className="text-xl font-bold text-orange-700">
              {formatCurrency(financialData.summary.totalCapex)}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600">Cumulative FCF</div>
            <div className="text-xl font-bold text-purple-700">
              {formatCurrency(financialData.summary.cumulativeFcf)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearByYearEditor;
