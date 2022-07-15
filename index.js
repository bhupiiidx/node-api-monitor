const axios = require("axios");

// Api's
const slackMonitorApi = "http://216.48.177.163:8088/api/v1/components";
const slackSendMessageApi =
  "https://chat.bangalore2.com/hooks/5ub7wxdz5jy1jyzzqqx443p6pc";

// store previous api response
let previousData = [];

// Refresh Interval
const refreshInterval = 1000;

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
  if (previousData.length > 0) {
    await getResponse.data.data.map(async (item, index) => {
      if (item.status_name !== previousData[index].status_name) {
        const text = `${item.name} ${item.status_name}`;
        await alertSlack({ text });
      }
    });
  }

  previousData = getResponse.data.data;
};

setInterval(async () => {
  await monitorSlackApi();
}, refreshInterval);
