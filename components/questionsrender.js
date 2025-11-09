import { Hash } from "lucide-react";

export const QuestionRenderer = ({ question, _questionNumber, _status }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
          <Hash className="h-3 w-3" />
          {question.id}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {question.title}
        </h3>
      </div>

      {/* Render only the section that matches the question.type */}
      <div className="pl-4 border-l-2 border-gray-200">
        {question.type === "multiple-choice-with-statements" &&
          question.content?.romanNumerals?.length > 0 && (
            <div className="space-y-4">
              {question.content.romanNumerals.map((item) => (
                <div
                  key={`${item?.numeral ?? ""}-${item?.text ?? ""}`}
                  className="leading-relaxed"
                >
                  <span className="font-semibold text-gray-900">
                    Statement {item.numeral} :
                  </span>
                  <div className="ml-8 mt-1">
                    <p className="text-gray-700 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        {question.type === "simple-multiple-choice" &&
          question.content?.simpleText?.trim() && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                {question.content.simpleText}
              </p>
            </div>
          )}
      </div>

      {/* Correct Answer */}
      {question.correctAnswer && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm mb-2">
            <span className="font-semibold text-green-800">
              Correct Answer:{" "}
            </span>
            <span className="text-green-700 font-medium">
              {question.correctAnswer}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
