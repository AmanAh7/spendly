"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  ListFilter,
  Search,
} from "lucide-react";

import { formatCurrency } from "@/lib/format";

type TransactionRecord = {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  date: string;
  notes: string | null;
  classification: string | null;
  paymentMethod: string | null;
};

type TransactionsManagerProps = {
  transactions: TransactionRecord[];
  currency: string;
  page: number;
  totalPages: number;
  totalCount: number;
  search: string;
  type: string;
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

const incomeSourceLabels: Record<string, string> = {
  SALARY: "Salary",
  FREELANCE: "Freelance",
  BUSINESS: "Business",
  INVESTMENT: "Investment",
  INTEREST: "Interest",
  RENTAL_INCOME: "Rental Income",
  GIFT: "Gift",
  OTHER: "Other",
};

function getClassificationLabel(transaction: TransactionRecord) {
  if (transaction.type === "income") {
    return (
      incomeSourceLabels[transaction.classification ?? ""] ??
      transaction.classification ??
      "Income"
    );
  }

  return transaction.classification ?? "Expense";
}

function getSecondaryLabel(transaction: TransactionRecord) {
  if (
    transaction.type === "expense" &&
    transaction.paymentMethod &&
    paymentMethodLabels[transaction.paymentMethod]
  ) {
    return paymentMethodLabels[transaction.paymentMethod];
  }

  return null;
}

function formatTransactionDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN");
}

export function TransactionsManager({
  transactions,
  currency,
  page,
  totalPages,
  totalCount,
  search,
  type,
  sort,
}: TransactionsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function updateFilters(formElement: HTMLFormElement) {
    const formData = new FormData(formElement);
    const params = new URLSearchParams();

    const nextSearch = String(formData.get("search") ?? "").trim();
    const nextType = String(formData.get("type") ?? "all");
    const nextSort = String(formData.get("sort") ?? "date-desc");

    if (nextSearch) {
      params.set("search", nextSearch);
    }

    if (nextType !== "all") {
      params.set("type", nextType);
    }

    if (nextSort !== "date-desc") {
      params.set("sort", nextSort);
    }

    startTransition(() => {
      router.push(`/dashboard/transactions?${params.toString()}`);
    });
  }

  function changePage(nextPage: number) {
    const params = new URLSearchParams();

    if (search) {
      params.set("search", search);
    }

    if (type !== "all") {
      params.set("type", type);
    }

    if (sort !== "date-desc") {
      params.set("sort", sort);
    }

    params.set("page", String(nextPage));

    startTransition(() => {
      router.push(`/dashboard/transactions?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Finance</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Transactions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            View your income and expenses together in one place.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ListFilter className="h-4 w-4 text-primary" />
          {totalCount} {totalCount === 1 ? "transaction" : "transactions"}
        </div>
      </div>

      <form
        className="glass-panel-strong rounded-2xl p-4"
        onSubmit={(event) => {
          event.preventDefault();
          updateFilters(event.currentTarget);
        }}
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_220px_auto]">
          <label className="relative block">
            <span className="sr-only">Search transactions</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search transactions..."
              className="h-10 w-full rounded-xl border border-input bg-background/40 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <label>
            <span className="sr-only">Filter by transaction type</span>
            <select
              name="type"
              defaultValue={type}
              className="h-10 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All transactions</option>
              <option value="income">Income only</option>
              <option value="expense">Expenses only</option>
            </select>
          </label>

          <label>
            <span className="sr-only">Sort transactions</span>
            <select
              name="sort"
              defaultValue={sort}
              className="h-10 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
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
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Filter className="h-4 w-4" />
            {isPending ? "Loading..." : "Apply"}
          </button>
        </div>
      </form>

      <div className="glass-panel-strong overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">All transactions</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Combined income and expense activity.
            </p>
          </div>

          <CalendarDays className="h-5 w-5 text-primary" />
        </div>

        {transactions.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-190 text-left">
                <thead className="border-b border-border/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Transaction</th>
                    <th className="px-5 py-4 font-medium">Type</th>
                    <th className="px-5 py-4 font-medium">Classification</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 text-right font-medium">Amount</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/40">
                  {transactions.map((transaction) => {
                    const isIncome = transaction.type === "income";
                    const secondaryLabel = getSecondaryLabel(transaction);

                    return (
                      <tr
                        key={`${transaction.type}-${transaction.id}`}
                        className="transition hover:bg-background/20"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {transaction.description}
                          </p>
                          {transaction.notes ? (
                            <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                              {transaction.notes}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-2 text-sm ${
                              isIncome ? "text-success" : "text-primary"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                            {isIncome ? "Income" : "Expense"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          <span>{getClassificationLabel(transaction)}</span>
                          {secondaryLabel ? (
                            <span className="block text-xs">
                              {secondaryLabel}
                            </span>
                          ) : null}
                        </td>

                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {formatTransactionDate(transaction.date)}
                        </td>

                        <td
                          className={`px-5 py-4 text-right font-semibold ${
                            isIncome ? "text-success" : "text-foreground"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(transaction.amount, currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border/40 md:hidden">
              {transactions.map((transaction) => {
                const isIncome = transaction.type === "income";
                const secondaryLabel = getSecondaryLabel(transaction);

                return (
                  <article
                    key={`${transaction.type}-${transaction.id}`}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isIncome
                              ? "bg-success/15 text-success"
                              : "bg-primary/15 text-primary"
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-medium">
                            {transaction.description}
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {isIncome ? "Income" : "Expense"} ·{" "}
                            {getClassificationLabel(transaction)}
                          </p>
                          {secondaryLabel ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {secondaryLabel}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <p
                        className={`shrink-0 font-semibold ${
                          isIncome ? "text-success" : "text-foreground"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(transaction.amount, currency)}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>{formatTransactionDate(transaction.date)}</span>
                      {transaction.notes ? (
                        <span className="max-w-[55%] truncate">
                          {transaction.notes}
                        </span>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarDays className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">
              No transactions found
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {search
                ? "Try changing your search terms."
                : type === "income"
                  ? "No income records have been added yet."
                  : type === "expense"
                    ? "No expense records have been added yet."
                    : "Your income and expenses will appear here."}
            </p>
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
                disabled={page <= 1 || isPending}
                className="rounded-lg border border-border p-2 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => changePage(page + 1)}
                disabled={page >= totalPages || isPending}
                className="rounded-lg border border-border p-2 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
