import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { PayloadEditor } from "@/components/payload-editor";
import { Button } from "@/components/ui/button";

const dataFile = path.join(process.cwd(), "data", "data.json");

const sampleBatch = `[
  {
    "type": "simple-multiple-choice",
    "content": {
      "title": "Social Service League in Bombay",
      "question": "In 1911, who founded the Social Service League in Bombay?"
    },
    "options": [
      "(a) N. M. Joshi",
      "(b) B. G. Tilak",
      "(c) Annie Besant",
      "(d) G. S. Khaparde"
    ],
    "correctAnswer": "(a) N. M. Joshi",
    "explanation": "Narayan Malhar Joshi started the Social Service League to train volunteers for civic improvement.",
    "metadata": {
      "difficulty": "medium",
      "subject": "modern_history",
      "exam": "UPSC",
      "year": "2019",
      "tags": ["UPSC", "History", "PYQ"]
    }
  },
  {
    "type": "simple-multiple-choice",
    "content": {
      "title": "Directive Principles of State Policy",
      "question": "Which Article of the Indian Constitution deals with the promotion of international peace?"
    },
    "options": [
      "(a) Article 43",
      "(b) Article 45",
      "(c) Article 51",
      "(d) Article 39"
    ],
    "correctAnswer": "(c) Article 51",
    "explanation": "Article 51 urges the state to promote international peace and security.",
    "metadata": {
      "difficulty": "easy",
      "subject": "polity",
      "exam": "SSC",
      "year": "2018",
      "tags": ["SSC", "Polity", "Conceptual"]
    }
  }
]`;

async function loadQuestions() {
  try {
    const file = await readFile(dataFile, "utf8");
    if (!file.trim()) {
      return [];
    }

    const parsed = JSON.parse(file);
    if (!Array.isArray(parsed)) {
      throw new Error("data.json must contain an array at the root");
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
  return `/batch-add?${search.toString()}`;
}

function getField(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function addBatch(formData) {
  "use server";

  const payload = getField(formData, "payload");

  if (!payload) {
    redirect(
      buildRedirectUrl({
        error: "Paste a JSON array of questions before submitting.",
      }),
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(payload);
  } catch (error) {
    console.error("Failed to parse incoming batch payload", error);
    redirect(
      buildRedirectUrl({
        error: "Invalid JSON. Ensure the payload is a valid array.",
      }),
    );
  }

  if (!Array.isArray(parsed)) {
    redirect(
      buildRedirectUrl({
        error: "Payload must be a JSON array of question objects.",
      }),
    );
  }

  const cleanedBatch = parsed
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        console.warn(
          `Skipping entry at index ${index} because it is not an object.`,
        );
        return null;
      }

      const { id: _ignoredId, ...rest } = item;
      return {
        ...rest,
        id: randomUUID(),
      };
    })
    .filter(Boolean);

  if (cleanedBatch.length === 0) {
    redirect(
      buildRedirectUrl({
        error: "No valid question objects found in the array.",
      }),
    );
  }

  let existing;
  try {
    existing = await loadQuestions();
  } catch (error) {
    console.error("Failed to read data.json", error);
    redirect(
      buildRedirectUrl({
        error: "Unable to read existing data. Check server logs.",
      }),
    );
  }

  const updated = [...existing, ...cleanedBatch];

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

  redirect(
    buildRedirectUrl({
      status: "success",
      added: String(cleanedBatch.length),
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

export default function BatchAddPage({ searchParams }) {
  const statusParam = searchParams?.status;
  const errorParam = searchParams?.error;
  const addedCount = Number(searchParams?.added || 0);

  return (
    <main className="mx-auto my-12 max-w-3xl space-y-8 px-4">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Question bank
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Batch add questions
        </h1>
        <p className="text-muted-foreground text-sm">
          Paste a JSON array of question objects (without <code>id</code>{" "}
          fields). Each entry will receive a generated UUID and be appended to{" "}
          <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">
            data/data.json
          </code>
          .
        </p>
      </header>

      {statusParam === "success" && addedCount > 0
        ? (
          <Alert type="success">
            Added {addedCount} question{addedCount > 1 ? "s" : ""} to the data
            store.
          </Alert>
        )
        : null}

      {errorParam ? <Alert type="error">{errorParam}</Alert> : null}

      <form
        action={addBatch}
        className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <label htmlFor="payload" className="text-sm font-medium">
                Question array payload
              </label>
              <p className="text-xs text-muted-foreground">
                Provide a valid JSON array. Non-object entries will be skipped
                automatically.
              </p>
            </div>

            <Button type="submit" className="w-full md:w-auto">
              Save batch
            </Button>
          </div>

          <PayloadEditor
            id="payload"
            name="payload"
            sample={sampleBatch}
            helper="Pretty / Minify tidy the JSON. Reset reloads the sample array."
          />
        </div>
      </form>
    </main>
  );
}
