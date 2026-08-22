"use client";

import { FormEvent, useState, useTransition } from "react";
import {
  Edit3,
  LockKeyhole,
  Palette,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  createCategory,
  deleteCategory,
  updateCategory,
  type CategoryActionResult,
} from "@/actions/category-actions";
import { categorySchema, type CategoryInput } from "@/lib/validators/category";
import { Toast } from "@/components/ui/toast";
import { PageHeader } from "@/components/layout/page-header";

type CategoryRecord = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  referenceCount: number;
  appliesToExpenses: boolean;
  appliesToBudgets: boolean;
  appliesToRecurringExpenses: boolean;
  appliesToGoals: boolean;
};

type CategoryManagerProps = {
  categories: CategoryRecord[];
};

const defaultValues: CategoryInput = {
  name: "",
  icon: "Tag",
  color: "#8B5CF6",
  appliesToExpenses: true,
  appliesToBudgets: true,
  appliesToRecurringExpenses: true,
  appliesToGoals: true,
};

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(
    null,
  );
  const [values, setValues] = useState<CategoryInput>(defaultValues);
  const [feedback, setFeedback] = useState<CategoryActionResult | null>(null);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  function openCreateForm() {
    setEditingCategory(null);
    setValues(defaultValues);
    setFormError("");
    setFeedback(null);
    setIsFormOpen(true);
  }

  function openEditForm(category: CategoryRecord) {
    setEditingCategory(category);
    setValues({
      name: category.name,
      icon: category.icon,
      color: category.color,
      appliesToExpenses: category.appliesToExpenses,
      appliesToBudgets: category.appliesToBudgets,
      appliesToRecurringExpenses: category.appliesToRecurringExpenses,
      appliesToGoals: category.appliesToGoals,
    });
    setFormError("");
    setFeedback(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isPending) {
      return;
    }

    setIsFormOpen(false);
    setEditingCategory(null);
    setValues(defaultValues);
    setFormError("");
  }

  function updateValue<K extends keyof CategoryInput>(
    key: K,
    value: CategoryInput[K],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = categorySchema.safeParse(values);

    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ?? "Check the form details.",
      );
      return;
    }

    startTransition(async () => {
      const result = editingCategory
        ? await updateCategory(editingCategory.id, parsed.data)
        : await createCategory(parsed.data);

      setFeedback(result);

      if (result.success) {
        closeForm();
        router.refresh();
      }
    });
  }

  function handleDelete(category: CategoryRecord) {
    if (category.isDefault) {
      setFeedback({
        error: "Default categories cannot be deleted.",
      });
      return;
    }

    if (category.referenceCount > 0) {
      setFeedback({
        error:
          "This category is still used by existing financial records and cannot be deleted.",
      });
      return;
    }

    const confirmed = window.confirm(
      `Delete "${category.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCategory(category.id);
      setFeedback(result);

      if (result.success) {
        router.refresh();
      }
    });
  }

  function renderApplicability(category: CategoryRecord) {
    const features: string[] = [];

    if (category.appliesToExpenses) {
      features.push("Expenses");
    }

    if (category.appliesToBudgets) {
      features.push("Budgets");
    }

    if (category.appliesToRecurringExpenses) {
      features.push("Recurring");
    }

    if (category.appliesToGoals) {
      features.push("Goals");
    }

    if (features.length === 0) {
      return "Not applicable to any feature";
    }

    return features.join(", ");
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
        title="Categories"
        description="Organize your expenses, budgets, recurring payments, and goals with user-owned categories."
        actions={
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add category
          </button>
        }
      />

      <section className="glass-panel-strong overflow-hidden rounded-3xl">
        <div className="border-b border-border/50 px-5 py-4">
          <h2 className="text-base font-semibold">Your categories</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Categories in use cannot be deleted.
          </p>
        </div>

        {categories.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-180 text-left">
                <thead className="border-b border-border/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Category</th>
                    <th className="px-5 py-4 font-medium">Applicability</th>
                    <th className="px-5 py-4 font-medium">Usage</th>
                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/40">
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="transition hover:bg-background/20"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 items-center justify-center rounded-xl"
                            style={{
                              backgroundColor: `${category.color}22`,
                              color: category.color,
                            }}
                          >
                            <Tag className="h-4 w-4" aria-hidden="true" />
                          </span>

                          <div>
                            <p className="font-medium">{category.name}</p>

                            {category.isDefault ? (
                              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <LockKeyhole
                                  className="h-3 w-3"
                                  aria-hidden="true"
                                />
                                Default category
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {renderApplicability(category)}
                      </td>

                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {category.referenceCount > 0
                          ? `${category.referenceCount} record${
                              category.referenceCount === 1 ? "" : "s"
                            }`
                          : "Unused"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(category)}
                            aria-label={`Edit ${category.name}`}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit3 className="h-4 w-4" aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
                            disabled={
                              isPending ||
                              category.isDefault ||
                              category.referenceCount > 0
                            }
                            aria-label={`Delete ${category.name}`}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
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
              {categories.map((category) => (
                <article key={category.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: `${category.color}22`,
                          color: category.color,
                        }}
                      >
                        <Tag className="h-4 w-4" aria-hidden="true" />
                      </span>

                      <div className="min-w-0">
                        <h3 className="truncate font-medium">
                          {category.name}
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {renderApplicability(category)}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {category.isDefault
                            ? "Default category"
                            : category.referenceCount > 0
                              ? `${category.referenceCount} record${
                                  category.referenceCount === 1 ? "" : "s"
                                }`
                              : "Unused"}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => openEditForm(category)}
                        aria-label={`Edit ${category.name}`}
                        className="rounded-lg p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit3 className="h-4 w-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        disabled={
                          isPending ||
                          category.isDefault ||
                          category.referenceCount > 0
                        }
                        aria-label={`Delete ${category.name}`}
                        className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
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
            <Palette
              className="mx-auto h-8 w-8 text-primary"
              aria-hidden="true"
            />

            <h3 className="mt-5 text-lg font-semibold">No categories yet</h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Create a category to organize your financial records.
            </p>
          </div>
        )}
      </section>

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
            aria-labelledby="category-dialog-title"
            className="glass-panel-strong max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto rounded-3xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">Categories</p>

                <h2
                  id="category-dialog-title"
                  className="mt-1 text-2xl font-semibold"
                >
                  {editingCategory ? "Edit category" : "Add category"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close category form"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-background/50 hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={submitForm} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Name
                </label>

                <input
                  id="category-name"
                  type="text"
                  value={values.name}
                  onChange={(event) => updateValue("name", event.target.value)}
                  placeholder="e.g. Subscriptions"
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="category-icon"
                    className="mb-2 block text-sm font-medium"
                  >
                    Icon name
                  </label>

                  <input
                    id="category-icon"
                    type="text"
                    value={values.icon}
                    onChange={(event) =>
                      updateValue("icon", event.target.value)
                    }
                    placeholder="e.g. Tag"
                    className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />

                  <p className="mt-1 text-xs text-muted-foreground">
                    Stored for future icon rendering.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="category-color"
                    className="mb-2 block text-sm font-medium"
                  >
                    Color
                  </label>

                  <div className="flex h-11 items-center gap-3 rounded-xl border border-input bg-background/40 px-3">
                    <input
                      id="category-color"
                      type="color"
                      value={values.color}
                      onChange={(event) =>
                        updateValue("color", event.target.value)
                      }
                      className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                    />

                    <span className="text-sm text-muted-foreground">
                      {values.color}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 block text-sm font-medium">
                  Feature applicability
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={values.appliesToExpenses}
                      onChange={(event) =>
                        updateValue("appliesToExpenses", event.target.checked)
                      }
                    />
                    Expenses
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={values.appliesToBudgets}
                      onChange={(event) =>
                        updateValue("appliesToBudgets", event.target.checked)
                      }
                    />
                    Budgets
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={values.appliesToRecurringExpenses}
                      onChange={(event) =>
                        updateValue(
                          "appliesToRecurringExpenses",
                          event.target.checked,
                        )
                      }
                    />
                    Recurring expenses
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={values.appliesToGoals}
                      onChange={(event) =>
                        updateValue("appliesToGoals", event.target.checked)
                      }
                    />
                    Goals
                  </label>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Select at least one feature where this category can be used.
                </p>
              </div>

              {formError ? (
                <p className="text-xs text-destructive">{formError}</p>
              ) : null}

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
                    : editingCategory
                      ? "Save changes"
                      : "Add category"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
