const axios = require("axios");

// Api's
const slackMonitorApi = "http://216.48.177.163:8088/api/v1/components?per_page=50";
const slackSendMessageApi =
  "https://chat.bangalore2.com/hooks/5ub7wxdz5jy1jyzzqqx443p6pc";

// store previous api response
let previousData = [];

// Refresh Interval
const refreshInterval = 10000;

const alertSlack = async (item) => {
  console.log("item msg is =>", item.text);
  const rawResponse = await axios(slackSendMessageApi, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    data: { text: item.text },
  })
    .then((data) => {
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
          previousData[0][index].status_name !==
            'Operational'
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
