"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Edit3, Plus, Trash2, X } from "lucide-react";

import {
  createBudget,
  deleteBudget,
  updateBudget,
  type BudgetActionResult,
} from "@/actions/budget-actions";
import { budgetSchema, type BudgetInput } from "@/lib/validators/budget";
import { formatCurrency } from "@/lib/format";
import { Toast } from "@/components/ui/toast";

type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

type BudgetRecord = {
  id: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  usage: number;
  periodStart: string;
  periodEnd: string;
  category: CategoryOption | null;
};

type BudgetManagerProps = {
  budgets: BudgetRecord[];
  categories: CategoryOption[];
  currency: string;
};

const defaultValues: BudgetInput = {
  name: "",
  amount: "",
  categoryId: "",
  periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10),
  periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10),
};

function formatPeriod(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);

  return `${startDate.toLocaleDateString(
    "en-IN",
  )} – ${endDate.toLocaleDateString("en-IN")}`;
}

function usageColor(usage: number) {
  if (usage > 90) {
    return "bg-destructive";
  }

  if (usage > 70) {
    return "bg-warning";
  }

  return "bg-success";
}

export function BudgetManager({
  budgets,
  categories,
  currency,
}: BudgetManagerProps) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetRecord | null>(null);
  const [feedback, setFeedback] = useState<BudgetActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues,
  });

  useEffect(() => {
    if (editingBudget) {
      form.reset({
        name: editingBudget.name,
        amount: editingBudget.amount.toFixed(2),
        categoryId: editingBudget.category?.id ?? "",
        periodStart: editingBudget.periodStart,
        periodEnd: editingBudget.periodEnd,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [editingBudget, form]);

  function openCreateForm() {
    setEditingBudget(null);
    setFeedback(null);
    setIsFormOpen(true);
  }

  function openEditForm(budget: BudgetRecord) {
    setEditingBudget(budget);
    setFeedback(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isPending) {
      return;
    }

    setIsFormOpen(false);
    setEditingBudget(null);
    form.reset(defaultValues);
  }

  function submitBudget(values: BudgetInput) {
    startTransition(async () => {
      const result = editingBudget
        ? await updateBudget(editingBudget.id, values)
        : await createBudget(values);

      setFeedback(result);

      if (result.success) {
        setIsFormOpen(false);
        setEditingBudget(null);
        form.reset(defaultValues);
        router.refresh();
      }
    });
  }

  function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `Delete "${name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteBudget(id);

      setFeedback(result);

      if (result.success) {
        router.refresh();
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

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Finance</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Budgets
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track overall spending and category limits independently.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add budget
        </button>
      </div>

      <div className="glass-panel-strong overflow-hidden rounded-3xl">
        <div className="border-b border-border/50 px-5 py-4">
          <h2 className="text-base font-semibold">All budgets</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Each budget measures only the expenses that belong to it.
          </p>
        </div>

        {budgets.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-240 text-left">
                <thead className="border-b border-border/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Budget</th>
                    <th className="px-5 py-4 font-medium">Period</th>
                    <th className="px-5 py-4 text-right font-medium">Spent</th>
                    <th className="px-5 py-4 text-right font-medium">Limit</th>
                    <th className="px-5 py-4 font-medium">Usage</th>
                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/40">
                  {budgets.map((budget) => (
                    <tr
                      key={budget.id}
                      className="transition hover:bg-background/20"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">{budget.name}</p>
                        <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          {budget.category ? (
                            <>
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: budget.category.color,
                                }}
                              />
                              {budget.category.name}
                            </>
                          ) : (
                            "Overall budget"
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {formatPeriod(budget.periodStart, budget.periodEnd)}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold">
                        {formatCurrency(budget.spent, currency)}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold">
                        {formatCurrency(budget.amount, currency)}
                      </td>

                      <td className="min-w-45 px-5 py-4">
                        <div className="flex justify-between gap-3 text-xs">
                          <span>{Math.round(budget.usage)}%</span>
                          <span className="text-muted-foreground">
                            {formatCurrency(budget.remaining, currency)} left
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/50">
                          <div
                            className={`h-full rounded-full ${usageColor(
                              budget.usage,
                            )}`}
                            style={{
                              width: `${Math.min(
                                Math.max(budget.usage, 2),
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(budget)}
                            aria-label={`Edit ${budget.name}`}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(budget.id, budget.name)}
                            disabled={isPending}
                            aria-label={`Delete ${budget.name}`}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border/40 md:hidden">
              {budgets.map((budget) => (
                <article key={budget.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-medium">{budget.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {budget.category?.name ?? "Overall budget"}
                      </p>
                    </div>

                    <p className="shrink-0 font-semibold">
                      {formatCurrency(budget.amount, currency)}
                    </p>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    {formatPeriod(budget.periodStart, budget.periodEnd)}
                  </p>

                  <div className="mt-4 flex justify-between gap-3 text-xs">
                    <span>{formatCurrency(budget.spent, currency)} spent</span>
                    <span>{Math.round(budget.usage)}% used</span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/50">
                    <div
                      className={`h-full rounded-full ${usageColor(
                        budget.usage,
                      )}`}
                      style={{
                        width: `${Math.min(Math.max(budget.usage, 2), 100)}%`,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(budget.remaining, currency)} remaining
                    </span>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEditForm(budget)}
                        aria-label={`Edit ${budget.name}`}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(budget.id, budget.name)}
                        disabled={isPending}
                        aria-label={`Delete ${budget.name}`}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarDays className="h-6 w-6" />
            </div>

            <h3 className="mt-5 text-lg font-semibold">No budgets yet</h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Create an overall or category-specific budget to start tracking
              spending.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Add your first budget
            </button>
          </div>
        )}
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
            aria-labelledby="budget-dialog-title"
            className="glass-panel-strong max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto rounded-3xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">Budgets</p>
                <h2
                  id="budget-dialog-title"
                  className="mt-1 text-2xl font-semibold"
                >
                  {editingBudget ? "Edit budget" : "Add budget"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close budget form"
                className="rounded-lg p-2 text-muted-foreground hover:bg-background/50 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={form.handleSubmit(submitBudget)}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="budget-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Budget name
                </label>

                <input
                  id="budget-name"
                  type="text"
                  placeholder="e.g. Monthly spending"
                  {...form.register("name")}
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />

                {form.formState.errors.name ? (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="budget-amount"
                  className="mb-2 block text-sm font-medium"
                >
                  Amount
                </label>

                <input
                  id="budget-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...form.register("amount")}
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />

                {form.formState.errors.amount ? (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.amount.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="budget-category"
                  className="mb-2 block text-sm font-medium"
                >
                  Category
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    Optional
                  </span>
                </label>

                <select
                  id="budget-category"
                  {...form.register("categoryId")}
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Overall budget</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="budget-start"
                    className="mb-2 block text-sm font-medium"
                  >
                    Period start
                  </label>

                  <input
                    id="budget-start"
                    type="date"
                    {...form.register("periodStart")}
                    className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />

                  {form.formState.errors.periodStart ? (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.periodStart.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="budget-end"
                    className="mb-2 block text-sm font-medium"
                  >
                    Period end
                  </label>

                  <input
                    id="budget-end"
                    type="date"
                    {...form.register("periodEnd")}
                    className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />

                  {form.formState.errors.periodEnd ? (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.periodEnd.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isPending}
                  className="h-11 rounded-xl border border-border px-4 text-sm font-medium hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending
                    ? "Saving..."
                    : editingBudget
                      ? "Save changes"
                      : "Add budget"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
