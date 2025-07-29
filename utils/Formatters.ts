export function formatTime(dateStr: string | Date): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(dateStr: string | Date): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelative(dateStr: string | Date): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = Math.abs(now.getTime() - then.getTime());

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);

  if (days > 0) return formatDate(then);
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `Just now`;
}
