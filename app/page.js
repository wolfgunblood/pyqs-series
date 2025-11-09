import { ProblemDashboard } from "@/components/problem-dashboard";
import { readQuestions } from "@/lib/question-store";

export default async function Home() {
  const questions = await readQuestions();
  return <ProblemDashboard questions={questions} />;
}
