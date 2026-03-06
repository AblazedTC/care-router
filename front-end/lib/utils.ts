import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getGoogleMapsUrl(name: string, address: string): string {
  const query = encodeURIComponent(`${name}, ${address}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}
