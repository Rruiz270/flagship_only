import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, DollarSign, Building, Calendar, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { SCENARIO_PRESETS } from '../utils/financialModel';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = ({ financialData, onScenarioChange, currentScenario }) => {
  const [selectedYear, setSelectedYear] = useState(10);

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

  if (!financialData?.projection) {
    return <div className="p-8 text-center text-gray-500">Loading financial data...</div>;
  }

  const { projection, summary } = financialData;
  const yearData = projection.slice(1, 11); // Years 1-10

  // Prepare chart data
  const revenueChartData = yearData.map(year => ({
    year: `Y${year.year}`,
    calendarYear: year.calendarYear,
    tuition: year.revenue.tuition,
    kits: year.revenue.kits,
    total: year.revenue.total,
  }));

  const profitabilityData = yearData.map(year => ({
    year: `Y${year.year}`,
    calendarYear: year.calendarYear,
    revenue: year.revenue.total,
    costs: year.costs.total,
    ebitda: year.ebitda,
    ebitdaMargin: year.ebitdaMargin * 100,
  }));

  const studentsData = yearData.map(year => ({
    year: `Y${year.year}`,
    calendarYear: year.calendarYear,
    students: year.students,
  }));

  const selectedYearData = projection[selectedYear];
  const revenueBreakdown = selectedYearData ? [
    { name: 'Tuition', value: selectedYearData.revenue.tuition, color: '#3b82f6' },
    { name: 'Kit Sales', value: selectedYearData.revenue.kits, color: '#10b981' },
  ] : [];

  const costBreakdown = selectedYearData ? [
    { name: 'Staff', value: selectedYearData.costs.staff + selectedYearData.costs.corporate, color: '#ef4444' },
    { name: 'Technology', value: selectedYearData.costs.technology, color: '#8b5cf6' },
    { name: 'Facilities', value: selectedYearData.costs.facilities, color: '#f59e0b' },
    { name: 'Marketing', value: selectedYearData.costs.marketing, color: '#06b6d4' },
    { name: 'Other', value: selectedYearData.costs.teacherTraining + selectedYearData.costs.badDebt + selectedYearData.costs.paymentProcessing + selectedYearData.costs.insurance + selectedYearData.costs.legal + selectedYearData.costs.contingency, color: '#6b7280' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Flagship School - 10 Year Financial Plan</h2>
            <p className="text-sm text-gray-600 mt-1">Standalone business model for the premium demonstration school</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Scenario:</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              {Object.entries(SCENARIO_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => onScenarioChange(key, preset.parameters)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    currentScenario === key
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 text-gray-600 text-sm">
            <DollarSign className="w-4 h-4" />
            <span>Year 10 Revenue</span>
          </div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(summary.year10Revenue)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 text-gray-600 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Year 10 EBITDA</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {formatCurrency(summary.year10Ebitda)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 text-gray-600 text-sm">
            <Users className="w-4 h-4" />
            <span>Year 10 Students</span>
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {summary.year10Students.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 text-gray-600 text-sm">
            <Target className="w-4 h-4" />
            <span>IRR</span>
          </div>
          <div className="text-2xl font-bold text-orange-600 mt-1">
            {formatPercentage(summary.irr)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 text-gray-600 text-sm">
            <Building className="w-4 h-4" />
            <span>Total Investment</span>
          </div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {formatCurrency(summary.totalInvestment)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 text-gray-600 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Payback Period</span>
          </div>
          <div className="text-2xl font-bold text-teal-600 mt-1">
            {summary.paybackPeriod} years
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Growth (10 Years)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip
                formatter={(value) => formatCurrencyFull(value)}
                labelFormatter={(label) => {
                  const item = revenueChartData.find(d => d.year === label);
                  return item ? `${label} (${item.calendarYear})` : label;
                }}
              />
              <Legend />
              <Bar dataKey="tuition" name="Tuition" stackId="a" fill="#3b82f6" />
              <Bar dataKey="kits" name="Kit Sales" stackId="a" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Student Growth Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Enrollment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={studentsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip
                formatter={(value) => [value.toLocaleString(), 'Students']}
                labelFormatter={(label) => {
                  const item = studentsData.find(d => d.year === label);
                  return item ? `${label} (${item.calendarYear})` : label;
                }}
              />
              <Area type="monotone" dataKey="students" name="Students" fill="#8b5cf6" stroke="#8b5cf6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profitability Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profitability Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profitabilityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v.toFixed(0)}%`} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'EBITDA Margin') return [`${value.toFixed(1)}%`, name];
                  return [formatCurrencyFull(value), name];
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} />
              <Line yAxisId="left" type="monotone" dataKey="ebitda" name="EBITDA" stroke="#3b82f6" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="ebitdaMargin" name="EBITDA Margin" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Year Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Year {selectedYear} Breakdown</h3>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
                <option key={year} value={year}>Year {year} ({2026 + year})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Revenue Pie */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 text-center mb-2">Revenue</h4>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {revenueBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-1 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Costs Pie */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 text-center mb-2">Costs</h4>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {costBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-1 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedYearData && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue:</span>
                <span className="font-medium">{formatCurrency(selectedYearData.revenue.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Costs:</span>
                <span className="font-medium text-red-600">{formatCurrency(selectedYearData.costs.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">EBITDA:</span>
                <span className="font-medium text-green-600">{formatCurrency(selectedYearData.ebitda)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Margin:</span>
                <span className="font-medium text-blue-600">{formatPercentage(selectedYearData.ebitdaMargin)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">10-Year Financial Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-900">Metric</th>
                {yearData.map(year => (
                  <th key={year.year} className="px-4 py-3 text-right font-semibold text-gray-900">
                    Y{year.year}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-bold text-gray-900 bg-gray-100">Total/Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="sticky left-0 bg-white px-4 py-2 text-gray-700">Students</td>
                {yearData.map(year => (
                  <td key={year.year} className="px-4 py-2 text-right text-gray-600">
                    {year.students.toLocaleString()}
                  </td>
                ))}
                <td className="px-4 py-2 text-right font-medium bg-gray-50">-</td>
              </tr>
              <tr className="bg-green-50">
                <td className="sticky left-0 bg-green-50 px-4 py-2 font-medium text-green-800">Revenue</td>
                {yearData.map(year => (
                  <td key={year.year} className="px-4 py-2 text-right text-green-700">
                    {formatCurrency(year.revenue.total)}
                  </td>
                ))}
                <td className="px-4 py-2 text-right font-bold text-green-800 bg-green-100">
                  {formatCurrency(yearData.reduce((sum, y) => sum + y.revenue.total, 0))}
                </td>
              </tr>
              <tr>
                <td className="sticky left-0 bg-white px-4 py-2 text-gray-700">Costs</td>
                {yearData.map(year => (
                  <td key={year.year} className="px-4 py-2 text-right text-red-600">
                    {formatCurrency(year.costs.total)}
                  </td>
                ))}
                <td className="px-4 py-2 text-right font-medium text-red-600 bg-gray-50">
                  {formatCurrency(yearData.reduce((sum, y) => sum + y.costs.total, 0))}
                </td>
              </tr>
              <tr className="bg-blue-50">
                <td className="sticky left-0 bg-blue-50 px-4 py-2 font-medium text-blue-800">EBITDA</td>
                {yearData.map(year => (
                  <td key={year.year} className="px-4 py-2 text-right text-blue-700">
                    {formatCurrency(year.ebitda)}
                  </td>
                ))}
                <td className="px-4 py-2 text-right font-bold text-blue-800 bg-blue-100">
                  {formatCurrency(summary.cumulativeEbitda)}
                </td>
              </tr>
              <tr>
                <td className="sticky left-0 bg-white px-4 py-2 text-gray-700">EBITDA Margin</td>
                {yearData.map(year => (
                  <td key={year.year} className="px-4 py-2 text-right text-gray-600">
                    {formatPercentage(year.ebitdaMargin)}
                  </td>
                ))}
                <td className="px-4 py-2 text-right font-medium bg-gray-50">
                  {formatPercentage(yearData.reduce((sum, y) => sum + y.ebitdaMargin, 0) / yearData.length)}
                </td>
              </tr>
              <tr>
                <td className="sticky left-0 bg-white px-4 py-2 text-gray-700">CAPEX</td>
                {yearData.map(year => (
                  <td key={year.year} className="px-4 py-2 text-right text-orange-600">
                    {formatCurrency(year.capex)}
                  </td>
                ))}
                <td className="px-4 py-2 text-right font-medium text-orange-600 bg-gray-50">
                  {formatCurrency(summary.totalCapex)}
                </td>
              </tr>
              <tr className="bg-purple-50">
                <td className="sticky left-0 bg-purple-50 px-4 py-2 font-medium text-purple-800">Free Cash Flow</td>
                {yearData.map(year => (
                  <td key={year.year} className={`px-4 py-2 text-right ${year.freeCashFlow >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
                    {formatCurrency(year.freeCashFlow)}
                  </td>
                ))}
                <td className="px-4 py-2 text-right font-bold text-purple-800 bg-purple-100">
                  {formatCurrency(summary.cumulativeFcf)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
