"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function PayloadEditor({
  id = "payload",
  name = "payload",
  sample = "",
  helper = "",
}) {
  const sampleText = sample.trim();
  const [value, setValue] = useState("");
  const [formatError, setFormatError] = useState("");

  function handleChange(event) {
    setValue(event.target.value);
    setFormatError("");
  }

  function handleReset() {
    if (sampleText) {
      setValue(sampleText);
    } else {
      setValue("");
    }
    setFormatError("");
  }

  function handleFormat(spaces) {
    try {
      const source = (value || sampleText).trim();
      if (!source) {
        return;
      }
      const formatted = JSON.stringify(JSON.parse(source), null, spaces);
      setValue(spaces && spaces > 0 ? `${formatted}\n` : formatted);
      setFormatError("");
    } catch (error) {
      console.error("Failed to format payload", error);
      setFormatError("JSON parse failed. Fix syntax before formatting.");
    }
  }

  function handleMinify() {
    handleFormat(0);
  }

  function handlePretty() {
    handleFormat(2);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={handlePretty}>
          Pretty
        </Button>
        <Button type="button" variant="secondary" onClick={handleMinify}>
          Minify
        </Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>

      <textarea
        id={id}
        name={name}
        required
        value={value}
        onChange={handleChange}
        rows={18}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="Add questions JSON here"
        autoComplete="off"
        spellCheck={false}
      />

      {helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}

      {formatError ? (
        <p className="text-xs text-red-500" aria-live="polite">
          {formatError}
        </p>
      ) : null}

    </div>
  );
}
