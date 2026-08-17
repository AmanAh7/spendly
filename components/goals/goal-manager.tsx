"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Edit3, Plus, Target, Trash2, X } from "lucide-react";

import {
  createGoal,
  createGoalContribution,
  deleteGoal,
  deleteGoalContribution,
  updateGoal,
  type GoalActionResult,
} from "@/actions/goal-actions";
import {
  contributionSchema,
  goalSchema,
  type ContributionInput,
  type GoalInput,
} from "@/lib/validators/goal";
import { formatCurrency, formatDate } from "@/lib/format";
import { Toast } from "@/components/ui/toast";

type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

type ContributionRecord = {
  id: string;
  amount: number;
  date: string;
  note: string | null;
};

type GoalRecord = {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  saved: number;
  remaining: number;
  progress: number;
  targetDate: string;
  completedAt: string | null;
  category: CategoryOption | null;
  contributions: ContributionRecord[];
};

type GoalManagerProps = {
  goals: GoalRecord[];
  categories: CategoryOption[];
  currency: string;
  dateFormat: string;
};

const defaultGoalValues: GoalInput = {
  name: "",
  description: "",
  targetAmount: "",
  categoryId: "",
  targetDate: "",
};

const defaultContributionValues: ContributionInput = {
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

function progressColor(progress: number, completed: boolean) {
  if (completed) return "bg-success";
  if (progress >= 90) return "bg-warning";
  return "bg-primary";
}

export function GoalManager({
  goals,
  categories,
  currency,
  dateFormat,
}: GoalManagerProps) {
  const router = useRouter();
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalRecord | null>(null);
  const [contributionGoal, setContributionGoal] = useState<GoalRecord | null>(
    null,
  );
  const [historyGoal, setHistoryGoal] = useState<GoalRecord | null>(null);
  const [feedback, setFeedback] = useState<GoalActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const goalForm = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: defaultGoalValues,
  });

  const contributionForm = useForm<ContributionInput>({
    resolver: zodResolver(contributionSchema),
    defaultValues: defaultContributionValues,
  });

  useEffect(() => {
    if (editingGoal) {
      goalForm.reset({
        name: editingGoal.name,
        description: editingGoal.description ?? "",
        targetAmount: editingGoal.targetAmount.toFixed(2),
        categoryId: editingGoal.category?.id ?? "",
        targetDate: editingGoal.targetDate,
      });
    } else {
      goalForm.reset(defaultGoalValues);
    }
  }, [editingGoal, goalForm]);

  useEffect(() => {
    contributionForm.reset(defaultContributionValues);
  }, [contributionGoal, contributionForm]);

  function openCreateGoalForm() {
    setEditingGoal(null);
    setFeedback(null);
    setIsGoalFormOpen(true);
  }

  function openEditGoalForm(goal: GoalRecord) {
    setEditingGoal(goal);
    setFeedback(null);
    setIsGoalFormOpen(true);
  }

  function closeGoalForm() {
    if (isPending) return;

    setIsGoalFormOpen(false);
    setEditingGoal(null);
    goalForm.reset(defaultGoalValues);
  }

  function submitGoal(values: GoalInput) {
    startTransition(async () => {
      const result = editingGoal
        ? await updateGoal(editingGoal.id, values)
        : await createGoal(values);

      setFeedback(result);

      if (result.success) {
        setIsGoalFormOpen(false);
        setEditingGoal(null);
        goalForm.reset(defaultGoalValues);
        router.refresh();
      }
    });
  }

  function handleDeleteGoal(goal: GoalRecord) {
    const confirmed = window.confirm(
      `Delete "${goal.name}"? This will also delete its contributions.`,
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteGoal(goal.id);
      setFeedback(result);

      if (result.success) {
        router.refresh();
      }
    });
  }

  function submitContribution(values: ContributionInput) {
    if (!contributionGoal) return;

    startTransition(async () => {
      const result = await createGoalContribution(contributionGoal.id, values);

      setFeedback(result);

      if (result.success) {
        setContributionGoal(null);
        contributionForm.reset(defaultContributionValues);
        router.refresh();
      }
    });
  }

  function handleDeleteContribution(goalId: string, contributionId: string) {
    const confirmed = window.confirm(
      "Delete this contribution? This action cannot be undone.",
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteGoalContribution(goalId, contributionId);

      setFeedback(result);

      if (result.success) {
        setHistoryGoal(null);
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
            Savings goals
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track your progress toward the things that matter.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateGoalForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add goal
        </button>
      </div>

      {goals.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {goals.map((goal) => {
            const completed = Boolean(goal.completedAt);
            const progressWidth = Math.min(Math.max(goal.progress, 2), 100);

            return (
              <article
                key={goal.id}
                className="glass-panel-strong rounded-3xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-lg font-semibold">
                        {goal.name}
                      </h2>

                      {completed ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                      ) : null}
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {completed
                        ? "Completed goal"
                        : (goal.category?.name ?? "General goal")}
                    </p>
                  </div>

                  <Target className="h-5 w-5 shrink-0 text-primary" />
                </div>

                {goal.description ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {goal.description}
                  </p>
                ) : null}

                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-semibold">
                      {Math.round(goal.progress)}%
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatCurrency(goal.saved, currency)} saved
                    </p>
                  </div>

                  <p className="text-right text-xs text-muted-foreground">
                    Target
                    <br />
                    {formatCurrency(goal.targetAmount, currency)}
                  </p>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted/50">
                  <div
                    className={`h-full rounded-full ${progressColor(
                      goal.progress,
                      completed,
                    )}`}
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    {goal.remaining > 0
                      ? `${formatCurrency(goal.remaining, currency)} remaining`
                      : "Target reached"}
                  </span>

                  {goal.targetDate ? (
                    <span>
                      Target {formatDate(goal.targetDate, dateFormat)}
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {!completed ? (
                    <button
                      type="button"
                      onClick={() => setContributionGoal(goal)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add contribution
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setHistoryGoal(goal)}
                    className="rounded-xl border border-border px-3 py-2 text-xs font-medium transition hover:border-primary hover:text-primary"
                  >
                    History
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditGoalForm(goal)}
                    className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-primary"
                    aria-label={`Edit ${goal.name}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal)}
                    disabled={isPending}
                    className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-destructive hover:text-destructive disabled:opacity-50"
                    aria-label={`Delete ${goal.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel-strong rounded-3xl px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Target className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-lg font-semibold">No savings goals yet</h2>

          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Create a goal and start tracking your progress.
          </p>

          <button
            type="button"
            onClick={openCreateGoalForm}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Create your first goal
          </button>
        </div>
      )}

      {isGoalFormOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeGoalForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-dialog-title"
            className="glass-panel-strong max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto rounded-3xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">
                  Savings goals
                </p>

                <h2
                  id="goal-dialog-title"
                  className="mt-1 text-2xl font-semibold"
                >
                  {editingGoal ? "Edit goal" : "Add goal"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeGoalForm}
                aria-label="Close goal form"
                className="rounded-lg p-2 text-muted-foreground hover:bg-background/50 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={goalForm.handleSubmit(submitGoal)}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="goal-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Goal name
                </label>

                <input
                  id="goal-name"
                  type="text"
                  placeholder="e.g. Emergency fund"
                  {...goalForm.register("name")}
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />

                {goalForm.formState.errors.name ? (
                  <p className="mt-1 text-xs text-destructive">
                    {goalForm.formState.errors.name.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="goal-target-amount"
                  className="mb-2 block text-sm font-medium"
                >
                  Target amount
                </label>

                <input
                  id="goal-target-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...goalForm.register("targetAmount")}
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />

                {goalForm.formState.errors.targetAmount ? (
                  <p className="mt-1 text-xs text-destructive">
                    {goalForm.formState.errors.targetAmount.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="goal-category"
                  className="mb-2 block text-sm font-medium"
                >
                  Category
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    Optional
                  </span>
                </label>

                <select
                  id="goal-category"
                  {...goalForm.register("categoryId")}
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">No category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="goal-target-date"
                  className="mb-2 block text-sm font-medium"
                >
                  Target date
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    Optional
                  </span>
                </label>

                <input
                  id="goal-target-date"
                  type="date"
                  {...goalForm.register("targetDate")}
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />

                {goalForm.formState.errors.targetDate ? (
                  <p className="mt-1 text-xs text-destructive">
                    {goalForm.formState.errors.targetDate.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="goal-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    Optional
                  </span>
                </label>

                <textarea
                  id="goal-description"
                  rows={3}
                  placeholder="Add useful details..."
                  {...goalForm.register("description")}
                  className="w-full resize-y rounded-xl border border-input bg-background/40 px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />

                {goalForm.formState.errors.description ? (
                  <p className="mt-1 text-xs text-destructive">
                    {goalForm.formState.errors.description.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeGoalForm}
                  disabled={isPending}
                  className="h-11 rounded-xl border border-border px-4 text-sm font-medium hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
                >
                  {isPending
                    ? "Saving..."
                    : editingGoal
                      ? "Save changes"
                      : "Add goal"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {contributionGoal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setContributionGoal(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="contribution-dialog-title"
            className="glass-panel-strong w-full max-w-lg rounded-3xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">Contribution</p>

                <h2
                  id="contribution-dialog-title"
                  className="mt-1 text-2xl font-semibold"
                >
                  Add to {contributionGoal.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setContributionGoal(null)}
                aria-label="Close contribution form"
                className="rounded-lg p-2 text-muted-foreground hover:bg-background/50 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={contributionForm.handleSubmit(submitContribution)}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="contribution-amount"
                  className="mb-2 block text-sm font-medium"
                >
                  Amount
                </label>

                <input
                  id="contribution-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...contributionForm.register("amount")}
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />

                {contributionForm.formState.errors.amount ? (
                  <p className="mt-1 text-xs text-destructive">
                    {contributionForm.formState.errors.amount.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="contribution-date"
                  className="mb-2 block text-sm font-medium"
                >
                  Date
                </label>

                <input
                  id="contribution-date"
                  type="date"
                  {...contributionForm.register("date")}
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />

                {contributionForm.formState.errors.date ? (
                  <p className="mt-1 text-xs text-destructive">
                    {contributionForm.formState.errors.date.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="contribution-note"
                  className="mb-2 block text-sm font-medium"
                >
                  Note
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    Optional
                  </span>
                </label>

                <textarea
                  id="contribution-note"
                  rows={3}
                  placeholder="e.g. Monthly transfer"
                  {...contributionForm.register("note")}
                  className="w-full resize-y rounded-xl border border-input bg-background/40 px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />

                {contributionForm.formState.errors.note ? (
                  <p className="mt-1 text-xs text-destructive">
                    {contributionForm.formState.errors.note.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setContributionGoal(null)}
                  disabled={isPending}
                  className="h-11 rounded-xl border border-border px-4 text-sm font-medium hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Add contribution"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {historyGoal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setHistoryGoal(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-dialog-title"
            className="glass-panel-strong max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto rounded-3xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">
                  Contribution history
                </p>

                <h2
                  id="history-dialog-title"
                  className="mt-1 text-2xl font-semibold"
                >
                  {historyGoal.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setHistoryGoal(null)}
                aria-label="Close contribution history"
                className="rounded-lg p-2 text-muted-foreground hover:bg-background/50 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {historyGoal.contributions.length > 0 ? (
              <div className="mt-6 divide-y divide-border/50">
                {historyGoal.contributions.map((contribution) => (
                  <div
                    key={contribution.id}
                    className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {formatCurrency(contribution.amount, currency)}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(contribution.date, dateFormat)}
                        {contribution.note ? ` · ${contribution.note}` : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteContribution(
                          historyGoal.id,
                          contribution.id,
                        )
                      }
                      disabled={isPending}
                      aria-label="Delete contribution"
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-border/70 p-5 text-center">
                <p className="text-sm font-medium">No contributions yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add your first contribution to begin tracking progress.
                </p>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
