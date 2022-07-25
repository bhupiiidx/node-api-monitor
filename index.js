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
  var t = "";
  if (item.status_name === "Partial Outage") {
    t = `*${item.name}* \n ${item.status_name} :red_circle:`;
  } else if (item.status_name === "Performance Issues") {
    t = `*${item.name}* \n ${item.status_name} :full_moon:`;
  } else if (item.status_name === "Operational") {
    t = `*${item.name}* \n ${item.status_name} :white_check_mark:`;
  } else {
    t = item.name + " " + item.status_name;
  }
  var d = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: t,
        },
      },
    ],
  };


  await axios(slackSendMessageApi, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    data: d,
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
  var arryObj = {};
  await getResponse.data.data.map(async (item) => {
    var keyName = item.name.toLowerCase().replaceAll(" ", "-");
    arryObj[keyName] = {
      id: item.id,
      name: item.name,
      status_name: item.status_name,
    };
  });

  Object.keys(arryObj).map(async (key_name) => {
    if (previousData[key_name]) {
      var stored_dic = previousData[key_name];
      if (stored_dic["to_be_checked_again"]) {
        var stored_dic_lis = stored_dic["lis"];
        if (stored_dic_lis.length < 3) {
          stored_dic_lis.push(arryObj[key_name].status_name);
        }
        if (stored_dic_lis.length === 3) {
          alertSlack({
            name: arryObj[key_name].name,
            status_name: arryObj[key_name].status_name,
          });
          stored_dic_lis.length = 0;
          stored_dic["to_be_checked_again"] = false;
        }
      } else {
        if (arryObj[key_name].status_name !== stored_dic.status) {
          var new_dic = {};
          new_dic["status"] = arryObj[key_name].status_name;
          if (arryObj[key_name].status_name === "Partial Outage") {
            new_dic["to_be_checked_again"] = true;
            new_dic["lis"] = [arryObj[key_name].status_name];
          } else if (arryObj[key_name].status_name === "Performance Issues") {
            new_dic["to_be_checked_again"] = true;
            new_dic["lis"] = [arryObj[key_name].status_name];
          } else if (arryObj[key_name].status_name === "Operational") {
            new_dic["to_be_checked_again"] = false;
            new_dic["lis"] = [];
          } else {
            return;
          }
          previousData[key_name] = new_dic;
          if (!new_dic["to_be_checked_again"]) {
            alertSlack({
              name: arryObj[key_name].name,
              status_name: arryObj[key_name].status_name,
            });
          }
        }
      }
    } else {
      var new_dic = {};
      new_dic["status"] = arryObj[key_name].status_name;
      if (arryObj[key_name].status_name === "Partial Outage") {
        new_dic["to_be_checked_again"] = true;
        new_dic["lis"] = [arryObj[key_name].status_name];
      } else if (arryObj[key_name].status_name === "Performance Issues") {
        new_dic["to_be_checked_again"] = true;
        new_dic["lis"] = [arryObj[key_name].status_name];
      } else if (arryObj[key_name].status_name === "Operational") {
        new_dic["to_be_checked_again"] = false;
        new_dic["lis"] = [];
      } else {
        return;
      }
      previousData[key_name] = new_dic;
    }
  });
};

function myTimer() {
  console.log("______Refreshed_______");
  monitorSlackApi();
}

setInterval(myTimer, refreshInterval);
