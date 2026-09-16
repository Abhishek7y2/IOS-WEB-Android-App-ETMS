const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(dateString: string): string {
  if (!dateString) return '';

  const parts = dateString.split('-').map((value) => Number(value));
  if (parts.length !== 3 || parts.some((value) => Number.isNaN(value))) {
    return dateString;
  }

  const [year, month, day] = parts;
  const monthName = MONTH_NAMES[month - 1] ?? 'Jan';
  return `${monthName} ${day.toString().padStart(2, '0')}, ${year}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

