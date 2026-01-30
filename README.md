# Flagship School - 10 Year Financial Model

Interactive financial modeling application for the standalone Flagship AI School business.

## Overview

This application provides a comprehensive 10-year financial projection for operating a premium AI-powered K-12 school as a standalone business. It includes:

- **3 Scenario Analysis**: Pessimistic, Realistic, and Optimistic projections
- **Revenue Modeling**: Tuition + Kit Sales
- **Cost Structure**: Technology, Staff, Facilities, Marketing, and more
- **Investment Analysis**: CAPEX, Funding sources, IRR, NPV, Payback period
- **Editable Parameters**: All values can be customized with edit buttons
- **Year-by-Year Editing**: Override specific year values
- **Excel Export**: Export all data to spreadsheets

## Key Financial Parameters (Realistic Scenario)

| Parameter | Value |
|-----------|-------|
| Max Students | 1,200 |
| Monthly Tuition | R$ 2,300 |
| Initial CAPEX | R$ 15M (Year 0) |
| Year 1 CAPEX | R$ 5M |
| Total Investment | R$ 20M |
| Technology Year 1 | R$ 5M |

## Revenue Streams

1. **Tuition Revenue**: Monthly tuition from enrolled students
2. **Kit Sales**: Annual educational kit per student (R$ 1,200/year)

## Funding Structure

- Bridge Loan: R$ 8M (repaid Year 1)
- Desenvolve SP: R$ 10M (CAPEX financing)
- Prefeitura Subsidy: R$ 2M (government subsidy)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Technology Stack

- **React 19** - UI Framework
- **Vite** - Build Tool
- **Tailwind CSS 4** - Styling
- **Recharts** - Charts and Visualizations
- **XLSX/ExcelJS** - Excel Export

## Features

### Dashboard
- KPI cards with key metrics
- Revenue and student growth charts
- Profitability analysis
- Year breakdown with pie charts

### Year-by-Year Editor
- Expandable view for each year
- Edit individual values for any year
- Override formulas with custom values
- Changes persist in localStorage

### Parameter Editor
- Grouped parameter sections
- Edit buttons for each section
- Real-time calculation updates
- Reset to defaults option

### Export
- Executive Summary
- 10-Year Projections
- Cost Breakdown
- Funding Structure
- Export All option

## License

Private - All Rights Reserved
