import type { TableCellValue, TableColumn } from '../types/table';

const DEFAULT_DATE_FORMAT = 'Y-m-d';
const DEFAULT_DATE_TIME_FORMAT = 'Y-m-d H:i:s';

const stringMeta = (column: TableColumn, key: string, fallback = ''): string => {
  const value = column.meta[key];

  return typeof value === 'string' ? value : fallback;
};

const parseDate = (value: TableCellValue, dateOnly: boolean): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return null;
  }

  if (dateOnly) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedValue);

    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
  }

  const date = new Date(trimmedValue);

  return Number.isNaN(date.getTime()) ? null : date;
};

const partsFor = (date: Date, timezone: string | undefined): Record<string, string> => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  if (timezone) {
    options.timeZone = timezone;
  }

  return Object.fromEntries(
    new Intl.DateTimeFormat('en-US', options)
      .formatToParts(date)
      .map((part: Intl.DateTimeFormatPart): [string, string] => [part.type, part.value])
  );
};

const namedPart = (date: Date, part: 'month' | 'weekday', style: 'short' | 'long', timezone: string | undefined): string => {
  const options: Intl.DateTimeFormatOptions = { [part]: style };

  if (timezone) {
    options.timeZone = timezone;
  }

  return new Intl.DateTimeFormat('en-US', options).format(date);
};

const hour12 = (hour: number): number => {
  const value = hour % 12;

  return value === 0 ? 12 : value;
};

const pad = (value: number): string => String(value).padStart(2, '0');

export function formatDateValue(column: TableColumn, value: TableCellValue, dateOnly = false): string {
  const placeholder = stringMeta(column, 'placeholder', '-');

  if (value === null || value === undefined || value === '') {
    return placeholder;
  }

  const date = parseDate(value, dateOnly);

  if (!date) {
    return String(value);
  }

  const timezone = dateOnly ? undefined : stringMeta(column, 'timezone') || undefined;
  const format = stringMeta(column, 'format', dateOnly ? DEFAULT_DATE_FORMAT : DEFAULT_DATE_TIME_FORMAT);
  const parts = partsFor(date, timezone);
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour === '24' ? '0' : parts.hour);
  const minute = Number(parts.minute);
  const second = Number(parts.second);
  const replacements: Record<string, string> = {
    Y: String(year),
    yyyy: String(year),
    y: String(year).slice(-2),
    yy: String(year).slice(-2),
    F: namedPart(date, 'month', 'long', timezone),
    MMMM: namedPart(date, 'month', 'long', timezone),
    M: namedPart(date, 'month', 'short', timezone),
    MMM: namedPart(date, 'month', 'short', timezone),
    m: pad(month),
    MM: pad(month),
    n: String(month),
    d: pad(day),
    dd: pad(day),
    j: String(day),
    D: namedPart(date, 'weekday', 'short', timezone),
    l: namedPart(date, 'weekday', 'long', timezone),
    H: pad(hour),
    HH: pad(hour),
    G: String(hour),
    h: pad(hour12(hour)),
    hh: pad(hour12(hour)),
    g: String(hour12(hour)),
    i: pad(minute),
    mm: pad(minute),
    s: pad(second),
    ss: pad(second),
    A: hour < 12 ? 'AM' : 'PM',
    a: hour < 12 ? 'am' : 'pm'
  };

  return format.replace(/yyyy|MMMM|MMM|MM|dd|yy|HH|hh|mm|ss|Y|y|F|M|m|n|d|j|D|l|H|G|h|g|i|s|A|a/g, (token: string): string => replacements[token] ?? token);
}