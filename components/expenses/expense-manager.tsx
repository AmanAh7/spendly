"use client";

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
  createExpense,
  deleteExpense,
  updateExpense,
  type ExpenseActionResult,
} from "@/actions/expense-actions";
import {
  expenseSchema,
  paymentMethodValues,
  type ExpenseInput,
} from "@/lib/validators/expense";
import { formatCurrency, formatDate } from "@/lib/format";
import { Toast } from "@/components/ui/toast";

type ExpenseRecord = {
  id: string;
  amount: number;
  description: string;
  paymentMethod: string;
  date: string;
  notes: string | null;
  category: {
    id: string;
    name: string;
    color: string;
  };
};

type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

type ExpenseManagerProps = {
  expenses: ExpenseRecord[];
  categories: CategoryOption[];
  currency: string;
  dateFormat: string;
  page: number;
  totalPages: number;
  totalCount: number;
  search: string;
  categoryId: string;
  paymentMethod: string;
  sort: string;
};

const paymentMethodLabels: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other",
};

const defaultValues: ExpenseInput = {
  amount: "",
  description: "",
  categoryId: "",
  paymentMethod: "UPI",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
};

export function ExpenseManager({
  expenses,
  categories,
  currency,
  dateFormat,
  page,
  totalPages,
  totalCount,
  search,
  categoryId,
  paymentMethod,
  sort,
}: ExpenseManagerProps) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(
    null,
  );
  const [feedback, setFeedback] = useState<ExpenseActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues,
  });
  useEffect(() => {
    if (editingExpense) {
      form.reset({
        amount: editingExpense.amount.toFixed(2),
        description: editingExpense.description,
        categoryId: editingExpense.category.id,
        paymentMethod:
          editingExpense.paymentMethod as ExpenseInput["paymentMethod"],
        date: editingExpense.date.slice(0, 10),
        notes: editingExpense.notes ?? "",
      });
    } else {
      form.reset(defaultValues);
    }
  }, [editingExpense, form]);
  function openCreateForm() {
    setEditingExpense(null);
    setFeedback(null);
    setIsFormOpen(true);
  }

  function openEditForm(expense: ExpenseRecord) {
    setEditingExpense(expense);
    setFeedback(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isPending) {
      return;
    }

    setIsFormOpen(false);
    setEditingExpense(null);
    form.reset(defaultValues);
  }

  function submitExpense(values: ExpenseInput) {
    startTransition(async () => {
      const result = editingExpense
        ? await updateExpense(editingExpense.id, values)
        : await createExpense(values);

      setFeedback(result);

      if (result.success) {
        setIsFormOpen(false);
        setEditingExpense(null);
        form.reset(defaultValues);
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
      const result = await deleteExpense(id);
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
    const nextCategory = String(formData.get("categoryId") ?? "");
    const nextPaymentMethod = String(formData.get("paymentMethod") ?? "");
    const nextSort = String(formData.get("sort") ?? "date-desc");

    if (nextSearch) {
      params.set("search", nextSearch);
    }

    if (nextCategory) {
      params.set("categoryId", nextCategory);
    }

    if (nextPaymentMethod) {
      params.set("paymentMethod", nextPaymentMethod);
    }

    if (nextSort !== "date-desc") {
      params.set("sort", nextSort);
    }

    router.push(`/dashboard/expenses?${params.toString()}`);
  }

  function changePage(nextPage: number) {
    const params = new URLSearchParams();

    if (search) {
      params.set("search", search);
    }

    if (categoryId) {
      params.set("categoryId", categoryId);
    }

    if (paymentMethod) {
      params.set("paymentMethod", paymentMethod);
    }

    if (sort !== "date-desc") {
      params.set("sort", sort);
    }

    params.set("page", String(nextPage));

    router.push(`/dashboard/expenses?${params.toString()}`);
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
            Expenses
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track and manage every expense in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add expense
        </button>
      </div>

      <form
        className="glass-panel-strong rounded-2xl p-4"
        onSubmit={(event) => {
          event.preventDefault();
          updateFilters(event.currentTarget);
        }}
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px_auto]">
          <label className="relative block">
            <span className="sr-only">Search expenses</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search expenses..."
              className="h-10 w-full rounded-xl border border-input bg-background/40 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <label>
            <span className="sr-only">Filter by category</span>
            <select
              name="categoryId"
              defaultValue={categoryId}
              className="h-10 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Filter by payment method</span>
            <select
              name="paymentMethod"
              defaultValue={paymentMethod}
              className="h-10 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All payment methods</option>
              {paymentMethodValues.map((method) => (
                <option key={method} value={method}>
                  {paymentMethodLabels[method]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Sort expenses</span>
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
            <Filter className="h-4 w-4" />
            Apply
          </button>
        </div>
      </form>

      <div className="glass-panel-strong overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">All expenses</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalCount} {totalCount === 1 ? "expense" : "expenses"} found
            </p>
          </div>
        </div>

        {expenses.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-190 text-left">
                <thead className="border-b border-border/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Expense</th>
                    <th className="px-5 py-4 font-medium">Category</th>
                    <th className="px-5 py-4 font-medium">Payment</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 text-right font-medium">Amount</th>
                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/40">
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="transition hover:bg-background/20"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">{expense.description}</p>
                        {expense.notes ? (
                          <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                            {expense.notes}
                          </p>
                        ) : null}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 text-sm">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: expense.category.color,
                            }}
                          />
                          {expense.category.name}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {paymentMethodLabels[expense.paymentMethod]}
                      </td>

                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {formatDate(expense.date, dateFormat)}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold">
                        {formatCurrency(expense.amount, currency)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(expense)}
                            aria-label={`Edit ${expense.description}`}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(expense.id, expense.description)
                            }
                            disabled={isPending}
                            aria-label={`Delete ${expense.description}`}
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
              {expenses.map((expense) => (
                <article key={expense.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-medium">
                        {expense.description}
                      </h3>
                      <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: expense.category.color,
                          }}
                        />
                        {expense.category.name}
                      </p>
                    </div>

                    <p className="shrink-0 font-semibold">
                      {formatCurrency(expense.amount, currency)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>
                      {paymentMethodLabels[expense.paymentMethod]} ·{" "}
                      {formatDate(expense.date, dateFormat)}
                    </span>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEditForm(expense)}
                        aria-label={`Edit ${expense.description}`}
                        className="rounded-lg p-2 transition hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(expense.id, expense.description)
                        }
                        disabled={isPending}
                        aria-label={`Delete ${expense.description}`}
                        className="rounded-lg p-2 transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
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
            <h3 className="mt-5 text-lg font-semibold">No expenses found</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {search || categoryId || paymentMethod
                ? "Try changing your search or filters."
                : "Add your first expense to start tracking your spending."}
            </p>

            {!search && !categoryId && !paymentMethod ? (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Add your first expense
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
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => changePage(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-border p-2 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
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
            aria-labelledby="expense-dialog-title"
            className="glass-panel-strong max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto rounded-3xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">Expenses</p>
                <h2
                  id="expense-dialog-title"
                  className="mt-1 text-2xl font-semibold"
                >
                  {editingExpense ? "Edit expense" : "Add expense"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close expense form"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-background/50 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={form.handleSubmit(submitExpense)}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-medium"
                >
                  Amount
                </label>
                <input
                  id="amount"
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
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  placeholder="e.g. Grocery shopping"
                  {...form.register("description")}
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
                {form.formState.errors.description ? (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="categoryId"
                    className="mb-2 block text-sm font-medium"
                  >
                    Category
                  </label>
                  <select
                    id="categoryId"
                    {...form.register("categoryId")}
                    className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.categoryId ? (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.categoryId.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="paymentMethod"
                    className="mb-2 block text-sm font-medium"
                  >
                    Payment method
                  </label>
                  <select
                    id="paymentMethod"
                    {...form.register("paymentMethod")}
                    className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  >
                    {paymentMethodValues.map((method) => (
                      <option key={method} value={method}>
                        {paymentMethodLabels[method]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-medium"
                >
                  Date
                </label>
                <input
                  id="date"
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
                  htmlFor="notes"
                  className="mb-2 block text-sm font-medium"
                >
                  Notes
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    Optional
                  </span>
                </label>
                <textarea
                  id="notes"
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
                  disabled={isPending}
                  className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending
                    ? "Saving..."
                    : editingExpense
                      ? "Save changes"
                      : "Add expense"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
