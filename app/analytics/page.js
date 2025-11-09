import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { readQuestions } from "@/lib/question-store";

export default async function AnalyticsPage() {
  const questions = await readQuestions();
  return <AnalyticsDashboard questions={questions} />;
}
