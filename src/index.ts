import got from "got";
import moment from "moment";
import { parse } from "node-html-parser";

const fetchUrl =
  "https://www.ss.lv/lv/real-estate/plots-and-lands/riga-region/sigulda/sell/filter/";

var lastSeen: string | null = null;
const ONE_HOUR_IN_MS = 1000 * 60 * 60;

function log(msg: string) {
  const time = moment().format("DD.MMM, HH:mm");
  console.log(`[${time}] ${msg}`);
}

const send = require("gmail-send")({
  user: "jekabs.karklins@gmail.com",
  pass: process.env.ppw,
  to: "jekabs.karklins@gmail.com",
  subject: "New real estate added to ss.lv",
});

function sendEmail() {
  log("Sending email");
  send(
    {
      text: `New property added: ${lastSeen}`,
    },
    (error: string, result: string, fullResult: any) => {
      if (error) {
        log(error);
      }
      if (result) {
        log(result);
      }
      if (fullResult) {
        log(JSON.stringify(fullResult));
      }
    }
  );
}

async function check() {
  log("Checking");

  const response = await got(fetchUrl);
  const dom = parse(response.body);
  const newestEntry = dom.querySelector(".msg2").text;

  console.log(`Newest entry ${newestEntry}`);
  if (lastSeen === null) {
    lastSeen = newestEntry;
    return;
  }

  if (newestEntry !== lastSeen) {
    lastSeen = newestEntry;
    sendEmail();
  }
}

setInterval(() => {
  check();
}, ONE_HOUR_IN_MS);

check();
