"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import questions from "@/data/data.json";

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

export function ProblemDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const problems = useMemo(
    () =>
      questions.map((question, index) => normalizeQuestion(question, index)),
    [],
  );

  const filtered = problems.filter((problem) => {
    if (!searchTerm.trim()) {
      return true;
    }

    const haystack =
      `${problem.title} ${problem.prompt} ${problem.subject} ${problem.difficulty}`.toLowerCase();
    return haystack.includes(searchTerm.trim().toLowerCase());
  });

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
          Showing {filtered.length} of {problems.length} stored entries. Use the
          search box to instantly filter by title, prompt, subject, or
          difficulty.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
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
          : filtered.map((problem) => (
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
    </div>
  );
}
