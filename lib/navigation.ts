import {
  BarChart3,
  Bell,
  CircleDollarSign,
  FileText,
  Gauge,
  Goal,
  LayoutDashboard,
  ListChecks,
  Repeat2,
  Settings,
  Tags,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Main",
    items: [
      {
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Transactions",
        href: "/dashboard/transactions",
        icon: ListChecks,
      },
    ],
  },
  {
    label: "Money",
    items: [
      {
        label: "Expenses",
        href: "/dashboard/expenses",
        icon: CircleDollarSign,
      },
      {
        label: "Income",
        href: "/dashboard/income",
        icon: WalletCards,
      },
      {
        label: "Budgets",
        href: "/dashboard/budgets",
        icon: Gauge,
      },
      {
        label: "Goals",
        href: "/dashboard/goals",
        icon: Goal,
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
      {
        label: "Reports",
        href: "/dashboard/reports",
        icon: FileText,
      },
    ],
  },
  {
    label: "Manage",
    items: [
      {
        label: "Categories",
        href: "/dashboard/categories",
        icon: Tags,
      },
      {
        label: "Recurring expenses",
        href: "/dashboard/recurring",
        icon: Repeat2,
      },
      {
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

export function isNavigationItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
