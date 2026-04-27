import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function guestsSortKey(guests: string | number | null | undefined): number {
  if (guests == null) return Number.MAX_SAFE_INTEGER
  const match = String(guests).match(/\d+/)
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER
}
