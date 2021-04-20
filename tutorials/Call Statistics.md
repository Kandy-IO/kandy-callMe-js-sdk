---
layout: page
categories: quickstarts-javascript
title: Call Statistics
permalink: /quickstarts/javascript/newCallMe/Call%20Statistics
---

# Call Statistics

In this quickstart we will cover the basics of retrieving call statistics with Kandy.js. Code snippets will be used to demonstrate this feature, and together these snippets will form a working demo application that can be viewed at the end.

## The need to collect & target audience

Call statistics can be extremely useful to help with debugging various call-related issues in the field. Collecting these statistics may also serve as a basis for some application features. For example, they can be used for displaying the health status of a live call as part of an application's monitoring panel.

Obtaining call statistics is a mid-call operation, therefore, there must be an established call in order to start collecting statistics. For this tutorial, we will assume you're familiar with making and establishing calls. Otherwise, please see [Voice and Video Calls Quickstart](Voice%20and%20Video%20Calls).

The call statistics we're about to capture in this tutorial are low level stats and won't be necessarily appropriate for the end users who make the calls. This tutorial is targeted for developers of call applications, and recommends a way on how to capture this data for call quality analysis.

## Requirements & the returned stats

Collecting Call statistics is done by invoking the [`call.getStats`](https://kandy-io.github.io/kandy-callMe-js-sdk/docs/#callgetstats) API.

At a minimum one must provide the `callId` associated with current call. This will return statistics about the call itself.

If a `trackId` is also provided, it can be used to obtain a more specific report (i.e. statistics about the track itself within that active call).
The supplied `trackId` may refer to locally created media tracks or remote tracks.

The returned statistics come from the WebRTC statistics monitoring model in the form of a RTCStatsReport. For further details on such report, see [RTCStatsReport](https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport). In addition to RTCStatsReport, there will also be a statistic report coming from Kandy.js.

Once the `call.getStats` API is invoked, there are two ways of obtaining the results:

- By using the returned Promise object.
- By implementing a handler function which listens to the `call:statsReceived` event.

For simplicity, this tutorial will showcase the first option.

## Collecting Call statistics

Once Call statistics have been collected, they can be further inspected.

For the purpose of collecting such stats, this tutorial is just showing augmented functionality already provided in the [Logging](Logging) tutorial where one can download the collected data, for convenience.

Application developers may choose to download statistics data along with log data.
However, for this tutorial we'll only provide the download of statistics data in order to demonstrate just the Call statistics.

To follow a typical use case, this tutorial binds the Call statistics collection to the lifetime of a single call.

Therefore, the collection of the statistics will start as soon as call is started by either party, and automatically end when either party hangs up the call. For simplicity, the collected stats are stored in an array and each participant in the call will collect its own statistics.

If a new call is started, this tutorial will append its collected stats to the previously collected stats. For this tutorial, we will store the stats for each call in a 2D array. The format of the array will be: `[ [callId, RTCStats], [callId, RTCStats], ... ]`, where `RTCStats` is an array of the collected stats.

```javascript
// Save the call statistics in this array
let callStats = []
```

To keep a simple bound on accumulated data, this array will store up to a maximum of 5 calls worth of statistics.

```javascript
// We'll store only this many calls worth of stats.
const MAX_STATS_LENGTH = 5
```

Once we collect stats for over 5 calls, the stats related to the oldest call will be automatically removed.

Application developers can choose to alter this behaviour of course, based on the application's needs.

## User Interface

To interact with our demo application, we will have a basic UI that allows us to make outgoing anonymous calls. The UI will be kept very simple, as it is not the focus of this quickstart, so it will be a straightforward set of elements for user input.

Just like in [Anonymous Calls Quickstart](Voice%20and%20Video%20Calls), you will need to fill in a few fields and then make any type of anonymous call to another user.

We won't cover the widgets associated with these steps as they are covered in their respective tutorial sections.

The only new widget we'll add in this tutorial is a download button, which downloads whatever Call statistics have been accumulated so far.

```html
<input type="submit" value="Download Call Stats" onclick="downloadCallStats()" /> <br />
<br />
```

This follows very similar functionality showcased in [Logging Quickstart](Logging) where a download button was provided to get the log data.

Typically, application developers would likely combine these 2 sets of data (logs and call statistics) into one download option.

## Step 1: Making & Answering a Call

For this tutorial, calls are made with audio-only.
We won't go into details on how a call is made/answered, as this is covered in the Voice and Video Calls section.

Because we'll only have a voice call, we will only add a remote container so that each side can hear audio coming from remote peer, once the call is established.

## Step 2: Call Events & Triggering functions

The call events available during the life-cycle of a call are also mentioned in the Anonymous Calls tutorial (including the ones responsible for rendering the media tracks) and can be referred to from there.

For this tutorial, we chose a few of these events & functions to be the triggers for the start of the Call statistics collection, as well as to mark the end of the collection. For the data collection, we'll use a timer variable which will trigger every 1 second, as follows:

```javascript
// Define our timer variable
let timer

const TIMEOUT_INTERVAL = 1000 // 1 second

// Implement our Call statistics collection
function retrieveCallStats () {
  // Get the stats by invoking the API.
  // For this example, we'll only get the stats
  // associated with the callId (i.e. no trackId is used as second parameter)
  client.call
    .getStats(callId)
    .then(stats => {
      // Use a boolean to track whether it's a new call's stats
      let newCall = true
      // Find the stats for the current call using the callId
      for (callStat of callStats) {
        if (callStat[0] === callId) {
          newCall = false
          // Add the stats from the RTCStatsReport Map object to this calls stats
          callStat[1].push(...stats.values())
          break
        }
      }
      // If the newCall boolean is still true, these stats are for a new call
      if (newCall) {
        // Before we store this calls stats, remove the oldest call's stats if we are beyond the max collection limit
        if (callStats.length === MAX_STATS_LENGTH) {
          log('Removing all call statistics associated with oldest call.')
          callStats = callStats.slice(1)
        }
        // Add the stats for this call to the collection of call stats
        callStats.push([callId, [...stats.values()]])
      }
    })
    .catch(error => {
      log('Stats collection failed. Error message: ', error.error.message)
      clearTimeout(timer)
    })
}
```

- Start call stats collection when caller gets a `call:start` event, as part of making the anonymous call:

```javascript 
client.on('call:start', function (params) {
   log('Starting call stats collection.')
   timer = setInterval(retrieveCallStats, TIMEOUT_INTERVAL) // trigger stats collection every 1 second
}
```

- Stop the 'local' call stats collection when user hangs up:

```javascript 
function endCall () {
  log('Stopping call stats collection.')
  clearTimeout(timer) // stop stats collection

  // Access call by the callId and end the call
  ...
}
```

- Stop the call stats collection when remote side hangs up.

```javascript 
client.on('call:stateChange', function (params) {
  // Retrieve call state using params.callId
  ...

  // If the call ended, stop stats collection.
  if (call.state === 'Ended') {
    log('Stopping call stats collection.')
    clearTimeout(timer) // stop stats collection

    // Reset callId
    ...
  }
})
```

## Step 3: Save Call Statistics to File

As mentioned earlier, the saving of Call statistics is done in a similar manner to the logs in the Logging tutorial section, and the functionality can be combined to download both types of data.

```javascript
/**
 * Function for providing the SDK call statistics to a user via a downloaded file.
 * @method downloadCallStats
 */
function downloadCallStats () {
  // Convert the saved call stats into a JSON blob.
  const blob = new Blob([JSON.stringify(callStats)], { type: 'application/json' })

  // Create a button that will save the Blob as a file when clicked.
  const button = document.createElement('a')
  button.href = URL.createObjectURL(blob)
  // Give the file a name.
  button.download = Date.now().toString() + '_sdk' + client.getVersion() + '_call_stats.json'

  // Auto-click the button.
  button.click()
}
```

We can now call the demo application done. We've covered the basics of what is needed to allow a user to collect call statistics.

## Live Demo

Want to try this example for yourself? Click the button below to get started.

### Instructions for Demo

#### Prerequisites (for token-based anonymous calling)

- Make sure you have the key & realm values obtained from your administrator.
- Make sure you have the necessary tokens before proceeding. See [Generating Tokens](Generating%20Tokens).

#### Steps

1. Open one browser or tab instance of Google Chrome®, or [another supported browser](Get%20Started), by clicking **Try it** once. This will be the browser instance starting the anonymous call (i.e., _caller_).
2. Go to the 'Voice and Video Calls' tutorial in the _Kandy Link_ Tutorials, and open one browser or tab instance of Google Chrome® (or another supported browser) by clicking **Try it** once. This will be the browser instance which will answer the call (i.e. _callee_).
3. For the _callee_, enter the appropriate authentication credentials for the account or project.
   - Enter the email address of that callee user (account or project users).
   - Enter the password to authenticate.
4. For the anonymous _caller_, do the following:
   - For regular anonymous calls to the callee, ensure the 'Make a token-based call' checkbox is unchecked.
     - Enter the primary contact of the _caller_ in the specified text field.
     - Enter the primary contact of the _callee_ in the specified text field.
   - For token-based anonymous call to the callee, ensure 'Make a token-based call' checkbox is checked.
     - In this case, ensure that your Node.js HTTPS server is started. We've provided a sample server, and this server can be started using the `yarn start` command.
     - NOTE: If using the sample server, you will need to replace the dummy values specified in the `index.js` file of the sample server (lines 30-35) with your own values. Also, a key and certificate file will be needed to start the server with HTTPS (lines 14-17).
     - Once the sample server has been started, the codepen will interact with the server to retrieve the necessary parameters for making a token-based anonymous call at the time the anonymous call is made.
5. Click **Make Call** to start the anonymous call to the _callee_.
6. Accept the incoming call from the _callee_. The two parties should now be in an established call and collection of call statistics should have started on both sides.
7. Click **End Call** in either browser instance to end the call. Call statistics should have ended on both sides.
8. Click **Download Call Stats** in either instance to download the statistics. Check your **Downloads** folder which should contain your downloaded file.

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Anonymous Call Statistics Demo\n */\n\n// Save the call statistics in this array\nlet callStats = []\n\n// We&apos;ll store only this many calls worth of stats.\nconst MAX_STATS_LENGTH = 5\n\n// Setup Kandy with the following configuration.\nconst { create } = Kandy\nconst client = create({\n  call: {\n    iceserver: [\n      {\n        url: &apos;$KANDYTURN1$&apos;,\n        credentials: &apos;&apos;\n      },\n      {\n        url: &apos;$KANDYTURN2$&apos;,\n        credentials: &apos;&apos;\n      },\n      {\n        url: &apos;$KANDYSTUN1$&apos;,\n        credentials: &apos;&apos;\n      },\n      {\n        url: &apos;$KANDYSTUN2$&apos;,\n        credentials: &apos;&apos;\n      }\n    ]\n  },\n  authentication: {\n    subscription: {\n      service: [&apos;call&apos;],\n      server: &apos;$SUBSCRIPTIONFQDN$&apos;\n    },\n    websocket: {\n      server: &apos;$SUBSCRIPTIONFQDN$&apos;\n    }\n  },\n  logs: {\n    logLevel: &apos;debug&apos;,\n    logActions: {\n      actionOnly: false,\n      exposePayloads: true\n    }\n  }\n})\n\nfunction toggleVisibilityOnUserFields () {\n  let chbox = document.getElementById(&apos;make-token-based-anonymous-call&apos;)\n  let visibility = &apos;block&apos;\n  if (chbox.checked) {\n    visibility = &apos;none&apos;\n  }\n  document.getElementById(&apos;callerSection&apos;).style.display = visibility\n  document.getElementById(&apos;calleeSection&apos;).style.display = visibility\n}\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  document.getElementById(&apos;messages&apos;).innerHTML += &apos;<div>&apos; + message + &apos;</div>&apos;\n}\n\n// Variable to keep track of the call.\nlet callId\n\n// If call is a regular anonymous one, then we&apos;ll use caller & callee\n// values, as provided by user (in the text fields of this UI).\n// If call is a token-based anonymous one, then caller & callee will\n// be obtained from our Node.js https server.\nasync function makeAnonymousCall () {\n  let makeATokenBasedAnonymousCall = document.getElementById(&apos;make-token-based-anonymous-call&apos;).checked\n\n  let caller = document.getElementById(&apos;caller&apos;).value\n  if (!caller && !makeATokenBasedAnonymousCall) {\n    // For regular anonymous call, ask user to fill in the value\n    log(&apos;Error: Please provide the primary contact for the caller.&apos;)\n    return\n  }\n\n  let callee = document.getElementById(&apos;callee&apos;).value\n  if (!callee && !makeATokenBasedAnonymousCall) {\n    // For regular anonymous call, ask user to fill in the value\n    log(&apos;Error: Please provide the primary contact for the callee.&apos;)\n    return\n  }\n\n  // For regular anonymous call, there is no need for credentials\n  let credentials = {}\n\n  // Define our call options. Assume for now it is for a regular anonymous call.\n  const callOptions = {\n    from: caller,\n    video: false,\n    audio: true\n  }\n  if (makeATokenBasedAnonymousCall) {\n    // Before attempting to trigger outgoing call, get the actual token values\n    // from expressjs application server in order to make a token-based anonymous call.\n    const getTokensRequestUrl = &apos;https://localhost:3000/callparameters&apos;\n    let result = await fetch(getTokensRequestUrl)\n    let data = await result.json()\n\n    let accountToken = data.accountToken\n    let fromToken = data.fromToken\n    let toToken = data.toToken\n    let realm = data.realm\n\n    caller = data.caller\n    callee = data.callee\n\n    callOptions[&apos;from&apos;] = caller\n\n    log(&apos;Got Account Token: &apos; + accountToken)\n    log(&apos;Got From Token:    &apos; + fromToken)\n    log(&apos;Got To Token:      &apos; + toToken)\n    log(&apos;Got Realm:         &apos; + realm)\n    log(&apos;Got Caller:        &apos; + caller)\n    log(&apos;Got Callee:        &apos; + callee)\n\n    // Build our credentials object.\n    credentials = {\n      accountToken,\n      fromToken,\n      toToken,\n      realm\n    }\n    log(&apos;Making a token-based anonymous call to &apos; + callee)\n  } else {\n    // For regular anonymous calls, no extra information is needed.\n    log(&apos;Making a regular anonymous call to &apos; + callee)\n  }\n\n  // Finally, trigger the outgoing anonymous call.\n  callId = client.call.makeAnonymous(callee, credentials, callOptions)\n}\n\n// End an ongoing call.\nfunction endCall () {\n  // Retrieve call state.\n  let call = client.call.getById(callId)\n  log(&apos;Ending call with &apos; + call.to)\n\n  client.call.end(callId)\n}\n\n// Set listener for generic call errors.\nclient.on(&apos;call:error&apos;, function (params) {\n  log(&apos;Error: Encountered error on call: &apos; + params.error.message)\n})\n\nclient.on(&apos;media:error&apos;, function (params) {\n  log(&apos;Call encountered media error: &apos; + params.error.message)\n})\n\n// Set listener for changes in a call&apos;s state.\nclient.on(&apos;call:stateChange&apos;, function (params) {\n  // Retrieve call state.\n  const call = client.call.getById(params.callId)\n\n  if (params.error && params.error.message) {\n    log(&apos;Error: &apos; + params.error.message)\n  }\n  log(&apos;Call state changed from &apos; + params.previous.state + &apos; to &apos; + call.state)\n\n  // If the call ended, stop tracking the callId.\n  if (call.state === &apos;Ended&apos;) {\n    log(&apos;Stopping call stats collection.&apos;)\n    clearTimeout(timer) // stop stats collection\n\n    callId = null\n  }\n})\n\n// Set listener for successful call starts & triggering point for starting stats collection.\nclient.on(&apos;call:start&apos;, function (params) {\n  log(&apos;Call successfully started. Waiting for response.&apos;)\n\n  // Start Call statistics collection at this point\n  log(&apos;Starting call stats collection.&apos;)\n  timer = setInterval(retrieveCallStats, TIMEOUT_INTERVAL) // trigger stats collection every 1 second\n})\n\n// Set listener for incoming calls.\nclient.on(&apos;call:receive&apos;, function (params) {\n  // Keep track of the callId.\n  callId = params.callId\n\n  // Retrieve call information.\n  let call = client.call.getById(params.callId)\n  log(&apos;Received incoming call from &apos; + call.from)\n\n  log(&apos;Starting call stats collection.&apos;)\n  timer = setInterval(retrieveCallStats, TIMEOUT_INTERVAL) // trigger stats collection every 1 second\n})\n\n// Set listener for new tracks.\nclient.on(&apos;call:newTrack&apos;, function (params) {\n  // Check whether the new track was a local track or not.\n  if (!params.local) {\n    // Only render the remote audio into the remote container.\n    client.media.renderTracks([params.trackId], &apos;#remote-container&apos;)\n  }\n})\n\n// Set listener for ended tracks.\nclient.on(&apos;call:trackEnded&apos;, function (params) {\n  // Check whether the ended track was a local track or not.\n  if (!params.local) {\n    // Remove the track from the remote container.\n    client.media.removeTracks([params.trackId], &apos;#remote-container&apos;)\n  }\n})\n\n// Define our timer variable\nlet timer\n\nconst TIMEOUT_INTERVAL = 1000 // 1 second\n\n// Implement our Call statistics collection\nfunction retrieveCallStats () {\n  // Get the stats by invoking the API.\n  // For this example, we&apos;ll only get the stats\n  // associated with the callId (i.e. no trackId is used as second parameter)\n  client.call\n    .getStats(callId)\n    .then(stats => {\n      // Use a boolean to track whether it&apos;s a new call&apos;s stats\n      let newCall = true\n      // Find the stats for the current call using the callId\n      for (callStat of callStats) {\n        if (callStat[0] === callId) {\n          newCall = false\n          // Add the stats from the RTCStatsReport Map object to this calls stats\n          callStat[1].push(...stats.values())\n          break\n        }\n      }\n      // If the newCall boolean is still true, these stats are for a new call\n      if (newCall) {\n        // Before we store this calls stats, remove the oldest call&apos;s stats if we are beyond the max collection limit\n        if (callStats.length === MAX_STATS_LENGTH) {\n          log(&apos;Removing all call statistics associated with oldest call.&apos;)\n          callStats = callStats.slice(1)\n        }\n        // Add the stats for this call to the collection of call stats\n        callStats.push([callId, [...stats.values()]])\n      }\n    })\n    .catch(error => {\n      log(&apos;Stats collection failed. Error message: &apos;, error.error.message)\n      clearTimeout(timer)\n    })\n}\n\n/**\n * Function for providing the SDK call statistics to a user via a downloaded file.\n * @method downloadCallStats\n */\nfunction downloadCallStats () {\n  // Convert the saved call stats into a JSON blob.\n  const blob = new Blob([JSON.stringify(callStats)], { type: &apos;application/json&apos; })\n\n  // Create a button that will save the Blob as a file when clicked.\n  const button = document.createElement(&apos;a&apos;)\n  button.href = URL.createObjectURL(blob)\n  // Give the file a name.\n  button.download = Date.now().toString() + &apos;_sdk&apos; + client.getVersion() + &apos;_call_stats.json&apos;\n\n  // Auto-click the button.\n  button.click()\n}\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-callMe-js-sdk@650/dist/kandy.js\&quot;></script>\n<script src=\&quot;$DEFAULTCONFIGURL$\&quot;></script>\n\n<div>\n  <fieldset>\n    <legend>Make an Anonymous Call</legend>\n\n    <!-- User input for making a call. -->\n    <div style=\&quot;margin-bottom: 5px\&quot;>\n      <input type=\&quot;button\&quot; value=\&quot;Make Call\&quot; onclick=\&quot;makeAnonymousCall();\&quot; />\n      <div style=\&quot;margin-left: 20px\&quot; id=\&quot;calleeSection\&quot;>\n        to <input id=\&quot;callee\&quot; type=\&quot;text\&quot; placeholder=\&quot;Callee&apos;s primary contact\&quot; />\n      </div>\n    </div>\n\n    <div id=\&quot;callerSection\&quot; style=\&quot;margin-left: 20px\&quot;>\n      Caller: <input id=\&quot;caller\&quot; type=\&quot;text\&quot; placeholder=\&quot;Caller&apos;s primary contact\&quot; />\n    </div>\n\n    <div>\n      Make a token-based call\n      <input type=\&quot;checkbox\&quot; id=\&quot;make-token-based-anonymous-call\&quot; onclick=\&quot;toggleVisibilityOnUserFields();\&quot; />\n    </div>\n  </fieldset>\n\n  <fieldset>\n    <legend>End an Anonymous Call</legend>\n    <!-- User input for ending an ongoing call. -->\n    <input type=\&quot;button\&quot; value=\&quot;End Call\&quot; onclick=\&quot;endCall();\&quot; />\n  </fieldset>\n  <div id=\&quot;remote-container\&quot;></div>\n\n  <br />\n  <div>Call Statistics</div>\n</div>\n\n<input type=\&quot;submit\&quot; value=\&quot;Download Call Stats\&quot; onclick=\&quot;downloadCallStats()\&quot; /> <br />\n<br />\n\n  <fieldset>\n    <!-- Message output container. -->\n    <legend>Application Messages</legend>\n    <div id=\&quot;messages\&quot;></div>\n  </fieldset>\n</div>\n\n&quot;,&quot;css&quot;:&quot;&quot;,&quot;title&quot;:&quot;Javascript SDK Anonymous Call Statistics Demo&quot;,&quot;editors&quot;:101,&quot;js_external&quot;:&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-callMe-js-sdk@650/dist/kandy.js&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>

_Note: You’ll be sent to an external website._

