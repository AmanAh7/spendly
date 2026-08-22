"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Edit3,
  Pause,
  Play,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createRecurringExpense,
  deleteRecurringExpense,
  toggleRecurringExpense,
  updateRecurringExpense,
  type RecurringExpenseActionResult,
} from "@/actions/recurring-expense-actions";
import {
  recurringExpenseSchema,
  recurringFrequencyValues,
  recurringGenerationModeValues,
  type RecurringExpenseInput,
} from "@/lib/validators/recurring-expense";
import { paymentMethodValues } from "@/lib/validators/expense";
import { formatCurrency } from "@/lib/format";
import { Toast } from "@/components/ui/toast";
import { PageHeader } from "@/components/layout/page-header";

type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

type RecurringExpenseRecord = {
  id: string;
  amount: number;
  description: string;
  paymentMethod: string;
  frequency: string;
  generationMode: string;
  nextDueDate: string;
  isActive: boolean;
  notes: string | null;
  category: CategoryOption;
};

type Props = {
  recurringExpenses: RecurringExpenseRecord[];
  categories: CategoryOption[];
  currency: string;
};

const defaultValues: RecurringExpenseInput = {
  amount: "",
  description: "",
  categoryId: "",
  paymentMethod: "UPI",
  frequency: "MONTHLY",
  generationMode: "MANUAL",
  nextDueDate: new Date().toISOString().slice(0, 10),
  notes: "",
};

const paymentMethodLabels: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other",
};

const frequencyLabels: Record<string, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export function RecurringExpenseManager({
  recurringExpenses,
  categories,
  currency,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringExpenseRecord | null>(null);
  const [values, setValues] = useState<RecurringExpenseInput>(defaultValues);
  const [feedback, setFeedback] = useState<RecurringExpenseActionResult | null>(
    null,
  );
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setValues({
      ...defaultValues,
      nextDueDate: new Date().toISOString().slice(0, 10),
    });
    setFormError("");
    setIsOpen(true);
  }

  function openEdit(item: RecurringExpenseRecord) {
    setEditing(item);
    setValues({
      amount: item.amount.toFixed(2),
      description: item.description,
      categoryId: item.category.id,
      paymentMethod:
        item.paymentMethod as RecurringExpenseInput["paymentMethod"],
      frequency: item.frequency as RecurringExpenseInput["frequency"],
      generationMode:
        item.generationMode as RecurringExpenseInput["generationMode"],
      nextDueDate: item.nextDueDate.slice(0, 10),
      notes: item.notes ?? "",
    });
    setFormError("");
    setIsOpen(true);
  }

  function closeForm() {
    if (isPending) {
      return;
    }

    setIsOpen(false);
    setEditing(null);
    setValues(defaultValues);
    setFormError("");
  }

  function updateValue<K extends keyof RecurringExpenseInput>(
    key: K,
    value: RecurringExpenseInput[K],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = recurringExpenseSchema.safeParse(values);

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }

    startTransition(async () => {
      const result = editing
        ? await updateRecurringExpense(editing.id, parsed.data)
        : await createRecurringExpense(parsed.data);

      setFeedback(result);

      if (result.success) {
        closeForm();
        router.refresh();
      }
    });
  }

  function remove(item: RecurringExpenseRecord) {
    if (
      !window.confirm(
        `Delete "${item.description}"? Existing generated expenses will remain.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteRecurringExpense(item.id);
      setFeedback(result);

      if (result.success) {
        router.refresh();
      }
    });
  }

  function toggle(item: RecurringExpenseRecord) {
    startTransition(async () => {
      const result = await toggleRecurringExpense(item.id);
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

      <PageHeader
        eyebrow="Finance"
        title="Recurring expenses"
        description="Track reminders or automatically record repeating expenses."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add recurring expense
          </button>
        }
      />

      <div className="grid gap-4">
        {recurringExpenses.length === 0 ? (
          <div className="glass-panel-strong rounded-3xl px-6 py-16 text-center">
            <CalendarClock
              className="mx-auto h-8 w-8 text-primary"
              aria-hidden="true"
            />

            <h2 className="mt-4 text-lg font-semibold">
              No recurring expenses
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Add a recurring expense to receive reminders or generate expenses
              automatically.
            </p>

            <button
              type="button"
              onClick={openCreate}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add your first recurring expense
            </button>
          </div>
        ) : (
          recurringExpenses.map((item) => (
            <article
              key={item.id}
              className={`glass-panel-strong rounded-3xl p-5 ${
                item.isActive ? "" : "opacity-60"
              }`}
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: item.category.color,
                      }}
                    />

                    <h2 className="truncate text-lg font-semibold">
                      {item.description}
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.category.name} ·{" "}
                    {paymentMethodLabels[item.paymentMethod]} ·{" "}
                    {frequencyLabels[item.frequency]}
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="h-4 w-4" aria-hidden="true" />
                    Next due:{" "}
                    {new Date(item.nextDueDate).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="flex items-start justify-between gap-4 sm:flex-col sm:items-end">
                  <p className="text-lg font-semibold">
                    {formatCurrency(item.amount, currency)}
                  </p>

                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                    {item.generationMode === "AUTOMATIC"
                      ? "Automatic"
                      : "Manual"}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-border/50 pt-4">
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium transition hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  {item.isActive ? (
                    <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  )}

                  {item.isActive ? "Pause" : "Activate"}
                </button>

                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium transition hover:border-primary hover:text-primary"
                >
                  <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => remove(item)}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium transition hover:border-destructive hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <section className="glass-panel-strong max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto rounded-3xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">
                  Recurring expenses
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                  {editing ? "Edit recurring expense" : "Add recurring expense"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close recurring expense form"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-background/50 hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">Amount</label>

                <input
                  value={values.amount}
                  onChange={(event) =>
                    updateValue("amount", event.target.value)
                  }
                  inputMode="decimal"
                  placeholder="0.00"
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <input
                  value={values.description}
                  onChange={(event) =>
                    updateValue("description", event.target.value)
                  }
                  placeholder="e.g. Rent"
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Category
                  <select
                    value={values.categoryId}
                    onChange={(event) =>
                      updateValue("categoryId", event.target.value)
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Select category</option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium">
                  Payment method
                  <select
                    value={values.paymentMethod}
                    onChange={(event) =>
                      updateValue(
                        "paymentMethod",
                        event.target
                          .value as RecurringExpenseInput["paymentMethod"],
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  >
                    {paymentMethodValues.map((method) => (
                      <option key={method} value={method}>
                        {paymentMethodLabels[method]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Frequency
                  <select
                    value={values.frequency}
                    onChange={(event) =>
                      updateValue(
                        "frequency",
                        event.target
                          .value as RecurringExpenseInput["frequency"],
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  >
                    {recurringFrequencyValues.map((frequency) => (
                      <option key={frequency} value={frequency}>
                        {frequencyLabels[frequency]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium">
                  Generation mode
                  <select
                    value={values.generationMode}
                    onChange={(event) =>
                      updateValue(
                        "generationMode",
                        event.target
                          .value as RecurringExpenseInput["generationMode"],
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  >
                    {recurringGenerationModeValues.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode === "AUTOMATIC" ? "Automatic" : "Manual"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Next due date
                </label>

                <input
                  type="date"
                  value={values.nextDueDate}
                  onChange={(event) =>
                    updateValue("nextDueDate", event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Notes{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    Optional
                  </span>
                </label>

                <textarea
                  value={values.notes}
                  onChange={(event) => updateValue("notes", event.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-input bg-background/40 px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {formError ? (
                <p className="text-xs text-destructive">{formError}</p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isPending}
                  className="h-11 rounded-xl border border-border px-4 text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Save recurring expense"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
