import axios from "axios";
import * as functions from "firebase-functions";

import {
  DiscordStatus,
  WeekDay,
  MomentOfDay,
  Time,
  Item,
  isTime,
} from "./types";

export const verify = functions
  .runWith({ secrets: ["DISCORD_TOKEN"] })
  .pubsub.schedule("every 5 minutes")
  .timeZone("America/Sao_Paulo")
  .onRun(async (_) => {
    const now = new Date(Date.now() - 3 * 3600 * 1000);
    console.log("=== START EXECUTION ===");
    console.log(`Date: ${formatFullDate(now)}`);

    let status: DiscordStatus = DiscordStatus.online;
    let message: string | null = null;
    let expirationDate: Date | null = null;

    for (const item of agenda) {
      // console.log("=== ITEM OF AGENDA ===");
      // console.log(`Message: ${item.message}`);
      // console.log(`WeekDay: ${item.moment.weekDay}`);
      // console.log(`Start: ${formatTime(item.moment.startTime)}`);
      // console.log(`End: ${formatTime(item.moment.endTime)}`);
      // console.log(`Same day of week? ${isAtSameDayOfWeek(now, item.moment)}`);
      // console.log(`Is in interval? ${itemIsOccurring(now, item.moment)}`);
      if (
        isAtSameDayOfWeek(now, item.moment) &&
        itemIsOccurring(now, item.moment)
      ) {
        console.log(
          `Found Item in Range: ${item.message} - ${formatTime(
            item.moment.startTime
          )} -> ${formatTime(item.moment.endTime)}`
        );
        status = DiscordStatus.dontDisturb;
        message = item.message;
        expirationDate = getExpirationDateUTC(now, item.moment.endTime);
      }
    }

    console.log("=== STATUS TO SET ===");
    console.log(`Status: ${status}`);
    console.log(`Message: ${message}`);
    console.log(
      `Expiration Date: ${
        expirationDate !== null ? formatFullDate(expirationDate) : null
      }`
    );

    let data: { [key: string]: any } = {};
    data.status = status.valueOf();
    if (message !== null && expirationDate !== null) {
      data.custom_status = {
        text: message,
        expires_at: expirationDate?.toISOString(),
      };
    }

    await axios.patch("https://discord.com/api/v6/users/@me/settings", data, {
      headers: {
        Authorization: `${process.env.DISCORD_TOKEN}`,
      },
    });

    console.log("=== END ===");
  });

function isAtSameDayOfWeek(now: Date, moment: MomentOfDay): boolean {
  return now.getDay() === moment.weekDay.valueOf();
}

function itemIsOccurring(now: Date, moment: MomentOfDay): boolean {
  const start = new Date(now.getTime());
  start.setHours(moment.startTime.hours);
  start.setMinutes(moment.startTime.minutes);

  const end = new Date(now.getTime());
  end.setHours(moment.endTime.hours);
  end.setMinutes(moment.endTime.minutes);

  return now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
}

function getExpirationDateUTC(now: Date, endTime: Time): Date {
  const endDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    endTime.hours,
    endTime.minutes,
    0
  );

  // console.log(`END DATE LOCAL: ${endDate.toISOString()}`);
  // console.log(endDate.getTime());
  // console.log(endDate.getTime() + 3 * 3600 * 1000);
  // console.log(
  //   `END DATE UTC: ${new Date(
  //     endDate.getTime() + 3 * 3600 * 1000
  //   ).toISOString()}`
  // );

  return new Date(endDate.getTime() + 3 * 3600 * 1000);
}

function formatTime(input: Date): string;
function formatTime(input: Time): string;

function formatTime(input: unknown): string {
  if (input instanceof Date) {
    return `${prefixZero(input.getHours())}h${prefixZero(
      input.getMinutes()
    )}min`;
  } else if (isTime(input)) {
    return `${prefixZero((input as Time).hours)}h${prefixZero(
      (input as Time).minutes
    )}min`;
  }

  throw Error();
}

function formatDate(date: Date): string {
  return `${prefixZero(date.getDate())}/${prefixZero(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
}

function prefixZero(input: number): string {
  return `${("0" + input).slice(-2)}`;
}

function formatFullDate(date: Date): string {
  return `${formatDate(date)} - ${formatTime(date)}`;
}

const agenda: Array<Item> = [
  {
    message: "Em Aula: SD",
    moment: {
      weekDay: WeekDay.monday,
      startTime: {
        hours: 8,
        minutes: 50,
      },
      endTime: {
        hours: 10,
        minutes: 40,
      },
    },
  },
  {
    message: "Em Aula: CC",
    moment: {
      weekDay: WeekDay.monday,
      startTime: {
        hours: 10,
        minutes: 40,
      },
      endTime: {
        hours: 12,
        minutes: 20,
      },
    },
  },
];
