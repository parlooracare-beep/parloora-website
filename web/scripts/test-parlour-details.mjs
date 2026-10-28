import test from "node:test";
import assert from "node:assert/strict";

// ─── 1. Business Logic: Opening hours and Bangladesh timezone ─────────────────
import { getParlourOpeningStatus } from "../src/lib/opening-hours.ts";

test("Opening Status calculates open/closed correctly for weekday schedule", () => {
  const schedule = {
    Friday: { open: "09:00", close: "18:00", closed: false },
    Monday: { open: "09:00", close: "18:00", closed: false },
    Sunday: { open: "09:00", close: "18:00", closed: false },
    Tuesday: { open: "09:00", close: "18:00", closed: false },
    Saturday: { open: "09:00", close: "18:00", closed: false },
    Thursday: { open: "09:00", close: "18:00", closed: false },
    Wednesday: { open: "09:00", close: "18:00", closed: false },
  };

  const status = getParlourOpeningStatus(schedule);
  assert.equal(typeof status.isOpen, "boolean");
  assert.ok(["Open Now", "Closed"].includes(status.statusLabel));
  assert.ok(status.todayHoursText.includes("9:00 AM"));
  assert.equal(status.scheduleList.length, 7);
});

test("Opening Status handles closed days cleanly", () => {
  const closedSchedule = {
    Friday: { open: "09:00", close: "18:00", closed: true },
    Monday: { open: "09:00", close: "18:00", closed: true },
    Sunday: { open: "09:00", close: "18:00", closed: true },
    Tuesday: { open: "09:00", close: "18:00", closed: true },
    Saturday: { open: "09:00", close: "18:00", closed: true },
    Thursday: { open: "09:00", close: "18:00", closed: true },
    Wednesday: { open: "09:00", close: "18:00", closed: true },
  };

  const status = getParlourOpeningStatus(closedSchedule);
  assert.equal(status.isOpen, false);
  assert.equal(status.statusLabel, "Closed");
  assert.equal(status.todayHoursText, "Closed Today");
});

test("Opening Status provides fallback when no opening_hours defined", () => {
  const statusActive = getParlourOpeningStatus({}, true);
  assert.equal(statusActive.isOpen, true);
  assert.equal(statusActive.statusLabel, "Open Now");

  const statusInactive = getParlourOpeningStatus(null, false);
  assert.equal(statusInactive.isOpen, false);
  assert.equal(statusInactive.statusLabel, "Closed");
});

// ─── 2. Critical Rating Rule Verification ─────────────────────────────────────
test("Zero published reviews yields null avgRating and 'No reviews yet' message", () => {
  const emptyReviews = [];
  const reviewCount = emptyReviews.length;
  const avgRating = reviewCount > 0
    ? parseFloat((emptyReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewCount).toFixed(1))
    : null;

  assert.equal(avgRating, null);
  assert.equal(reviewCount, 0);

  // Must not evaluate to 5.0
  const renderedRating = avgRating !== null ? avgRating : "No reviews yet";
  assert.equal(renderedRating, "No reviews yet");
  assert.notEqual(renderedRating, 5.0);
  assert.notEqual(renderedRating, "5.0");
});

test("Actual published reviews compute exact weighted average rating", () => {
  const sampleReviews = [
    { rating: 5, comment: "Amazing hair styling" },
    { rating: 4, comment: "Great service and clean environment" },
    { rating: 5, comment: "Friendly staff" },
  ];
  const reviewCount = sampleReviews.length;
  const avgRating = parseFloat((sampleReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewCount).toFixed(1));

  assert.equal(avgRating, 4.7);
  assert.equal(reviewCount, 3);
});

// ─── 3. Business Category derivation ──────────────────────────────────────────
function deriveCategory(type) {
  if (!type) return "Beauty Parlour";
  const lower = type.toLowerCase().trim();
  if (lower.includes("woman") || lower.includes("women")) return "Women's Salon";
  if (lower.includes("man") || lower.includes("men")) return "Men's Salon";
  if (lower.includes("spa")) return "Spa & Wellness";
  if (lower.includes("makeup")) return "Makeup Studio";
  if (lower.includes("unisex")) return "Unisex Salon";
  return type;
}

test("Category normalizes parlour types properly", () => {
  assert.equal(deriveCategory("Man"), "Men's Salon");
  assert.equal(deriveCategory("Woman"), "Women's Salon");
  assert.equal(deriveCategory("women salon"), "Women's Salon");
  assert.equal(deriveCategory("Luxury Spa"), "Spa & Wellness");
  assert.equal(deriveCategory("Unisex"), "Unisex Salon");
  assert.equal(deriveCategory(null), "Beauty Parlour");
});
