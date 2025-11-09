import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataFile = path.join(process.cwd(), "data", "data.json");

async function ensureQuestionsArray(raw) {
  if (!raw.trim()) {
    return [];
  }

  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    return parsed;
  }

  throw new Error("data.json must contain an array of questions");
}

export async function readQuestions() {
  try {
    const file = await readFile(dataFile, "utf8");
    return ensureQuestionsArray(file);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function writeQuestions(questions) {
  await writeFile(dataFile, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
}
