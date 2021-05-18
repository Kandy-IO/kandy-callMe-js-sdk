---
layout: page
categories: quickstarts-javascript
title: Handling Media Tracks
permalink: /quickstarts/javascript/link/Handling%20%26%20Media%20Tracks
---

# Handling Media Tracks

In this quickstart we will cover how to handle media during an ongoing call with Kandy.js. Code snippets will be used to demonstrate these features, and together these snippets will form a working demo application that can be viewed at the end.

For information about other call features, such as starting calls and mid-call operations, please refer to their respective quickstarts.

## User Interface

To interact with our demo application, we will have a UI that allows us to make outgoing calls and respond to incoming calls. For this tutorial, we will add the ability to do the following to the UI:

- Start / Stop Video
- Add / Remove media

```html
<div>
  <br />
  <fieldset style="background-color: WhiteSmoke">
    <legend>Add/Remove Media</legend>
    <fieldset>
      <div class="add-remove" style="margin-bottom: 15px">
        <!-- User input for making a call. -->
        Audio: <input type="checkbox" id="make-with-audio" /> Video:
        <input type="checkbox" id="make-with-video" /> ScreenShare: <input type="checkbox" id="make-with-screen" />
        <input type="button" value="Add Media(s)" onclick="addMedia();" />
        <fieldset>
          Added Track(s):
          <div id="add-media"></div>
        </fieldset>
        <br />
        <fieldset>
          Remove Track(s):
          <div id="remove-media"></div>
        </fieldset>
        <input type="button" value="Remove Media(s)" onclick="removeMedia();" />
      </div>
    </fieldset>
  </fieldset>
  <!-- Media containers. -->
  Remote video:
  <div id="remote-container"></div>
  Local video:
  <div id="local-container"></div>
</div>
```

## Add / Remove Media

### Add Media(s)

To add multiple media to an ongoing call, the `call.addMedia` API can be used. Our `addMedia` function shown below (triggered when the user clicks "Add Media"), adds the specified media track(s) to the Call and sends the media(s) to the remote participant(s) by using the `call.addMedia` API.

```javascript
/*
 *  Add media on ongoing Call functionality.
 */
function addMedia () {
  log('Adding media track(s) to ongoing call' + callId)

  // true if the input checkboxes are checked or false otherwise
  let withAudio = document.getElementById('make-with-audio').checked
  let withVideo = document.getElementById('make-with-video').checked
  let withScreenshare = document.getElementById('make-with-screen').checked

  let media = {
    audio: withAudio,
    video: withVideo,
    screen: withScreenshare
  }

  client.call.addMedia(callId, media)

  document.getElementById('make-with-audio').checked = false
  document.getElementById('make-with-video').checked = false
  document.getElementById('make-with-screen').checked = false
}
```

### Remove Media(s)

To remove media from an ongoing, when the user clicks on the 'Remove Media' button, our `removeMedia` function will:

1.  Retrieve the information of the ongoing call
2.  Create a list of media track IDs that we want to remove.
3.  Use the `call.removeMedia` API to remove the tracks from the call and stop being sent to the remote participant(s).

Similarly to the `call.addMedia` API, this API can also be used to remove multiple tracks

```javascript
/*
 *  Remove media(s) from ongoing Call functionality.
 */
function removeMedia () {
  log('Removing media track(s) to ongoing call' + callId)
  let checkBoxes = document.getElementsByName('removeMedia')

  let removedTracks = []
  // Retrieves the trackIds from the checked tracks to be removed
  // Stored the id in an array
  for (var i = 0; i < checkBoxes.length; i++) {
    // checks to see which checkbox is clicked and gets the value from it
    // Each checkbox value contain the trackIds of a particular media
    if (checkBoxes[i].checked) {
      removedTracks.push(checkBoxes[i].value)
      // Disables the displayed selected tracks to be removed.
      checkBoxes[i].disabled = true
      document.getElementById(checkBoxes[i].id).innerHTML = ''
    }
  }
  client.call.removeMedia(callId, removedTracks)
}
```

## Events

The `call:newTrack` event will be emitted for both local and remote users. It informs us that a new Track has been added to the ongoing call. The Track may have been added by either the local user or remote user. More information on the track can be retrieved by using the `media.getTrackById` API.

We will use this event to render local visual media and remote audio/visual media into their respective containers whenever a new track is added to the call. See below.

```javascript
/**
 * Set listener for new tracks.
 * When a new Track is added to the call,information about the Track can be retrieved using the
 * `media.getTrackById` API. This information helps determine the type of track we are
 * rendering i.e., local or remote track, audio or video track, etc.
 */
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
  // retrieves the information about the call
  let callId = params.callId

  let call = client.call.getById(callId)

  let localTracks = call.localTracks

  localTracks.forEach(track => {
    let { trackId, kind } = client.media.getTrackById(track)

    // Ensure we're not dealing with an ID already rendered
    if (!allTracks.includes(trackId)) {
      allTracks.push(trackId)
      // Displays the list of tracks
      // New tracks added to the call will be diaplayed
      createHTMLElements(trackId, kind)
    }
  })
})

/*
 * When a new Track is added,
 * A new section for add and remove media is created
 * with the list of track present and can be removed
 * to add
 */
function createHTMLElements (id, kind) {
  let input = document.createElement('input')
  let listAllTracks = document.createElement('div')
  let label = document.createElement('label')
  let lineBreak = document.createElement('br')

  listAllTracks.innerHTML = kind + ':' + ' ' + id
  listAllTracks.id = id
  input.type = 'checkbox'
  input.id = id
  input.value = id
  input.name = 'removeMedia'

  label.appendChild(document.createTextNode(id))
  document.getElementById('add-media').appendChild(listAllTracks)
  document.getElementById('remove-media').appendChild(input)
  document.getElementById('remove-media').appendChild(label)
  document.getElementById(id).innerHTML = track.kind + ':' + id
  document.getElementById('remove-media').appendChild(lineBreak)
}
```

The `call:trackEnded` event will be emitted for both local and remote users. This event informs us that a Track has been removed from a Call. The Track may have been removed by either the local user or remote user. See Below.

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
   - Specify if you want the call to include video (otherwise it will be an audio-only call, by default).
   - For regular anonymous calls to the callee, ensure the 'Make a token-based call' checkbox is unchecked.
     - Enter the primary contact of the _caller_ in the specified text field.
     - Enter the primary contact of the _callee_ in the specified text field.
   - For token-based anonymous call to the callee, ensure 'Make a token-based call' checkbox is checked.
     - In this case, ensure that your Node.js HTTPS server is started. We've provided a sample server, and this server can be started using the `yarn start` command.
     - NOTE: If using the sample server, you will need to replace the dummy values specified in the `index.js` file of the sample server (lines 30-35) with your own values. Also, a key and certificate file will be needed to start the server with HTTPS (lines 14-17).
     - Once the sample server has been started, the codepen will interact with the server to retrieve the necessary parameters for making a token-based anonymous call at the time the anonymous call is made.
5. Click **Make Call** to start the anonymous call to the _callee_.
6. Accept the incoming call from the _callee_. The two parties should now be in an established call.
7. Click **End Call** in either browser instance to end the call.

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Anonymous Calls Demo\n */\n\n// Setup Kandy with the following configuration.\nconst { create } = Kandy\nconst client = create({\n  call: {\n    iceserver: [\n      {\n        url: &apos;$KANDYTURN1$&apos;,\n        credentials: &apos;&apos;\n      },\n      {\n        url: &apos;$KANDYTURN2$&apos;,\n        credentials: &apos;&apos;\n      },\n      {\n        url: &apos;$KANDYSTUN1$&apos;,\n        credentials: &apos;&apos;\n      },\n      {\n        url: &apos;$KANDYSTUN2$&apos;,\n        credentials: &apos;&apos;\n      }\n    ]\n  },\n  authentication: {\n    subscription: {\n      service: [&apos;call&apos;],\n      server: &apos;$SUBSCRIPTIONFQDN$&apos;\n    },\n    websocket: {\n      server: &apos;$SUBSCRIPTIONFQDN$&apos;\n    }\n  },\n  logs: {\n    logLevel: &apos;debug&apos;,\n    logActions: {\n      actionOnly: false,\n      exposePayloads: true\n    }\n  }\n})\n\nfunction toggleVisibilityOnUserFields () {\n  let chbox = document.getElementById(&apos;make-token-based-anonymous-call&apos;)\n  let visibility = &apos;block&apos;\n  if (chbox.checked) {\n    visibility = &apos;none&apos;\n  }\n  document.getElementById(&apos;callerSection&apos;).style.display = visibility\n  document.getElementById(&apos;calleeSection&apos;).style.display = visibility\n}\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  document.getElementById(&apos;messages&apos;).innerHTML += &apos;<div>&apos; + message + &apos;</div>&apos;\n}\n\n// Variable to keep track of the call.\nlet callId\n\nlet allTracks = []\n\n// If call is a regular anonymous one, then we&apos;ll use caller & callee\n// values, as provided by user (in the text fields of this UI).\n// If call is a token-based anonymous one, then caller & callee will\n// be obtained from our Node.js https server.\nasync function makeAnonymousCall () {\n  let makeATokenBasedAnonymousCall = document.getElementById(&apos;make-token-based-anonymous-call&apos;).checked\n\n  let caller = document.getElementById(&apos;caller&apos;).value\n  if (!caller && !makeATokenBasedAnonymousCall) {\n    // For regular anonymous call, ask user to fill in the value\n    log(&apos;Error: Please provide the primary contact for the caller.&apos;)\n    return\n  }\n\n  let callee = document.getElementById(&apos;callee&apos;).value\n  if (!callee && !makeATokenBasedAnonymousCall) {\n    // For regular anonymous call, ask user to fill in the value\n    log(&apos;Error: Please provide the primary contact for the callee.&apos;)\n    return\n  }\n\n  // For regular anonymous call, there is no need for credentials\n  let credentials = {}\n\n  // Define our call options. Assume for now it is for a regular anonymous call.\n  const callOptions = {\n    from: caller,\n    video: false,\n    audio: true\n  }\n  if (makeATokenBasedAnonymousCall) {\n    // Before attempting to trigger outgoing call, get the actual token values\n    // from expressjs application server in order to make a token-based anonymous call.\n    const getTokensRequestUrl = &apos;https://localhost:3000/callparameters&apos;\n    let result = await fetch(getTokensRequestUrl)\n    let data = await result.json()\n\n    let accountToken = data.accountToken\n    let fromToken = data.fromToken\n    let toToken = data.toToken\n    let realm = data.realm\n\n    caller = data.caller\n    callee = data.callee\n\n    callOptions[&apos;from&apos;] = caller\n\n    log(&apos;Got Account Token: &apos; + accountToken)\n    log(&apos;Got From Token:    &apos; + fromToken)\n    log(&apos;Got To Token:      &apos; + toToken)\n    log(&apos;Got Realm:         &apos; + realm)\n    log(&apos;Got Caller:        &apos; + caller)\n    log(&apos;Got Callee:        &apos; + callee)\n\n    // Build our credentials object.\n    credentials = {\n      accountToken,\n      fromToken,\n      toToken,\n      realm\n    }\n    log(&apos;Making a token-based anonymous call to &apos; + callee)\n  } else {\n    // For regular anonymous calls, no extra information is needed.\n    log(&apos;Making a regular anonymous call to &apos; + callee)\n  }\n\n  // Finally, trigger the outgoing anonymous call.\n  callId = client.call.makeAnonymous(callee, credentials, callOptions)\n}\n\n// Handles removing all the list of tracks rendered\nfunction removeAllTracks (parent) {\n  while (parent.firstChild) {\n    parent.removeChild(parent.firstChild)\n  }\n}\n\n// End an ongoing call.\nfunction endCall () {\n  // Retrieve call state.\n  let call = client.call.getById(callId)\n  log(&apos;Ending call with &apos; + call.to)\n\n  client.call.end(callId)\n}\n\n/*\n *  Add media on ongoing Call functionality.\n */\nfunction addMedia () {\n  log(&apos;Adding media track(s) to ongoing call&apos; + callId)\n\n  // true if the input checkboxes are checked or false otherwise\n  let withAudio = document.getElementById(&apos;make-with-audio&apos;).checked\n  let withVideo = document.getElementById(&apos;make-with-video&apos;).checked\n  let withScreenshare = document.getElementById(&apos;make-with-screen&apos;).checked\n\n  let media = {\n    audio: withAudio,\n    video: withVideo,\n    screen: withScreenshare\n  }\n\n  client.call.addMedia(callId, media)\n\n  document.getElementById(&apos;make-with-audio&apos;).checked = false\n  document.getElementById(&apos;make-with-video&apos;).checked = false\n  document.getElementById(&apos;make-with-screen&apos;).checked = false\n}\n\n/*\n *  Remove media(s) from ongoing Call functionality.\n */\nfunction removeMedia () {\n  log(&apos;Removing media track(s) to ongoing call&apos; + callId)\n  let checkBoxes = document.getElementsByName(&apos;removeMedia&apos;)\n\n  let removedTracks = []\n  // Retrieves the trackIds from the checked tracks to be removed\n  // Stored the id in an array\n  for (var i = 0; i < checkBoxes.length; i++) {\n    // checks to see which checkbox is clicked and gets the value from it\n    // Each checkbox value contain the trackIds of a particular media\n    if (checkBoxes[i].checked) {\n      removedTracks.push(checkBoxes[i].value)\n      // Disables the displayed selected tracks to be removed.\n      checkBoxes[i].disabled = true\n      document.getElementById(checkBoxes[i].id).innerHTML = &apos;&apos;\n    }\n  }\n  client.call.removeMedia(callId, removedTracks)\n}\n\n/**\n * Set listener for new tracks.\n * When a new Track is added to the call,information about the Track can be retrieved using the\n * `media.getTrackById` API. This information helps determine the type of track we are\n * rendering i.e., local or remote track, audio or video track, etc.\n */\nclient.on(&apos;call:newTrack&apos;, function (params) {\n  // Check whether the new track was a local track or not.\n  if (params.local) {\n    // Only render local visual media into the local container.\n    const localTrack = client.media.getTrackById(params.trackId)\n    if (localTrack.kind === &apos;video&apos;) {\n      client.media.renderTracks([params.trackId], &apos;#local-container&apos;)\n    }\n  } else {\n    // Render the remote media into the remote container.\n    client.media.renderTracks([params.trackId], &apos;#remote-container&apos;)\n  }\n  // retrieves the information about the call\n  let callId = params.callId\n\n  let call = client.call.getById(callId)\n\n  let localTracks = call.localTracks\n\n  localTracks.forEach(track => {\n    let { trackId, kind } = client.media.getTrackById(track)\n\n    // Ensure we&apos;re not dealing with an ID already rendered\n    if (!allTracks.includes(trackId)) {\n      allTracks.push(trackId)\n      // Displays the list of tracks\n      // New tracks added to the call will be diaplayed\n      createHTMLElements(trackId, kind)\n    }\n  })\n})\n\n/*\n * When a new Track is added,\n * A new section for add and remove media is created\n * with the list of track present and can be removed\n * to add\n */\nfunction createHTMLElements (id, kind) {\n  let input = document.createElement(&apos;input&apos;)\n  let listAllTracks = document.createElement(&apos;div&apos;)\n  let label = document.createElement(&apos;label&apos;)\n  let lineBreak = document.createElement(&apos;br&apos;)\n\n  listAllTracks.innerHTML = kind + &apos;:&apos; + &apos; &apos; + id\n  listAllTracks.id = id\n  input.type = &apos;checkbox&apos;\n  input.id = id\n  input.value = id\n  input.name = &apos;removeMedia&apos;\n\n  label.appendChild(document.createTextNode(id))\n  document.getElementById(&apos;add-media&apos;).appendChild(listAllTracks)\n  document.getElementById(&apos;remove-media&apos;).appendChild(input)\n  document.getElementById(&apos;remove-media&apos;).appendChild(label)\n  document.getElementById(id).innerHTML = track.kind + &apos;:&apos; + id\n  document.getElementById(&apos;remove-media&apos;).appendChild(lineBreak)\n}\n\n// Set listener for ended tracks.\nclient.on(&apos;call:trackEnded&apos;, function (params) {\n  // Check whether the ended track was a local track or not.\n  if (params.local) {\n    // Remove the track from the local container.\n    client.media.removeTracks([params.trackId], &apos;#local-container&apos;)\n  } else {\n    // Remove the track from the remote container.\n    client.media.removeTracks([params.trackId], &apos;#remote-container&apos;)\n  }\n})\n\n// Set listener for changes in a call&apos;s state.\nclient.on(&apos;call:stateChange&apos;, function (params) {\n  // Retrieve call state.\n  const call = client.call.getById(params.callId)\n\n  if (params.error && params.error.message) {\n    log(&apos;Error: &apos; + params.error.message)\n  }\n  log(&apos;Call state changed from &apos; + params.previous.state + &apos; to &apos; + call.state)\n\n  // If the call ended, stop tracking the callId.\n  if (params.state === &apos;ENDED&apos;) {\n    callId = null\n  }\n\n  if (call.state === &apos;Ended&apos;) {\n    // Removes the list of tracks displayed when the call ends\n    removeAllTracks(document.getElementById(&apos;add-media&apos;))\n    removeAllTracks(document.getElementById(&apos;remove-media&apos;))\n  }\n})\n\n// Set listener for successful call starts.\nclient.on(&apos;call:start&apos;, function (params) {\n  log(&apos;Call successfully started. Waiting for response.&apos;)\n})\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-callMe-js-sdk@669/dist/kandy.js\&quot;></script>\n<script src=\&quot;$DEFAULTCONFIGURL$\&quot;></script>\n\n<div>\n  <fieldset>\n    <fieldset>\n      <legend>Make an Anonymous Call</legend>\n\n      <!-- User input for making a call. -->\n      <div style=\&quot;margin-bottom: 10px\&quot;>\n        <input type=\&quot;button\&quot; style=\&quot;margin-bottom: 10px\&quot; value=\&quot;Make Call\&quot; onclick=\&quot;makeAnonymousCall();\&quot; />\n        <div style=\&quot;margin-left: 20px\&quot; id=\&quot;calleeSection\&quot;>\n          To: <input id=\&quot;callee\&quot; type=\&quot;text\&quot; placeholder=\&quot;Callee&apos;s primary contact\&quot; />\n        </div>\n      </div>\n\n      <div id=\&quot;callerSection\&quot;>Caller: <input id=\&quot;caller\&quot; type=\&quot;text\&quot; placeholder=\&quot;Caller&apos;s primary contact\&quot; /></div>\n\n      <div>\n        Make a token-based call\n        <input type=\&quot;checkbox\&quot; id=\&quot;make-token-based-anonymous-call\&quot; onclick=\&quot;toggleVisibilityOnUserFields();\&quot; />\n      </div>\n    </fieldset>\n\n    <fieldset>\n      <legend>End an Anonymous Call</legend>\n      <!-- User input for ending an ongoing call. -->\n      <input type=\&quot;button\&quot; value=\&quot;End Call\&quot; onclick=\&quot;endCall();\&quot; />\n    </fieldset>\n    <fieldset>\n      <!-- Message output container. -->\n      <legend>Messages</legend>\n      <div id=\&quot;messages\&quot;></div>\n    </fieldset>\n  </fieldset>\n</div>\n\n<div>\n  <br />\n  <fieldset style=\&quot;background-color: WhiteSmoke\&quot;>\n    <legend>Add/Remove Media</legend>\n    <fieldset>\n      <div class=\&quot;add-remove\&quot; style=\&quot;margin-bottom: 15px\&quot;>\n        <!-- User input for making a call. -->\n        Audio: <input type=\&quot;checkbox\&quot; id=\&quot;make-with-audio\&quot; /> Video:\n        <input type=\&quot;checkbox\&quot; id=\&quot;make-with-video\&quot; /> ScreenShare: <input type=\&quot;checkbox\&quot; id=\&quot;make-with-screen\&quot; />\n        <input type=\&quot;button\&quot; value=\&quot;Add Media(s)\&quot; onclick=\&quot;addMedia();\&quot; />\n        <fieldset>\n          Added Track(s):\n          <div id=\&quot;add-media\&quot;></div>\n        </fieldset>\n        <br />\n        <fieldset>\n          Remove Track(s):\n          <div id=\&quot;remove-media\&quot;></div>\n        </fieldset>\n        <input type=\&quot;button\&quot; value=\&quot;Remove Media(s)\&quot; onclick=\&quot;removeMedia();\&quot; />\n      </div>\n    </fieldset>\n  </fieldset>\n  <!-- Media containers. -->\n  Remote video:\n  <div id=\&quot;remote-container\&quot;></div>\n  Local video:\n  <div id=\&quot;local-container\&quot;></div>\n</div>\n\n&quot;,&quot;css&quot;:&quot;video {\n  width: 50% !important;\n}\n\n&quot;,&quot;title&quot;:&quot;Javascript SDK Anonymous Calls Demo&quot;,&quot;editors&quot;:101,&quot;js_external&quot;:&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-callMe-js-sdk@669/dist/kandy.js&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>

_Note: You’ll be sent to an external website._

