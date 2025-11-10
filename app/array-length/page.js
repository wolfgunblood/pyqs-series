"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

function parseArrayLength(input) {
  if (!input.trim()) {
    return { length: 0, error: "" };
  }

  try {
    const parsed = JSON.parse(input);
    if (!Array.isArray(parsed)) {
      return {
        length: 0,
        error: "The provided JSON must be an array.",
      };
    }

    return { length: parsed.length, error: "" };
  } catch (error) {
    return { length: 0, error: "Invalid JSON. Please fix the syntax." };
  }
}

export default function ArrayLengthTool() {
  const [input, setInput] = useState("");
  const [touched, setTouched] = useState(false);

  const result = useMemo(() => parseArrayLength(input), [input]);

  const showLength = touched && !result.error;

  return (
    <main className="mx-auto my-12 max-w-3xl space-y-8 px-4">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Utilities
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Array length checker
        </h1>
        <p className="text-muted-foreground text-sm">
          Paste any JSON array, and we will instantly tell you how many objects
          it contains. Helpful before using batch import tools.
        </p>
      </header>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <label htmlFor="json-array" className="text-sm font-medium">
            JSON array input
          </label>
          <p className="text-xs text-muted-foreground">
            Only arrays are accepted. The tool ignores whitespace and does not
            persist data.
          </p>
        </div>

        <textarea
          id="json-array"
          name="json-array"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={12}
          className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder='[{"foo":"bar"}]'
          spellCheck={false}
        />

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => setTouched(true)}>
            Check length
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setInput("");
              setTouched(false);
            }}
          >
            Clear
          </Button>
        </div>

        {touched
          ? (
            <>
              {result.error
                ? <p className="text-sm text-red-600">{result.error}</p>
                : null}
              {showLength
                ? (
                  <p className="text-sm font-semibold text-emerald-600">
                    Array length: {result.length} item
                    {result.length === 1 ? "" : "s"}
                  </p>
                )
                : null}
            </>
          )
          : null}
      </section>
    </main>
  );
}
