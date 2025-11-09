"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

function normalizeQuestion(question, index) {
  const fallbackTitle =
    question?.content?.title || question?.question || `Question ${index + 1}`;
  const prompt =
    question?.content?.question ||
    question?.content?.simpleText ||
    question?.question ||
    question?.content?.description ||
    "";

  return {
    id: String(question?.id || question?.questionNumber || index + 1),
    title: fallbackTitle,
    prompt,
    difficulty: question?.metadata?.difficulty || "unknown",
    subject: question?.metadata?.subject || "general",
    year: question?.metadata?.year || question?.metadata?.exam || "",
  };
}

const PAGE_SIZE = 10;

export function ProblemDashboard({ questions = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const problems = useMemo(
    () =>
      questions.map((question, index) => normalizeQuestion(question, index)),
    [questions],
  );

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) {
      return problems;
    }

    return problems.filter((problem) => {
      const haystack =
        `${problem.title} ${problem.prompt} ${problem.subject} ${problem.difficulty}`.toLowerCase();
      return haystack.includes(searchTerm.trim().toLowerCase());
    });
  }, [problems, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const visibleProblems = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const displayedCount = visibleProblems.length;
  const startDisplay = filtered.length === 0 ? 0 : pageStart + 1;
  const endDisplay =
    filtered.length === 0 ? 0 : pageStart + displayedCount;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
          Question bank
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Browse every saved question
        </h1>
        <p className="text-sm text-gray-600">
          Showing{" "}
          {filtered.length === 0
            ? 0
            : `${startDisplay}-${endDisplay}`}{" "}
          of {filtered.length} matching entries (out of {problems.length} stored
          items). Use the search box to instantly filter by title, prompt,
          subject, or difficulty.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by keyword, subject, or difficulty"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        />
        {searchTerm
          ? <Button
              type="button"
              variant="outline"
              onClick={() => setSearchTerm("")}
            >
              Clear search
            </Button>
          : null}
      </div>

      <ul className="space-y-3">
        {filtered.length === 0
          ? <li className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
              No questions match your search. Try a different phrase or clear
              the filter.
            </li>
          : visibleProblems.map((problem) => (
              <li
                key={problem.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      #{problem.id}
                    </div>
                    <Link
                      href={`/pyq/${problem.id}`}
                      className="text-lg font-medium text-sky-700 hover:underline"
                    >
                      {problem.title}
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      {problem.subject}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                      {problem.difficulty}
                    </span>
                    {problem.year
                      ? <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                          {problem.year}
                        </span>
                      : null}
                  </div>
                </div>
                {problem.prompt
                  ? <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                      {problem.prompt}
                    </p>
                  : null}
              </li>
            ))}
      </ul>

      {filtered.length > 0
        ? <div className="flex flex-col justify-between gap-3 border-t border-gray-200 pt-4 text-sm text-gray-600 sm:flex-row sm:items-center">
            <div>
              Page {safePage} of {totalPages} | Showing up to {PAGE_SIZE} per
              page
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage === 1}
              >
                Previous
              </Button>
              <span className="text-xs uppercase tracking-wide text-gray-500">
                {startDisplay}-{endDisplay}
              </span>
              <Button
                variant="outline"
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={safePage === totalPages || filtered.length === 0}
              >
                Next
              </Button>
            </div>
          </div>
        : null}
    </div>
  );
}
