const http = require("http");
const https = require("https");
const cron = require("cron");

const job = new cron.CronJob("*/14 * * * *", function () {
  const url = process.env.API_URL;
  const client = url.startsWith("https") ? https : http;

  client
    .get(url, (res) => {
      if (res.statusCode === 200) {
        console.log("GET request sent successfully");
      } else {
        console.log("GET request failed", res.statusCode);
      }
    })
    .on("error", (e) => console.error("Error while sending request", e));
});

module.exports = job;
