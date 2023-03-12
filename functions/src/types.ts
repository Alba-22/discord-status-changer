// https://stackoverflow.com/questions/39494689/is-it-possible-to-restrict-number-to-a-certain-range/70307091#70307091
type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

type CustomRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

export interface Item {
  moment: MomentOfDay;
  message: string;
}

export interface MomentOfDay {
  weekDay: WeekDay;
  startTime: Time;
  endTime: Time;
}

export enum WeekDay {
  sunday = 0,
  monday = 1,
  tuesday = 2,
  wednesday = 3,
  thursday = 4,
  friday = 5,
  saturday = 6,
}

export interface Time {
  hours: Hour;
  minutes: Minute;
  second?: Second;
}

export function isTime(input: any): boolean {
  return "hours" in input && "minutes" in input;
}

export type Second = CustomRange<0, 60>;
export type Minute = CustomRange<0, 60>;
export type Hour = CustomRange<0, 24>;

export enum DiscordStatus {
  online = "online",
  dontDisturb = "dnd",
}
