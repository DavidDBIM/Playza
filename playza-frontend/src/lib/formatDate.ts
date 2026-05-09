export const formatSessionTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  
  // Format: "9 May, 12:00 PM"
  return date.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const getRemainingTime = (dateString: string) => {
  const target = new Date(dateString).getTime();
  const now = new Date().getTime();
  const diff = target - now;
  
  if (diff <= 0) return null;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
};
