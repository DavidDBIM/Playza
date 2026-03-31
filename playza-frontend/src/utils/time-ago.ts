/**
 * Returns a human-readable string representation of the time elapsed since the given date.
 * @param date - The date to compare with the current time.
 * @returns A string like "2mins ago", "10secs ago", "just now", etc.
 */
export function timeAgo(date: string | Date | undefined): string {
  if (!date) return "N/A";
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 5) return "just now";
  if (diffInSeconds < 60) return `${diffInSeconds}secs ago`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}mins ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}hrs ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}days ago`;
  
  return past.toLocaleDateString();
}
