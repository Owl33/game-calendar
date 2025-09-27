export interface Game {
  id: string | number;
  name: string;
  released: string;
  image?: string;
}

export interface GamesByDate {
  [day: number]: Game[];
}

export interface CalendarDate {
  year: number;
  month: number;
  day: number | null;
}