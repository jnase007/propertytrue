(function () {
  "use strict";

  var PIN = "3121";
  var DRAFT_KEY = "pt-underwrite-draft-v1";
  var DEALS_KEY = "pt-underwrite-deals-v1";
  var uw = window.PTUnderwrite;
  var state = { photo: "", showDownside: false, filling: false, status: "" };

  function $(id) { return document.getElementById(id); }
  function num(value) {
    var n = parseFloat(String(value == null ? "" : value).replace(/[^0-9.\-]/g, ""));
    return isFinite(n) ? n : 0;
  }
  function numEl(el) { return el ? num(el.value) : 0; }
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function money(n) {
    if (n == null || !isFinite(Number(n))) return "—";
    var v = Math.round(Number(n));
    return (v < 0 ? "-" : "") + "$" + Math.abs(v).toLocaleString("en-US");
  }
  function pct(n, digits) {
    if (n == null || !isFinite(n)) return "—";
    return (n * 100).toFixed(digits == null ? 1 : digits) + "%";
  }
  function ratio(n) {
    if (n == null || !isFinite(n)) return "—";
    return n.toFixed(2);
  }
  function signedClass(n) { return n < 0 ? "neg" : "pos"; }
  function safeSrc(src) {
    if (!src) return "";
    var s = String(src).trim();
    if (/^data:image\/(png|jpeg|jpg|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(s)) return s;
    try {
      var url = new URL(s);
      if (url.protocol === "https:" || url.protocol === "http:") return url.href;
    } catch (err) { /* not a url */ }
    return "";
  }

  function readPartners() {
    return Array.prototype.slice.call(document.querySelectorAll(".partner")).filter(function (row) {
      return !row.hidden;
    }).map(function (row) {
      return {
        name: row.querySelector(".p-name").value.trim() || "Partner",
        capital: numEl(row.querySelector(".p-capital")),
        cashShare: numEl(row.querySelector(".p-cash")),
        profitShare: numEl(row.querySelector(".p-profit"))
      };
    });
  }

  function readForm() {
    var units = [];
    for (var i = 0; i < 4; i++) {
      units.push({
        label: $("unitLabel" + i).value.trim() || ("Unit " + (i + 1)),
        beds: $("unitBeds" + i).value.trim(),
        actualMonthly: numEl($("unitActual" + i)),
        proformaMonthly: numEl($("unitProforma" + i))
      });
    }
    return {
      name: $("name").value.trim() || "Untitled deal",
      address: $("address").value.trim(),
      city: $("city").value.trim(),
      yearBuilt: $("yearBuilt").value.trim(),
      lot: $("lot").value.trim(),
      buildingSqft: $("buildingSqft").value.trim(),
      listingUrl: $("listingUrl").value.trim(),
      units: units,
      price: numEl($("price")),
      downPct: numEl($("downPct")),
      rate: numEl($("rate")),
      termYears: numEl($("termYears")) || 30,
      closingMode: $("closingFollow").checked ? "pct" : "dollars",
      closingPct: numEl($("closingPct")),
      closingDollars: numEl($("closingDollars")),
      rehab: numEl($("rehab")),
      upfrontReserves: numEl($("upfrontReserves")),
      vacancyPct: numEl($("vacancyPct")),
      taxMode: $("taxFollow").checked ? "pct" : "dollars",
      taxPct: numEl($("taxPct")),
      taxesAnnual: numEl($("taxesAnnual")),
      insuranceAnnual: numEl($("insuranceAnnual")),
      maintenanceAnnual: numEl($("maintenanceAnnual")),
      managementMode: $("mgmtFollow").checked ? "pct" : "dollars",
      managementPct: numEl($("managementPct")),
      managementAnnual: numEl($("managementAnnual")),
      replacementReservesAnnual: numEl($("replacementReservesAnnual")),
      utilitiesAnnual: numEl($("utilitiesAnnual")),
      rentGrowthPct: numEl($("rentGrowthPct")),
      expenseGrowthPct: numEl($("expenseGrowthPct")),
      exitCapPct: numEl($("exitCapPct")),
      exitCostPct: numEl($("exitCostPct")),
      holdYears: 5,
      downsideVacancyAdd: numEl($("downsideVacancyAdd")),
      downsideRentGrowthPct: numEl($("downsideRentGrowthPct")),
      downsideExpenseGrowthAdd: numEl($("downsideExpenseGrowthAdd")),
      downsideExitCapAdd: numEl($("downsideExitCapAdd")),
      sponsorFeePct: numEl($("sponsorFeePct")),
      partners: readPartners(),
      plan: $("plan").value.trim(),
      risks: $("risks").value.trim()
    };
  }

  function fillPartners(partners) {
    var rows = document.querySelectorAll(".partner");
    for (var i = 0; i < rows.length; i++) {
      var partner = partners[i];
      rows[i].hidden = !partner;
      if (!partner) continue;
      rows[i].querySelector(".p-name").value = partner.name || "";
      rows[i].querySelector(".p-capital").value = partner.capital || 0;
      rows[i].querySelector(".p-cash").value = partner.cashShare || 0;
      rows[i].querySelector(".p-profit").value = partner.profitShare || 0;
    }
    $("togglePartner").textContent = rows[2].hidden ? "Add a third partner" : "Remove third partner";
  }

  function fillForm(input) {
    state.filling = true;
    $("name").value = input.name || "";
    $("address").value = input.address || "";
    $("city").value = input.city || "";
    $("yearBuilt").value = input.yearBuilt || "";
    $("lot").value = input.lot || "";
    $("buildingSqft").value = input.buildingSqft || "";
    $("listingUrl").value = input.listingUrl || "";
    var units = input.units || [];
    for (var i = 0; i < 4; i++) {
      var unit = units[i] || {};
      $("unitLabel" + i).value = unit.label || ("Unit " + (i + 1));
      $("unitBeds" + i).value = unit.beds || "";
      $("unitActual" + i).value = unit.actualMonthly || 0;
      $("unitProforma" + i).value = unit.proformaMonthly || 0;
    }
    $("price").value = input.price || 0;
    $("downPct").value = input.downPct == null ? 25 : input.downPct;
    $("rate").value = input.rate == null ? 7 : input.rate;
    $("termYears").value = input.termYears || 30;
    $("closingFollow").checked = input.closingMode !== "dollars";
    $("closingPct").value = input.closingPct == null ? 2.5 : input.closingPct;
    $("closingDollars").value = input.closingDollars || 0;
    $("rehab").value = input.rehab || 0;
    $("upfrontReserves").value = input.upfrontReserves || 0;
    $("vacancyPct").value = input.vacancyPct == null ? 5 : input.vacancyPct;
    $("taxFollow").checked = input.taxMode !== "dollars";
    $("taxPct").value = input.taxPct == null ? 1.1 : input.taxPct;
    $("taxesAnnual").value = input.taxesAnnual || 0;
    $("insuranceAnnual").value = input.insuranceAnnual || 0;
    $("maintenanceAnnual").value = input.maintenanceAnnual || 0;
    $("mgmtFollow").checked = input.managementMode !== "dollars";
    $("managementPct").value = input.managementPct == null ? 8 : input.managementPct;
    $("managementAnnual").value = input.managementAnnual || 0;
    $("replacementReservesAnnual").value = input.replacementReservesAnnual || 0;
    $("utilitiesAnnual").value = input.utilitiesAnnual || 0;
    $("rentGrowthPct").value = input.rentGrowthPct == null ? 3 : input.rentGrowthPct;
    $("expenseGrowthPct").value = input.expenseGrowthPct == null ? 2 : input.expenseGrowthPct;
    $("exitCapPct").value = input.exitCapPct == null ? 6 : input.exitCapPct;
    $("exitCostPct").value = input.exitCostPct == null ? 5 : input.exitCostPct;
    $("downsideVacancyAdd").value = input.downsideVacancyAdd == null ? 3 : input.downsideVacancyAdd;
    $("downsideRentGrowthPct").value = input.downsideRentGrowthPct == null ? 0 : input.downsideRentGrowthPct;
    $("downsideExpenseGrowthAdd").value = input.downsideExpenseGrowthAdd == null ? 1 : input.downsideExpenseGrowthAdd;
    $("downsideExitCapAdd").value = input.downsideExitCapAdd == null ? 0.5 : input.downsideExitCapAdd;
    $("showDownside").checked = !!state.showDownside;
    $("sponsorFeePct").value = input.sponsorFeePct || 0;
    $("plan").value = input.plan || "";
    $("risks").value = input.risks || "";
    fillPartners(input.partners || []);
    state.filling = false;
    syncModes();
  }

  function syncModes() {
    $("closingDollarWrap").classList.toggle("hidden", $("closingFollow").checked);
    $("taxDollarWrap").classList.toggle("hidden", $("taxFollow").checked);
    $("mgmtDollarWrap").classList.toggle("hidden", $("mgmtFollow").checked);
  }

  function line(label, value, cls) {
    return "<tr><td>" + esc(label) + "</td><td class=\"" + (cls || "") + "\">" + value + "</td></tr>";
  }

  function verdictCard(label, value, detail, cls) {
    return "<div class=\"v-card " + (cls || "") + "\"><span>" + esc(label) + "</span><b>" + value + "</b><small>" + detail + "</small></div>";
  }

  function renderVerdict(input, result) {
    var actual = result.actual;
    var pass = actual.debt.annualPI > 0 ? actual.pass : null;
    var tone = pass == null ? "" : (pass ? "pass" : "fail");
    var tag = pass == null ? "NO LOAN" : (pass ? "PASS" : "FAIL");
    var gap = result.maxPrice.price == null ? "" : (input.price - result.maxPrice.price);
    var gapText = result.maxPrice.price == null
      ? esc(result.maxPrice.reason || "")
      : (gap > 1
        ? "Ask is " + money(gap) + " above the 1.20 price"
        : money(Math.abs(gap)) + " of room under the 1.20 price");
    var maxDetail = result.maxPrice.price == null ? "Not solvable" : "At " + input.downPct + "% down, " + input.rate + "% / " + input.termYears + " yr";
    $("verdict").innerHTML =
      "<div class=\"verdict-grid\">" +
        "<div class=\"v-card primary " + tone + "\"><span>DSCR vs 1.20 · actual rents</span><b>" + ratio(actual.dscr) + " <span class=\"tag\">" + tag + "</span></b><small>" + gapText + "</small></div>" +
        verdictCard("Cash needed", money(actual.uses.cashNeeded), "Down, closing, rehab, reserves, fee") +
        verdictCard("Year-1 cash flow", "<span class=\"" + signedClass(actual.cashFlow) + "\">" + money(actual.cashFlow) + "</span>", "NOI minus principal and interest") +
        verdictCard("Cash-on-cash", "<span class=\"" + signedClass(actual.coc) + "\">" + pct(actual.coc) + "</span>", "Year-1 cash flow / cash needed") +
        verdictCard("Max price for 1.20", money(result.maxPrice.price), maxDetail) +
      "</div>" +
      "<div class=\"submetrics\">" +
        "<div class=\"metric\"><span>NOI</span><b>" + money(actual.op.noi) + "</b><small>After vacancy and all expenses</small></div>" +
        "<div class=\"metric\"><span>Cap rate</span><b>" + pct(actual.capRate) + "</b><small>NOI / price</small></div>" +
        "<div class=\"metric\"><span>All-cash yield</span><b>" + pct(actual.allCashYield) + "</b><small>NOI / (price + closing + rehab)</small></div>" +
        "<div class=\"metric\"><span>Pro forma DSCR</span><b class=\"" + (result.proforma.pass ? "pos" : "neg") + "\">" + ratio(result.proforma.dscr) + "</b><small>Same expenses, pro forma rents</small></div>" +
      "</div>" +
      "<p class=\"def-line\">" + result.units + " unit" + (result.units === 1 ? "" : "s") + " · " + esc(input.address || "No address") +
        " · Loan " + money(actual.debt.loan) + " · P&amp;I " + money(actual.debt.monthlyPI) + "/mo · Verdict uses actual rents only.</p>";
  }

function opsTable(result, compact) {
  function pair(label, a, b, clsA) {
    return "<tr><td>" + label + "</td><td class=\"" + (clsA || "") + "\">" + a + "</td><td>" + b + "</td></tr>";
  }
  var a = result.actual;
  var p = result.proforma;
  var extra = compact ? "" : (
    pair("5-year IRR", pct(result.base.irr), pct(result.proformaBase.irr)) +
    pair("Equity multiple", isFinite(result.base.equityMultiple) ? result.base.equityMultiple.toFixed(2) + "x" : "—",
      isFinite(result.proformaBase.equityMultiple) ? result.proformaBase.equityMultiple.toFixed(2) + "x" : "—")
  );
  return "<div class=\"table-scroll\"><table><thead><tr><th></th><th>Actual</th><th>Pro forma</th></tr></thead><tbody>" +
    pair("Gross rent", money(a.op.gpr), money(p.op.gpr)) +
    pair("Vacancy", money(a.op.vacancyLoss), money(p.op.vacancyLoss)) +
    pair("Effective income", money(a.op.egi), money(p.op.egi)) +
    pair("Taxes", money(a.op.taxes), money(p.op.taxes)) +
    pair("Insurance", money(a.op.insurance), money(p.op.insurance)) +
    pair("Maintenance", money(a.op.maintenance), money(p.op.maintenance)) +
    pair("Management", money(a.op.management), money(p.op.management)) +
    pair("Replacement reserves", money(a.op.replacementReserves), money(p.op.replacementReserves)) +
    pair("Utilities", money(a.op.utilities), money(p.op.utilities)) +
    pair("NOI", money(a.op.noi), money(p.op.noi)) +
    pair("Principal and interest", money(a.debt.annualPI), money(p.debt.annualPI)) +
    pair("Cash flow", money(a.cashFlow), money(p.cashFlow), signedClass(a.cashFlow)) +
    pair("DSCR", ratio(a.dscr), ratio(p.dscr), a.pass ? "pos" : "neg") +
    pair("Cap rate", pct(a.capRate), pct(p.capRate)) +
    pair("Cash-on-cash", pct(a.coc), pct(p.coc)) +
    pair("All-cash yield", pct(a.allCashYield), pct(p.allCashYield)) +
    extra +
    "</tbody></table></div>";
}

  function usesTable(stack, debt) {
    return "<div class=\"table-scroll\"><table><tbody>" +
      line("Purchase price", money(stack.price)) +
      line("Down payment", money(stack.downPayment)) +
      line("Loan amount", money(stack.loan)) +
      line("Closing", money(stack.closing)) +
      line("Rehab", money(stack.rehab)) +
      line("Upfront reserves", money(stack.upfrontReserves)) +
      line("Sponsor fee", money(stack.sponsorFee)) +
      line("Cash needed", money(stack.cashNeeded)) +
      line("Monthly P&I", money(debt.monthlyPI)) +
      line("Annual P&I", money(debt.annualPI)) +
      "</tbody></table></div>";
  }

  function yearTable(projection) {
    var body = projection.rows.map(function (row) {
      return "<tr><td>" + row.year + "</td><td>" + money(row.gpr) + "</td><td>" + money(row.expenses) + "</td><td>" + money(row.noi) +
        "</td><td>" + money(row.debtService) + "</td><td class=\"" + signedClass(row.cashFlow) + "\">" + money(row.cashFlow) +
        "</td><td>" + money(row.principalPaid) + "</td><td>" + money(row.endingBalance) + "</td></tr>";
    }).join("");
    var a = projection.assumptions;
    var sale = projection.salePrice == null
      ? "<p class=\"note\">Exit price needs an exit cap above 0.</p>"
      : "<p class=\"note\">Year-5 sale " + money(projection.salePrice) +
        " · selling costs " + money(projection.sellingCosts) +
        " · net to equity " + money(projection.netSale) +
        " · IRR " + pct(projection.irr) +
        " · equity multiple " + (isFinite(projection.equityMultiple) ? projection.equityMultiple.toFixed(2) + "x" : "—") +
        ". Assumptions: vacancy " + a.vacancyPct + "%, rent growth " + a.rentGrowthPct + "%, expense growth " + a.expenseGrowthPct + "%, exit cap " + a.exitCapPct + "%.</p>";
    return "<div class=\"table-scroll\"><table><thead><tr><th>Year</th><th>Gross rent</th><th>Expenses</th><th>NOI</th><th>P&amp;I</th><th>Cash flow</th><th>Principal</th><th>Loan balance</th></tr></thead><tbody>" +
      body + "</tbody></table></div>" + sale;
  }

  function jvTable(split, cashNeeded, compact) {
    var warnings = "";
    if (Math.abs(split.cashShareSum - 100) > 0.05) {
      warnings += "<p class=\"warn\">Cash-flow shares total " + split.cashShareSum.toFixed(1) + "%. The rest is unallocated.</p>";
    }
    if (Math.abs(split.profitShareSum - 100) > 0.05) {
      warnings += "<p class=\"warn\">Profit shares total " + split.profitShareSum.toFixed(1) + "%. The rest is unallocated.</p>";
    }
    if (Math.abs(split.totalCapital - cashNeeded) > 1) {
      warnings += "<p class=\"warn\">Partner capital " + money(split.totalCapital) + " does not match cash needed " + money(cashNeeded) + ".</p>";
    }
    var body = split.partners.map(function (partner) {
      return "<tr><td>" + esc(partner.name) + "</td><td>" + money(partner.capital) + "</td><td>" + money(partner.feeReceived) +
        "</td><td>" + money(partner.netCashIn) + "</td><td>" + partner.cashShare + "%</td><td>" + partner.profitShare +
        "%</td><td class=\"" + signedClass(partner.year1) + "\">" + money(partner.year1) + "</td><td>" + money(partner.exitDistribution) +
        "</td><td class=\"" + signedClass(partner.exitProfit) + "\">" + money(partner.exitProfit) + "</td><td>" +
        (isFinite(partner.multiple) ? partner.multiple.toFixed(2) + "x" : "—") + "</td></tr>";
    }).join("");
if (compact) {
    body = split.partners.map(function (partner) {
      return "<tr><td>" + esc(partner.name) + "</td><td>" + money(partner.capital) + "</td><td>" + partner.cashShare +
        "%</td><td>" + partner.profitShare + "%</td><td class=\"" + signedClass(partner.year1) + "\">" + money(partner.year1) +
        "</td><td>" + money(partner.exitDistribution) + "</td><td>" +
        (isFinite(partner.multiple) ? partner.multiple.toFixed(2) + "x" : "—") + "</td></tr>";
    }).join("");
    return warnings + "<div class=\"table-scroll\"><table><thead><tr><th>Partner</th><th>Capital</th><th>CF</th><th>Profit</th><th>Year-1 CF</th><th>Exit check</th><th>Multiple</th></tr></thead><tbody>" +
      body + "</tbody></table></div>";
  }
  return warnings + "<div class=\"table-scroll\"><table><thead><tr><th>Partner</th><th>Capital</th><th>Fee</th><th>Net in</th><th>CF</th><th>Profit</th><th>Year-1 CF</th><th>Exit check</th><th>Exit profit</th><th>Multiple</th></tr></thead><tbody>" +
    body + "</tbody></table></div>";
}

  function renderResults(input, result) {
    var projection = state.showDownside ? result.downside : result.base;
    var split = state.showDownside ? result.jvDownside : result.jvBase;
    var down = result.downside.assumptions;
    $("results").innerHTML =
      "<section class=\"card\"><h2>Actual vs pro forma</h2><p class=\"hint\">The pass/fail above uses actual rent. Pro forma keeps the same vacancy rate, taxes, and other expenses, except percentage management, which follows income.</p>" +
        opsTable(result) + "</section>" +
      "<section class=\"card\"><h2>Cash needed and loan</h2>" + usesTable(result.actual.uses, result.actual.debt) + "</section>" +
      "<section class=\"card\"><h2>Five-year projection · " + (state.showDownside ? "downside" : "base") + "</h2>" +
        "<p class=\"note\">Downside (vacancy " + down.vacancyPct + "%, rent growth " + down.rentGrowthPct + "%, expense growth " + down.expenseGrowthPct + "%, exit cap " + down.exitCapPct +
        "%): year-1 NOI " + money(result.downside.rows[0].noi) + ", DSCR " + ratio(result.downside.rows[0].noi / (result.actual.debt.annualPI || NaN)) +
        ", IRR " + pct(result.downside.irr) + ", multiple " + (isFinite(result.downside.equityMultiple) ? result.downside.equityMultiple.toFixed(2) + "x" : "—") +
        ". Base IRR " + pct(result.base.irr) + ".</p>" +
        yearTable(projection) + "</section>" +
      "<section class=\"card\"><h2>Partner split · " + (state.showDownside ? "downside" : "base") + "</h2>" +
        jvTable(split, result.actual.uses.cashNeeded) +
        "<p class=\"hint\">Sponsor fee is paid at close to the first partner and is part of cash needed. It is not an operating expense. Equity multiple is cash returned divided by cash invested, with capital calls counted as invested.</p></section>" +
      "<section class=\"card\"><h2>Definitions</h2><p class=\"hint\">NOI is effective rent after vacancy, minus taxes, insurance, maintenance, management, replacement reserves, and utilities. DSCR is that NOI divided by annual principal and interest. All-cash yield is NOI divided by price plus closing plus rehab. Max price is solved so DSCR is 1.20 at the down payment and rate on this screen. Taxes scale with that price only while “taxes follow price” is on.</p></section>";
    $("closingHint").textContent = $("closingFollow").checked ? "Closing at this price: " + money(result.actual.uses.closing) : "Using the dollar closing cost.";
    $("taxHint").textContent = $("taxFollow").checked ? "Taxes at this price: " + money(result.actual.op.taxes) + " / year" : "Using the dollar tax amount.";
    $("mgmtHint").textContent = $("mgmtFollow").checked ? "Management on actual income: " + money(result.actual.op.management) + " / year" : "Using the dollar management amount.";
    $("rentHint").textContent = "Actual gross rent " + money(result.actual.op.gpr) + " / year · pro forma " + money(result.proforma.op.gpr) + " / year.";
  }

  function factList(input, result) {
    var bits = [];
    if (input.city) bits.push(input.city);
    if (result.units) bits.push(result.units + " units");
    if (input.yearBuilt) bits.push("Built " + input.yearBuilt);
    if (input.lot) bits.push("Lot " + input.lot);
    if (input.buildingSqft) bits.push(input.buildingSqft + " sf");
    var mix = input.units.filter(function (unit) {
      return unit.actualMonthly > 0 || unit.proformaMonthly > 0;
    }).map(function (unit) {
      return unit.label + (unit.beds ? " " + unit.beds : "") + " · actual " + money(unit.actualMonthly) + "/mo · pro forma " + money(unit.proformaMonthly) + "/mo";
    }).join("<br>");
    return "<p>" + esc(bits.join(" · ")) + "</p><p class=\"fine\">" + mix + "</p>";
  }

  function renderMemo(input, result) {
    var src = safeSrc(state.photo);
    var photo = src
      ? "<img class=\"memo-photo\" alt=\"" + esc(input.address || "Property photo") + "\" src=\"" + esc(src) + "\">"
      : "<div class=\"memo-photo\" style=\"display:flex;align-items:center;justify-content:center;color:#5b6577;font-weight:700;\">No photo</div>";
    var link = safeSrc(input.listingUrl);
    var actual = result.actual;
    var tone = actual.debt.annualPI > 0 && actual.pass ? "PASS" : (actual.debt.annualPI > 0 ? "FAIL" : "NO LOAN");
    var projection = result.base;
    $("memo").innerHTML =
      "<section class=\"sheet\"><div class=\"sheet-top\"><div><div class=\"memo-brand\">PROPERTY TRUE</div><p class=\"stamp\">Internal memo — not an offer of securities</p></div><div class=\"fine\">" + esc(input.name) + "<br>Year-1 actual rents</div></div>" +
      "<div class=\"sheet-id\" style=\"margin-top:0.7rem\">" + photo + "<div class=\"memo-facts\"><h1>" + esc(input.address || "Property") + "</h1>" + factList(input, result) +
      (link ? "<p class=\"fine\">Listing: " + esc(link) + "</p>" : "") + "</div></div>" +
      "<h2>Verdict</h2><div class=\"table-scroll\"><table><tbody>" +
      line("DSCR (actual)", ratio(actual.dscr) + " · " + tone) +
      line("Cash needed", money(actual.uses.cashNeeded)) +
      line("Year-1 cash flow", money(actual.cashFlow)) +
      line("Cash-on-cash", pct(actual.coc)) +
      line("Max price at DSCR 1.20", money(result.maxPrice.price)) +
      line("NOI / cap rate / all-cash yield", money(actual.op.noi) + " · " + pct(actual.capRate) + " · " + pct(actual.allCashYield)) +
      "</tbody></table></div>" +
      "<h2>Cash required</h2>" + usesTable(actual.uses, actual.debt) +
      "<h2>Year-1 operations</h2>" + opsTable(result, true) +
      "<p class=\"fine\">NOI is after vacancy, taxes, insurance, maintenance, management, replacement reserves, and utilities. DSCR = NOI / principal and interest. All-cash yield = NOI / (price + closing + rehab). The verdict uses actual rents.</p></section>" +
      "<section class=\"sheet\"><div class=\"memo-brand\">PROPERTY TRUE</div><p class=\"stamp\">Internal memo — not an offer of securities</p><h2>" + esc(input.address || "Five-year projection") + "</h2>" +
      yearTable(projection) +
      "<p class=\"fine\">Downside vacancy " + result.downside.assumptions.vacancyPct + "%, rent growth " + result.downside.assumptions.rentGrowthPct + "%, expense growth " + result.downside.assumptions.expenseGrowthPct + "%, exit cap " + result.downside.assumptions.exitCapPct + "%. Downside IRR " + pct(result.downside.irr) + ", multiple " + (isFinite(result.downside.equityMultiple) ? result.downside.equityMultiple.toFixed(2) + "x" : "—") + ".</p>" +
      "<h2>Partners</h2>" + jvTable(result.jvBase, actual.uses.cashNeeded, true) +
      "<h2>Plan</h2><p class=\"pre\">" + esc(input.plan || "—") + "</p>" +
      "<h2>Risks</h2><p class=\"pre\">" + esc(input.risks || "—") + "</p>" +
      "<p class=\"stamp\">Internal memo — not an offer of securities</p></section>";
  }

  function paintPhoto() {
    var src = safeSrc(state.photo);
    var img = $("photoPreview");
    img.src = src || "";
    img.alt = src ? ($("address").value || "Property photo") : "";
    $("photoBox").classList.toggle("has-photo", !!src);
  }

  function setStatus(text) {
    state.status = text || "";
    $("status").textContent = state.status;
  }

  function render() {
    if (!uw) return;
    syncModes();
    var input = readForm();
    var result = uw.evaluate(input);
    renderVerdict(input, result);
    renderResults(input, result);
    renderMemo(input, result);
    paintPhoto();
    $("sampleBanner").classList.toggle("hidden", input.name !== "Sample 4-unit");
  }

  function scheduleSave() {
    if (state.filling) return;
    clearTimeout(scheduleSave.timer);
    scheduleSave.timer = setTimeout(saveDraft, 400);
  }

  function payload() {
    var photo = safeSrc(state.photo);
    if (photo.length > 450000) photo = "";
    return { input: readForm(), photo: photo, showDownside: state.showDownside, savedAt: new Date().toISOString() };
  }

  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload()));
    } catch (err) {
      try {
        var data = payload();
        data.photo = "";
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
        setStatus("Numbers saved. The photo was too large for this browser.");
      } catch (err2) {
        setStatus("This browser could not store the deal.");
      }
    }
  }

  function loadDraft() {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); }
    catch (err) { return null; }
  }

  function readDeals() {
    try { return JSON.parse(localStorage.getItem(DEALS_KEY) || "[]"); }
    catch (err) { return []; }
  }

  function writeDeals(deals) {
    localStorage.setItem(DEALS_KEY, JSON.stringify(deals));
    paintDealSelect(deals);
  }

  function paintDealSelect(deals) {
    var current = $("dealSelect").value;
    $("dealSelect").innerHTML = "<option value=\"\">Saved deals</option>" + deals.map(function (deal, index) {
      return "<option value=\"" + index + "\">" + esc(deal.input.name || "Untitled") + "</option>";
    }).join("");
    if (current) $("dealSelect").value = current;
  }

  function applyRecord(record) {
    state.showDownside = !!(record && record.showDownside);
    state.photo = record && record.photo ? record.photo : "";
    $("photoUrl").value = state.photo.indexOf("data:") === 0 ? "" : state.photo;
    fillForm(record.input);
    render();
  }

  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var max = 1280;
        var scale = Math.min(1, max / Math.max(img.width, img.height));
        var canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that image."));
      };
      img.src = url;
    });
  }

  function setMemoMode(on) {
    document.body.classList.toggle("force-print", on);
    $("memo").setAttribute("aria-hidden", on ? "false" : "true");
    $("printBar").classList.toggle("hidden", !on);
    window.scrollTo(0, 0);
  }

  function unlock() {
    sessionStorage.setItem("pt-ops", "1");
    $("gate").classList.add("hidden");
    $("app").classList.remove("hidden");
    if (new URLSearchParams(location.search).get("print") === "1") setMemoMode(true);
  }

  function bind() {
    $("gateForm").addEventListener("submit", function (event) {
      event.preventDefault();
      if ($("pin").value.trim() === PIN) unlock();
      else {
        $("gateErr").textContent = "Wrong PIN";
        $("pin").value = "";
      }
    });
    $("dealForm").addEventListener("input", function () {
      if (state.filling) return;
      render();
      scheduleSave();
    });
    $("dealForm").addEventListener("change", function (event) {
      if (event.target && event.target.id === "showDownside") state.showDownside = event.target.checked;
      if (state.filling) return;
      render();
      scheduleSave();
    });
    $("photoFile").addEventListener("change", function () {
      var file = $("photoFile").files && $("photoFile").files[0];
      if (!file) return;
      compressImage(file).then(function (dataUrl) {
        state.photo = dataUrl;
        $("photoUrl").value = "";
        $("photoMsg").textContent = "Photo added from this device.";
        render();
        scheduleSave();
      }).catch(function () {
        $("photoMsg").textContent = "That file could not be used. Try a JPG or PNG.";
      });
    });
    $("photoUrl").addEventListener("change", function () {
      var src = safeSrc($("photoUrl").value);
      if ($("photoUrl").value.trim() && !src) {
        $("photoMsg").textContent = "Paste a direct image URL (https://…jpg or png). Listing pages are not fetched.";
        return;
      }
      state.photo = src;
      $("photoMsg").textContent = src ? "Using the image URL." : "";
      render();
      scheduleSave();
    });
    $("clearPhoto").addEventListener("click", function () {
      state.photo = "";
      $("photoUrl").value = "";
      $("photoFile").value = "";
      $("photoMsg").textContent = "Photo removed.";
      render();
      scheduleSave();
    });
    $("saveDeal").addEventListener("click", function () {
      var deals = readDeals();
      var record = payload();
      var name = record.input.name;
      var index = -1;
      for (var i = 0; i < deals.length; i++) if (deals[i].input.name === name) index = i;
      if (index >= 0) deals[index] = record;
      else deals.unshift(record);
      try {
        writeDeals(deals);
        setStatus("Saved “" + name + "” in this browser.");
      } catch (err) {
        record.photo = "";
        if (index >= 0) deals[index] = record;
        else deals[0] = record;
        try {
          writeDeals(deals);
          setStatus("Saved the numbers. The photo was too large to keep.");
        } catch (err2) {
          setStatus("Could not save. Browser storage is full.");
        }
      }
    });
    $("loadDeal").addEventListener("click", function () {
      var deals = readDeals();
      var index = Number($("dealSelect").value);
      if (!deals[index]) { setStatus("Choose a saved deal first."); return; }
      applyRecord(deals[index]);
      setStatus("Loaded “" + deals[index].input.name + "”.");
    });
    $("deleteDeal").addEventListener("click", function () {
      var deals = readDeals();
      var index = Number($("dealSelect").value);
      if (!deals[index]) { setStatus("Choose a saved deal first."); return; }
      var name = deals[index].input.name;
      deals.splice(index, 1);
      writeDeals(deals);
      setStatus("Deleted “" + name + "”.");
    });
    $("resetSample").addEventListener("click", function () {
      state.photo = "";
      state.showDownside = false;
      $("photoUrl").value = "";
      fillForm(uw.sampleInput());
      render();
      scheduleSave();
      setStatus("Sample 4-unit deal loaded.");
    });
    $("togglePartner").addEventListener("click", function () {
      var third = document.querySelector(".partner[data-partner=\"2\"]");
      third.hidden = !third.hidden;
      $("togglePartner").textContent = third.hidden ? "Add a third partner" : "Remove third partner";
      render();
      scheduleSave();
    });
    $("previewMemo").addEventListener("click", function () { setMemoMode(true); });
    $("backToEdit").addEventListener("click", function () { setMemoMode(false); });
    $("doPrint").addEventListener("click", function () { window.print(); });
    var preview = document.getElementById("photoPreview");
    preview.addEventListener("error", function () {
      if (!state.photo) return;
      $("photoMsg").textContent = "That image URL did not load. Upload a photo instead.";
      state.photo = "";
      $("photoBox").classList.remove("has-photo");
    });
  }

  function init() {
    if (!uw) {
      $("gateErr").textContent = "Calculator math failed to load.";
      return;
    }
    bind();
    paintDealSelect(readDeals());
    var draft = loadDraft();
    if (draft && draft.input) applyRecord(draft);
    else {
      fillForm(uw.sampleInput());
      render();
    }
    if (sessionStorage.getItem("pt-ops") === "1") unlock();
  }

  init();
})();
