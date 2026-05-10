import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, pattern: string = 'MMM d, yyyy') {
  return format(new Date(date), pattern);
}

export function formatRelativeDate(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function getTripDuration(startDate: string | Date, endDate: string | Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function getTravelStyleColor(style: string): string {
  const colors: Record<string, string> = {
    LUXURY: 'text-amber-400 bg-amber-400/10',
    BACKPACKING: 'text-emerald-400 bg-emerald-400/10',
    ADVENTURE: 'text-orange-400 bg-orange-400/10',
    FAMILY: 'text-pink-400 bg-pink-400/10',
    SOLO: 'text-blue-400 bg-blue-400/10',
    ROMANTIC: 'text-rose-400 bg-rose-400/10',
    BUSINESS: 'text-slate-400 bg-slate-400/10',
    GROUP: 'text-violet-400 bg-violet-400/10',
  };
  return colors[style] || 'text-gray-400 bg-gray-400/10';
}

export function getTravelStyleEmoji(style: string): string {
  const emojis: Record<string, string> = {
    LUXURY: '💎',
    BACKPACKING: '🎒',
    ADVENTURE: '🧗',
    FAMILY: '👨‍👩‍👧',
    SOLO: '🧳',
    ROMANTIC: '❤️',
    BUSINESS: '💼',
    GROUP: '👥',
  };
  return emojis[style] || '✈️';
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    ADVENTURE: '🧗',
    FOOD: '🍽️',
    HISTORICAL: '🏛️',
    SHOPPING: '🛍️',
    NIGHTLIFE: '🌃',
    BEACHES: '🏖️',
    HIKING: '🥾',
    CULTURAL: '🎭',
    TRANSPORT: '🚌',
    ACCOMMODATION: '🏨',
    OTHER: '📍',
  };
  return icons[category] || '📍';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PLANNING: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    UPCOMING: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    ONGOING: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    COMPLETED: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    CANCELLED: 'text-red-400 bg-red-400/10 border-red-400/20',
  };
  return colors[status] || 'text-gray-400 bg-gray-400/10';
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}
