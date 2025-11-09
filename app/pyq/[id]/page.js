"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { QuestionRenderer } from "@/components/questionsrender";
import questions from "@/data/data.json";

export default function QuestionDetailPage() {
  const params = useParams();
  const requestedId = params?.id ? decodeURIComponent(params.id) : "";
  console.log("requestedId", requestedId);
  const questionIndex = questions.findIndex(
    (item) => String(item?.id) === requestedId,
  );
  const question = questions[questionIndex];
  const previousQuestion =
    questionIndex > 0 ? questions[questionIndex - 1] : null;
  const nextQuestion =
    questionIndex >= 0 && questionIndex < questions.length - 1
      ? questions[questionIndex + 1]
      : null;

  if (!question) {
    return (
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <div>
          <Link
            href="/"
            className="text-sm font-medium text-sky-600 transition hover:text-sky-800"
          >
            Back to list
          </Link>
        </div>

        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Question not found.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <div>
        <Link
          href="/"
          className="text-sm font-medium text-sky-600 transition hover:text-sky-800"
        >
          Back to list
        </Link>
      </div>

      <QuestionRenderer question={question} />

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm font-medium text-sky-700 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {previousQuestion
            ? (
              <Link
                href={`/pyq/${encodeURIComponent(previousQuestion.id)}`}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sky-700 transition hover:border-sky-300 hover:text-sky-900"
              >
                ← Previous question
              </Link>
            )
            : (
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Start of list
              </span>
            )}
        </div>
        <div className="text-center text-xs uppercase tracking-wide text-slate-500 sm:text-right">
          Question {questionIndex + 1} of {questions.length}
        </div>
        <div className="text-right">
          {nextQuestion
            ? (
              <Link
                href={`/pyq/${encodeURIComponent(nextQuestion.id)}`}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sky-700 transition hover:border-sky-300 hover:text-sky-900"
              >
                Next question →
              </Link>
            )
            : (
              <span className="text-xs uppercase tracking-wide text-slate-400">
                End of list
              </span>
            )}
        </div>
      </div>
    </main>
  );
}
