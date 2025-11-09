"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { QuestionRenderer } from "@/components/questionsrender";
import questions from "@/data/data.json";

export default function QuestionDetailPage() {
  const params = useParams();
  const requestedId = params?.id ? decodeURIComponent(params.id) : "";
  console.log("requestedId", requestedId);
  const question = questions.find((item) => String(item?.id) === requestedId);

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
    </main>
  );
}
