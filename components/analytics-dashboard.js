"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

const PAGE_CONTAINER_CLASSES =
  "mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:py-12";
const difficultyPalette = {
  easy: "bg-emerald-500",
  medium: "bg-amber-500",
  hard: "bg-rose-500",
  unknown: "bg-slate-400",
};

function normalizeQuestion(question, index) {
  const metadata = question?.metadata ?? {};

  return {
    id: String(question?.id || question?.questionNumber || index + 1),
    subject: metadata.subject || "general",
    difficulty: metadata.difficulty || "unknown",
    year: metadata.year?.toString() || "",
    exam: metadata.exam?.toString() || "",
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
  };
}

function buildCountMap(items, key) {
  const counts = new Map();

  items.forEach((item) => {
    const value = item[key] || "Not specified";
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function AnalyticsDashboard({ questions = [] }) {
  const normalized = useMemo(
    () => questions.map((question, index) => normalizeQuestion(question, index)),
    [questions],
  );

  const years = useMemo(() => {
    const set = new Set();
    normalized.forEach((question) => {
      if (question.year) {
        set.add(question.year);
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [normalized]);

  const exams = useMemo(() => {
    const set = new Set();
    normalized.forEach((question) => {
      if (question.exam) {
        set.add(question.exam);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [normalized]);

  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedExam, setSelectedExam] = useState("all");

  const filtered = useMemo(
    () =>
      normalized.filter((question) => {
        if (selectedYear !== "all" && question.year !== selectedYear) {
          return false;
        }
        if (selectedExam !== "all" && question.exam !== selectedExam) {
          return false;
        }
        return true;
      }),
    [normalized, selectedExam, selectedYear],
  );

  const subjectBreakdown = useMemo(
    () => buildCountMap(filtered, "subject"),
    [filtered],
  );
  const examBreakdown = useMemo(
    () => buildCountMap(filtered, "exam"),
    [filtered],
  );
  const yearBreakdown = useMemo(
    () => buildCountMap(filtered, "year"),
    [filtered],
  );

  const difficultyBreakdown = useMemo(() => {
    const counts = filtered.reduce(
      (acc, question) => {
        const key = question.difficulty || "unknown";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {
        easy: 0,
        medium: 0,
        hard: 0,
        unknown: 0,
      },
    );

    return Object.entries(counts).map(([key, count]) => ({
      key,
      count,
      percentage: filtered.length
        ? Math.round((count / filtered.length) * 100)
        : 0,
    }));
  }, [filtered]);

  const totalQuestions = normalized.length;
  const filteredExamCount = new Set(
    filtered.map((question) => question.exam).filter(Boolean),
  ).size;
  const filteredYearCount = new Set(
    filtered.map((question) => question.year).filter(Boolean),
  ).size;
  const activeFilters =
    selectedYear !== "all" || selectedExam !== "all" ? "Active filters" : "";

  return (
    <div className={PAGE_CONTAINER_CLASSES}>
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
          Analytics
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Question insights dashboard
        </h1>
        <p className="text-sm text-gray-600">
          {totalQuestions} total questions captured.{" "}
          {filtered.length === totalQuestions
            ? "Showing all entries."
            : `Showing ${filtered.length} after filters.`}
        </p>
      </header>

      <section className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label
              htmlFor="analytics-year"
              className="text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Year
            </label>
            <select
              id="analytics-year"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <option value="all">All years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="analytics-exam"
              className="text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Exam
            </label>
            <select
              id="analytics-exam"
              value={selectedExam}
              onChange={(event) => setSelectedExam(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <option value="all">All exams</option>
              {exams.map((exam) => (
                <option key={exam} value={exam}>
                  {exam}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setSelectedExam("all");
                setSelectedYear("all");
              }}
              disabled={selectedYear === "all" && selectedExam === "all"}
            >
              Clear filters
            </Button>
          </div>
        </div>
        {activeFilters ? (
          <div className="flex flex-wrap items-center gap-3 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-sky-700">
            {selectedYear !== "all" ? (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                Year: {selectedYear}
              </span>
            ) : null}
            {selectedExam !== "all" ? (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                Exam: {selectedExam}
              </span>
            ) : null}
          </div>
        ) : null}
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total questions",
              value: totalQuestions,
            },
            {
              label: "Matching filters",
              value: filtered.length,
            },
            {
              label: "Subjects covered",
              value: subjectBreakdown.length,
            },
            {
              label: "Distinct exams",
              value: filteredExamCount,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Difficulty split
              </p>
              <p className="text-sm text-gray-600">
                Share of filtered questions per difficulty
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {filtered.length} total
            </span>
          </div>
          <div className="space-y-4">
            {difficultyBreakdown.map((item) => (
              <div key={item.key}>
                <div className="mb-1 flex items-center justify-between text-sm font-medium text-gray-700">
                  <span className="capitalize">{item.key}</span>
                  <span>
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full ${difficultyPalette[item.key] ?? difficultyPalette.unknown}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Subject spotlight
            </p>
            <p className="text-sm text-gray-600">
              Top subjects by question volume (filtered)
            </p>
          </div>
          {subjectBreakdown.length === 0 ? (
            <p className="text-sm text-gray-500">
              No questions available for the current filters.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {subjectBreakdown.slice(0, 6).map((subject) => (
                <li
                  key={subject.label}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium capitalize text-gray-900">
                      {subject.label}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      {(subject.count / Math.max(filtered.length, 1) * 100).toFixed(1)}%
                      {" of filtered"}
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">
                    {subject.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Exam coverage
            </p>
            <p className="text-sm text-gray-600">
              Distribution of visible questions per exam
            </p>
          </div>
          {examBreakdown.length === 0 ? (
            <p className="text-sm text-gray-500">
              No exam information for the current filters.
            </p>
          ) : (
            <ul className="space-y-3">
              {examBreakdown.slice(0, 6).map((exam) => (
                <li
                  key={exam.label}
                  className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {exam.label === "Not specified" ? "Unspecified exam" : exam.label}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      {(exam.count / Math.max(filtered.length, 1) * 100).toFixed(1)}%
                      {" of filtered"}
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">
                    {exam.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Year timeline
              </p>
              <p className="text-sm text-gray-600">
                Visible questions per year
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {filteredYearCount} years
            </span>
          </div>
          {yearBreakdown.length === 0 ? (
            <p className="text-sm text-gray-500">
              No year metadata for the selected filters.
            </p>
          ) : (
            <ul className="space-y-2">
              {yearBreakdown.slice(0, 8).map((year) => (
                <li
                  key={year.label}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2"
                >
                  <span className="font-medium text-gray-800">
                    {year.label === "Not specified" ? "Unspecified year" : year.label}
                  </span>
                  <span className="text-base font-semibold text-gray-900">
                    {year.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
