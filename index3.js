const axios = require("axios");
require("dotenv").config();

// Env Api's
const slackMonitorApi = `${process.env.NODE_API}`;
const slackSendMessageApi = `${process.env.NODE_WEBHOOK_API}`;

// store previous api response
let previousData = {};

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

async function waitAndGiveResult(waitTime) {
  console.log("waitAndGiveResult called");
  let getResponse = {};

  //   return new Promise((resolve) => {
  //     // wait 3s before calling fn(par)
  //     setTimeout(
  //       () =>
  //         resolve(async () => {
  //             console.log("enter after 10000s");
  //           getResponse = await axios.get(slackMonitorApi);
  //           return getResponse;
  //         }),
  //       waitTime
  //     );
  //   });

  setTimeout(async () => {
    console.log("enter after 10000s");
    getResponse = await axios.get(slackMonitorApi);
  }, waitTime);
  return getResponse;
}

async function monitorThrice() {
  //   let getResponse1 = {};
  //   setTimeout(async () => {
  //     getResponse1 = await axios.get(slackMonitorApi);
  //     console.log("monitor thrice : 1");
  //   }, 10000);
  //   let getResponse2 = {};
  //   setTimeout(async () => {
  //     getResponse2 = await axios.get(slackMonitorApi);
  //     console.log("monitor thrice : 2");
  //   }, 10000);
  //   let getResponse3 = {};
  //   setTimeout(async () => {
  //     getResponse3 = await axios.get(slackMonitorApi);
  //     console.log("monitor thrice : 3");
  //   }, 10000);
  let getResponse1 = await waitAndGiveResult(10000);
  //   let getResponse2 = await waitAndGiveResult(10000);
  //   let getResponse3 = await waitAndGiveResult(10000);
  //   return [getResponse1, getResponse2, getResponse3];
  return getResponse1;
}

const monitorSlackApi = async () => {
  if (slackMonitorApi) {
    const getResponse = await axios.get(slackMonitorApi);

    var arryObj = {};
    await getResponse.data.data.map(async (item) => {
      var keyName = item.name.toLowerCase().replaceAll(" ", "-");
      arryObj[keyName] = {
        id: item.id,
        name: item.name,
        status_name: item.status_name,
      };
    });

    //   await Object.keys(arryObj).map((m) =>
    //     console.log("arryObj 1 ======>", arryObj[m].name)
    //   );
    const thriceResponse = await monitorThrice();
    console.log("thriceResponse =>", thriceResponse);

    if (Object.keys(previousData).length > 0) {
      await Object.keys(arryObj).map(async (key_name) => {
        // Operational
        if (arryObj[key_name].status_name === "Operational") {
          if (
            arryObj[key_name].status_name !== previousData[key_name].status_name
          ) {
            const text = `${arryObj[key_name].name} ${arryObj[key_name].status_name}`;
            await alertSlack({ text });
          }
        }
        // Partial Outage && Performance Issue
        else if (
          arryObj[key_name].status_name === "Partial Outage" ||
          arryObj[key_name].status_name === "Performance Issues"
        ) {
        }
      });
    }

    previousData = arryObj;
  } else {
    clearInterval(myTimer);
    console.log("Api from env file not found");
  }
};

function myTimer() {
  console.log("______Refreshed_______");
  monitorSlackApi();
}

setInterval(myTimer, refreshInterval);
