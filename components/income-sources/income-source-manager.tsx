"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Edit3, Plus, Trash2, X } from "lucide-react";

import {
  createIncomeSource,
  deleteIncomeSource,
  updateIncomeSource,
  type IncomeSourceActionResult,
} from "@/actions/income-source-actions";
import {
  incomeSourceSchema,
  type IncomeSourceInput,
} from "@/lib/validators/income-source";
import { Toast } from "@/components/ui/toast";
import { PageHeader } from "@/components/layout/page-header";

type IncomeSourceRecord = {
  id: string;
  name: string;
  isDefault: boolean;
  referenceCount: number;
};

type IncomeSourceManagerProps = {
  sources: IncomeSourceRecord[];
};

export function IncomeSourceManager({ sources }: IncomeSourceManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<IncomeSourceRecord | null>(
    null,
  );
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState<IncomeSourceActionResult | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  function openCreateForm() {
    setEditingSource(null);
    setName("");
    setFeedback(null);
    setIsFormOpen(true);
  }

  function openEditForm(source: IncomeSourceRecord) {
    setEditingSource(source);
    setName(source.name);
    setFeedback(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isPending) {
      return;
    }

    setIsFormOpen(false);
    setEditingSource(null);
    setName("");
  }

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input: IncomeSourceInput = { name };
    const parsed = incomeSourceSchema.safeParse(input);

    if (!parsed.success) {
      setFeedback({
        error: parsed.error.issues[0]?.message ?? "Enter a valid source name.",
      });
      return;
    }

    startTransition(async () => {
      const result = editingSource
        ? await updateIncomeSource(editingSource.id, parsed.data)
        : await createIncomeSource(parsed.data);

      setFeedback(result);

      if (result.success) {
        setIsFormOpen(false);
        setEditingSource(null);
        setName("");
        window.location.reload();
      }
    });
  }

  function handleDelete(source: IncomeSourceRecord) {
    const confirmed = window.confirm(
      `Delete "${source.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteIncomeSource(source.id);
      setFeedback(result);

      if (result.success) {
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-6">
      <Toast
        message={feedback?.error ?? feedback?.success ?? null}
        variant={feedback?.error ? "error" : "success"}
        onDismiss={() => setFeedback(null)}
      />

      <PageHeader
        eyebrow="Finance"
        title="Income sources"
        description="Manage the sources used to classify your income."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/income"
              className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Back to income
            </Link>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add source
            </button>
          </div>
        }
      />

      <div className="glass-panel-strong overflow-hidden rounded-3xl">
        <div className="border-b border-border/50 px-5 py-4">
          <h2 className="text-base font-semibold">All income sources</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            {sources.length} {sources.length === 1 ? "source" : "sources"}
          </p>
        </div>

        <div className="divide-y divide-border/40">
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="font-medium">{source.name}</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {source.referenceCount}{" "}
                  {source.referenceCount === 1
                    ? "income record"
                    : "income records"}
                  {source.isDefault ? " · Default" : ""}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                {!source.isDefault ? (
                  <>
                    <button
                      type="button"
                      onClick={() => openEditForm(source)}
                      disabled={isPending}
                      aria-label={`Edit ${source.name}`}
                      className="rounded-lg p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                    >
                      <Edit3 className="h-4 w-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(source)}
                      disabled={isPending}
                      aria-label={`Delete ${source.name}`}
                      className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isFormOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="income-source-dialog-title"
            className="glass-panel-strong w-full max-w-lg rounded-3xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">Income</p>

                <h2
                  id="income-source-dialog-title"
                  className="mt-1 text-2xl font-semibold"
                >
                  {editingSource ? "Edit source" : "Add source"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close income source form"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-background/50 hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={submitForm} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="income-source-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Source name
                </label>

                <input
                  id="income-source-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Consulting"
                  autoFocus
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isPending}
                  className="h-11 rounded-xl border border-border px-4 text-sm font-medium transition hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending
                    ? "Saving..."
                    : editingSource
                      ? "Save changes"
                      : "Add source"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
