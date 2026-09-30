const DATE_LOCALE = "en-GB";

const dateFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const formatDate = (date: Date): string => dateFormatter.format(date);

export const formatDateTime = (date: Date): string => dateTimeFormatter.format(date);
