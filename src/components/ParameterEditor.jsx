import React, { useState } from 'react';
import { Edit2, Save, X, RotateCcw, DollarSign, Users, Building, Percent, Calendar } from 'lucide-react';

const PARAMETER_DEFINITIONS = {
  students: {
    title: 'Student Capacity',
    icon: Users,
    color: 'purple',
    fields: [
      { key: 'maxStudents', label: 'Maximum Capacity', type: 'number', unit: 'students' },
      { key: 'studentsYear1', label: 'Year 1 Students', type: 'number', unit: 'students' },
      { key: 'studentsYear2', label: 'Year 2 Students', type: 'number', unit: 'students' },
      { key: 'studentsYear3Plus', label: 'Year 3+ Students', type: 'number', unit: 'students' },
      { key: 'churnRate', label: 'Annual Churn Rate', type: 'percent', unit: '%' },
    ]
  },
  pricing: {
    title: 'Pricing',
    icon: DollarSign,
    color: 'green',
    fields: [
      { key: 'tuitionMonthly', label: 'Monthly Tuition', type: 'currency', unit: 'R$/month' },
      { key: 'tuitionIncreaseRate', label: 'Annual Increase', type: 'percent', unit: '%' },
      { key: 'kitCostPerStudent', label: 'Kit Cost per Student', type: 'currency', unit: 'R$/year' },
    ]
  },
  technology: {
    title: 'Technology Costs',
    icon: Building,
    color: 'blue',
    fields: [
      { key: 'technologyYear1', label: 'Year 1 Technology', type: 'currency', unit: 'R$' },
      { key: 'technologyYearsAfter', label: 'Years 2-10 (annual)', type: 'currency', unit: 'R$/year' },
    ]
  },
  capex: {
    title: 'CAPEX & Investment',
    icon: Building,
    color: 'red',
    fields: [
      { key: 'initialCapex', label: 'Initial CAPEX (Year 0)', type: 'currency', unit: 'R$' },
      { key: 'year1Capex', label: 'Year 1 CAPEX', type: 'currency', unit: 'R$' },
      { key: 'bridgeLoan', label: 'Bridge Loan', type: 'currency', unit: 'R$' },
      { key: 'desenvolveSP', label: 'Desenvolve SP Loan', type: 'currency', unit: 'R$' },
      { key: 'prefeituraSubsidy', label: 'Prefeitura Subsidy', type: 'currency', unit: 'R$' },
    ]
  },
  operations: {
    title: 'Operating Costs',
    icon: Percent,
    color: 'orange',
    fields: [
      { key: 'baseFacilityCost', label: 'Annual Facility Cost', type: 'currency', unit: 'R$/year' },
      { key: 'facilityInflationRate', label: 'Facility Inflation', type: 'percent', unit: '%' },
      { key: 'staffCostPerStudent', label: 'Staff Cost per Student', type: 'currency', unit: 'R$/year' },
      { key: 'minStaffCost', label: 'Minimum Staff Cost', type: 'currency', unit: 'R$/year' },
      { key: 'corporateOverhead', label: 'Corporate Overhead', type: 'currency', unit: 'R$/year' },
      { key: 'marketingRate', label: 'Marketing (% Revenue)', type: 'percent', unit: '%' },
      { key: 'badDebtRate', label: 'Bad Debt Rate', type: 'percent', unit: '%' },
      { key: 'paymentProcessingRate', label: 'Payment Processing', type: 'percent', unit: '%' },
    ]
  },
};

const ParameterEditor = ({ parameters, onParameterChange, onReset }) => {
  const [editingSection, setEditingSection] = useState(null);
  const [editValues, setEditValues] = useState({});

  const formatValue = (value, type) => {
    if (type === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    } else if (type === 'percent') {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  const parseValue = (value, type) => {
    if (type === 'percent') {
      return parseFloat(value) / 100;
    }
    return parseFloat(value.replace(/[^\d.-]/g, ''));
  };

  const startEditing = (sectionKey) => {
    const section = PARAMETER_DEFINITIONS[sectionKey];
    const values = {};
    section.fields.forEach(field => {
      const value = parameters[field.key];
      if (field.type === 'percent') {
        values[field.key] = (value * 100).toFixed(1);
      } else {
        values[field.key] = value;
      }
    });
    setEditValues(values);
    setEditingSection(sectionKey);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditValues({});
  };

  const saveEditing = () => {
    const section = PARAMETER_DEFINITIONS[editingSection];
    const updates = {};
    section.fields.forEach(field => {
      if (field.type === 'percent') {
        updates[field.key] = parseFloat(editValues[field.key]) / 100;
      } else {
        updates[field.key] = parseFloat(editValues[field.key]);
      }
    });
    onParameterChange(updates);
    setEditingSection(null);
    setEditValues({});
  };

  const handleInputChange = (key, value) => {
    setEditValues(prev => ({ ...prev, [key]: value }));
  };

  const ParameterSection = ({ sectionKey, section }) => {
    const Icon = section.icon;
    const isEditing = editingSection === sectionKey;

    return (
      <div className={`bg-white rounded-lg shadow border-l-4 border-${section.color}-500`}>
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className={`w-5 h-5 text-${section.color}-600`} />
            <h3 className="font-semibold text-gray-900">{section.title}</h3>
          </div>
          {isEditing ? (
            <div className="flex items-center space-x-2">
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
            </div>
          ) : (
            <button
              onClick={() => startEditing(sectionKey)}
              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
              title="Edit parameters"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="p-4 space-y-3">
          {section.fields.map(field => (
            <div key={field.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{field.label}</span>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={editValues[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="w-28 px-2 py-1 text-right text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    step={field.type === 'percent' ? '0.1' : '1000'}
                  />
                  <span className="text-xs text-gray-400 w-16">{field.unit}</span>
                </div>
              ) : (
                <span className="font-medium text-gray-900">
                  {formatValue(parameters[field.key], field.type)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Model Parameters</h2>
        <button
          onClick={onReset}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Reset all to defaults"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(PARAMETER_DEFINITIONS).map(([key, section]) => (
          <ParameterSection key={key} sectionKey={key} section={section} />
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-2">Funding Structure</p>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Bridge Loan:</span>
            <span className="font-medium">{formatValue(parameters.bridgeLoan, 'currency')}</span>
          </div>
          <div className="flex justify-between">
            <span>Desenvolve SP:</span>
            <span className="font-medium">{formatValue(parameters.desenvolveSP, 'currency')}</span>
          </div>
          <div className="flex justify-between">
            <span>Prefeitura Subsidy:</span>
            <span className="font-medium">{formatValue(parameters.prefeituraSubsidy, 'currency')}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="font-medium">Total Funding:</span>
            <span className="font-bold text-primary-600">
              {formatValue(parameters.bridgeLoan + parameters.desenvolveSP + parameters.prefeituraSubsidy, 'currency')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterEditor;
