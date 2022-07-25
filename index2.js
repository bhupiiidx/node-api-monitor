const axios = require("axios");
require("dotenv").config();

// Env Api's
const slackMonitorApi = `${process.env.NODE_API}`;
const slackSendMessageApi = `${process.env.NODE_WEBHOOK_API}`;

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
  if(slackMonitorApi){
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
  
    if (previousData.length > 2) {
      await Object.keys(arryObj).map(async (key_name) => {
        // Operational
        if (arryObj[key_name].status_name === "Operational") {
          if (
            arryObj[key_name].status_name !==
            previousData[2][key_name].status_name
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
          if (
            previousData[0][key_name].status_name ===
              previousData[1][key_name].status_name &&
            previousData[0][key_name].status_name ===
              previousData[2][key_name].status_name &&
            previousData[0][key_name].status_name !== "Operational"
          ) {
            if (
              arryObj[key_name].status_name !==
              previousData[0][key_name].status_name
            ) {
              const text = `${arryObj[key_name].name} ${arryObj[key_name].status_name}`;
              await alertSlack({ text });
            }
          }
          else{
            var po = 0
            var pi = 0
            var o = 0
            var text = ''
            previousData.map(m => {
              m[key_name].status_name === 'Partial Outage' && po++
              m[key_name].status_name === 'Performance Issues' && pi++
              m[key_name].status_name === 'Operational' && o++
            })
            if(previousData[0][key_name].status_name !== "Operational"){
              text = `${arryObj[key_name].name} ${arryObj[key_name].status_name}`
              await alertSlack({ text });
            }
            else{
              if(po > 1){
                text = `${arryObj[key_name].name} Partial Outage`
                await alertSlack({ text });
              }
              else if(pi > 1){
                text = `${arryObj[key_name].name} Partial Outage`
                await alertSlack({ text });
              }
              else if(o > 1){
                text = `${arryObj[key_name].name} Partial Outage`
                await alertSlack({ text });
              }
              else{
                return
              }
            }
          }
        }
      });
    }
  
    previousData.push(arryObj);
    while (previousData.length > 3) {
      previousData.shift();
    }
  }
  else{
    clearInterval(myTimer);
    console.log("Api from env file not found");
  }
};

function myTimer(){
  console.log("______Refreshed_______");
  monitorSlackApi();
}

setInterval(myTimer, refreshInterval);
