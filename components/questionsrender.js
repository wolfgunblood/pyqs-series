"use client";

import { useState } from "react";

function buildQuestionText(question) {
  const primary =
    question?.content?.question ||
    question?.content?.simpleText ||
    question?.question ||
    question?.prompt;
  const secondary =
    question?.content_hi?.question ||
    question?.content_hi?.simpleText ||
    question?.question_hi;

  return { primary, secondary };
}

export function QuestionRenderer({ question }) {
  const [selected, setSelected] = useState("");

  if (!question) {
    return null;
  }

  const { primary, secondary } = buildQuestionText(question);
  const options = question?.options ?? [];
  const optionsHi = question?.options_hi ?? [];
  const correctAnswer = question?.correctAnswer?.trim();
  const showExplanation = Boolean(selected);
  const isCorrect =
    showExplanation &&
    correctAnswer &&
    selected.trim().toLowerCase() === correctAnswer.toLowerCase();

  const explanationColor = isCorrect
    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
    : "border-rose-300 bg-rose-50 text-rose-900";

  const explanationFallback = isCorrect
    ? "Great job! That is the correct answer."
    : correctAnswer
    ? `Correct answer: ${correctAnswer}`
    : "Review the material and try again.";

  return (
    <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Question
        </p>

        {question?.type === "multiple-statement-question" &&
        question.content?.statements?.length ? (
          <div className="space-y-3">
            {question.content.statements.map((item, index) => (
              <div
                key={`${question.id}-statement-${item.label ?? index}`}
                className="flex gap-3 rounded-lg bg-gray-50 p-3"
              >
                <span className="flex-shrink-0 font-semibold text-gray-900">
                  {item.label ? `${item.label}.` : `Statement ${index + 1}:`}
                </span>
                <p className="text-gray-700 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        ) : null}

        {question?.type === "statement-analysis" && (
          <div className="space-y-4">
            {question.content?.statements?.length ? (
              <div className="space-y-4 border-l-2 border-gray-200 pl-4">
                {question.content.statements.map((item, index) => (
                  <div
                    key={`${question.id}-roman-${index}`}
                    className="leading-relaxed"
                  >
                    <span className="font-semibold text-slate-900">
                      Statement {item.label} :
                    </span>
                    <div className="ml-8 mt-1">
                      <p className="text-slate-700 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
        {primary ? (
          <p className="text-base leading-relaxed text-slate-900">{primary}</p>
        ) : null}
        {secondary ? (
          <p className="text-sm leading-relaxed text-slate-600">{secondary}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Choose an option
        </p>
        <div className="space-y-3">
          {options.length === 0 ? (
            <p className="text-sm text-slate-500">Options unavailable.</p>
          ) : (
            options.map((option, index) => {
              const optionText = option?.trim() || `Option ${index + 1}`;
              const optionId = `${question.id}-option-${index}`;
              const secondaryOption = optionsHi[index];

              return (
                <label
                  key={optionId}
                  htmlFor={optionId}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm transition hover:border-slate-400 ${
                    selected === option
                      ? "border-slate-400"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    id={optionId}
                    name={`answer-${question.id}`}
                    value={option}
                    checked={selected === option}
                    onChange={(event) => setSelected(event.target.value)}
                    className="mt-1 h-4 w-4 border-slate-400 text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{optionText}</p>
                    {secondaryOption ? (
                      <p className="text-xs text-slate-600">
                        {secondaryOption}
                      </p>
                    ) : null}
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>

      {showExplanation ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${explanationColor}`}
        >
          <p className="font-semibold">{isCorrect ? "Correct" : "Incorrect"}</p>
          <p className="mt-1">{question?.explanation || explanationFallback}</p>
        </div>
      ) : null}
    </article>
  );
}
