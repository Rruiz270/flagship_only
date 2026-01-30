import React, { useState } from 'react';
import { Download, ChevronDown, FileSpreadsheet, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const formatCurrencyForExport = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0);
};

export const formatPercentageForExport = (value) => {
  return `${((value || 0) * 100).toFixed(1)}%`;
};

export const exportToExcel = (sheets, filename) => {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    if (!sheet.data || sheet.data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(sheet.data);

    // Auto-size columns
    const colWidths = Object.keys(sheet.data[0] || {}).map(key => {
      const maxLength = Math.max(
        key.length,
        ...sheet.data.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 30) };
    });
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.substring(0, 31));
  });

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const ExportButton = ({ financialData, currentScenario }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (type) => {
    if (!financialData?.projection) {
      alert('No data available to export');
      return;
    }

    const projection = financialData.projection;
    const yearData = projection.slice(1, 11);
    const summary = financialData.summary;
    const currentDate = new Date().toISOString().split('T')[0];

    const sheets = [];

    if (type === 'summary' || type === 'all') {
      sheets.push({
        name: 'Executive Summary',
        data: [
          { Metric: 'Report Date', Value: currentDate },
          { Metric: 'Scenario', Value: currentScenario },
          { Metric: 'Year 10 Revenue', Value: formatCurrencyForExport(summary.year10Revenue) },
          { Metric: 'Year 10 EBITDA', Value: formatCurrencyForExport(summary.year10Ebitda) },
          { Metric: 'Year 10 Students', Value: summary.year10Students },
          { Metric: 'IRR', Value: formatPercentageForExport(summary.irr) },
          { Metric: 'NPV', Value: formatCurrencyForExport(summary.npv) },
          { Metric: 'Payback Period', Value: `${summary.paybackPeriod} years` },
          { Metric: 'Total Investment', Value: formatCurrencyForExport(summary.totalInvestment) },
          { Metric: 'Cumulative EBITDA', Value: formatCurrencyForExport(summary.cumulativeEbitda) },
          { Metric: 'Cumulative FCF', Value: formatCurrencyForExport(summary.cumulativeFcf) },
        ]
      });
    }

    if (type === 'projections' || type === 'all') {
      sheets.push({
        name: '10-Year Projections',
        data: yearData.map(year => ({
          Year: year.year,
          'Calendar Year': year.calendarYear,
          Students: year.students,
          'Tuition Revenue': formatCurrencyForExport(year.revenue.tuition),
          'Kit Revenue': formatCurrencyForExport(year.revenue.kits),
          'Total Revenue': formatCurrencyForExport(year.revenue.total),
          'Total Costs': formatCurrencyForExport(year.costs.total),
          'EBITDA': formatCurrencyForExport(year.ebitda),
          'EBITDA Margin': formatPercentageForExport(year.ebitdaMargin),
          'CAPEX': formatCurrencyForExport(year.capex),
          'Net Income': formatCurrencyForExport(year.netIncome),
          'Free Cash Flow': formatCurrencyForExport(year.freeCashFlow),
        }))
      });
    }

    if (type === 'costs' || type === 'all') {
      sheets.push({
        name: 'Cost Breakdown',
        data: yearData.map(year => ({
          Year: year.year,
          'Calendar Year': year.calendarYear,
          Technology: formatCurrencyForExport(year.costs.technology),
          Staff: formatCurrencyForExport(year.costs.staff),
          Corporate: formatCurrencyForExport(year.costs.corporate),
          Facilities: formatCurrencyForExport(year.costs.facilities),
          Marketing: formatCurrencyForExport(year.costs.marketing),
          'Teacher Training': formatCurrencyForExport(year.costs.teacherTraining),
          'Bad Debt': formatCurrencyForExport(year.costs.badDebt),
          'Payment Processing': formatCurrencyForExport(year.costs.paymentProcessing),
          Insurance: formatCurrencyForExport(year.costs.insurance),
          Legal: formatCurrencyForExport(year.costs.legal),
          Contingency: formatCurrencyForExport(year.costs.contingency),
          'Total Costs': formatCurrencyForExport(year.costs.total),
        }))
      });
    }

    if (type === 'funding' || type === 'all') {
      sheets.push({
        name: 'Funding Structure',
        data: [
          { Source: 'Bridge Loan', Amount: formatCurrencyForExport(summary.fundingStructure.bridgeLoan), Notes: 'Initial funding, repaid Year 1' },
          { Source: 'Desenvolve SP', Amount: formatCurrencyForExport(summary.fundingStructure.desenvolveSP), Notes: 'CAPEX financing' },
          { Source: 'Prefeitura Subsidy', Amount: formatCurrencyForExport(summary.fundingStructure.prefeituraSubsidy), Notes: 'Government subsidy' },
          { Source: 'Total Funding', Amount: formatCurrencyForExport(summary.fundingStructure.total), Notes: '' },
        ]
      });
    }

    if (sheets.length > 0) {
      exportToExcel(sheets, `Flagship_School_${currentScenario}`);
    }

    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-2">
              <button
                onClick={() => handleExport('summary')}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <FileSpreadsheet className="w-4 h-4 text-gray-400" />
                <span>Executive Summary</span>
              </button>
              <button
                onClick={() => handleExport('projections')}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <FileSpreadsheet className="w-4 h-4 text-gray-400" />
                <span>10-Year Projections</span>
              </button>
              <button
                onClick={() => handleExport('costs')}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <FileSpreadsheet className="w-4 h-4 text-gray-400" />
                <span>Cost Breakdown</span>
              </button>
              <button
                onClick={() => handleExport('funding')}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <FileSpreadsheet className="w-4 h-4 text-gray-400" />
                <span>Funding Structure</span>
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => handleExport('all')}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-md"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export All</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
