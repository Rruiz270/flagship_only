import React, { useState, useMemo } from 'react';
import {
  Edit2, Save, X, ChevronDown, ChevronRight, RotateCcw,
  Users, DollarSign, TrendingUp, Building2, Megaphone,
  GraduationCap, Shield, Scale, Percent, Calculator,
  Wallet, CreditCard, AlertCircle, PiggyBank
} from 'lucide-react';

const STORAGE_KEY = 'flagship-yearly-overrides';

const YearByYearEditor = ({ financialData, parameters, onParameterChange, currentScenario }) => {
  const [editingYear, setEditingYear] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [expandedYears, setExpandedYears] = useState({ 1: true, 2: true, 3: true });

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'R$ 0';
    if (Math.abs(value) >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(2)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  const formatCurrencyFull = (value) => {
    if (value === undefined || value === null) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '0.0%';
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
      tuition: Math.round(data.pricing.tuition),
      kitCost: Math.round(data.pricing.kitCost),
      technology: Math.round(data.costs.technology),
      staffCosts: Math.round(data.costs.staff),
      corporate: Math.round(data.costs.corporate),
      facilities: Math.round(data.costs.facilities),
      marketing: Math.round(data.costs.marketing),
      teacherTraining: Math.round(data.costs.teacherTraining),
      insurance: Math.round(data.costs.insurance),
      legal: Math.round(data.costs.legal),
      capex: Math.round(data.capex),
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

  // Section Component for P&L grouping
  const Section = ({ title, icon: Icon, children, className = '' }) => (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-200">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );

  // Line Item Component
  const LineItem = ({
    label,
    value,
    editField,
    isEditing,
    editValue,
    onEdit,
    isPositive = true,
    isSubtotal = false,
    isTotal = false,
    indent = false,
    percentage = null,
    icon: Icon = null,
    showPercentOfRevenue = false,
    totalRevenue = 0
  }) => {
    const displayValue = typeof value === 'number' ? value : 0;
    const percentOfRevenue = showPercentOfRevenue && totalRevenue > 0
      ? (displayValue / totalRevenue * 100).toFixed(1) + '%'
      : null;

    return (
      <div className={`flex items-center justify-between py-1.5 ${indent ? 'pl-4' : ''} ${isTotal ? 'border-t-2 border-gray-300 pt-2 mt-1' : ''} ${isSubtotal ? 'border-t border-gray-200 pt-2 mt-1' : ''}`}>
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
          <span className={`text-sm ${isTotal || isSubtotal ? 'font-semibold' : 'text-gray-600'}`}>
            {label}
          </span>
          {percentOfRevenue && (
            <span className="text-xs text-gray-400">({percentOfRevenue})</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isEditing && editField ? (
            <input
              type="number"
              value={editValue}
              onChange={(e) => onEdit(editField, e.target.value)}
              className="w-28 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <span className={`text-sm font-medium ${
              isTotal || isSubtotal
                ? (displayValue >= 0 ? 'text-gray-900' : 'text-red-600')
                : (isPositive ? 'text-gray-700' : 'text-red-600')
            }`}>
              {formatCurrency(displayValue)}
            </span>
          )}
          {percentage !== null && (
            <span className="text-xs text-gray-400 w-12 text-right">
              {formatPercentage(percentage)}
            </span>
          )}
        </div>
      </div>
    );
  };

  const YearCard = ({ year, data }) => {
    const isExpanded = expandedYears[year];
    const isEditing = editingYear === year;
    const hasYearOverride = parameters.yearlyOverrides?.[year];

    // Calculate some derived metrics
    const costPerStudent = data.students > 0 ? data.costs.total / data.students : 0;
    const revenuePerStudent = data.students > 0 ? data.revenue.total / data.students : 0;
    const grossMargin = data.revenue.total > 0 ? (data.revenue.total - data.costs.total) / data.revenue.total : 0;

    return (
      <div className={`border rounded-lg shadow-sm ${hasYearOverride ? 'border-amber-300 bg-amber-50/50' : 'border-gray-200 bg-white'}`}>
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
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
                <span className="font-bold text-gray-900 text-lg">
                  Year {year}
                </span>
                <span className="text-gray-500">({data.calendarYear})</span>
                {hasYearOverride && (
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                    Modified
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 flex items-center space-x-3">
                <span className="flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1" />
                  {data.students.toLocaleString()} students
                </span>
                <span>|</span>
                <span className="text-green-600 font-medium">
                  Revenue: {formatCurrency(data.revenue.total)}
                </span>
                <span>|</span>
                <span className={data.ebitda >= 0 ? 'text-blue-600 font-medium' : 'text-red-600 font-medium'}>
                  EBITDA: {formatCurrency(data.ebitda)}
                </span>
                <span>|</span>
                <span className={data.freeCashFlow >= 0 ? 'text-purple-600 font-medium' : 'text-red-600 font-medium'}>
                  FCF: {formatCurrency(data.freeCashFlow)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            {hasYearOverride && !isEditing && (
              <button
                onClick={() => clearYearOverride(year)}
                className="p-1.5 text-amber-600 hover:bg-amber-100 rounded transition-colors"
                title="Clear year overrides"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            {isEditing ? (
              <>
                <button
                  onClick={saveEditing}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Save changes"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelEditing}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => startEditing(year, data)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit year values"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded Content - P&L Style */}
        {isExpanded && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              {/* Left Column */}
              <div>
                {/* Enrollment & Pricing */}
                <Section title="Enrollment & Pricing" icon={Users}>
                  <LineItem
                    label="Enrolled Students"
                    value={data.students}
                    editField="students"
                    isEditing={isEditing}
                    editValue={editValues.students}
                    onEdit={handleInputChange}
                    icon={Users}
                  />
                  <LineItem
                    label="Monthly Tuition"
                    value={data.pricing.tuition}
                    editField="tuition"
                    isEditing={isEditing}
                    editValue={editValues.tuition}
                    onEdit={handleInputChange}
                    icon={DollarSign}
                  />
                  <LineItem
                    label="Annual Kit Cost"
                    value={data.pricing.kitCost}
                    editField="kitCost"
                    isEditing={isEditing}
                    editValue={editValues.kitCost}
                    onEdit={handleInputChange}
                    icon={GraduationCap}
                  />
                </Section>

                {/* Revenue Streams */}
                <Section title="Revenue Streams" icon={TrendingUp}>
                  <LineItem
                    label="Tuition Revenue"
                    value={data.revenue.tuition}
                    showPercentOfRevenue
                    totalRevenue={data.revenue.total}
                    icon={DollarSign}
                  />
                  <LineItem
                    label="Educational Kit Sales"
                    value={data.revenue.kits}
                    showPercentOfRevenue
                    totalRevenue={data.revenue.total}
                    icon={GraduationCap}
                  />
                  <LineItem
                    label="Total Revenue"
                    value={data.revenue.total}
                    isTotal
                    icon={TrendingUp}
                  />
                </Section>

                {/* Key Metrics */}
                <Section title="Key Metrics" icon={Calculator}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 uppercase">EBITDA Margin</div>
                      <div className={`text-lg font-bold ${data.ebitdaMargin >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatPercentage(data.ebitdaMargin)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 uppercase">Gross Margin</div>
                      <div className={`text-lg font-bold ${grossMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(grossMargin)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 uppercase">Revenue/Student</div>
                      <div className="text-lg font-bold text-gray-700">
                        {formatCurrencyFull(revenuePerStudent)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 uppercase">Cost/Student</div>
                      <div className="text-lg font-bold text-gray-700">
                        {formatCurrencyFull(costPerStudent)}
                      </div>
                    </div>
                  </div>
                </Section>
              </div>

              {/* Right Column */}
              <div>
                {/* Operating Expenses */}
                <Section title="Operating Expenses" icon={Wallet}>
                  <LineItem
                    label="Technology & Platform"
                    value={data.costs.technology}
                    editField="technology"
                    isEditing={isEditing}
                    editValue={editValues.technology}
                    onEdit={handleInputChange}
                    isPositive={false}
                    showPercentOfRevenue
                    totalRevenue={data.revenue.total}
                    icon={Calculator}
                  />
                  <LineItem
                    label="Staff & Teachers"
                    value={data.costs.staff}
                    editField="staffCosts"
                    isEditing={isEditing}
                    editValue={editValues.staffCosts}
                    onEdit={handleInputChange}
                    isPositive={false}
                    showPercentOfRevenue
                    totalRevenue={data.revenue.total}
                    icon={Users}
                  />
                  <LineItem
                    label="Corporate Overhead"
                    value={data.costs.corporate}
                    editField="corporate"
                    isEditing={isEditing}
                    editValue={editValues.corporate}
                    onEdit={handleInputChange}
                    isPositive={false}
                    showPercentOfRevenue
                    totalRevenue={data.revenue.total}
                    icon={Building2}
                  />
                  <LineItem
                    label="Facilities & Utilities"
                    value={data.costs.facilities}
                    editField="facilities"
                    isEditing={isEditing}
                    editValue={editValues.facilities}
                    onEdit={handleInputChange}
                    isPositive={false}
                    showPercentOfRevenue
                    totalRevenue={data.revenue.total}
                    icon={Building2}
                  />
                  <LineItem
                    label="Marketing & Sales"
                    value={data.costs.marketing}
                    editField="marketing"
                    isEditing={isEditing}
                    editValue={editValues.marketing}
                    onEdit={handleInputChange}
                    isPositive={false}
                    showPercentOfRevenue
                    totalRevenue={data.revenue.total}
                    icon={Megaphone}
                  />
                  <LineItem
                    label="Teacher Training"
                    value={data.costs.teacherTraining}
                    editField="teacherTraining"
                    isEditing={isEditing}
                    editValue={editValues.teacherTraining}
                    onEdit={handleInputChange}
                    isPositive={false}
                    showPercentOfRevenue
                    totalRevenue={data.revenue.total}
                    icon={GraduationCap}
                  />
                  <LineItem
                    label="Bad Debt (2%)"
                    value={data.costs.badDebt}
                    isPositive={false}
                    showPercentOfRevenue
                    totalRevenue={data.revenue.total}
                    icon={AlertCircle}
                  />
                  <LineItem
                    label="Payment Processing (2.5%)"
                    value={data.costs.paymentProcessing}
                    isPositive={false}
                    showPercentOfRevenue
                    totalRevenue={data.revenue.total}
                    icon={CreditCard}
                  />
                  <LineItem
                    label="Insurance"
                    value={data.costs.insurance}
                    editField="insurance"
                    isEditing={isEditing}
                    editValue={editValues.insurance}
                    onEdit={handleInputChange}
                    isPositive={false}
                    showPercentOfRevenue
                    totalRevenue={data.revenue.total}
                    icon={Shield}
                  />
                  <LineItem
                    label="Legal & Compliance"
                    value={data.costs.legal}
                    editField="legal"
                    isEditing={isEditing}
                    editValue={editValues.legal}
                    onEdit={handleInputChange}
                    isPositive={false}
                    showPercentOfRevenue
                    totalRevenue={data.revenue.total}
                    icon={Scale}
                  />
                  <LineItem
                    label="Contingency (2%)"
                    value={data.costs.contingency}
                    isPositive={false}
                    showPercentOfRevenue
                    totalRevenue={data.revenue.total}
                    icon={PiggyBank}
                  />
                  <LineItem
                    label="Total Operating Costs"
                    value={data.costs.total}
                    isTotal
                    isPositive={false}
                  />
                </Section>

                {/* Financial Results */}
                <Section title="Financial Results" icon={DollarSign}>
                  <LineItem
                    label="EBITDA"
                    value={data.ebitda}
                    percentage={data.ebitdaMargin}
                    isSubtotal
                  />
                  <LineItem
                    label="Taxes (34%)"
                    value={-data.taxes}
                    isPositive={false}
                    indent
                  />
                  <LineItem
                    label="Net Income"
                    value={data.netIncome}
                    isSubtotal
                  />
                  <LineItem
                    label="CAPEX"
                    value={-data.capex}
                    editField="capex"
                    isEditing={isEditing}
                    editValue={editValues.capex}
                    onEdit={handleInputChange}
                    isPositive={false}
                    indent
                  />
                  <LineItem
                    label="Free Cash Flow"
                    value={data.freeCashFlow}
                    isTotal
                  />
                </Section>

                {/* Funding Info (if applicable) */}
                {(data.fundingSources || data.debtService) && (
                  <Section title="Funding & Debt Service" icon={Building2}>
                    {data.fundingSources?.bridgeLoan && (
                      <LineItem
                        label="Bridge Loan Received"
                        value={data.fundingSources.bridgeLoan}
                        icon={DollarSign}
                      />
                    )}
                    {data.fundingSources?.desenvolveSP && (
                      <LineItem
                        label="Desenvolve SP"
                        value={data.fundingSources.desenvolveSP}
                        icon={Building2}
                      />
                    )}
                    {data.fundingSources?.prefeituraSubsidy && (
                      <LineItem
                        label="Prefeitura Subsidy"
                        value={data.fundingSources.prefeituraSubsidy}
                        icon={Building2}
                      />
                    )}
                    {data.debtService?.bridgeRepayment && (
                      <LineItem
                        label="Bridge Loan Repayment"
                        value={-data.debtService.bridgeRepayment}
                        isPositive={false}
                      />
                    )}
                    {data.debtService?.bridgeInterest && (
                      <LineItem
                        label="Bridge Interest (14%)"
                        value={-data.debtService.bridgeInterest}
                        isPositive={false}
                      />
                    )}
                    {data.debtService?.dspInterest && (
                      <LineItem
                        label="DSP Interest (8.4%)"
                        value={-data.debtService.dspInterest}
                        isPositive={false}
                      />
                    )}
                    {data.debtService?.principal && (
                      <LineItem
                        label="DSP Principal"
                        value={-data.debtService.principal}
                        isPositive={false}
                      />
                    )}
                    {data.debtService?.interest && (
                      <LineItem
                        label="DSP Interest"
                        value={-data.debtService.interest}
                        isPositive={false}
                      />
                    )}
                  </Section>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Year 0 Special Card
  const Year0Card = ({ data }) => {
    const isExpanded = expandedYears[0];

    return (
      <div className="border border-gray-300 rounded-lg bg-gray-50">
        <div
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleYear(0)}
        >
          <div className="flex items-center space-x-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <div className="font-bold text-gray-700 text-lg">
                Year 0 <span className="text-gray-500 font-normal">({data?.calendarYear || 2026})</span>
              </div>
              <div className="text-sm text-gray-500">
                Pre-Launch Phase | Initial CAPEX: {formatCurrency(data?.capex || 0)}
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-6 pb-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div>
                <Section title="Pre-Launch Investments" icon={Building2}>
                  <LineItem
                    label="Initial CAPEX (Building/Renovation)"
                    value={data?.capex || 0}
                    icon={Building2}
                  />
                  <LineItem
                    label="Corporate Overhead (Setup)"
                    value={data?.costs?.corporate || 0}
                    icon={Users}
                  />
                </Section>
              </div>
              <div>
                <Section title="Initial Funding" icon={DollarSign}>
                  {data?.fundingSources?.bridgeLoan && (
                    <LineItem
                      label="Bridge Loan Received"
                      value={data.fundingSources.bridgeLoan}
                      icon={DollarSign}
                    />
                  )}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                    Bridge loan covers initial CAPEX, repaid in Year 1 when Desenvolve SP funding arrives.
                  </div>
                </Section>
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
            <h2 className="text-2xl font-bold text-gray-900">Year-by-Year Financial Statement</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete P&L breakdown for each year. Click to expand and see all details. Use edit button to modify values.
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-500">
                Scenario: <span className="font-semibold text-blue-600 capitalize">{currentScenario}</span>
              </span>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-500">
                10-Year Projection (2026-2036)
              </span>
            </div>
          </div>
          {hasOverrides && (
            <button
              onClick={clearAllOverrides}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Overrides</span>
            </button>
          )}
        </div>

        {hasOverrides && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <strong>Note:</strong> Some years have custom overrides applied (indicated with "Modified" badge).
            These changes persist in your browser and override the scenario calculations.
          </div>
        )}
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-xs text-gray-500 uppercase font-medium">Total Revenue (10Y)</div>
          <div className="text-xl font-bold text-green-600">
            {formatCurrency(yearData.slice(1).reduce((sum, y) => sum + y.revenue.total, 0))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-xs text-gray-500 uppercase font-medium">Total EBITDA (10Y)</div>
          <div className="text-xl font-bold text-blue-600">
            {formatCurrency(financialData.summary.cumulativeEbitda)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="text-xs text-gray-500 uppercase font-medium">Total CAPEX</div>
          <div className="text-xl font-bold text-orange-600">
            {formatCurrency(financialData.summary.totalCapex)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="text-xs text-gray-500 uppercase font-medium">Total FCF (10Y)</div>
          <div className="text-xl font-bold text-purple-600">
            {formatCurrency(financialData.summary.cumulativeFcf)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-emerald-500">
          <div className="text-xs text-gray-500 uppercase font-medium">IRR</div>
          <div className="text-xl font-bold text-emerald-600">
            {formatPercentage(financialData.summary.irr)}
          </div>
        </div>
      </div>

      {/* Year 0 (Pre-Launch) */}
      <Year0Card data={yearData[0]} />

      {/* Years 1-10 */}
      <div className="space-y-4">
        {yearData.slice(1, 11).map((data) => (
          <YearCard key={data.year} year={data.year} data={data} />
        ))}
      </div>

      {/* 10-Year Detailed Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">10-Year Cumulative Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-500 uppercase">Revenue</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tuition Revenue</span>
                <span className="font-medium">{formatCurrency(yearData.slice(1).reduce((sum, y) => sum + y.revenue.tuition, 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kit Sales</span>
                <span className="font-medium">{formatCurrency(yearData.slice(1).reduce((sum, y) => sum + y.revenue.kits, 0))}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Total Revenue</span>
                <span className="font-bold text-green-600">{formatCurrency(yearData.slice(1).reduce((sum, y) => sum + y.revenue.total, 0))}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-500 uppercase">Costs</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Operating Costs</span>
                <span className="font-medium text-red-600">{formatCurrency(yearData.slice(1).reduce((sum, y) => sum + y.costs.total, 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total CAPEX</span>
                <span className="font-medium text-orange-600">{formatCurrency(financialData.summary.totalCapex)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes Paid</span>
                <span className="font-medium text-red-600">{formatCurrency(yearData.slice(1).reduce((sum, y) => sum + y.taxes, 0))}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-500 uppercase">Profitability</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">EBITDA</span>
                <span className="font-medium text-blue-600">{formatCurrency(financialData.summary.cumulativeEbitda)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Net Income</span>
                <span className="font-medium">{formatCurrency(yearData.slice(1).reduce((sum, y) => sum + y.netIncome, 0))}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Free Cash Flow</span>
                <span className="font-bold text-purple-600">{formatCurrency(financialData.summary.cumulativeFcf)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-500 uppercase">Investment Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Investment</span>
                <span className="font-medium">{formatCurrency(financialData.summary.totalInvestment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IRR</span>
                <span className="font-medium text-emerald-600">{formatPercentage(financialData.summary.irr)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">NPV (10%)</span>
                <span className="font-medium">{formatCurrency(financialData.summary.npv)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payback Period</span>
                <span className="font-medium">{financialData.summary.paybackPeriod} years</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearByYearEditor;
