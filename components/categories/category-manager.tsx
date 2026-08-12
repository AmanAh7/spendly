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
import {
  categorySchema,
  categoryTypeValues,
  type CategoryInput,
} from "@/lib/validators/category";
import { Toast } from "@/components/ui/toast";

type CategoryRecord = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  isDefault: boolean;
  referenceCount: number;
};

type CategoryManagerProps = {
  categories: CategoryRecord[];
};

const defaultValues: CategoryInput = {
  name: "",
  icon: "Tag",
  color: "#8B5CF6",
  type: "EXPENSE",
};

const typeLabels: Record<string, string> = {
  EXPENSE: "Expense",
  INCOME: "Income",
  BOTH: "Income & expense",
};

const typeClasses: Record<string, string> = {
  EXPENSE: "bg-primary/15 text-primary",
  INCOME: "bg-success/15 text-success",
  BOTH: "bg-accent/15 text-accent",
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
      type: category.type as CategoryInput["type"],
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

  return (
    <div className="space-y-6">
      <Toast
        message={feedback?.error ?? feedback?.success ?? null}
        variant={feedback?.error ? "error" : "success"}
        onDismiss={() => setFeedback(null)}
      />

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Finance</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Categories
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Organize your income and expenses with user-owned categories.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add category
        </button>
      </header>

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
                    <th className="px-5 py-4 font-medium">Type</th>
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
                            <Tag className="h-4 w-4" />
                          </span>

                          <div>
                            <p className="font-medium">{category.name}</p>
                            {category.isDefault ? (
                              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <LockKeyhole className="h-3 w-3" />
                                Default category
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            typeClasses[category.type] ??
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {typeLabels[category.type] ?? category.type}
                        </span>
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
                            <Edit3 className="h-4 w-4" />
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
                        <Tag className="h-4 w-4" />
                      </span>

                      <div className="min-w-0">
                        <h3 className="truncate font-medium">
                          {category.name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {typeLabels[category.type] ?? category.type}
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
                        <Edit3 className="h-4 w-4" />
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
            <Palette className="mx-auto h-8 w-8 text-primary" />
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
                <X className="h-5 w-5" />
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
                <label
                  htmlFor="category-type"
                  className="mb-2 block text-sm font-medium"
                >
                  Category type
                </label>
                <select
                  id="category-type"
                  value={values.type}
                  onChange={(event) =>
                    updateValue(
                      "type",
                      event.target.value as CategoryInput["type"],
                    )
                  }
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                >
                  {categoryTypeValues.map((type) => (
                    <option key={type} value={type}>
                      {typeLabels[type]}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Expense categories are used by expenses, budgets, and
                  recurring expenses. BOTH categories can be used across
                  financial features.
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
