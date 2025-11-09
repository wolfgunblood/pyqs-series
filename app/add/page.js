import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PayloadEditor } from "@/components/payload-editor";
import { Button } from "@/components/ui/button";

const dataFile = path.join(process.cwd(), "data", "data.json");

const sampleQuestion = `{
  "type": "simple-multiple-choice",
  "content": {
    "title": "Militant nationalist school of thought in India",
    "question": "Who among the following did not represent the militant nationalist school of thought in India?"
  },
  "options": [
    "(a) Ashwini Kumar Dutt",
    "(b) Vishnushastri Chiplunkar",
    "(c) Krishna Kumar Mitra",
    "(d) Lala Lajpat Rai"
  ],
  "correctAnswer": "(c) Krishna Kumar Mitra",
  "explanation": "Krishna Kumar Mitra was associated with the moderate nationalist school, while others such as Ashwini Kumar Dutt, Vishnushastri Chiplunkar, and Lala Lajpat Rai were prominent militant nationalists advocating assertive methods for India's independence.",
  "metadata": {
    "difficulty": "easy",
    "subject": "modern_history",
    "tags": ["UPSC", "EPFO", "History", "Modern India", "National Movement", "Previous Year", "Conceptual"],
    "exam": "EPFO",
    "year": "2021",
    "similarQuestions": []
  }
}`;

async function loadQuestions() {
  try {
    const file = await readFile(dataFile, "utf8");
    if (!file.trim()) {
      return [];
    }

    const parsed = JSON.parse(file);

    if (!Array.isArray(parsed)) {
      throw new Error("data.json must contain an array of questions");
    }

    return parsed;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function persistQuestions(questions) {
  await writeFile(dataFile, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
}

function buildRedirectUrl(params) {
  const search = new URLSearchParams(params);
  return `/add?${search.toString()}`;
}

function getField(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function addQuestion(formData) {
  "use server";

  const payload = getField(formData, "payload");

  if (!payload) {
    redirect(
      buildRedirectUrl({
        error: "Paste a JSON question payload before submitting",
      }),
    );
  }

  let parsedPayload;
  try {
    parsedPayload = JSON.parse(payload);
  } catch (error) {
    console.error("Failed to parse incoming question payload", error);
    redirect(
      buildRedirectUrl({
        error: "Invalid JSON. Please double-check the payload.",
      }),
    );
  }

  if (
    !parsedPayload ||
    typeof parsedPayload !== "object" ||
    Array.isArray(parsedPayload)
  ) {
    redirect(
      buildRedirectUrl({
        error: "Payload must be a JSON object (not an array).",
      }),
    );
  }

  let questions;
  try {
    questions = await loadQuestions();
  } catch (error) {
    console.error("Failed to read data.json", error);
    redirect(
      buildRedirectUrl({
        error: "Unable to read data file. Check server logs.",
      }),
    );
  }

  const newId = randomUUID();

  const newQuestion = {
    ...parsedPayload,
    id: newId,
  };

  const updated = [...questions, newQuestion];

  try {
    await persistQuestions(updated);
  } catch (error) {
    console.error("Failed to write data.json", error);
    redirect(
      buildRedirectUrl({
        error: "Failed to update data file. Check server logs.",
      }),
    );
  }

  revalidatePath("/");
  revalidatePath("/pyq");
  revalidatePath(`/pyq/${newId}`);

  redirect(
    buildRedirectUrl({
      status: "success",
      id: String(newId),
    }),
  );
}

function Alert({ type = "info", children }) {
  const color =
    type === "error"
      ? "border-red-500/40 bg-red-500/10 text-red-700"
      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700";

  return (
    <p className={`rounded-md border px-4 py-3 text-sm ${color}`}>{children}</p>
  );
}

export default function AddQuestionPage({ searchParams }) {
  const statusParam = searchParams?.status;
  const errorParam = searchParams?.error;
  const createdId = searchParams?.id;

  return (
    <main className="mx-auto my-12 max-w-3xl space-y-8 px-4">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Question bank
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Add a new question
        </h1>
        <p className="text-muted-foreground text-sm">
          Paste a complete JSON object and we will append it to
          <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">
            data/data.json
          </code>
          with a fresh UUID. Use the editor controls below to load the provided
          sample, pretty/minify the payload, and submit when ready.
        </p>
      </header>

      {statusParam === "success" && createdId
        ? <Alert type="success">
            Question #{createdId} saved successfully.
          </Alert>
        : null}

      {errorParam ? <Alert type="error">{errorParam}</Alert> : null}

      <form
        action={addQuestion}
        className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <label htmlFor="payload" className="text-sm font-medium">
                Question JSON payload
              </label>
              <p className="text-xs text-muted-foreground">
                Paste the entire question object (without an <code>id</code>).
                Use the Pretty / Minify buttons to tidy the JSON, or Reset to
                load the sample question again.
              </p>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Save question
            </Button>
          </div>

          <PayloadEditor
            id="payload"
            name="payload"
            sample={sampleQuestion}
            helper="Pretty / Minify clean the JSON. Reset restores the sample question."
          />
        </div>
      </form>
    </main>
  );
}
