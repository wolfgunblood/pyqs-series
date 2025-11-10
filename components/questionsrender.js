"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
];

function hasValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (value && typeof value === "object") {
    return Object.keys(value).length > 0;
  }

  return Boolean(value);
}

function getLocalizedValue(question, language, baseKey, options = {}) {
  const { fallbackToOtherLanguage = true } = options;
  const suffix = language === "hi" ? "_hi" : "";
  const alternateSuffix = language === "hi" ? "" : "_hi";
  const primaryKey = `${baseKey}${suffix}`;
  const fallbackKey = `${baseKey}${alternateSuffix}`;

  const primary = question?.[primaryKey];
  if (hasValue(primary)) {
    return { value: primary, isFallback: false };
  }

  if (!fallbackToOtherLanguage) {
    return { value: undefined, isFallback: false };
  }

  const fallback = question?.[fallbackKey];
  if (hasValue(fallback)) {
    return { value: fallback, isFallback: true };
  }

  return { value: undefined, isFallback: false };
}

function getPromptText(question, content, language) {
  const contentFields = [
    content?.title,
    content?.question,
    content?.simpleText,
    content?.description,
  ];

  for (const field of contentFields) {
    if (typeof field === "string" && field.trim()) {
      return field.trim();
    }
  }

  const directKey = language === "hi" ? "question_hi" : "question";
  if (typeof question?.[directKey] === "string" && question[directKey].trim()) {
    return question[directKey].trim();
  }

  const fallbackContent =
    language === "hi" ? question?.content : question?.content_hi;
  const fallbackFields = [
    fallbackContent?.title,
    fallbackContent?.question,
    fallbackContent?.simpleText,
    fallbackContent?.description,
  ];

  for (const field of fallbackFields) {
    if (typeof field === "string" && field?.trim()) {
      return field.trim();
    }
  }

  return "";
}

export function QuestionRenderer({ question }) {
  const [selected, setSelected] = useState("");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    setSelected("");
  }, [language, question?.id]);

  if (!question) {
    return null;
  }

  const { value: localizedContentRaw, isFallback: isContentFallback } =
    getLocalizedValue(question, language, "content");
  const { value: localizedOptionsRaw, isFallback: isOptionsFallback } =
    getLocalizedValue(question, language, "options");
  const { value: localizedAnswerRaw } = getLocalizedValue(
    question,
    language,
    "correctAnswer"
  );
  const { value: localizedExplanationRaw } = getLocalizedValue(
    question,
    language,
    "explanation",
    { fallbackToOtherLanguage: false }
  );

  const content = localizedContentRaw ?? {};
  const prompt = getPromptText(question, content, language);
  const questionText =
    typeof content?.question === "string" && content.question.trim()
      ? content.question.trim()
      : prompt;
  const supplementalPrompt =
    typeof content?.prompt === "string" && content.prompt.trim()
      ? content.prompt.trim()
      : "";
  const statements = Array.isArray(content?.statements)
    ? content.statements
    : [];
  const options = Array.isArray(localizedOptionsRaw) ? localizedOptionsRaw : [];
  const correctAnswer =
    typeof localizedAnswerRaw === "string"
      ? localizedAnswerRaw.trim()
      : question?.correctAnswer?.trim();
  const explanationText =
    typeof localizedExplanationRaw === "string"
      ? localizedExplanationRaw.trim()
      : "";

  const showExplanation = Boolean(selected);
  const isCorrect =
    showExplanation &&
    correctAnswer &&
    selected.trim().toLowerCase() === correctAnswer.toLowerCase();

  const explanationColor = isCorrect
    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
    : "border-rose-300 bg-rose-50 text-rose-900";

  const explanationSupportText = isCorrect
    ? "Great job! That is the correct answer."
    : correctAnswer
    ? `Correct answer: ${correctAnswer}`
    : "Review the material and try again.";

  const languageLabel = language === "hi" ? "Hindi" : "English";
  const otherLanguageLabel = language === "hi" ? "English" : "Hindi";

  const explanationFallback = explanationText
    ? ""
    : `${languageLabel} explanation unavailable. ${explanationSupportText}`;

  const contentFallbackMessage = isContentFallback
    ? `${languageLabel} content unavailable - showing ${otherLanguageLabel} version.`
    : null;

  const optionsFallbackMessage =
    isOptionsFallback && options.length
      ? `${languageLabel} options unavailable - showing ${otherLanguageLabel} choices.`
      : null;

  return (
    <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Question
          </p>

          <div className="flex gap-2">
            {LANGUAGE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={language === option.value ? "default" : "outline"}
                onClick={() => setLanguage(option.value)}
                aria-pressed={language === option.value}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {contentFallbackMessage ? (
          <p className="text-xs text-amber-600">{contentFallbackMessage}</p>
        ) : null}
        {question?.type === "simple-multiple-choice" && questionText ? (
          <p className="text-base leading-relaxed text-slate-900">
            {questionText}
          </p>
        ) : null}
        {supplementalPrompt ? (
          <p className="text-base leading-relaxed text-slate-900">
            {supplementalPrompt}
          </p>
        ) : null}

        {question?.type === "multiple-statement-question" &&
        statements.length ? (
          <div className="space-y-3 py-2">
            {statements.map((item, index) => (
              <div
                key={`${question.id}-statement-${item.label ?? index}`}
                className="flex rounded-lg bg-gray-50 p-0.5"
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
            {statements.length ? (
              <div className="space-y-4 border-l-2 border-gray-200 pl-4">
                {statements.map((item, index) => (
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
      </div>
      {supplementalPrompt && questionText && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="font-semibold text-blue-900">{questionText}</p>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Choose an option
        </p>
        {optionsFallbackMessage ? (
          <p className="text-xs text-amber-600">{optionsFallbackMessage}</p>
        ) : null}
        <div className="space-y-3">
          {options.length === 0 ? (
            <p className="text-sm text-slate-500">Options unavailable.</p>
          ) : (
            options.map((option, index) => {
              const optionText = option?.trim() || `Option ${index + 1}`;
              const optionId = `${question.id}-option-${index}`;

              return (
                <label
                  key={optionId}
                  htmlFor={optionId}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm transition hover:border-slate-400 ${
                    selected === optionText
                      ? "border-slate-400"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    id={optionId}
                    name={`answer-${question.id}`}
                    value={optionText}
                    checked={selected === optionText}
                    onChange={() => setSelected(optionText)}
                    className="mt-1 h-4 w-4 border-slate-400 text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{optionText}</p>
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
          <p className="mt-1">{explanationText || explanationFallback}</p>
        </div>
      ) : null}
    </article>
  );
}
