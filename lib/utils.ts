import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely, resolving conflicting utility classes.
 * Used by every shadcn/ui component and our own custom components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
