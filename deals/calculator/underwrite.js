/*
 * Property True deal underwriting.
 *
 * NOI = effective gross income minus vacancy and every operating expense,
 * including taxes and insurance.
 * DSCR = NOI / annual principal and interest (not PITI).
 * All-cash yield = NOI / (price + closing + rehab).
 * Max price is the purchase price that produces DSCR 1.20 at the chosen
 * down payment, rate, and term. Taxes scale with price only when tax mode
 * is a percent of price. Other expenses stay fixed dollars, except
 * percentage management, which follows effective gross income.
 *
 * The verdict always uses actual rents. Pro forma is a separate scenario.
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.PTUnderwrite = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var TARGET_DSCR = 1.2;

  function cents(n) {
    if (!isFinite(n)) return 0;
    return Math.round(n * 100) / 100;
  }

  function num(n) {
    var x = Number(n);
    return isFinite(x) ? x : 0;
  }

  function monthlyPayment(principal, annualRatePct, years) {
    var nper = years * 12;
    if (!(principal > 0) || !(nper > 0)) return 0;
    var r = annualRatePct / 100 / 12;
    if (r === 0) return principal / nper;
    var pow = Math.pow(1 + r, nper);
    return principal * r * pow / (pow - 1);
  }

  function amortize(principal, annualRatePct, termYears, holdYears) {
    var payment = monthlyPayment(principal, annualRatePct, termYears);
    var r = annualRatePct / 100 / 12;
    var balance = principal > 0 ? principal : 0;
    var years = [];
    var hold = Math.max(0, holdYears | 0);
    for (var y = 0; y < hold; y++) {
      var principalPaid = 0;
      var interestPaid = 0;
      for (var m = 0; m < 12; m++) {
        if (balance <= 0.005) break;
        var interest = balance * r;
        var princ = payment - interest;
        if (princ > balance) princ = balance;
        if (princ < 0) princ = 0;
        balance -= princ;
        if (balance < 0.005) balance = 0;
        principalPaid += princ;
        interestPaid += interest;
      }
      years.push({
        year: y + 1,
        principalPaid: cents(principalPaid),
        interestPaid: cents(interestPaid),
        debtService: cents(principalPaid + interestPaid),
        endingBalance: cents(balance)
      });
    }
    return {
      monthlyPayment: cents(payment),
      annualDebtService: cents(payment * 12),
      years: years
    };
  }

  function unitAnnual(unit, basis) {
    var monthly = basis === "proforma" ? num(unit && unit.proformaMonthly) : num(unit && unit.actualMonthly);
    return monthly * 12;
  }

  function grossRent(units, basis) {
    return (units || []).reduce(function (sum, unit) {
      return sum + unitAnnual(unit, basis);
    }, 0);
  }

  function activeUnitCount(units) {
    return (units || []).filter(function (unit) {
      return num(unit.actualMonthly) > 0 || num(unit.proformaMonthly) > 0;
    }).length;
  }

  function taxesFor(input, price) {
    if (input.taxMode === "dollars") return Math.max(0, num(input.taxesAnnual));
    return Math.max(0, price * num(input.taxPct) / 100);
  }

  function closingFor(input, price) {
    if (input.closingMode === "dollars") return Math.max(0, num(input.closingDollars));
    return Math.max(0, price * num(input.closingPct) / 100);
  }

  function operating(input, price, basis, vacancyPct) {
    var gpr = grossRent(input.units, basis);
    var vacPct = vacancyPct == null ? num(input.vacancyPct) : vacancyPct;
    var vacancyLoss = gpr * vacPct / 100;
    var egi = gpr - vacancyLoss;
    var taxes = taxesFor(input, price);
    var insurance = Math.max(0, num(input.insuranceAnnual));
    var maintenance = Math.max(0, num(input.maintenanceAnnual));
    var utilities = Math.max(0, num(input.utilitiesAnnual));
    var replacementReserves = Math.max(0, num(input.replacementReservesAnnual));
    var management = input.managementMode === "dollars"
      ? Math.max(0, num(input.managementAnnual))
      : egi * num(input.managementPct) / 100;
    var expenses = taxes + insurance + maintenance + management + replacementReserves + utilities;
    return {
      gpr: cents(gpr),
      vacancyPct: vacPct,
      vacancyLoss: cents(vacancyLoss),
      egi: cents(egi),
      taxes: cents(taxes),
      insurance: cents(insurance),
      maintenance: cents(maintenance),
      management: cents(management),
      replacementReserves: cents(replacementReserves),
      utilities: cents(utilities),
      expenses: cents(expenses),
      noi: cents(egi - expenses)
    };
  }

  function loanTerms(input, price, holdYears) {
    var downPct = num(input.downPct);
    var downPayment = price * downPct / 100;
    var loan = Math.max(0, price - downPayment);
    var rate = num(input.rate);
    var term = num(input.termYears) || 30;
    var schedule = amortize(loan, rate, term, holdYears);
    return {
      downPct: downPct,
      downPayment: cents(downPayment),
      loan: cents(loan),
      rate: rate,
      termYears: term,
      monthlyPI: schedule.monthlyPayment,
      annualPI: schedule.annualDebtService,
      schedule: schedule.years
    };
  }

  function uses(input, price) {
    var loan = loanTerms(input, price, 1);
    var closing = closingFor(input, price);
    var rehab = Math.max(0, num(input.rehab));
    var upfrontReserves = Math.max(0, num(input.upfrontReserves));
    var sponsorFee = price * num(input.sponsorFeePct) / 100;
    return {
      price: cents(price),
      downPayment: loan.downPayment,
      loan: loan.loan,
      closing: cents(closing),
      rehab: cents(rehab),
      upfrontReserves: cents(upfrontReserves),
      sponsorFee: cents(sponsorFee),
      cashNeeded: cents(loan.downPayment + closing + rehab + upfrontReserves + sponsorFee)
    };
  }

  function dscr(noi, annualPI) {
    if (!(annualPI > 0)) return null;
    return noi / annualPI;
  }

  function snapshot(input, price, basis, vacancyPct) {
    var op = operating(input, price, basis, vacancyPct);
    var hold = num(input.holdYears) || 5;
    var debt = loanTerms(input, price, hold);
    var stack = uses(input, price);
    var ratio = dscr(op.noi, debt.annualPI);
    var cashFlow = cents(op.noi - debt.annualPI);
    var yieldBase = price + stack.closing + stack.rehab;
    return {
      basis: basis,
      op: op,
      debt: debt,
      uses: stack,
      dscr: ratio,
      pass: ratio != null && ratio + 1e-9 >= TARGET_DSCR,
      cashFlow: cashFlow,
      coc: stack.cashNeeded > 0 ? cashFlow / stack.cashNeeded : null,
      allCashYield: yieldBase > 0 ? op.noi / yieldBase : null,
      capRate: price > 0 ? op.noi / price : null
    };
  }

  function incomeAfterNonTaxExpenses(input, basis, vacancyPct) {
    var forced = {};
    for (var key in input) forced[key] = input[key];
    forced.taxMode = "dollars";
    forced.taxesAnnual = 0;
    return operating(forced, 0, basis, vacancyPct).noi;
  }

  function maxPrice(input, basis, target) {
    var goal = target || TARGET_DSCR;
    var down = num(input.downPct) / 100;
    var ltv = 1 - down;
    if (!(ltv > 0)) return { price: null, reason: "All cash — there is no loan to size." };
    var rate = num(input.rate);
    var term = num(input.termYears) || 30;
    var piPerDollar = monthlyPayment(1, rate, term) * 12;
    if (!(piPerDollar > 0)) return { price: null, reason: "This rate and term do not produce a payment." };
    var perPriceDollar = piPerDollar * ltv;
    var beforeTax = incomeAfterNonTaxExpenses(input, basis, null);
    if (input.taxMode === "dollars") {
      var noi = beforeTax - Math.max(0, num(input.taxesAnnual));
      if (!(noi > 0)) return { price: null, reason: "NOI is not positive, so no price hits DSCR " + goal.toFixed(2) + "." };
      return { price: noi / (goal * perPriceDollar), reason: null };
    }
    var taxRate = num(input.taxPct) / 100;
    var denom = taxRate + goal * perPriceDollar;
    if (!(beforeTax > 0) || !(denom > 0)) {
      return { price: null, reason: "Income after non-tax expenses is not positive." };
    }
    return { price: beforeTax / denom, reason: null };
  }

  function npv(rate, flows) {
    var total = 0;
    for (var t = 0; t < flows.length; t++) total += flows[t] / Math.pow(1 + rate, t);
    return total;
  }

  function irr(flows) {
    if (!flows || flows.length < 2) return null;
    var hasPos = false;
    var hasNeg = false;
    for (var i = 0; i < flows.length; i++) {
      if (flows[i] > 0) hasPos = true;
      if (flows[i] < 0) hasNeg = true;
    }
    if (!hasPos || !hasNeg) return null;
    var rate = 0.1;
    for (var n = 0; n < 40; n++) {
      var value = npv(rate, flows);
      var slope = 0;
      for (var t = 1; t < flows.length; t++) slope -= t * flows[t] / Math.pow(1 + rate, t + 1);
      if (!isFinite(slope) || Math.abs(slope) < 1e-12) break;
      var next = rate - value / slope;
      if (!isFinite(next)) break;
      if (next <= -0.99) next = -0.99;
      if (Math.abs(next - rate) < 1e-9) return next;
      rate = next;
    }
    var lo = -0.9;
    var hi = 5;
    var flo = npv(lo, flows);
    var fhi = npv(hi, flows);
    if (flo * fhi > 0) {
      hi = 40;
      fhi = npv(hi, flows);
      if (flo * fhi > 0) return isFinite(rate) ? rate : null;
    }
    for (var b = 0; b < 80; b++) {
      var mid = (lo + hi) / 2;
      var fm = npv(mid, flows);
      if (flo * fm <= 0) {
        hi = mid;
        fhi = fm;
      } else {
        lo = mid;
        flo = fm;
      }
    }
    return (lo + hi) / 2;
  }

  function equityMultiple(flows) {
    if (!flows || !flows.length) return null;
    var invested = 0;
    var returned = 0;
    for (var i = 0; i < flows.length; i++) {
      if (flows[i] < 0) invested += -flows[i];
      else returned += flows[i];
    }
    if (!(invested > 0)) return null;
    return returned / invested;
  }

  function projectionAssumptions(input, variant) {
    var vacancy = num(input.vacancyPct);
    var rentGrowth = num(input.rentGrowthPct);
    var expenseGrowth = num(input.expenseGrowthPct);
    var exitCap = num(input.exitCapPct);
    if (variant === "downside") {
      vacancy = Math.min(100, vacancy + num(input.downsideVacancyAdd != null ? input.downsideVacancyAdd : 3));
      rentGrowth = input.downsideRentGrowthPct == null || input.downsideRentGrowthPct === ""
        ? 0
        : num(input.downsideRentGrowthPct);
      expenseGrowth = expenseGrowth + num(input.downsideExpenseGrowthAdd != null ? input.downsideExpenseGrowthAdd : 1);
      exitCap = exitCap + num(input.downsideExitCapAdd != null ? input.downsideExitCapAdd : 0.5);
    }
    return {
      variant: variant,
      vacancyPct: vacancy,
      rentGrowthPct: rentGrowth,
      expenseGrowthPct: expenseGrowth,
      exitCapPct: exitCap,
      exitCostPct: num(input.exitCostPct)
    };
  }

  function project(input, price, basis, variant) {
    var hold = Math.max(1, num(input.holdYears) || 5);
    var assumptions = projectionAssumptions(input, variant);
    var debt = loanTerms(input, price, hold);
    var stack = uses(input, price);
    var rentG = assumptions.rentGrowthPct / 100;
    var expG = assumptions.expenseGrowthPct / 100;
    var baseOp = operating(input, price, basis, assumptions.vacancyPct);
    var rows = [];
    for (var y = 1; y <= hold; y++) {
      var rentFactor = Math.pow(1 + rentG, y - 1);
      var expFactor = Math.pow(1 + expG, y - 1);
      var gpr = baseOp.gpr * rentFactor;
      var vacancyLoss = gpr * assumptions.vacancyPct / 100;
      var egi = gpr - vacancyLoss;
      var taxes = baseOp.taxes * expFactor;
      var insurance = baseOp.insurance * expFactor;
      var maintenance = baseOp.maintenance * expFactor;
      var utilities = baseOp.utilities * expFactor;
      var replacementReserves = baseOp.replacementReserves * expFactor;
      var management = input.managementMode === "dollars"
        ? baseOp.management * expFactor
        : egi * num(input.managementPct) / 100;
      var expenses = taxes + insurance + maintenance + management + replacementReserves + utilities;
      var noi = egi - expenses;
      var sched = debt.schedule[y - 1] || {
        principalPaid: 0,
        interestPaid: 0,
        debtService: 0,
        endingBalance: 0
      };
      rows.push({
        year: y,
        gpr: cents(gpr),
        vacancyLoss: cents(vacancyLoss),
        egi: cents(egi),
        expenses: cents(expenses),
        noi: cents(noi),
        debtService: sched.debtService,
        interest: sched.interestPaid,
        principalPaid: sched.principalPaid,
        endingBalance: sched.endingBalance,
        cashFlow: cents(noi - sched.debtService)
      });
    }
    var last = rows[rows.length - 1];
    var salePrice = null;
    var sellingCosts = 0;
    var netSale = null;
    if (assumptions.exitCapPct > 0 && last) {
      salePrice = last.noi > 0 ? last.noi / (assumptions.exitCapPct / 100) : 0;
      sellingCosts = salePrice * assumptions.exitCostPct / 100;
      netSale = salePrice - sellingCosts - last.endingBalance;
    }
    var flows = [-stack.cashNeeded];
    rows.forEach(function (row, index) {
      var cf = row.cashFlow;
      if (index === rows.length - 1 && netSale != null) cf += netSale;
      flows.push(cents(cf));
    });
    return {
      assumptions: assumptions,
      rows: rows,
      salePrice: salePrice == null ? null : cents(salePrice),
      sellingCosts: cents(sellingCosts),
      netSale: netSale == null ? null : cents(netSale),
      cashFlows: flows,
      irr: irr(flows),
      equityMultiple: equityMultiple(flows)
    };
  }

  function jv(input, projection, price) {
    var partners = (input.partners || []).map(function (partner) {
      return {
        name: partner.name || "Partner",
        capital: Math.max(0, num(partner.capital)),
        cashShare: num(partner.cashShare),
        profitShare: num(partner.profitShare)
      };
    }).filter(function (partner) {
      return partner.name || partner.capital || partner.cashShare || partner.profitShare;
    });
    var fee = price * num(input.sponsorFeePct) / 100;
    var totalCapital = partners.reduce(function (sum, partner) { return sum + partner.capital; }, 0);
    var cashShareSum = partners.reduce(function (sum, partner) { return sum + partner.cashShare; }, 0);
    var profitShareSum = partners.reduce(function (sum, partner) { return sum + partner.profitShare; }, 0);
    var netSale = projection.netSale;
    var rows = partners.map(function (partner, index) {
      var yearCashFlows = projection.rows.map(function (row) {
        return cents(row.cashFlow * partner.cashShare / 100);
      });
      var feeReceived = index === 0 ? cents(fee) : 0;
      var exitDistribution = null;
      var exitProfit = null;
      if (netSale != null) {
        if (totalCapital <= 0) {
          exitProfit = cents(netSale * partner.profitShare / 100);
          exitDistribution = exitProfit;
        } else if (netSale >= totalCapital) {
          var pool = netSale - totalCapital;
          exitProfit = cents(pool * partner.profitShare / 100);
          exitDistribution = cents(partner.capital + exitProfit);
        } else {
          exitDistribution = cents(netSale * (partner.capital / totalCapital));
          exitProfit = cents(exitDistribution - partner.capital);
        }
      }
      var calls = yearCashFlows.reduce(function (sum, cf) { return sum + (cf < 0 ? -cf : 0); }, 0);
      var dists = yearCashFlows.reduce(function (sum, cf) { return sum + (cf > 0 ? cf : 0); }, 0);
      var exitPos = exitDistribution != null && exitDistribution > 0 ? exitDistribution : 0;
      var invested = partner.capital + calls;
      var returned = dists + exitPos + feeReceived;
      return {
        name: partner.name,
        capital: cents(partner.capital),
        cashShare: partner.cashShare,
        profitShare: partner.profitShare,
        feeReceived: feeReceived,
        netCashIn: cents(partner.capital - feeReceived),
        yearCashFlows: yearCashFlows,
        year1: yearCashFlows.length ? yearCashFlows[0] : 0,
        exitDistribution: exitDistribution,
        exitProfit: exitProfit,
        multiple: invested > 0 ? returned / invested : null
      };
    });
    return {
      partners: rows,
      fee: cents(fee),
      totalCapital: cents(totalCapital),
      cashShareSum: cashShareSum,
      profitShareSum: profitShareSum,
      netSale: netSale
    };
  }

  function evaluate(input) {
    var price = Math.max(0, num(input.price));
    var actual = snapshot(input, price, "actual", null);
    var proforma = snapshot(input, price, "proforma", null);
    var sized = maxPrice(input, "actual", TARGET_DSCR);
    var base = project(input, price, "actual", "base");
    var downside = project(input, price, "actual", "downside");
    var proformaBase = project(input, price, "proforma", "base");
    return {
      price: price,
      units: activeUnitCount(input.units),
      actual: actual,
      proforma: proforma,
      maxPrice: sized,
      base: base,
      downside: downside,
      proformaBase: proformaBase,
      jvBase: jv(input, base, price),
      jvDownside: jv(input, downside, price),
      targetDscr: TARGET_DSCR
    };
  }

  function sampleInput() {
    return {
      name: "Sample 4-unit",
      address: "1234 Sample Avenue",
      city: "Riverside, CA 92501",
      yearBuilt: "1978",
      lot: "7,200 sf",
      buildingSqft: "3,200",
      listingUrl: "",
      units: [
        { label: "Unit 1", beds: "2/1", actualMonthly: 1706.25, proformaMonthly: 1850 },
        { label: "Unit 2", beds: "2/1", actualMonthly: 1706.25, proformaMonthly: 1850 },
        { label: "Unit 3", beds: "2/1", actualMonthly: 1706.25, proformaMonthly: 1850 },
        { label: "Unit 4", beds: "2/1", actualMonthly: 1706.25, proformaMonthly: 1850 }
      ],
      price: 878000,
      downPct: 25,
      rate: 7,
      termYears: 30,
      closingMode: "pct",
      closingPct: 2.5,
      closingDollars: 0,
      rehab: 0,
      upfrontReserves: 0,
      vacancyPct: 5,
      taxMode: "pct",
      taxPct: 1.1,
      taxesAnnual: 0,
      insuranceAnnual: 4800,
      maintenanceAnnual: 4000,
      managementMode: "pct",
      managementPct: 8,
      managementAnnual: 0,
      replacementReservesAnnual: 1200,
      utilitiesAnnual: 0,
      rentGrowthPct: 3,
      expenseGrowthPct: 2,
      exitCapPct: 6,
      exitCostPct: 5,
      holdYears: 5,
      downsideVacancyAdd: 3,
      downsideRentGrowthPct: 0,
      downsideExpenseGrowthAdd: 1,
      downsideExitCapAdd: 0.5,
      sponsorFeePct: 0,
      partners: [
        { name: "Sponsor", capital: 60000, cashShare: 25, profitShare: 40 },
        { name: "Investor", capital: 181450, cashShare: 75, profitShare: 60 }
      ],
      plan: "Keep the four tenants in place and raise rents toward pro forma as leases turn. Light turnover in year 1. No ADU in the base case. Target a 45-day close.",
      risks: "Local rent rules can limit turnover increases. A roof or sewer repair would use the reserves. Vacancy above 5% or a rate above 7% pushes DSCR further under 1.20. A higher exit cap is the main sale risk."
    };
  }

  return {
    TARGET_DSCR: TARGET_DSCR,
    cents: cents,
    monthlyPayment: monthlyPayment,
    amortize: amortize,
    grossRent: grossRent,
    evaluate: evaluate,
    irr: irr,
    equityMultiple: equityMultiple,
    sampleInput: sampleInput
  };
});
