import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

// Date formatters
export function formatDate(date: string | Date, formatStr = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, formatStr) : 'Invalid date';
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : 'Invalid date';
}

// Number formatters
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// String formatters
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function formatInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Social handle formatters
export function formatSocialHandle(handle: string | null, platform: string): string {
  if (!handle) return '';
  const cleanHandle = handle.replace('@', '');
  switch (platform) {
    case 'instagram':
      return `@${cleanHandle}`;
    case 'tiktok':
      return `@${cleanHandle}`;
    case 'youtube':
      return cleanHandle;
    case 'twitter':
      return `@${cleanHandle}`;
    default:
      return cleanHandle;
  }
}

export function getSocialUrl(handle: string | null, platform: string): string {
  if (!handle) return '';
  const cleanHandle = handle.replace('@', '');
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${cleanHandle}`;
    case 'tiktok':
      return `https://tiktok.com/@${cleanHandle}`;
    case 'youtube':
      return `https://youtube.com/@${cleanHandle}`;
    case 'twitter':
      return `https://twitter.com/${cleanHandle}`;
    default:
      return '';
  }
}

// Status formatters
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    busy: 'bg-yellow-100 text-yellow-800',
    unavailable: 'bg-red-100 text-red-800',
    requested: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-purple-100 text-purple-800',
    archived: 'bg-gray-100 text-gray-800',
    pending: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: 'Available',
    busy: 'Busy',
    unavailable: 'Unavailable',
    requested: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    in_progress: 'In Progress',
    completed: 'Completed',
    archived: 'Archived',
    pending: 'Pending',
    submitted: 'Submitted',
    approved: 'Approved',
  };
  return labels[status] || status;
}
