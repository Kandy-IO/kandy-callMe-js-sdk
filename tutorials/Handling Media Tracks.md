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

To interact with our demo application, we will have a UI that allows us to make outgoing calls and respond to incoming calls. In addition for this tutorial, we will add the ability to add and remove local media.

```html
<div>
  <br />
  <fieldset style="background-color: WhiteSmoke">
    <legend>Add Media</legend>
    <div class="bottomSpacing">
      <!-- User input for adding media to a call. Allows a user to select which
            types of media they would like to be added in the operation. -->
      Audio: <input type="checkbox" id="make-with-audio" />
      Video: <input type="checkbox" id="make-with-video" />
      ScreenShare: <input type="checkbox" id="make-with-screen" />
      <input type="button" value="Add Media(s)" onclick="addMedia();" />
    </div>
  </fieldset>

  <fieldset>
    <legend>Remove Media</legend>
    <!-- User input for removing local media from a call. As local media is added,
          they will be listed here with the option to remove them from the call. -->
    <input type="button" value="Remove Media(s)" onclick="removeMedia();" disabled />
    <div id="localTrack-controls"></div>
  </fieldset>

  <!-- Media containers. -->
  <fieldset>
    <legend>Media containers</legend>
    Remote video: <div id="remote-container"></div>
    Local video: <div id="local-container"></div>
  </fieldset>
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

  const withAudioBox = document.getElementById('make-with-audio')
  const withVideoBox = document.getElementById('make-with-video')
  const withScreenBox = document.getElementById('make-with-screen')

  const media = {
    audio: withAudioBox.checked,
    video: withVideoBox.checked,
    screen: withScreenBox.checked
  }

  client.call.addMedia(callId, media)

  // Reset the checkboxes afterwards.
  withAudioBox.checked = false
  withVideoBox.checked = false
  withScreenBox.checked = false
}
```

### Remove Media(s)

To remove media from an ongoing, when the user clicks on the 'Remove Media' button, our `removeMedia` function will:

1. Retrieve the information of the ongoing call
2. Create a list of media track IDs that we want to remove.
3. Use the `call.removeMedia` API to remove the tracks from the call and stop being sent to the remote participant(s).

Similarly to the `call.addMedia` API, this API can also be used to remove multiple tracks

```javascript
/*
 *  Remove media(s) from ongoing Call functionality.
 */
function removeMedia () {
  log('Removing media track(s) to ongoing call' + callId)
  let checkBoxes = document.getElementsByName('removeMedia')
  // Get the list of IDs with checked checkboxes.
  const trackIds = getAllCheckedTracks()

  client.call.removeMedia(callId, trackIds)
}
```

## Events

## Events

The media events for handling tracks on a call fall into three categories:

1. Track Rendering: The `call:tracksAdded` and `call:tracksRemoved` events let the application know when tracks are available to be rendered or need to be unrendered.
2. Media Issues: The `media:sourceMuted` and `media:sourceUnmuted` events let the application know when a track is having a media interruption, such as a network issue.
3. Track Loss: The `media:trackEnded` event lets the application know when a track has unexpectedly ended and needs to be handled.

### Track Rendering

The `call:tracksAdded` and `call:tracksRemoved` events will be emitted once per call operation, either initiated locally or remotely, and will include the list of tracks that have been added or removed due to that operation. A track being added to a call means that its media is available to be rendered. A track being removed from a call means that it is no longer available to be rendered.

For our demo application, we will handle these events be rendering or unrendering the tracks as appropriate. For local tracks that are added to the call, we will also show a UI element that lets the user remove them from the call if desired. Below are the event listeners we will implement to handle the events and hand off the tracks to the functions to perform these actions.

```javascript
/**
 * When new tracks are added to the call, we want to render them.
 * For local tracks, we also want to add a UI element so we can remove them.
 */
client.on('call:tracksAdded', function (params) {
  const { trackIds } = params

  trackIds.forEach(trackId => {
    const track = client.media.getTrackById(trackId)

    // Render the track's media.
    renderTrack(track)

    // Add UI controls to remove local tracks from the call.
    if (track.isLocal) {
      addTrackControls(track)
    }
  })
})

/**
 * When tracks are removed from the call, we want to unrender them.
 * For local tracks, we also want to remove the UI element we previously added.
 */
client.on('call:tracksRemoved', function (params) {
  const { trackIds } = params

  // Iterate over each trackId to determine how to unrender it.
  trackIds.forEach(trackId => {
    const track = client.media.getTrackById(trackId)

    // Unrender the track from the page.
    removeTrack(track)

    // Remove the UI controls for the local track.
    if (track.isLocal) {
      removeTrackControls(track)
    }
  })
})
```

To render and unrender the tracks, we simply use the `media.renderTracks` or `media.removeTracks` APIs. We will render all tracks in either the local or remote HTML containers. It should be noted that we are not rendering local audio tracks since we do not want the user to hear themselves speaking.

```javascript
/*
 * Function that renders a track.
 * @param {Track} track The Track object retrieved from the SDK.
 */
function renderTrack (track) {
  if (track.isLocal) {
    // Only render local video into the local container. The user does not need
    //    to hear themselves speak.
    if (track.kind === 'video') {
      client.media.renderTracks([track.trackId], '#local-container')
    }
  } else {
    // Render all remote media into the remote container.
    client.media.renderTracks([track.trackId], '#remote-container')
  }
}

/*
 * Function that unrenders a track.
 * @param {Track} track The Track object retrieved from the SDK.
 */
function removeTrack (track) {
  // Check whether the ended track was a local track or not.
  if (track.isLocal) {
    if (track.kind === 'video') {
      // Remove the video track from the local container.
      //    Local audio tracks were not rendered by the renderTrack function.
      client.media.removeTracks([track.trackId], '#local-container')
    }
  } else {
    // Remove the track from the remote container.
    client.media.removeTracks([track.trackId], '#remote-container')
  }
}
```

For local tracks added to the call, we want the user to be able to remove them from the call. We will show a list of all local tracks, allowing the user to check the tracks they want to be removed before calling the `call.removeMedia` API. Below are the functions we will use to add the UI elements to the page, to remove the UI elements from the page afterwards, and to get the list of all selected tracks.

```javascript
/*
 * Function to add UI elements for removing a local track from the Call.
 * @param {Track} track The Track object retrieved from the SDK.
 */
function addTrackControls (track) {
  if (!track.isLocal) {
    // We only want to add controls for local tracks.
    return
  }

  const controlsId = 'controls-' + track.trackId
  if (document.getElementById(controlsId)) {
    // Controls already exist for this track.
    return
  }

  const controls = document.createElement('div')
  controls.id = controlsId

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.id = track.trackId
  checkbox.name = 'local-track'

  const label = document.createElement('label')
  label.innerHTML = track.kind + 'track (' + track.trackId + ')'

  controls.appendChild(checkbox)
  controls.appendChild(label)

  const trackList = document.getElementById('localTrack-controls')
  trackList.appendChild(controls)
}

/*
 * Function to remove UI elements used for removing a local track from the Call.
 * @param {Track} track The Track object retrieved from the SDK.
 */
function removeTrackControls (track) {
  if (!track.isLocal) {
    return
  }

  const controlsId = 'controls-' + track.trackId
  const controls = document.getElementById(controlsId)
  if (controls) {
    const trackList = document.getElementById('localTrack-controls')
    trackList.removeChild(controls)
  } else {
    // Track controls don't exist for this track.
  }
}

/*
 * Function to get the IDs of all checked checkboxes for local tracks.
 * @return {Array<string>} List of track IDs.
 */
function getAllCheckedTracks () {
  const checkedBoxes = document.querySelectorAll('input[name=local-track]:checked')
  const trackIds = Array.from(checkedBoxes).map(box => box.id)

  return trackIds
}
```

This is all of the code our demo application needs to handle media tracks being added and removed from a call.

### Media Issues

The `media:sourceMuted` and `media:sourceUnmuted` events are emitted when a track has stopped receiving media from its source. These events are emitted for individual tracks and are not tied to a call operation being performed. The predominant scenario where this will happen is for remote tracks during network issues, when they are not receiving a consistent flow of media and may flicker between being "source muted" and "source unmuted". It is also possible for these events to be emitted for a local track, but only by a local action, such as the browser preventing a track from receiving media based on an end-user action.

How these events should be handled is very subjective, but there are two main questions to help an application developer decide:

1. When should the events be handled? It is not known how long a track may be source muted for, or if it is a single occurrence or repeated, so these events may be seen to "flicker" back and forth. The main thoughts for an answer to this question are:
  - Handle them immediately: The end-user should see immediate feedback when a media issue occurs.
  - Handle them delayed (debounce): To prevent "flickering", a short delay before handling them can ensure the opposite event isn't immediately emitted as well.
  - Don't handle them: Media issues will be obvious to an end-user with choppy remote audio or video, and extra handling may not be necessary.

2. How seriously should they be handled? Whether it is seen as a minor or major issue will affect how an application wants to handle these events. A few options for an answer to this question are:
  - Provide UI feedback: The end-user should be shown some feedback (eg. buffering UI element) so they are aware of the issue, but the media can remain unchanged.
  - Unrender media: The track can be unrendered from the UI while "source muted" to clearly indicate a temporary outage.
  - Remove media: If a track is continuously having issues, a more drastic step could be to remove media from the call to reduce bandwidth needed. An audio&video call could be reduced to audio-only for both sides of the call, for example.

For our demo application, we will handle these events with a slight delay by showing a message to the end-user that a track has been "source muted".

```javascript
// Allow a debounce timeout to be stored per track.
const sourceMutedTimeouts = {}

/**
 * When a track which is available for rendering becomes source muted, we want
 *    to debounce the event to prevent "flickering" for short interruptions, but
 *    inform the end-user of longer interruptions.
 */
client.on('media:sourceMuted', function (params) {
  if (sourceMutedTimeouts[params.trackId]) {
    // We already have an event that this track has become source muted recently.
    //    That means the track's state is flickering between source muted/unmuted.
    //    Ignore this event.
  } else {
    // Setup a delay of 1 second before handling the event.
    sourceMutedTimeouts[params.trackId] = setTimeout(() => {
      const track = client.media.getTrackById(params.trackId)
      const call = client.call.getById(callId)
      const availableTracks = params.isLocal ? call.localTracks : call.remoteTracks
      // If the track is still source muted after the delay, log a message to
      //    inform the end-user.
      // We also check that the call is supposed to be available for rendering at
      //    this point in time. If the track is not part of the Call, then it is
      //    not expected to become source unmuted unless it becomes available again.
      if (track.sourceMuted && availableTracks.includes(params.trackId)) {
        const endpoint = params.isLocal ? 'Local' : 'Remote'
        log(endpoint + ' ' + track.kind + ' has been source muted for 1 second.')
      } else {
        // If the track is not source muted after the delay, then it was only a
        //    short media interruption.
      }

      // Remove the debounce timeout.
      sourceMutedTimeouts[params.trackId] = undefined
    }, 1000)
  }
})

/**
 * When a track which is available for rendering becomes source unmuted after a
 *    longer interruption, we want to inform the end-user that the interruption
 *    has ended.
 */
client.on('media:sourceUnmuted', function (params) {
  const call = client.call.getById(callId)
  const availableTracks = params.isLocal ? call.localTracks : call.remoteTracks

  if (sourceMutedTimeouts[params.trackId]) {
    // If there is a timeout for this track, that means the source muted state
    //    of the track has flickered within 1 second.
    // Ignore this event, since the timeout will check if the track was source
    //    unmuted during the delay.
  } else if (!availableTracks.includes(params.trackId)) {
    // If the track is not available as part of the Call at this point in time,
    //    then this event does not need to be handled.
    // This occurs for some browsers that simulate a new track becoming source
    //    unmuted immediately as they are first created.
  } else {
    // If there is no timeout, then the track had been source muted for too long.
    //    Log a message saying it has been source unmuted.
    const track = client.media.getTrackById(params.trackId)
    const endpoint = params.isLocal ? 'Local' : 'Remote'
    log(endpoint + ' ' + track.kind + ' has been source unmuted.')
  }
})
```

### Track Loss

When a track is removed from the call by an SDK operation, the `call:tracksRemoved` event will be emitted for that track. When a track ends unexpectedly, but is still part of the call, the `media:trackEnded` event will instead be emitted to let the application know about the problem. The predominant scenario where this will happen is for a local track whose device has been disconnected. For example, if a bluetooth headset or USB camera is disconnected from the machine, any local tracks retrieved from those devices will end. Some browsers also allow an end-user to end screensharing directly through the browser UI, which will also cause that local screenshare track to end.

When a track ends in this way, an application needs to decide how the track should be handled. The two most common methods are:

1. Remove the track: The track has ended and should be removed from the Call so that the remote side of the call knows that it is no longer available for rendering.
  - The `call.removeMedia` API can be used to remove a track from the call.
2. Replace the track: The track has ended but it can be replaced with a new track of the same type to prevent any call interruptions.
  - The `call.replaceTrack` API can be used to replace a track with a new one.

A scenario where you may want to remove the track is when it is a video (or screenshare) track. Replacing a video track with media from a different camera may not be desired by the end-user, depending what other cameras they have connected to their machine (and where they are pointing). Automatically removing the track would "re-synchronize" the call, so that both users know the video was removed.

A scenario where you may want to replace the track is when it is an audio track. Removing an ended audio track could result in the user not having audio, interrupting the call until the user can fix it. Automatically replacing an audio track with a new track could prevent the audio interruption.

For our demo application, we will follow the above scenarios: replace audio and remove video.

```javascript
/**
 * When a local track ends unexpectedly, minimize the interruption to the call it
 *    causes by either removing or replacing it.
 */
client.on('media:trackEnded', function (params) {
  const { trackId, callId } = params
  const track = client.media.getTrackById(trackId)

  if (track.isLocal) {
    if (track.kind === 'video') {
      // For a local video track that ended unexpectedly, clean up the call by
      //    unrendering it then removing it from the call.
      client.media.removeTrack([trackId], '#local-container')
      client.call.removeMedia(callId, [trackId])
    } else if (track.kind === 'audio') {
      // For a local audio track that ended unexpectedly, replace it with a new
      //    audio track.
      client.call.replaceTrack(callId, trackId, { audio: true })
    }
  }
})
```

## Limitations on Anonymous Calls

Once the Anonymous Call SDK is initialized, it does not receive any incoming call notifications. Therefore, an anonymous user cannot receive calls.
Once an anonymous call is established, the call cannot be transferred in any way using the Anonymous Call SDK.

As an example, when an anonymous caller calls support@company.com, the anonymous caller cannot transfer that call. If needed, the agent should transfer the anonymous caller to another agent.

To summarize, the following actions cannot be performed with the Anonymous Call SDK:

- Accept an incoming call
- Perform any type of call transfer
- Perform a "join" on two ongoing calls

We can now call the demo application done. We've covered the basics of what is needed to allow a user to use call functionality.

## Live Demo

Do you want to try this example for yourself? Click the button below to get started.

### Instructions for Demo

#### Prerequisites (for token-based anonymous calling)

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

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Anonymous Calls Demo\n */\n\n// Setup Kandy with the following configuration.\nconst { create } = Kandy\nconst client = create({\n  call: {\n    defaultPeerConfig: {\n      iceServers: [\n        { urls: &apos;$KANDYTURN1$&apos; },\n        { urls: &apos;$KANDYSTUN1$&apos; },\n        { urls: &apos;$KANDYTURN2$&apos; },\n        { urls: &apos;$KANDYSTUN2$&apos; }\n      ]\n    },\n    // Specify that credentials should be fetched from the server.\n    serverTurnCredentials: true\n  },\n  authentication: {\n    subscription: {\n      service: [&apos;call&apos;],\n      server: &apos;$SUBSCRIPTIONFQDN$&apos;\n    },\n    websocket: {\n      server: &apos;$SUBSCRIPTIONFQDN$&apos;\n    }\n  },\n  logs: {\n    logLevel: &apos;debug&apos;,\n    logActions: {\n      actionOnly: false,\n      exposePayloads: true\n    }\n  }\n})\n\nfunction toggleVisibilityOnUserFields () {\n  let chbox = document.getElementById(&apos;make-token-based-anonymous-call&apos;)\n  let visibility = &apos;block&apos;\n  if (chbox.checked) {\n    visibility = &apos;none&apos;\n  }\n  document.getElementById(&apos;callerSection&apos;).style.display = visibility\n  document.getElementById(&apos;calleeSection&apos;).style.display = visibility\n}\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  document.getElementById(&apos;messages&apos;).innerHTML += &apos;<div>&apos; + message + &apos;</div>&apos;\n}\n\n// Variable to keep track of the call.\nlet callId\n\n// If call is a regular anonymous one, then we&apos;ll use caller & callee\n// values, as provided by user (in the text fields of this UI).\n// If call is a token-based anonymous one, then caller & callee will\n// be obtained from our Node.js https server.\nasync function makeAnonymousCall () {\n  let makeATokenBasedAnonymousCall = document.getElementById(&apos;make-token-based-anonymous-call&apos;).checked\n\n  let caller = document.getElementById(&apos;caller&apos;).value\n  if (!caller && !makeATokenBasedAnonymousCall) {\n    // For regular anonymous call, ask user to fill in the value\n    log(&apos;Error: Please provide the primary contact for the caller.&apos;)\n    return\n  }\n\n  let callee = document.getElementById(&apos;callee&apos;).value\n  if (!callee && !makeATokenBasedAnonymousCall) {\n    // For regular anonymous call, ask user to fill in the value\n    log(&apos;Error: Please provide the primary contact for the callee.&apos;)\n    return\n  }\n\n  // For regular anonymous call, there is no need for credentials\n  let credentials = {}\n\n  // Define our call options. Assume for now it is for a regular anonymous call.\n  const callOptions = {\n    from: caller,\n    video: false,\n    audio: true\n  }\n  if (makeATokenBasedAnonymousCall) {\n    // Before attempting to trigger outgoing call, get the actual token values\n    // from expressjs application server in order to make a token-based anonymous call.\n    const getTokensRequestUrl = &apos;https://localhost:3000/callparameters&apos;\n    let result = await fetch(getTokensRequestUrl)\n    let data = await result.json()\n\n    let accountToken = data.accountToken\n    let fromToken = data.fromToken\n    let toToken = data.toToken\n    let realm = data.realm\n\n    caller = data.caller\n    callee = data.callee\n\n    callOptions[&apos;from&apos;] = caller\n\n    log(&apos;Got Account Token: &apos; + accountToken)\n    log(&apos;Got From Token:    &apos; + fromToken)\n    log(&apos;Got To Token:      &apos; + toToken)\n    log(&apos;Got Realm:         &apos; + realm)\n    log(&apos;Got Caller:        &apos; + caller)\n    log(&apos;Got Callee:        &apos; + callee)\n\n    // Build our credentials object.\n    credentials = {\n      accountToken,\n      fromToken,\n      toToken,\n      realm\n    }\n    log(&apos;Making a token-based anonymous call to &apos; + callee)\n  } else {\n    // For regular anonymous calls, no extra information is needed.\n    log(&apos;Making a regular anonymous call to &apos; + callee)\n  }\n\n  // Finally, trigger the outgoing anonymous call.\n  callId = client.call.makeAnonymous(callee, credentials, callOptions)\n}\n\n// End an ongoing call.\nfunction endCall () {\n  const call = client.call.getById(callId)\n\n  log(&apos;Ending call with &apos; + call.from)\n  client.call.end(callId)\n}\n\n// Set listener for changes in a call&apos;s state.\nclient.on(&apos;call:stateChange&apos;, function (params) {\n  const call = client.call.getById(params.callId)\n\n  if (params.error && params.error.message) {\n    log(&apos;Error: &apos; + params.error.message)\n  }\n  log(&apos;Call state changed from &apos; + params.previous.state + &apos; to &apos; + call.state)\n\n  // If the call ended, stop tracking the callId.\n  if (params.state === &apos;ENDED&apos;) {\n    callId = null\n  }\n})\n\n// Set listener for successful call starts.\nclient.on(&apos;call:start&apos;, function (params) {\n  log(&apos;Call successfully started. Waiting for response.&apos;)\n})\n\n/*\n *  Add media on ongoing Call functionality.\n */\nfunction addMedia () {\n  log(&apos;Adding media track(s) to ongoing call&apos; + callId)\n\n  const withAudioBox = document.getElementById(&apos;make-with-audio&apos;)\n  const withVideoBox = document.getElementById(&apos;make-with-video&apos;)\n  const withScreenBox = document.getElementById(&apos;make-with-screen&apos;)\n\n  const media = {\n    audio: withAudioBox.checked,\n    video: withVideoBox.checked,\n    screen: withScreenBox.checked\n  }\n\n  client.call.addMedia(callId, media)\n\n  // Reset the checkboxes afterwards.\n  withAudioBox.checked = false\n  withVideoBox.checked = false\n  withScreenBox.checked = false\n}\n\n/*\n *  Remove media(s) from ongoing Call functionality.\n */\nfunction removeMedia () {\n  log(&apos;Removing media track(s) to ongoing call&apos; + callId)\n  let checkBoxes = document.getElementsByName(&apos;removeMedia&apos;)\n  // Get the list of IDs with checked checkboxes.\n  const trackIds = getAllCheckedTracks()\n\n  client.call.removeMedia(callId, trackIds)\n}\n\n/**\n * When new tracks are added to the call, we want to render them.\n * For local tracks, we also want to add a UI element so we can remove them.\n */\nclient.on(&apos;call:tracksAdded&apos;, function (params) {\n  const { trackIds } = params\n\n  trackIds.forEach(trackId => {\n    const track = client.media.getTrackById(trackId)\n\n    // Render the track&apos;s media.\n    renderTrack(track)\n\n    // Add UI controls to remove local tracks from the call.\n    if (track.isLocal) {\n      addTrackControls(track)\n    }\n  })\n})\n\n/**\n * When tracks are removed from the call, we want to unrender them.\n * For local tracks, we also want to remove the UI element we previously added.\n */\nclient.on(&apos;call:tracksRemoved&apos;, function (params) {\n  const { trackIds } = params\n\n  // Iterate over each trackId to determine how to unrender it.\n  trackIds.forEach(trackId => {\n    const track = client.media.getTrackById(trackId)\n\n    // Unrender the track from the page.\n    removeTrack(track)\n\n    // Remove the UI controls for the local track.\n    if (track.isLocal) {\n      removeTrackControls(track)\n    }\n  })\n})\n\n/*\n * Function that renders a track.\n * @param {Track} track The Track object retrieved from the SDK.\n */\nfunction renderTrack (track) {\n  if (track.isLocal) {\n    // Only render local video into the local container. The user does not need\n    //    to hear themselves speak.\n    if (track.kind === &apos;video&apos;) {\n      client.media.renderTracks([track.trackId], &apos;#local-container&apos;)\n    }\n  } else {\n    // Render all remote media into the remote container.\n    client.media.renderTracks([track.trackId], &apos;#remote-container&apos;)\n  }\n}\n\n/*\n * Function that unrenders a track.\n * @param {Track} track The Track object retrieved from the SDK.\n */\nfunction removeTrack (track) {\n  // Check whether the ended track was a local track or not.\n  if (track.isLocal) {\n    if (track.kind === &apos;video&apos;) {\n      // Remove the video track from the local container.\n      //    Local audio tracks were not rendered by the renderTrack function.\n      client.media.removeTracks([track.trackId], &apos;#local-container&apos;)\n    }\n  } else {\n    // Remove the track from the remote container.\n    client.media.removeTracks([track.trackId], &apos;#remote-container&apos;)\n  }\n}\n\n/*\n * Function to add UI elements for removing a local track from the Call.\n * @param {Track} track The Track object retrieved from the SDK.\n */\nfunction addTrackControls (track) {\n  if (!track.isLocal) {\n    // We only want to add controls for local tracks.\n    return\n  }\n\n  const controlsId = &apos;controls-&apos; + track.trackId\n  if (document.getElementById(controlsId)) {\n    // Controls already exist for this track.\n    return\n  }\n\n  const controls = document.createElement(&apos;div&apos;)\n  controls.id = controlsId\n\n  const checkbox = document.createElement(&apos;input&apos;)\n  checkbox.type = &apos;checkbox&apos;\n  checkbox.id = track.trackId\n  checkbox.name = &apos;local-track&apos;\n\n  const label = document.createElement(&apos;label&apos;)\n  label.innerHTML = track.kind + &apos;track (&apos; + track.trackId + &apos;)&apos;\n\n  controls.appendChild(checkbox)\n  controls.appendChild(label)\n\n  const trackList = document.getElementById(&apos;localTrack-controls&apos;)\n  trackList.appendChild(controls)\n}\n\n/*\n * Function to remove UI elements used for removing a local track from the Call.\n * @param {Track} track The Track object retrieved from the SDK.\n */\nfunction removeTrackControls (track) {\n  if (!track.isLocal) {\n    return\n  }\n\n  const controlsId = &apos;controls-&apos; + track.trackId\n  const controls = document.getElementById(controlsId)\n  if (controls) {\n    const trackList = document.getElementById(&apos;localTrack-controls&apos;)\n    trackList.removeChild(controls)\n  } else {\n    // Track controls don&apos;t exist for this track.\n  }\n}\n\n/*\n * Function to get the IDs of all checked checkboxes for local tracks.\n * @return {Array<string>} List of track IDs.\n */\nfunction getAllCheckedTracks () {\n  const checkedBoxes = document.querySelectorAll(&apos;input[name=local-track]:checked&apos;)\n  const trackIds = Array.from(checkedBoxes).map(box => box.id)\n\n  return trackIds\n}\n\n// Allow a debounce timeout to be stored per track.\nconst sourceMutedTimeouts = {}\n\n/**\n * When a track which is available for rendering becomes source muted, we want\n *    to debounce the event to prevent \&quot;flickering\&quot; for short interruptions, but\n *    inform the end-user of longer interruptions.\n */\nclient.on(&apos;media:sourceMuted&apos;, function (params) {\n  if (sourceMutedTimeouts[params.trackId]) {\n    // We already have an event that this track has become source muted recently.\n    //    That means the track&apos;s state is flickering between source muted/unmuted.\n    //    Ignore this event.\n  } else {\n    // Setup a delay of 1 second before handling the event.\n    sourceMutedTimeouts[params.trackId] = setTimeout(() => {\n      const track = client.media.getTrackById(params.trackId)\n      const call = client.call.getById(callId)\n      const availableTracks = params.isLocal ? call.localTracks : call.remoteTracks\n      // If the track is still source muted after the delay, log a message to\n      //    inform the end-user.\n      // We also check that the call is supposed to be available for rendering at\n      //    this point in time. If the track is not part of the Call, then it is\n      //    not expected to become source unmuted unless it becomes available again.\n      if (track.sourceMuted && availableTracks.includes(params.trackId)) {\n        const endpoint = params.isLocal ? &apos;Local&apos; : &apos;Remote&apos;\n        log(endpoint + &apos; &apos; + track.kind + &apos; has been source muted for 1 second.&apos;)\n      } else {\n        // If the track is not source muted after the delay, then it was only a\n        //    short media interruption.\n      }\n\n      // Remove the debounce timeout.\n      sourceMutedTimeouts[params.trackId] = undefined\n    }, 1000)\n  }\n})\n\n/**\n * When a track which is available for rendering becomes source unmuted after a\n *    longer interruption, we want to inform the end-user that the interruption\n *    has ended.\n */\nclient.on(&apos;media:sourceUnmuted&apos;, function (params) {\n  const call = client.call.getById(callId)\n  const availableTracks = params.isLocal ? call.localTracks : call.remoteTracks\n\n  if (sourceMutedTimeouts[params.trackId]) {\n    // If there is a timeout for this track, that means the source muted state\n    //    of the track has flickered within 1 second.\n    // Ignore this event, since the timeout will check if the track was source\n    //    unmuted during the delay.\n  } else if (!availableTracks.includes(params.trackId)) {\n    // If the track is not available as part of the Call at this point in time,\n    //    then this event does not need to be handled.\n    // This occurs for some browsers that simulate a new track becoming source\n    //    unmuted immediately as they are first created.\n  } else {\n    // If there is no timeout, then the track had been source muted for too long.\n    //    Log a message saying it has been source unmuted.\n    const track = client.media.getTrackById(params.trackId)\n    const endpoint = params.isLocal ? &apos;Local&apos; : &apos;Remote&apos;\n    log(endpoint + &apos; &apos; + track.kind + &apos; has been source unmuted.&apos;)\n  }\n})\n\n/**\n * When a local track ends unexpectedly, minimize the interruption to the call it\n *    causes by either removing or replacing it.\n */\nclient.on(&apos;media:trackEnded&apos;, function (params) {\n  const { trackId, callId } = params\n  const track = client.media.getTrackById(trackId)\n\n  if (track.isLocal) {\n    if (track.kind === &apos;video&apos;) {\n      // For a local video track that ended unexpectedly, clean up the call by\n      //    unrendering it then removing it from the call.\n      client.media.removeTrack([trackId], &apos;#local-container&apos;)\n      client.call.removeMedia(callId, [trackId])\n    } else if (track.kind === &apos;audio&apos;) {\n      // For a local audio track that ended unexpectedly, replace it with a new\n      //    audio track.\n      client.call.replaceTrack(callId, trackId, { audio: true })\n    }\n  }\n})\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-callMe-js-sdk@5.1.0-beta.918/dist/kandy.js\&quot;></script>\n<script src=\&quot;$DEFAULTCONFIGURL$\&quot;></script>\n\n<div>\n  <fieldset>\n    <fieldset>\n      <legend>Make an Anonymous Call</legend>\n\n      <!-- User input for making a call. -->\n      <div class=\&quot;bottomSpacing\&quot;>\n        <input type=\&quot;button\&quot; class=\&quot;bottomSpacing\&quot; value=\&quot;Make Call\&quot; onclick=\&quot;makeAnonymousCall();\&quot; />\n        <div style=\&quot;margin-left: 20px\&quot; id=\&quot;calleeSection\&quot;>\n          To: <input id=\&quot;callee\&quot; type=\&quot;text\&quot; placeholder=\&quot;Callee&apos;s primary contact\&quot; />\n        </div>\n      </div>\n\n      <div id=\&quot;callerSection\&quot;>Caller: <input id=\&quot;caller\&quot; type=\&quot;text\&quot; placeholder=\&quot;Caller&apos;s primary contact\&quot; /></div>\n\n      <div>\n        Make a token-based call\n        <input type=\&quot;checkbox\&quot; id=\&quot;make-token-based-anonymous-call\&quot; onclick=\&quot;toggleVisibilityOnUserFields();\&quot; />\n      </div>\n    </fieldset>\n\n    <fieldset>\n      <legend>End an Anonymous Call</legend>\n      <!-- User input for ending an ongoing call. -->\n      <input type=\&quot;button\&quot; value=\&quot;End Call\&quot; onclick=\&quot;endCall();\&quot; />\n    </fieldset>\n    <fieldset>\n      <!-- Message output container. -->\n      <legend>Messages</legend>\n      <div id=\&quot;messages\&quot;></div>\n    </fieldset>\n  </fieldset>\n</div>\n\n<div>\n  <br />\n  <fieldset style=\&quot;background-color: WhiteSmoke\&quot;>\n    <legend>Add Media</legend>\n    <div class=\&quot;bottomSpacing\&quot;>\n      <!-- User input for adding media to a call. Allows a user to select which\n            types of media they would like to be added in the operation. -->\n      Audio: <input type=\&quot;checkbox\&quot; id=\&quot;make-with-audio\&quot; />\n      Video: <input type=\&quot;checkbox\&quot; id=\&quot;make-with-video\&quot; />\n      ScreenShare: <input type=\&quot;checkbox\&quot; id=\&quot;make-with-screen\&quot; />\n      <input type=\&quot;button\&quot; value=\&quot;Add Media(s)\&quot; onclick=\&quot;addMedia();\&quot; />\n    </div>\n  </fieldset>\n\n  <fieldset>\n    <legend>Remove Media</legend>\n    <!-- User input for removing local media from a call. As local media is added,\n          they will be listed here with the option to remove them from the call. -->\n    <input type=\&quot;button\&quot; value=\&quot;Remove Media(s)\&quot; onclick=\&quot;removeMedia();\&quot; disabled />\n    <div id=\&quot;localTrack-controls\&quot;></div>\n  </fieldset>\n\n  <!-- Media containers. -->\n  <fieldset>\n    <legend>Media containers</legend>\n    Remote video: <div id=\&quot;remote-container\&quot;></div>\n    Local video: <div id=\&quot;local-container\&quot;></div>\n  </fieldset>\n</div>\n\n&quot;,&quot;css&quot;:&quot;video {\n  width: 50% !important;\n}\n\n.bottomSpacing {\n  margin-bottom: 15px;\n}\n\n&quot;,&quot;title&quot;:&quot;Javascript SDK Anonymous Calls Demo&quot;,&quot;editors&quot;:101,&quot;js_external&quot;:&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-callMe-js-sdk@5.1.0-beta.918/dist/kandy.js&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>

_Note: You’ll be sent to an external website._

