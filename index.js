const axios = require("axios");
require("dotenv").config();

// Api's
const slackMonitorApi = process.env.NODE_API;
const slackSendMessageApi = process.env.NODE_WEBHOOK_API;

// store previous api response
let previousData = [];

// Refresh Interval
const refreshInterval = 10000;

// Web hook Alert
const alertSlack = async (item) => {
  await axios(slackSendMessageApi, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    data: { text: item.text },
  })
    .then((data) => {
      console.log("Message Sent for ", item.text);
      return data.data.message;
    })
    .catch((err) => {
      return err?.response?.data?.message;
    });
};

const monitorSlackApi = async () => {
  const getResponse = await axios.get(slackMonitorApi);
  if (previousData.length > 3) {
    await getResponse.data.data.map(async (item, index) => {
      // Operational
      if (item.status_name === "Operational") {
        if (item.status_name !== previousData[2][index].status_name) {
          const text = `${item.name} ${item.status_name}`;
          await alertSlack({ text });
        }
      }
      // Partial Outage && Performance Issue
      else if (
        item.status_name === "Partial Outage" ||
        item.status_name === "Performance Issues"
      ) {
        if (
          previousData[0][index].status_name ===
            previousData[1][index].status_name &&
          previousData[0][index].status_name ===
            previousData[2][index].status_name &&
          previousData[0][index].status_name !== "Operational"
        ) {
          if (item.status_name !== previousData[0][index].status_name) {
            const text = `${item.name} ${item.status_name}`;
            await alertSlack({ text });
          }
        }
      }
    });
  }

  previousData.push(getResponse.data.data);
  while (previousData.length > 3) {
    previousData.shift();
  }
};

console.log("Node api monitor running...");
setInterval(async () => {
  await monitorSlackApi();
}, refreshInterval);
