---
layout: page
categories: quickstarts-javascript
title: Anonymous Calls
permalink: /quickstarts/javascript/newCallMe/Anonymous%20Calls
position: 4
categories:
  - voice
  - video
---

# Anonymous Calls

In this quickstart, we will cover the basics of making IP anonymous calls with the Anonymous Call SDK. Code snippets will be used to demonstrate anonymous call usage of the Anonymous Call SDK and together these snippets will form a working demo application that you can modify and tinker with at the end.

Anonymous calls allow for users to make calls without the need for logging in. As such, a username and password is not necessary.

## How do anonymous calls work?

There are a few things that happen under the hood automatically when making calls using the Anonymous Call SDK.

### Subscription to WebSocket Notifications

When you start a call with the Anonymous Call SDK, a websocket connection is opened automatically and then automatically closed when the call ends.

### Subscription to Call Notifications

Likewise, all the necessary service subscriptions are automatically managed for you. This means that the Anonymous Call SDK automatically subscribes for the _Call_ service when a call is triggered, and then unsubscribes from the _Call_ service when the call terminates.

## Call Configs

When initializing the Anonymous Call SDK there are no required parameters for calls, we just need to provide some authentication configuration:

Please see [Configurations Quickstart](Configurations) for actual authentication parameters needed for such configuration.

Even though call specific configuration is not mandatory when it comes to making calls, providing ICE servers is required for users on different networks to be able to communicate. See section below for what those ICE servers need to be.

## ICE Servers

ICE servers are needed to ensure that media (audio and video) can be established even when the call participants are on different networks or behind firewalls. The recommended configuration includes a primary and secondary server for redundancy.

### Primary ICE Server

- TURN URL: $KANDYTURN1$
- STUN URL: $KANDYSTUN1$

### Secondary ICE Server

- TURN URL: $KANDYTURN2$
- STUN URL: $KANDYSTUN2$

For further documentation on ICE Servers, see the `call.IceServer` API.

## Making an Anonymous Call

There are two supported ways of making an anonymous call:

- Regular anonymous calls which are simple to implement but lack some control features.
- Token-based which provide added security and control at the cost of a more complex implementation.

The following sections elaborate on these 2 ways.

### Token-based Anonymous Call

The following code sample shows how to make a token-based anonymous call.

1. Specify the callee address and some call options (such as audio and video):

```javascript 
let callee = 'user1@example.com'
let callOptions = {}
```

2. Build 'credentials' object, based on the three encrypted tokens and the token realm you got from your administrator in the previous tutorial page - see [Generating Tokens Quickstart](Generating%20Tokens).

```javascript 
const credentials = {
  accountToken,
  fromToken,
  toToken,
  realm
}
```

Note: The caller address is already encrypted in the `accountToken`

3. Make the call with the above information using the `makeAnonymous` Call API:

```javascript 
// Initiate the anonymous call
callId = client.call.makeAnonymous(callee, credentials, callOptions)
```

### Regular Anonymous Call

For this type of anonymous calls, the user needs to define only the callee, and then invoke the `makeAnonymous` Call API:

```javascript 
// Define callee & callOptions, similar to previous example

// Initiate the anonymous call
callId = client.call.makeAnonymous(callee, {}, callOptions)
```

## User Interface

To interact with our demo application, we will have a basic UI that allows us to make outgoing anonymous calls. Due to call limitations explained below, this demo will not accept incoming calls.

In addition, the sample code below (including its UI interface) is what the application initiating the anonymous call would use. For the sample code used by the user/group receiving the anonymous call, you will need to refer to tutorial pages belonging to other SDKs (see 'Voice and Video Calls' Tutorial included in Kandy Link SDK).

```html
<div>
  <fieldset>
    <legend>Make an Anonymous Call</legend>

    <!-- User input for making a call. -->
    <div style="margin-bottom: 5px">
      <input type="button" value="Make Call" onclick="makeAnonymousCall();" />
      to <input type="text" id="callee" placeholder="Callee's primary contact" /> with video
      <input type="checkbox" id="make-with-video" />
    </div>

    <div style="margin-left: 49px">
      Caller: <input type="text" id="caller" placeholder="Caller's primary contact" />
    </div>

    <div>
      Make a token-based call
      <input type="checkbox" id="make-token-based-anonymous-call" />
    </div>
  </fieldset>

  <fieldset>
    <legend>End an Anonymous Call</legend>
    <!-- User input for ending an ongoing call. -->
    <input type="button" value="End Call" onclick="endCall();" />
  </fieldset>

  <fieldset>
    <!-- Message output container. -->
    <legend>Messages</legend>
    <div id="messages"></div>
  </fieldset>
</div>
```

To display information to the user, a `log` function will be used to append new messages to the "messages" element shown above.

```javascript
// Utility function for appending messages to the message div.
function log (message) {
  document.getElementById('messages').innerHTML += '<div>' + message + '</div>'
}
```

An important part of the UI for calls are the media containers. These containers will be used to hold the media from both sides of the call. A remote media container will _always_ be needed for a call (both voice and video), and a local media container will be needed if you would like to display the local video of the call. The HTML elements that Kandy.js will use as media containers are empty `<div>`s.

```html
<!-- Media containers. -->
Remote video:
<div id="remote-container"></div>

Local video:
<div id="local-container"></div>
```

With that, there is nothing more needed for the user interface.

### Step 1: Making an Anonymous Call

When the user clicks on the 'Make Call' button, we want our `makeAnonymousCall` function to retrieve the information needed for the call, then make the call. Since we did not specify default media containers on initialization, we will specify them as we make the call.

```javascript
/*
 *  Voice and Video Call functionality.
 */

// Variable to keep track of the call.
let callId;

// Get user input and make a call to the callee.
async function makeAnonymousCall() {
  // Gather call options.
  let callee = document.getElementById("callee").value;
  if (!callee) {
    log("Error: Please provide the primary contact for the callee.");
    return;
  }
  let withVideo = document.getElementById("make-with-video").checked;
  let makeATokenBasedAnonymousCall = document.getElementById("make-token-based-anonymous-call").checked;

  let caller = document.getElementById("caller").value;
  if (!caller) {
    log("Error: Please provide the primary contact for the caller.");
    return;
  }

  // Define our call options
  const callOptions = {
    from: caller,
    video: withVideo,
    audio: true
  };
  let credentials = {};
```

As previously stated, for token-based anonymous calls, `accountToken`, `fromToken`, `toToken`, and `realm` are required in order to make the anonymous call. See the [Generating Tokens](Generating%20Tokens) section for more information on how to obtain/generate these values. In the codepen provided below, these values will need to be replaced with appropriate values.

```javascript
  if (makeATokenBasedAnonymousCall) {
    // Tokens required for making a token-based anonymous call
    let accountToken = 'account token';
    let fromToken = 'data token';
    let toToken = 'to token';

    let realm = 'realm';

    // Build our credentials object
    credentials = {
      accountToken,
      fromToken,
      toToken,
      realm
    };
    log("Making a token-based anonymous call to " + callee);
  } else {
    // For regular anonymous calls, no extra information is needed
    log("Making a regular anonymous call to " + callee);
  }

  // Finally, trigger the outgoing anonymous call
  callId = client.call.makeAnonymous(callee, credentials, callOptions);
}
```

Kandy's `makeAnonymousCall` will return a unique ID that can be used to keep track of the call. This ID is also required be be able to perform operations (i.e., hold/unhold) on the call. See the _Limitations on Anonymous Calls_ section below to see what the caller can and cannot do with the call).

### Step 2: Ending a Call

If our user has an ongoing call, they can end it by providing the call's ID to Kandy's `call.end` function, which is what our demo application will do.

```javascript
// End an ongoing call.
function endCall () {
  // Retrieve call state.
  let call = client.call.getById(callId)
  log('Ending call with ' + call.to)

  client.call.end(callId)
}
```

### Step 3: Call Events

As we use Kandy's call functions, Kandy will emit events that provide feedback about the changes in call state. We will set listeners for these events to keep our demo application informed about Kandy state.

#### `call:start`

The `call:start` event informs us that an outgoing call that we made has successfully been initialized, and the callee should receive a notification about the incoming call.

```javascript
// Set listener for successful call starts.
client.on('call:start', function (params) {
  log('Call successfully started. Waiting for response.')
})
```

#### `call:error` and `media:error`

The `call:error` event informs us that a problem was encountered with the call. The `media:error` event is more specialized in that it indicates that the call could not be made because webRTC media could not be initialized. Both events provide information about the error that occured.

```javascript
// Set listener for generic call errors.
client.on('call:error', function (params) {
  log('Encountered error on call: ' + params.error.message)
})

// Set listener for call media errors.
client.on('media:error', function (params) {
  log('Call encountered media error: ' + params.error.message)
})
```

#### `call:stateChange`

As the call is acted upon (such as answered or rejected), its state will change. We can react to changes in the call by listening for the `call:stateChange` event. For our demo application, we will only act if the call was ended.

```javascript
// Set listener for changes in a call's state.
client.on('call:stateChange', function (params) {
  // Retrieve call state.
  const call = client.call.getById(params.callId)

  if (params.error && params.error.message) {
    log('Error: ' + params.error.message)
  }
  log('Call state changed from ' + params.previous.state + ' to ' + call.state)

  // If the call ended, stop tracking the callId.
  if (params.state === 'ENDED') {
    callId = null
  }
})
```

### `call:newTrack`

The `call:newTrack` event informs us that a new Track has been added to the call. The Track may have been added by either the local user or remote user. More information on the track can be retrieved by using the `media.getTrackById` API.

We will use this event to render local visual media and remote audio/visual media into the respective containers whenever a new track is added to the call.

```javascript
// Set listener for new tracks.
client.on('call:newTrack', function (params) {
  // Check whether the new track was a local track or not.
  if (params.local) {
    // Only render local visual media into the local container.
    const localTrack = client.media.getTrackById(params.trackId)
    if (localTrack.kind === 'video') {
      client.media.renderTracks([params.trackId], '#local-container')
    }
  } else {
    // Render the remote media into the remote container.
    client.media.renderTracks([params.trackId], '#remote-container')
  }
})
```

### `call:trackEnded`

The `call:trackEnded` event informs us that a Track has been removed from a Call. The Track may have been removed by either the local user or remote user using the {@link call.removeMedia} API. Tracks are also removed from Calls
automatically while the Call is on hold.

```javascript
// Set listener for ended tracks.
client.on('call:trackEnded', function (params) {
  // Check whether the ended track was a local track or not.
  if (params.local) {
    // Remove the track from the local container.
    client.media.removeTracks([params.trackId], '#local-container')
  } else {
    // Remove the track from the remote container.
    client.media.removeTracks([params.trackId], '#remote-container')
  }
})
```

## Limitations on Anonymous Calls

Once the Anonymous Call SDK is initialized, it does not receive any incoming call notifications. Therefore, an anonymous user cannot receive calls.
Once an anonymous call is established, the call cannot be transferred in any way using the Anonymous Call SDK.

As an example, when an anonymous caller calls support@company.com, the anonymous caller cannot transfer that call. If needed, the agent should transfer the anonymous caller to another agent.

To summarize, the following actions cannot be performed with the Anonymous Call SDK:

- Accept an incoming call
- Peform any type of call transfer
- Perform a "join" on two ongoing calls

We can now call the demo application done. We've covered the basics of what is needed to allow a user to use call functionality.

## Live Demo

Do you want to try this example for yourself? Click the button below to get started.

### Instructions for Demo

#### Prerequesites (for token-based anonymous calling)

- Make sure you have the key & realm values obtained from your administrator.
- Make sure you have the necessary tokens before proceeding. See [Generating Tokens](Generating%20Tokens).

#### Steps

1. Open one browser or tab instance of Google Chrome®, or (another supported browser), by clicking **Try it** once. This will be the browser instance starting the anonymous call (i.e., _caller_).
2. Go to the 'Voice and Video Calls' tutorial in the _Kandy Link_ Tutorials, and open one browser or tab instance of Google Chrome® (or another supported browser) by clicking **Try it** once. This will be the browser instance which will answer the call (i.e. _callee_).
3. For the _callee_, enter the appropriate authentication credentials for the account or project.
   - Enter the email address of that callee user (account or project users).
   - Enter the password to authenticate.
4. For the anonymous _caller_, do the following:
   - In the codepen source code associated with _caller_, search for the place where a token-based anonymous call is initiated, and provide actual values for the following defined variables: `accountToken`, `fromToken`, `toToken`, and `realm`.
   - Enter the primary contact of the _caller_ in the specified text field.
   - Enter the primary contact of the _callee_ in the specified text field.
   - Specify if you want the call to include video (otherwise it will be an audio-only call, by default).
   - For regular anonymous calls to the callee, ensure the 'Make a token-based call' checkbox is unchecked.
   - For token-based anonymous call to the callee, ensure 'Make a token-based call' checkbox is checked.
     - **NOTE:** You will need to update the codepen lines 86-90 with appropriate token and realm values.
5. Click **Make Call** to start the anonymous call to the _callee_.
6. Accept the incoming call from the _callee_. The two parties should now be in an established call.
7. Click **End Call** in either browser instance to end the call.

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Anonymous Calls Demo\n */\n\n// Setup Kandy with the following configuration.\nconst { create } = Kandy\nconst client = create({\n  call: {\n    iceserver: [\n      {\n        url: &apos;$KANDYTURN1$&apos;,\n        credentials: &apos;&apos;\n      },\n      {\n        url: &apos;$KANDYTURN2$&apos;,\n        credentials: &apos;&apos;\n      },\n      {\n        url: &apos;$KANDYSTUN1$&apos;,\n        credentials: &apos;&apos;\n      },\n      {\n        url: &apos;$KANDYSTUN2$&apos;,\n        credentials: &apos;&apos;\n      }\n    ]\n  },\n  authentication: {\n    subscription: {\n      service: [&apos;call&apos;],\n      server: &apos;$SUBSCRIPTIONFQDN$&apos;\n    },\n    websocket: {\n      server: &apos;$SUBSCRIPTIONFQDN$&apos;\n    }\n  },\n  logs: {\n    logLevel: &apos;debug&apos;,\n    logActions: {\n      flattenActions: false,\n      actionOnly: false,\n      exposePayloads: true\n    }\n  }\n})\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  document.getElementById(&apos;messages&apos;).innerHTML += &apos;<div>&apos; + message + &apos;</div>&apos;\n}\n\n/*\n *  Voice and Video Call functionality.\n */\n\n// Variable to keep track of the call.\nlet callId;\n\n// Get user input and make a call to the callee.\nasync function makeAnonymousCall() {\n  // Gather call options.\n  let callee = document.getElementById(\&quot;callee\&quot;).value;\n  if (!callee) {\n    log(\&quot;Error: Please provide the primary contact for the callee.\&quot;);\n    return;\n  }\n  let withVideo = document.getElementById(\&quot;make-with-video\&quot;).checked;\n  let makeATokenBasedAnonymousCall = document.getElementById(\&quot;make-token-based-anonymous-call\&quot;).checked;\n\n  let caller = document.getElementById(\&quot;caller\&quot;).value;\n  if (!caller) {\n    log(\&quot;Error: Please provide the primary contact for the caller.\&quot;);\n    return;\n  }\n\n  // Define our call options\n  const callOptions = {\n    from: caller,\n    video: withVideo,\n    audio: true\n  };\n  let credentials = {};\n\n  if (makeATokenBasedAnonymousCall) {\n    // Tokens required for making a token-based anonymous call\n    let accountToken = &apos;account token&apos;;\n    let fromToken = &apos;data token&apos;;\n    let toToken = &apos;to token&apos;;\n\n    let realm = &apos;realm&apos;;\n\n    // Build our credentials object\n    credentials = {\n      accountToken,\n      fromToken,\n      toToken,\n      realm\n    };\n    log(\&quot;Making a token-based anonymous call to \&quot; + callee);\n  } else {\n    // For regular anonymous calls, no extra information is needed\n    log(\&quot;Making a regular anonymous call to \&quot; + callee);\n  }\n\n  // Finally, trigger the outgoing anonymous call\n  callId = client.call.makeAnonymous(callee, credentials, callOptions);\n}\n\n// End an ongoing call.\nfunction endCall () {\n  // Retrieve call state.\n  let call = client.call.getById(callId)\n  log(&apos;Ending call with &apos; + call.to)\n\n  client.call.end(callId)\n}\n\n// Set listener for successful call starts.\nclient.on(&apos;call:start&apos;, function (params) {\n  log(&apos;Call successfully started. Waiting for response.&apos;)\n})\n\n// Set listener for generic call errors.\nclient.on(&apos;call:error&apos;, function (params) {\n  log(&apos;Encountered error on call: &apos; + params.error.message)\n})\n\n// Set listener for call media errors.\nclient.on(&apos;media:error&apos;, function (params) {\n  log(&apos;Call encountered media error: &apos; + params.error.message)\n})\n\n// Set listener for changes in a call&apos;s state.\nclient.on(&apos;call:stateChange&apos;, function (params) {\n  // Retrieve call state.\n  const call = client.call.getById(params.callId)\n\n  if (params.error && params.error.message) {\n    log(&apos;Error: &apos; + params.error.message)\n  }\n  log(&apos;Call state changed from &apos; + params.previous.state + &apos; to &apos; + call.state)\n\n  // If the call ended, stop tracking the callId.\n  if (params.state === &apos;ENDED&apos;) {\n    callId = null\n  }\n})\n\n// Set listener for new tracks.\nclient.on(&apos;call:newTrack&apos;, function (params) {\n  // Check whether the new track was a local track or not.\n  if (params.local) {\n    // Only render local visual media into the local container.\n    const localTrack = client.media.getTrackById(params.trackId)\n    if (localTrack.kind === &apos;video&apos;) {\n      client.media.renderTracks([params.trackId], &apos;#local-container&apos;)\n    }\n  } else {\n    // Render the remote media into the remote container.\n    client.media.renderTracks([params.trackId], &apos;#remote-container&apos;)\n  }\n})\n\n// Set listener for ended tracks.\nclient.on(&apos;call:trackEnded&apos;, function (params) {\n  // Check whether the ended track was a local track or not.\n  if (params.local) {\n    // Remove the track from the local container.\n    client.media.removeTracks([params.trackId], &apos;#local-container&apos;)\n  } else {\n    // Remove the track from the remote container.\n    client.media.removeTracks([params.trackId], &apos;#remote-container&apos;)\n  }\n})\n\n&quot;,&quot;html&quot;:&quot;<div>\n  <fieldset>\n    <legend>Make an Anonymous Call</legend>\n\n    <!-- User input for making a call. -->\n    <div style=\&quot;margin-bottom: 5px\&quot;>\n      <input type=\&quot;button\&quot; value=\&quot;Make Call\&quot; onclick=\&quot;makeAnonymousCall();\&quot; />\n      to <input type=\&quot;text\&quot; id=\&quot;callee\&quot; placeholder=\&quot;Callee&apos;s primary contact\&quot; /> with video\n      <input type=\&quot;checkbox\&quot; id=\&quot;make-with-video\&quot; />\n    </div>\n\n    <div style=\&quot;margin-left: 49px\&quot;>\n      Caller: <input type=\&quot;text\&quot; id=\&quot;caller\&quot; placeholder=\&quot;Caller&apos;s primary contact\&quot; />\n    </div>\n\n    <div>\n      Make a token-based call\n      <input type=\&quot;checkbox\&quot; id=\&quot;make-token-based-anonymous-call\&quot; />\n    </div>\n  </fieldset>\n\n  <fieldset>\n    <legend>End an Anonymous Call</legend>\n    <!-- User input for ending an ongoing call. -->\n    <input type=\&quot;button\&quot; value=\&quot;End Call\&quot; onclick=\&quot;endCall();\&quot; />\n  </fieldset>\n\n  <fieldset>\n    <!-- Message output container. -->\n    <legend>Messages</legend>\n    <div id=\&quot;messages\&quot;></div>\n  </fieldset>\n</div>\n\n<!-- Media containers. -->\nRemote video:\n<div id=\&quot;remote-container\&quot;></div>\n\nLocal video:\n<div id=\&quot;local-container\&quot;></div>\n\n&quot;,&quot;css&quot;:&quot;video {\n  width: 50% !important;\n}\n\n&quot;,&quot;title&quot;:&quot;Javascript SDK Anonymous Calls Demo&quot;,&quot;editors&quot;:101,&quot;js_external&quot;:&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-callMe-js-sdk@497/dist/kandy.js&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>

_Note: You’ll be sent to an external website._
