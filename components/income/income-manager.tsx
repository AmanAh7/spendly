"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Filter,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createIncome,
  deleteIncome,
  updateIncome,
  type IncomeActionResult,
} from "@/actions/income-actions";
import { incomeSchema, type IncomeInput } from "@/lib/validators/income";
import { formatCurrency } from "@/lib/format";
import { Toast } from "@/components/ui/toast";
import { PageHeader } from "@/components/layout/page-header";

type IncomeRecord = {
  id: string;
  amount: number;
  description: string;
  sourceId: string;
  source: string;
  date: string;
  notes: string | null;
};

type IncomeSourceOption = {
  id: string;
  name: string;
};

type IncomeManagerProps = {
  incomes: IncomeRecord[];
  incomeSources: IncomeSourceOption[];
  currency: string;
  page: number;
  totalPages: number;
  totalCount: number;
  search: string;
  source: string;
  sort: string;
};

function getDefaultValues(incomeSources: IncomeSourceOption[]): IncomeInput {
  return {
    amount: "",
    description: "",
    sourceId: incomeSources[0]?.id ?? "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  };
}

export function IncomeManager({
  incomes,
  incomeSources,
  currency,
  page,
  totalPages,
  totalCount,
  search,
  source,
  sort,
}: IncomeManagerProps) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);
  const [feedback, setFeedback] = useState<IncomeActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema),
    defaultValues: getDefaultValues(incomeSources),
  });

  useEffect(() => {
    if (editingIncome) {
      form.reset({
        amount: editingIncome.amount.toFixed(2),
        description: editingIncome.description,
        sourceId: editingIncome.sourceId,
        date: editingIncome.date.slice(0, 10),
        notes: editingIncome.notes ?? "",
      });
    } else {
      form.reset(getDefaultValues(incomeSources));
    }
  }, [editingIncome, form, incomeSources]);

  function openCreateForm() {
    setEditingIncome(null);
    setFeedback(null);
    setIsFormOpen(true);
  }

  function openEditForm(income: IncomeRecord) {
    setEditingIncome(income);
    setFeedback(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isPending) {
      return;
    }

    setIsFormOpen(false);
    setEditingIncome(null);
    form.reset(getDefaultValues(incomeSources));
  }

  function submitIncome(values: IncomeInput) {
    startTransition(async () => {
      const result = editingIncome
        ? await updateIncome(editingIncome.id, values)
        : await createIncome(values);

      setFeedback(result);

      if (result.success) {
        setIsFormOpen(false);
        setEditingIncome(null);
        form.reset(getDefaultValues(incomeSources));
        router.refresh();
      }
    });
  }

  function handleDelete(id: string, description: string) {
    const confirmed = window.confirm(
      `Delete "${description}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteIncome(id);
      setFeedback(result);

      if (result.success) {
        router.refresh();
      }
    });
  }

  function updateFilters(formElement: HTMLFormElement) {
    const formData = new FormData(formElement);
    const params = new URLSearchParams();

    const nextSearch = String(formData.get("search") ?? "").trim();
    const nextSource = String(formData.get("source") ?? "");
    const nextSort = String(formData.get("sort") ?? "date-desc");

    if (nextSearch) {
      params.set("search", nextSearch);
    }

    if (nextSource) {
      params.set("source", nextSource);
    }

    if (nextSort !== "date-desc") {
      params.set("sort", nextSort);
    }

    router.push(`/dashboard/income?${params.toString()}`);
  }

  function changePage(nextPage: number) {
    const params = new URLSearchParams();

    if (search) {
      params.set("search", search);
    }

    if (source) {
      params.set("source", source);
    }

    if (sort !== "date-desc") {
      params.set("sort", sort);
    }

    params.set("page", String(nextPage));

    router.push(`/dashboard/income?${params.toString()}`);
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
        title="Income"
        description="Track and manage every source of income in one place."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/income-sources"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Manage income sources
            </Link>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add income
            </button>
          </div>
        }
      />

      <form
        className="glass-panel-strong rounded-2xl p-4"
        onSubmit={(event) => {
          event.preventDefault();
          updateFilters(event.currentTarget);
        }}
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
          <label className="relative block">
            <span className="sr-only">Search income</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              name="search"
              defaultValue={search}
              placeholder="Search income..."
              className="h-10 w-full rounded-xl border border-input bg-background/40 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <label>
            <span className="sr-only">Filter by income source</span>

            <select
              name="source"
              defaultValue={source}
              className="h-10 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All sources</option>

              {incomeSources.map((incomeSource) => (
                <option key={incomeSource.id} value={incomeSource.id}>
                  {incomeSource.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Sort income</span>

            <select
              name="sort"
              defaultValue={sort}
              className="h-10 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Highest amount</option>
              <option value="amount-asc">Lowest amount</option>
              <option value="description-asc">Description A-Z</option>
            </select>
          </label>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium transition hover:border-primary hover:text-primary"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            Apply
          </button>
        </div>
      </form>

      <div className="glass-panel-strong overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">All income</h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {totalCount} {totalCount === 1 ? "record" : "records"} found
            </p>
          </div>
        </div>

        {incomes.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-190 text-left">
                <thead className="border-b border-border/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Income</th>
                    <th className="px-5 py-4 font-medium">Source</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 text-right font-medium">Amount</th>
                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/40">
                  {incomes.map((income) => (
                    <tr
                      key={income.id}
                      className="transition hover:bg-background/20"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">{income.description}</p>

                        {income.notes ? (
                          <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                            {income.notes}
                          </p>
                        ) : null}
                      </td>

                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {income.source}
                      </td>

                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {new Date(income.date).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-success">
                        +{formatCurrency(income.amount, currency)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(income)}
                            aria-label={`Edit ${income.description}`}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit3 className="h-4 w-4" aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(income.id, income.description)
                            }
                            disabled={isPending}
                            aria-label={`Delete ${income.description}`}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border/40 md:hidden">
              {incomes.map((income) => (
                <article key={income.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-medium">
                        {income.description}
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {income.source}
                      </p>
                    </div>

                    <p className="shrink-0 font-semibold text-success">
                      +{formatCurrency(income.amount, currency)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>
                      {income.source} ·{" "}
                      {new Date(income.date).toLocaleDateString("en-IN")}
                    </span>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEditForm(income)}
                        aria-label={`Edit ${income.description}`}
                        className="rounded-lg p-2 transition hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit3 className="h-4 w-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(income.id, income.description)
                        }
                        disabled={isPending}
                        aria-label={`Delete ${income.description}`}
                        className="rounded-lg p-2 transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
              <CalendarDays className="h-6 w-6" aria-hidden="true" />
            </div>

            <h3 className="mt-5 text-lg font-semibold">No income found</h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {search || source
                ? "Try changing your search or filters."
                : "Add your first income record to start tracking your earnings."}
            </p>

            {!search && !source ? (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add your first income
              </button>
            ) : null}
          </div>
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-border/50 px-5 py-4">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => changePage(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-border p-2 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => changePage(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-border p-2 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}
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
            aria-labelledby="income-dialog-title"
            className="glass-panel-strong max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto rounded-3xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-success">Income</p>

                <h2
                  id="income-dialog-title"
                  className="mt-1 text-2xl font-semibold"
                >
                  {editingIncome ? "Edit income" : "Add income"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close income form"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-background/50 hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={form.handleSubmit(submitIncome)}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="income-amount"
                  className="mb-2 block text-sm font-medium"
                >
                  Amount
                </label>

                <input
                  id="income-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...form.register("amount")}
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />

                {form.formState.errors.amount ? (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.amount.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="income-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>

                <input
                  id="income-description"
                  type="text"
                  placeholder="e.g. Monthly salary"
                  {...form.register("description")}
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />

                {form.formState.errors.description ? (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="income-source"
                  className="mb-2 block text-sm font-medium"
                >
                  Source
                </label>

                <select
                  id="income-source"
                  {...form.register("sourceId")}
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select a source</option>

                  {incomeSources.map((incomeSource) => (
                    <option key={incomeSource.id} value={incomeSource.id}>
                      {incomeSource.name}
                    </option>
                  ))}
                </select>

                {form.formState.errors.sourceId ? (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.sourceId.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="income-date"
                  className="mb-2 block text-sm font-medium"
                >
                  Date
                </label>

                <input
                  id="income-date"
                  type="date"
                  {...form.register("date")}
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />

                {form.formState.errors.date ? (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.date.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="income-notes"
                  className="mb-2 block text-sm font-medium"
                >
                  Notes
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    Optional
                  </span>
                </label>

                <textarea
                  id="income-notes"
                  rows={3}
                  placeholder="Add any useful details..."
                  {...form.register("notes")}
                  className="w-full resize-y rounded-xl border border-input bg-background/40 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />

                {form.formState.errors.notes ? (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.notes.message}
                  </p>
                ) : null}
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
                  disabled={isPending || incomeSources.length === 0}
                  className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending
                    ? "Saving..."
                    : editingIncome
                      ? "Save changes"
                      : "Add income"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
