export const formatTimestamp = (timestamp: Date | string): string => {
  const date = new Date(timestamp); 
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const isYesterday = (() => {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  })();

  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const time = date.toLocaleTimeString(undefined, options);

  if (isToday) {
    return `Today at ${time}`;
  } else if (isYesterday) {
    return `Yesterday at ${time}`;
  } else {
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    const formattedDate = date.toLocaleDateString(undefined, dateOptions);
    return `${formattedDate} at ${time}`;
  }
};
