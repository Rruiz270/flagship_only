// Flagship School Only - Financial Model
// 10-Year projection for standalone flagship school business

export const DEFAULT_PARAMETERS = {
  // Student capacity
  maxStudents: 1200, // Full capacity: 30 students/class, morning+afternoon shifts
  studentsYear1: 300, // Ramp-up year 1
  studentsYear2: 750, // Ramp-up year 2
  studentsYear3Plus: 1200, // Full capacity from year 3

  // Pricing
  tuitionMonthly: 2300, // R$2,300/month
  tuitionIncreaseRate: 0.06, // 6% annual increase
  kitCostPerStudent: 1200, // R$1,200/year per student

  // Churn
  churnRate: 0.05, // 5% annual student churn (K-12 standard)

  // Technology
  technologyYear1: 5000000, // R$5M Year 1
  technologyYearsAfter: 500000, // R$500K/year Years 2-10 (spread)

  // CAPEX - R$20M total
  initialCapex: 15000000, // R$15M Year 0 (building + renovation)
  year1Capex: 5000000, // R$5M Year 1 (equipment, finishing)

  // Facility costs
  baseFacilityCost: 1500000, // R$1.5M/year base
  facilityInflationRate: 0.05, // 5% annual inflation

  // Staff costs
  staffCostPerStudent: 4400, // R$4,400/student/year for teachers
  minStaffCost: 5000000, // Minimum R$5M/year staff
  corporateOverhead: 2000000, // R$2M/year corporate overhead

  // Operating costs (% of revenue)
  marketingRate: 0.05, // 5% marketing
  badDebtRate: 0.02, // 2% bad debt
  paymentProcessingRate: 0.025, // 2.5% payment processing

  // Other costs
  teacherTrainingBase: 200000, // R$200K base
  teacherTrainingPerStudent: 250, // R$250/student
  insuranceBase: 100000, // R$100K/year
  legalCompliance: 500000, // R$500K/year

  // Funding structure (proportional to R$20M)
  bridgeLoan: 8000000, // R$8M bridge (repaid when other funding arrives)
  desenvolveSP: 10000000, // R$10M from Desenvolve SP
  prefeituraSubsidy: 2000000, // R$2M from Prefeitura (10% subsidy)

  // Year overrides
  yearlyOverrides: {},
};

// Scenario presets
export const SCENARIO_PRESETS = {
  pessimistic: {
    name: 'Pessimistic',
    description: 'Conservative growth, higher costs, slower ramp-up',
    parameters: {
      maxStudents: 1000,
      studentsYear1: 250,
      studentsYear2: 600,
      studentsYear3Plus: 1000,
      tuitionMonthly: 2100,
      tuitionIncreaseRate: 0.05,
      kitCostPerStudent: 1000,
      churnRate: 0.07,
      technologyYear1: 5500000,
      technologyYearsAfter: 600000,
      initialCapex: 17000000,
      year1Capex: 5500000,
      baseFacilityCost: 1700000,
      staffCostPerStudent: 4800,
      minStaffCost: 5500000,
      corporateOverhead: 2300000,
      marketingRate: 0.06,
      badDebtRate: 0.03,
      bridgeLoan: 9000000,
      desenvolveSP: 11000000,
      prefeituraSubsidy: 2500000,
      yearlyOverrides: {},
    }
  },

  realistic: {
    name: 'Realistic',
    description: 'Expected scenario with moderate growth',
    parameters: { ...DEFAULT_PARAMETERS }
  },

  optimistic: {
    name: 'Optimistic',
    description: 'Strong growth, efficient operations, faster ramp-up',
    parameters: {
      maxStudents: 1400,
      studentsYear1: 400,
      studentsYear2: 900,
      studentsYear3Plus: 1400,
      tuitionMonthly: 2500,
      tuitionIncreaseRate: 0.07,
      kitCostPerStudent: 1400,
      churnRate: 0.03,
      technologyYear1: 4500000,
      technologyYearsAfter: 400000,
      initialCapex: 14000000,
      year1Capex: 4500000,
      baseFacilityCost: 1400000,
      staffCostPerStudent: 4000,
      minStaffCost: 4500000,
      corporateOverhead: 1800000,
      marketingRate: 0.04,
      badDebtRate: 0.015,
      bridgeLoan: 7000000,
      desenvolveSP: 9000000,
      prefeituraSubsidy: 2500000,
      yearlyOverrides: {},
    }
  }
};

export class FlagshipFinancialModel {
  constructor(parameters = DEFAULT_PARAMETERS) {
    this.params = { ...DEFAULT_PARAMETERS, ...parameters };
  }

  updateParameters(newParams) {
    this.params = { ...this.params, ...newParams };
  }

  calculateYearData(year) {
    const yearOverrides = this.params.yearlyOverrides?.[year] || {};

    // Student calculations with ramp-up
    let students;
    if (yearOverrides.students !== undefined) {
      students = yearOverrides.students;
    } else if (year === 0) {
      students = 0; // Pre-launch
    } else if (year === 1) {
      students = this.params.studentsYear1;
    } else if (year === 2) {
      students = this.params.studentsYear2;
    } else {
      students = this.params.studentsYear3Plus;
    }

    // Apply churn for years after first enrollment
    if (year > 1) {
      const churnRate = yearOverrides.churnRate || this.params.churnRate;
      const retentionFactor = 1 - churnRate;
      students = Math.round(students * retentionFactor + students * churnRate * 0.95); // 95% replacement
    }

    students = Math.min(students, this.params.maxStudents);

    // Pricing with annual increases
    const inflationYears = Math.max(0, year - 1);
    const currentTuition = yearOverrides.tuition ||
      (this.params.tuitionMonthly * Math.pow(1 + this.params.tuitionIncreaseRate, inflationYears));
    const currentKitCost = yearOverrides.kitCost ||
      (this.params.kitCostPerStudent * Math.pow(1 + this.params.tuitionIncreaseRate, inflationYears));

    // Revenue calculations
    const tuitionRevenue = students * currentTuition * 12;
    const kitRevenue = students * currentKitCost;
    const totalRevenue = tuitionRevenue + kitRevenue;

    // Cost calculations
    const inflationMultiplier = Math.pow(1.05, inflationYears);

    // Technology costs
    const technologyCosts = yearOverrides.technology ||
      (year === 0 ? 0 :
       year === 1 ? this.params.technologyYear1 :
       this.params.technologyYearsAfter * inflationMultiplier);

    // Staff costs
    const baseStaffCost = Math.max(
      this.params.minStaffCost,
      students * this.params.staffCostPerStudent
    );
    const staffCosts = yearOverrides.staffCosts ||
      (year === 0 ? 0 : baseStaffCost * inflationMultiplier);

    // Corporate overhead
    const corporateOverhead = yearOverrides.corporateOverhead ||
      (year === 0 ? this.params.corporateOverhead * 0.5 : // Half during pre-launch
       this.params.corporateOverhead * inflationMultiplier);

    // Facility costs
    const facilityCosts = yearOverrides.facilityCosts ||
      (year === 0 ? 0 :
       this.params.baseFacilityCost * Math.pow(1 + this.params.facilityInflationRate, inflationYears));

    // Marketing
    const marketingCosts = yearOverrides.marketing || (totalRevenue * this.params.marketingRate);

    // Educational costs
    const teacherTraining = yearOverrides.teacherTraining ||
      (year === 0 ? 0 :
       Math.max(this.params.teacherTrainingBase, students * this.params.teacherTrainingPerStudent) * inflationMultiplier);

    // Business costs
    const badDebt = totalRevenue * this.params.badDebtRate;
    const paymentProcessing = totalRevenue * this.params.paymentProcessingRate;

    // Other costs
    const insurance = yearOverrides.insurance ||
      (this.params.insuranceBase * inflationMultiplier);
    const legalCompliance = yearOverrides.legal ||
      (this.params.legalCompliance * inflationMultiplier);

    // Contingency
    const contingency = totalRevenue * 0.02;

    // Total operating costs
    const totalCosts = technologyCosts + staffCosts + corporateOverhead +
      facilityCosts + marketingCosts + teacherTraining + badDebt +
      paymentProcessing + insurance + legalCompliance + contingency;

    // EBITDA
    const ebitda = totalRevenue - totalCosts;
    const ebitdaMargin = totalRevenue > 0 ? ebitda / totalRevenue : 0;

    // CAPEX
    let capex;
    if (yearOverrides.capex !== undefined) {
      capex = yearOverrides.capex;
    } else if (year === 0) {
      capex = this.params.initialCapex;
    } else if (year === 1) {
      capex = this.params.year1Capex;
    } else {
      // Maintenance CAPEX
      capex = totalRevenue * 0.02;
    }

    // Taxes (34% Brazil corporate tax)
    const taxRate = 0.34;
    const taxableIncome = Math.max(0, ebitda);
    const taxes = taxableIncome * taxRate;

    const netIncome = ebitda - taxes;
    const freeCashFlow = netIncome - capex;

    // Funding details
    let fundingSources = null;
    let debtService = null;

    if (year === 0) {
      fundingSources = {
        bridgeLoan: this.params.bridgeLoan,
        total: this.params.bridgeLoan,
      };
    } else if (year === 1) {
      fundingSources = {
        desenvolveSP: this.params.desenvolveSP,
        prefeituraSubsidy: this.params.prefeituraSubsidy,
        total: this.params.desenvolveSP + this.params.prefeituraSubsidy,
      };
      // Bridge loan repayment
      debtService = {
        bridgeRepayment: this.params.bridgeLoan,
        bridgeInterest: this.params.bridgeLoan * 0.14, // 14% annual interest
      };
    } else if (year >= 2 && year <= 6) {
      // Desenvolve SP interest only (grace period)
      debtService = {
        dspInterest: this.params.desenvolveSP * 0.084, // 8.4% annual
      };
    } else if (year > 6) {
      // Principal + interest payments
      const remainingPrincipal = this.params.desenvolveSP - ((year - 7) * (this.params.desenvolveSP / 5));
      if (remainingPrincipal > 0) {
        debtService = {
          principal: this.params.desenvolveSP / 5, // 5-year amortization
          interest: remainingPrincipal * 0.084,
        };
      }
    }

    return {
      year,
      calendarYear: 2026 + year,
      students,
      revenue: {
        tuition: tuitionRevenue,
        kits: kitRevenue,
        total: totalRevenue,
      },
      costs: {
        technology: technologyCosts,
        staff: staffCosts,
        corporate: corporateOverhead,
        facilities: facilityCosts,
        marketing: marketingCosts,
        teacherTraining,
        badDebt,
        paymentProcessing,
        insurance,
        legal: legalCompliance,
        contingency,
        total: totalCosts,
      },
      capex,
      ebitda,
      ebitdaMargin,
      taxes,
      netIncome,
      freeCashFlow,
      pricing: {
        tuition: currentTuition,
        kitCost: currentKitCost,
      },
      fundingSources,
      debtService,
    };
  }

  calculateProjection(years = 10) {
    const projection = [];
    for (let year = 0; year <= years; year++) {
      projection.push(this.calculateYearData(year));
    }
    return projection;
  }

  calculateIRR(cashFlows) {
    let rate = 0.1;
    let high = 1.0;
    let low = -0.99;

    for (let i = 0; i < 100; i++) {
      let npv = 0;
      for (let j = 0; j < cashFlows.length; j++) {
        npv += cashFlows[j] / Math.pow(1 + rate, j);
      }

      if (Math.abs(npv) < 1000) break;

      if (npv > 0) {
        low = rate;
      } else {
        high = rate;
      }
      rate = (low + high) / 2;
    }

    return rate;
  }

  calculateNPV(cashFlows, discountRate = 0.1) {
    return cashFlows.reduce((npv, cashFlow, year) => {
      return npv + cashFlow / Math.pow(1 + discountRate, year);
    }, 0);
  }

  calculatePaybackPeriod(cashFlows) {
    let cumulative = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      cumulative += cashFlows[i];
      if (cumulative > 0) {
        return Math.max(i, 2);
      }
    }
    return cashFlows.length;
  }

  getFinancialSummary() {
    const projection = this.calculateProjection(10);
    const cashFlows = projection.map(year => year.freeCashFlow);

    // Initial investment
    cashFlows[0] = -(this.params.initialCapex);

    const irr = this.calculateIRR(cashFlows);
    const npv = this.calculateNPV(cashFlows);
    const year10 = projection[10];
    const cumulativeEbitda = projection.slice(1).reduce((sum, year) => sum + year.ebitda, 0);
    const cumulativeFcf = projection.slice(1).reduce((sum, year) => sum + year.freeCashFlow, 0);
    const totalCapex = projection.reduce((sum, year) => sum + year.capex, 0);

    return {
      projection,
      summary: {
        year10Revenue: year10.revenue.total,
        year10Ebitda: year10.ebitda,
        year10Students: year10.students,
        cumulativeEbitda,
        cumulativeFcf,
        totalCapex,
        irr,
        npv,
        paybackPeriod: this.calculatePaybackPeriod(cashFlows),
        totalInvestment: this.params.initialCapex + this.params.year1Capex,
        fundingStructure: {
          bridgeLoan: this.params.bridgeLoan,
          desenvolveSP: this.params.desenvolveSP,
          prefeituraSubsidy: this.params.prefeituraSubsidy,
          total: this.params.bridgeLoan + this.params.desenvolveSP + this.params.prefeituraSubsidy,
        },
      }
    };
  }
}
