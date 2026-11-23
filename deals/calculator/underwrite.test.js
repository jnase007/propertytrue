#!/usr/bin/env node
"use strict";

var assert = require("assert");
var uw = require("./underwrite.js");

var failures = 0;

function check(name, fn) {
  try {
    fn();
    console.log("ok  " + name);
  } catch (err) {
    failures += 1;
    console.error("FAIL " + name);
    console.error("     " + (err && err.message ? err.message : err));
  }
}

function close(actual, expected, tol) {
  assert.ok(isFinite(actual), "expected a finite number, got " + actual);
  assert.ok(Math.abs(actual - expected) <= tol, actual + " not within " + tol + " of " + expected);
}

check("IRR of -100 then +110 is 10%", function () {
  close(uw.irr([-100, 110]), 0.1, 1e-6);
});

check("30-year 7% payment factor is the standard mortgage constant", function () {
  var payment = uw.monthlyPayment(100000, 7, 30);
  close(payment, 665.3, 0.05);
});

check("sample 4-unit $878,000 / 25% down / 7% / $81,900 actual rent", function () {
  var input = uw.sampleInput();
  var result = uw.evaluate(input);
  var actualRent = uw.grossRent(input.units, "actual");
  close(actualRent, 81900, 0.01);
  assert.strictEqual(result.units, 4);
  close(result.actual.debt.loan, 878000 * 0.75, 0.02);
  close(result.actual.debt.downPayment, 878000 * 0.25, 0.02);
  close(result.actual.op.taxes, 878000 * 0.011, 0.02);
  close(result.actual.uses.closing, 878000 * 0.025, 0.02);
  close(result.actual.uses.cashNeeded, 878000 * 0.25 + 878000 * 0.025, 0.05);

  var noi = result.actual.op.noi;
  var pi = result.actual.debt.annualPI;
  assert.ok(noi > 40000 && noi < 70000, "NOI " + noi + " is not a sane annual figure");
  assert.ok(pi > 45000 && pi < 60000, "P&I " + pi + " is not a sane 7% payment");
  assert.ok(result.actual.dscr > 0.7 && result.actual.dscr < 1.15, "DSCR " + result.actual.dscr + " is not sane for this deal");
  assert.strictEqual(result.actual.pass, false, "this sample should fail the 1.20 DSCR test");
  close(result.actual.dscr, noi / pi, 1e-9);
  close(result.actual.cashFlow, noi - pi, 0.02);

  var yieldBase = input.price + result.actual.uses.closing + result.actual.uses.rehab;
  close(result.actual.allCashYield, noi / yieldBase, 1e-9);
  close(result.actual.capRate, noi / input.price, 1e-9);

  assert.ok(result.maxPrice.price > 0, result.maxPrice.reason || "missing max price");
  assert.ok(result.maxPrice.price < input.price, "max DSCR price should be under the ask on this sample");

  var sized = JSON.parse(JSON.stringify(input));
  sized.price = result.maxPrice.price;
  var atMax = uw.evaluate(sized);
  close(atMax.actual.dscr, 1.2, 0.005);

  assert.ok(result.proforma.dscr > result.actual.dscr, "pro forma rents should produce a higher DSCR");
  assert.ok(result.downside.rows[0].noi < result.base.rows[0].noi, "downside NOI should be lower");

  var paid = result.base.rows.reduce(function (sum, row) { return sum + row.principalPaid; }, 0);
  close(result.actual.debt.loan - result.base.rows[4].endingBalance, paid, 0.1);
  assert.ok(result.base.rows[4].endingBalance < result.actual.debt.loan);
  assert.strictEqual(result.base.rows.length, 5);
  assert.ok(isFinite(result.base.irr), "base IRR should be a number");
  assert.ok(result.base.equityMultiple > 0);

  console.log("     NOI " + noi.toFixed(2) +
    "  P&I " + pi.toFixed(2) +
    "  DSCR " + result.actual.dscr.toFixed(3) +
    "  max price " + Math.round(result.maxPrice.price) +
    "  year-1 CF " + result.actual.cashFlow.toFixed(2) +
    "  CoC " + (result.actual.coc * 100).toFixed(2) + "%" +
    "  cap " + (result.actual.capRate * 100).toFixed(2) + "%" +
    "  all-cash " + (result.actual.allCashYield * 100).toFixed(2) + "%" +
    "  IRR " + (result.base.irr * 100).toFixed(2) + "%" +
    "  EM " + result.base.equityMultiple.toFixed(2) + "x");
});

check("upfront reserves change cash needed and cash-on-cash, not all-cash yield", function () {
  var input = uw.sampleInput();
  var base = uw.evaluate(input);
  input.upfrontReserves = 10000;
  var next = uw.evaluate(input);
  close(next.actual.uses.cashNeeded, base.actual.uses.cashNeeded + 10000, 0.02);
  close(next.actual.allCashYield, base.actual.allCashYield, 1e-9);
  assert.ok(next.actual.coc !== base.actual.coc);
});

check("sponsor fee is paid to partner 1 and increases cash needed", function () {
  var input = uw.sampleInput();
  input.sponsorFeePct = 1;
  var result = uw.evaluate(input);
  close(result.jvBase.fee, 8780, 0.02);
  close(result.actual.uses.cashNeeded, 878000 * 0.275 + 8780, 0.05);
  close(result.jvBase.partners[0].feeReceived, 8780, 0.02);
  assert.strictEqual(result.jvBase.partners[1].feeReceived, 0);
});

check("principal paydown on the sample loan is positive in year 1", function () {
  var result = uw.evaluate(uw.sampleInput());
  assert.ok(result.base.rows[0].principalPaid > 1000);
  assert.ok(result.base.rows[0].interest > result.base.rows[0].principalPaid);
});

if (failures) {
  console.error(failures + " failed");
  process.exit(1);
}
console.log("all tests passed");
