---
layout: page
categories: quickstarts-javascript
title: Handling Devices
permalink: /quickstarts/javascript/newCallMe/Handling%20Devices
---

# Device Handling

In this quickstart we will cover how to handle devices with Kandy.js. Handling devices is not a required functionality in the sdk. This tutorial helps give an understanding on how devices work with calls or non-related call operations and retrieving information about the available devices. Code snippets will be used to demonstrate these features, and together these snippets will form a working demo application that can be viewed at the end.

For information about other call features, such as starting calls and mid-call operations, please refer to their respective quickstarts.

## Get Devices

To get the list of available devices and information, you simply call the `client.media.getDevices()` API function. When called, it will return an Object with a list for each device type i.e microphone, cameras, speakers. Device lists can be different based on the browser used. For instance, a device in the list can also be added by the browser again as a default device. Included in the device information is the `deviceId` and the `label` of the device, which are both strings. If this list is empty, there can be the possibility of no device present or you don't have permission to access the user's devices and due to this, the label property for the device can be an empty string.

```javascript 
function getDevices () {
  // Get the media devices currently available for use.
  const devices = client.media.getDevices()

  // They are organized in arrays by their device type.
  const { microphone, camera, speaker } = devices

  // Each device has details to identify it, notably a label and unique ID.
  const { label, deviceId } = microphone[0]

  // For some browsers, the details won't be provided unless the end-user has
  //    granted permission to access the devices. That is why we need to
  //    initialize the devices in some cases.
}
```

## Initializing Devices

The `client.media.initializeDevices` API is not required during call setup and will trigger the browser to ask the end-user for permission to access their camera and/or microphone. This gives the browser/application access to the device early, so that the end-user doesn't need to be prompted when they make a call. The API function takes parameters and the application will still need to specify the deviceId when making/answering a call. These permissions could be denied by the end-user and if denied, the list would not have that device using the `client.media.getDevices()` API to get the list of devices.

Note: The API will will trigger an event to let the application know the device list has been updated.

```javascript
/*
 * Call the API to initialize media devices. The browser may prompt the end-user
 *    with a pop-up to grant device permission, if not already allowed.
 * This operation will either trigger a `devices:change` or `devices:error` event,
 *    based on whether the SDK was granted permission or not.
 */
function initializeDevices () {
  // Can request permission for audio and/or video input devices.
  const initAudio = document.getElementById('init-audio').checked
  const initVideo = document.getElementById('init-video').checked

  client.media.initializeDevices({ audio: initAudio, video: initVideo })
}
```

## Selecting Your Device on Call Setup

To learn how to start or answer a call, refer to the [Voice and Video Calls tutorial](Voice%20and%20Video%20Calls). The microphone and/or camera can be chosen when starting a call. The IDs for each device in the media object can be passed as parameters to the `client.call.make` or `client.call.answer` call APIs, see below. Those IDs determine which microphone or camera will be used when starting the call. In the case of the speakers, this will be chosen when the audio track is rendered with the `client.media.renderTracks` API by passing the speaker's `deviceId` to use for audio tracks.

During a call setup, the `client.call.make` API has a different parameter for media options. Included in the media options is the `call.MediaConstraints` object, which defines the format for configuring the media options, see the `Call` API documentation.

Note: The constraints can use either the ideal or exact property. If the exact value cannot be used, the constraint will be considered an error. But in the case of the ideal property, the closest acceptable value will be used instead.

See below for how the media options should be formatted and how to make/answer call with a device.

```javascript 
async function makeAnonymousCall () {
  // Get media related options from UI.
  const withAudio = document.getElementById('make-with-audio').checked
  const withVideo = document.getElementById('make-with-video').checked
  const microphone = getSelectedDeviceId('microphone')
  const camera = getSelectedDeviceId('camera')

  // Determine the media options to provide to the API.
  const mediaOptions = {
    audio: withAudio,
    audioOptions: withAudio ? { deviceId: microphone } : undefined
    video: withVideo,
    videoOptions: withVideo ? { deviceId: camera } : undefined
  }

  // Do all of the other, non-media related things required for anonymous calls.
  // See the 'Anonymous Calls' tutorial for the explanation of this part.
  ...

  // Finally, trigger the outgoing anonymous call.
  callId = client.call.makeAnonymous(callee, credentials, mediaOptions)
}
```

## Changing Devices during a Call

To learn how to perform midcall operations, refer to the[Handling Media tutorial](Handling%20Media%20Tracks).

When adding a device (e.g. microphone and/or a camera) during an ongoing call, the `deviceId` for each device will need to be passed into the media object with the `client.call.addMedia` API. However, removing the device will require specifying the `trackId` and the `deviceId` in the media Object to the `client.call.replaceTrack` API as parameters. To learn how to add/remove media, refer to [Handling Media Tracks](Handling%20Media%20Tracks). Changing the output device (i.e speakers) requires unrendering the the tracks using the `client.media.removeTracks` and re-rendering the track with `client.media.renderTracks` API by passing the speaker's `deviceId` to use for audio tracks.

Note: The `client.call.replaceTrack` API is the recommended way to change a device during a call but if that can't be done, the application should remove using `client.call.removeTracks` and then re-add a track in order to change its device.

```javascript
/**
 * Changes the device, of the specified type, being used on the call with
 *    the selected device of that type.
 */
function replaceDevice (type) {
  const call = client.call.getById(callId)
  const newDevice = getSelectedDeviceId(type)

  /*
   * Important: The method to change input devices vs. output devices is different.
   * For input devices (microphone, camera), you need to replace the track being
   *    used with a new track that is getting media from the new device.
   * For output devices (speakers), you simply need to re-render the existing
   *    track and specify the new device to use.
   */
  if (type === 'microphone' || type === 'camera') {
    // Determine whether its an audio or video track we are replacing based
    //    on the device type specified.
    const mediaType = type === 'microphone' ? 'audio' : 'video'

    // Determine the media options to be provided to the API.
    const mediaOptions =
      mediaType === 'audio'
        ? { audio: true, audioOptions: { deviceId: newDevice } }
        : { video: true, videoOptions: { deviceId: newDevice } }

    // Find the ID of the track we are replacing. For input devices, we act
    //    on our local tracks.
    const trackId = call.localTracks.find(id => {
      const track = client.media.getTrackById(id)
      return track.kind === mediaType
    })

    // Replace the existing track with a new track using our selected device.
    client.call.replaceTrack(callId, trackId, mediaOptions)
  } else if (type === 'speaker') {
    // Find the ID of the track we want to change the speaker for. For output
    //    devices, we act on the remote tracks.
    const trackId = call.remoteTracks.find(id => {
      const track = client.media.getTrackById(id)
      return track.kind === 'audio'
    })

    // Unrender the remote audio track, then re-render it with the desired
    //    speaker device.
    client.media.removeTracks([trackId], '#remote-container')
    client.media.renderTracks([trackId], '#remote-container', {
      speakerId: newDevice
    })
  }
}
```

## Events

### devices:change

The `devices:change` event informs us when the media devices have changed and multiple things can also trigger this event. For instance, when initializing devices or connecting/disconnecting devices to the end-user's machine.

This would also be emitted during an ongoing call, if media devices changed. The `devices:error` event will be triggered when an error is encountered when using media devices. For instance, initializing devices or connecting/disconnecting devices to the end-user's machine could trigger these event if an error occurs. Also when the browser cannot find a media device that fulfills the `call.MediaConstraint` provided.

```javascript
/*
 * Listen for changes to the device lists. This will happen after devices have
 *    been initialized or if a device is added/removed from the end-user's machine.
 * When emitted, we want to updated our HTML device selectors using the
 *    updated lists.
 */
client.on('devices:change', () => {
  const devices = client.media.getDevices()
  log('Media devices have changed.')
  console.log('Full devices list: ', devices)

  const types = ['microphone', 'camera', 'speaker']
  types.forEach(type => {
    // Update our HTML select elements with the updated devices.
    updateSelector(type, devices[type])
  })
})

/*
 * Listen for device errors. This will happen either if permission is denied
 *   by the end-user when initializing devices, or if the SDK cannot get access
 *   to a device using the specified options when adding media to a call.
 */
client.on('devices:error', function (params) {
  log('An error occurred:' + params.error.message)
})
```

## Live Demo

Want to play around with this example for yourself? Feel free to edit this code on Codepen.

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Device Handling Demo\n */\n\nconst { create } = Kandy\nconst client = create({\n  call: {\n    iceserver: [\n      {\n        url: &apos;$KANDYTURN1$&apos;,\n        credentials: &apos;&apos;\n      },\n      {\n        url: &apos;$KANDYTURN2$&apos;,\n        credentials: &apos;&apos;\n      },\n      {\n        url: &apos;$KANDYSTUN1$&apos;,\n        credentials: &apos;&apos;\n      },\n      {\n        url: &apos;$KANDYSTUN2$&apos;,\n        credentials: &apos;&apos;\n      }\n    ]\n  },\n  authentication: {\n    subscription: {\n      service: [&apos;call&apos;],\n      server: &apos;$SUBSCRIPTIONFQDN$&apos;\n    },\n    websocket: {\n      server: &apos;$SUBSCRIPTIONFQDN$&apos;\n    }\n  },\n  logs: {\n    logLevel: &apos;debug&apos;,\n    logActions: {\n      actionOnly: false,\n      exposePayloads: true\n    }\n  }\n})\n\nfunction toggleVisibilityOnUserFields () {\n  let chbox = document.getElementById(&apos;make-token-based-anonymous-call&apos;)\n  let visibility = &apos;block&apos;\n  if (chbox.checked) {\n    visibility = &apos;none&apos;\n  }\n  document.getElementById(&apos;callerSection&apos;).style.display = visibility\n  document.getElementById(&apos;calleeSection&apos;).style.display = visibility\n}\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  document.getElementById(&apos;messages&apos;).innerHTML += &apos;<div>&apos; + message + &apos;</div>&apos;\n}\n\n/*\n * Helper functions for managing changes to the HTML.\n */\n\n// Function to update the HTML <select> elements of device lists.\nfunction updateSelector (deviceType, devices) {\n  const selector = document.getElementById(deviceType + &apos;-selector&apos;)\n\n  // Clear the previous options, then re-add the default \&quot;no selection\&quot; option.\n  selector.innerHTML = &apos;&apos;\n  const defaultOption = document.createElement(&apos;option&apos;)\n  defaultOption.value = undefined\n  defaultOption.textContent = &apos;No device selected.&apos;\n  selector.appendChild(defaultOption)\n\n  // Add each device of this type to the select element.\n  devices.forEach(device => {\n    const option = document.createElement(&apos;option&apos;)\n    option.value = device.deviceId\n\n    // Important: Device labels are not always available.\n    // This is generally because the SDK does not have permission to access\n    //    identifiable information about the devices. This is where we need\n    //    to prompt the end-user for permission by initializing the devices.\n    option.textContent = device.label ? device.label : &apos;Label not available - Media permission required!&apos;\n\n    selector.appendChild(option)\n  })\n}\n\n// Function to get the ID of the specified type&apos;s selected device.\nfunction getSelectedDeviceId (type) {\n  const device = document.getElementById(type + &apos;-selector&apos;).value\n\n  // If the selected device is the default option, return undefined.\n  // The system default device will be used if no deviceId is specified when\n  //    adding media to a call.\n  if (device === &apos;undefined&apos;) {\n    return undefined\n  }\n\n  return device\n}\n\n/*\n * Call related code.\n */\n\n// End an ongoing call.\nfunction endCall () {\n  // Retrieve call state.\n  let call = client.call.getById(callId)\n  log(&apos;Ending call with &apos; + call.to)\n\n  client.call.end(callId)\n}\n\n/*\n * Call the API to initialize media devices. The browser may prompt the end-user\n *    with a pop-up to grant device permission, if not already allowed.\n * This operation will either trigger a `devices:change` or `devices:error` event,\n *    based on whether the SDK was granted permission or not.\n */\nfunction initializeDevices () {\n  // Can request permission for audio and/or video input devices.\n  const initAudio = document.getElementById(&apos;init-audio&apos;).checked\n  const initVideo = document.getElementById(&apos;init-video&apos;).checked\n\n  client.media.initializeDevices({ audio: initAudio, video: initVideo })\n}\n\nlet callId\n// If call is a regular anonymous one, then we&apos;ll use caller & callee\n// values, as provided by user (in the text fields of this UI).\n// If call is a token-based anonymous one, then caller & callee will\n// be obtained from our Node.js https server.\nasync function makeAnonymousCall () {\n  // Get media related options from UI.\n  const withAudio = document.getElementById(&apos;make-with-audio&apos;).checked\n  const withVideo = document.getElementById(&apos;make-with-video&apos;).checked\n  const microphone = getSelectedDeviceId(&apos;microphone&apos;)\n  const camera = getSelectedDeviceId(&apos;camera&apos;)\n\n  // Determine the media options to provide to the call.\n  const mediaOptions = {\n    audio: withAudio,\n    audioOptions: withAudio ? { deviceId: microphone } : undefined,\n    video: withVideo,\n    videoOptions: withVideo ? { deviceId: camera } : undefined\n  }\n\n  let makeATokenBasedAnonymousCall = document.getElementById(&apos;make-token-based-anonymous-call&apos;).checked\n\n  let caller = document.getElementById(&apos;caller&apos;).value\n  if (!caller && !makeATokenBasedAnonymousCall) {\n    // For regular anonymous call, ask user to fill in the value\n    log(&apos;Error: Please provide the primary contact for the caller.&apos;)\n    return\n  }\n\n  let callee = document.getElementById(&apos;callee&apos;).value\n  if (!callee && !makeATokenBasedAnonymousCall) {\n    // For regular anonymous call, ask user to fill in the value\n    log(&apos;Error: Please provide the primary contact for the callee.&apos;)\n    return\n  }\n\n  // For regular anonymous call, there is no need for credentials\n  let credentials = {}\n\n  // Define our call options, by merging the media options in with the other options.\n  const callOptions = {\n    ...mediaOptions,\n    from: caller\n  }\n  if (makeATokenBasedAnonymousCall) {\n    // Before attempting to trigger outgoing call, get the actual token values\n    // from expressjs application server in order to make a token-based anonymous call.\n    const getTokensRequestUrl = &apos;https://localhost:3000/callparameters&apos;\n    let result = await fetch(getTokensRequestUrl)\n    let data = await result.json()\n\n    let accountToken = data.accountToken\n    let fromToken = data.fromToken\n    let toToken = data.toToken\n    let realm = data.realm\n\n    caller = data.caller\n    callee = data.callee\n\n    callOptions[&apos;from&apos;] = caller\n\n    log(&apos;Got Account Token: &apos; + accountToken)\n    log(&apos;Got From Token:    &apos; + fromToken)\n    log(&apos;Got To Token:      &apos; + toToken)\n    log(&apos;Got Realm:         &apos; + realm)\n    log(&apos;Got Caller:        &apos; + caller)\n    log(&apos;Got Callee:        &apos; + callee)\n\n    // Build our credentials object.\n    credentials = {\n      accountToken,\n      fromToken,\n      toToken,\n      realm\n    }\n    log(&apos;Making a token-based anonymous call to &apos; + callee)\n  } else {\n    // For regular anonymous calls, no extra information is needed.\n    log(&apos;Making a regular anonymous call to &apos; + callee)\n  }\n\n  // Finally, trigger the outgoing anonymous call.\n  callId = client.call.makeAnonymous(callee, credentials, callOptions)\n}\n\n/**\n * Changes the device, of the specified type, being used on the call with\n *    the selected device of that type.\n */\nfunction replaceDevice (type) {\n  const call = client.call.getById(callId)\n  const newDevice = getSelectedDeviceId(type)\n\n  /*\n   * Important: The method to change input devices vs. output devices is different.\n   * For input devices (microphone, camera), you need to replace the track being\n   *    used with a new track that is getting media from the new device.\n   * For output devices (speakers), you simply need to re-render the existing\n   *    track and specify the new device to use.\n   */\n  if (type === &apos;microphone&apos; || type === &apos;camera&apos;) {\n    // Determine whether its an audio or video track we are replacing based\n    //    on the device type specified.\n    const mediaType = type === &apos;microphone&apos; ? &apos;audio&apos; : &apos;video&apos;\n\n    // Determine the media options to be provided to the API.\n    const mediaOptions =\n      mediaType === &apos;audio&apos;\n        ? { audio: true, audioOptions: { deviceId: newDevice } }\n        : { video: true, videoOptions: { deviceId: newDevice } }\n\n    // Find the ID of the track we are replacing. For input devices, we act\n    //    on our local tracks.\n    const trackId = call.localTracks.find(id => {\n      const track = client.media.getTrackById(id)\n      return track.kind === mediaType\n    })\n\n    // Replace the existing track with a new track using our selected device.\n    client.call.replaceTrack(callId, trackId, mediaOptions)\n  } else if (type === &apos;speaker&apos;) {\n    // Find the ID of the track we want to change the speaker for. For output\n    //    devices, we act on the remote tracks.\n    const trackId = call.remoteTracks.find(id => {\n      const track = client.media.getTrackById(id)\n      return track.kind === &apos;audio&apos;\n    })\n\n    // Unrender the remote audio track, then re-render it with the desired\n    //    speaker device.\n    client.media.removeTracks([trackId], &apos;#remote-container&apos;)\n    client.media.renderTracks([trackId], &apos;#remote-container&apos;, {\n      speakerId: newDevice\n    })\n  }\n}\n\n/*\n * Listen for changes to the device lists. This will happen after devices have\n *    been initialized or if a device is added/removed from the end-user&apos;s machine.\n * When emitted, we want to updated our HTML device selectors using the\n *    updated lists.\n */\nclient.on(&apos;devices:change&apos;, () => {\n  const devices = client.media.getDevices()\n  log(&apos;Media devices have changed.&apos;)\n  console.log(&apos;Full devices list: &apos;, devices)\n\n  const types = [&apos;microphone&apos;, &apos;camera&apos;, &apos;speaker&apos;]\n  types.forEach(type => {\n    // Update our HTML select elements with the updated devices.\n    updateSelector(type, devices[type])\n  })\n})\n\n/*\n * Listen for device errors. This will happen either if permission is denied\n *   by the end-user when initializing devices, or if the SDK cannot get access\n *   to a device using the specified options when adding media to a call.\n */\nclient.on(&apos;devices:error&apos;, function (params) {\n  log(&apos;An error occurred:&apos; + params.error.message)\n})\n\n// Set listener for changes in a call&apos;s state.\nclient.on(&apos;call:stateChange&apos;, function (params) {\n  // Retrieve call state.\n  const call = client.call.getById(params.callId)\n\n  if (params.error && params.error.message) {\n    log(&apos;Error: &apos; + params.error.message)\n  }\n  log(&apos;Call state changed from &apos; + params.previous.state + &apos; to &apos; + call.state)\n\n  // If the call ended, stop tracking the callId.\n  if (params.state === client.call.states.ENDED) {\n    callId = null\n  }\n})\n\n// Set listener for incoming calls.\nclient.on(&apos;call:receive&apos;, function (params) {\n  // Keep track of the callId.\n  callId = params.callId\n\n  // Retrieve call information.\n  call = client.call.getById(params.callId)\n  log(&apos;Received incoming call from &apos; + call.from)\n})\n\n// Set listener for new tracks.\nclient.on(&apos;call:newTrack&apos;, function (params) {\n  // Check whether the new track was a local track or not.\n  if (params.local) {\n    // Don&apos;t render the local audio track so the end-user doesn&apos;t hear themselves.\n    const localTrack = client.media.getTrackById(params.trackId)\n    if (localTrack.kind === &apos;video&apos;) {\n      client.media.renderTracks([params.trackId], &apos;#local-container&apos;)\n    }\n  } else {\n    // Render the remote media into the remote container.\n    const remoteTrack = client.media.getTrackById(params.trackId)\n    if (remoteTrack.kind === &apos;audio&apos;) {\n      // Specify the speaker we want to use if it is an audio track.\n      const speakerId = getSelectedDeviceId(&apos;speaker&apos;)\n      client.media.renderTracks([params.trackId], &apos;#remote-container&apos;, {\n        speakerId\n      })\n    } else {\n      client.media.renderTracks([params.trackId], &apos;#remote-container&apos;)\n    }\n  }\n})\n\n// Set listener for ended tracks.\nclient.on(&apos;call:trackEnded&apos;, function (params) {\n  // Check whether the ended track was a local track or not.\n  if (params.local) {\n    // Remove the track from the local container.\n    client.media.removeTracks([params.trackId], &apos;#local-container&apos;)\n  } else {\n    // Remove the track from the remote container.\n    client.media.removeTracks([params.trackId], &apos;#remote-container&apos;)\n  }\n})\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-callMe-js-sdk@825/dist/kandy.js\&quot;></script>\n<script src=\&quot;$DEFAULTCONFIGURL$\&quot;></script>\n\n<div>\n  <fieldset>\n    <legend>Media Devices</legend>\n    <div>\n      <input type=\&quot;button\&quot; onclick=\&quot;initializeDevices()\&quot; value=\&quot;Initialize Devices\&quot;></input>\n      with audio: <input type=\&quot;checkbox\&quot; checked id=\&quot;init-audio\&quot;/>\n      with audio: <input type=\&quot;checkbox\&quot; id=\&quot;init-video\&quot;/>\n    <div>\n      Microphones:\n      <select id=\&quot;microphone-selector\&quot;>\n        <option>No device selected.</option>\n      </select>\n    </div>\n     <div>\n      Cameras:\n      <select id=\&quot;camera-selector\&quot;>\n        <option>No device selected.</option>\n      </select>\n    </div>\n     <div>\n      Speakers:\n      <select id=\&quot;speaker-selector\&quot;>\n        <option>No device selected.</option>\n      </select>\n    </div>\n  </fieldset>\n</div>\n\n<div>\n  <fieldset>\n    <fieldset>\n      <legend>Make an Anonymous Call</legend>\n\n      <div style=\&quot;margin-bottom: 15px\&quot;>\n        <!-- User input for making a call. -->\n        <input type=\&quot;button\&quot; value=\&quot; Make Call \&quot; onclick=\&quot;makeAnonymousCall();\&quot; />\n        with audio: <input type=\&quot;checkbox\&quot; checked id=\&quot;make-with-audio\&quot; />\n        with video: <input type=\&quot;checkbox\&quot; id=\&quot;make-with-video\&quot; />\n        using input devices selected above,\n        to: <input id=\&quot;callee\&quot; type=\&quot;text\&quot; placeholder=\&quot;Callee&apos;s primary contact\&quot; />\n        as: <input id=\&quot;caller\&quot; type=\&quot;text\&quot; placeholder=\&quot;Caller&apos;s primary contact\&quot; />\n      </div>\n\n      <div>\n        Make a token-based call\n        <input type=\&quot;checkbox\&quot; id=\&quot;make-token-based-anonymous-call\&quot; onclick=\&quot;toggleVisibilityOnUserFields();\&quot; />\n      </div>\n    </fieldset>\n\n    <div>\n      <input type=\&quot;button\&quot; value=\&quot;Change Microphone with selected device.\&quot; onclick=\&quot;replaceDevice(&apos;microphone&apos;);\&quot;/>\n      <input type=\&quot;button\&quot; value=\&quot;Change Camera with selected device.\&quot; onclick=\&quot;replaceDevice(&apos;camera&apos;);\&quot;/>\n      <input type=\&quot;button\&quot; value=\&quot;Change Speaker with selected device.\&quot; onclick=\&quot;replaceDevice(&apos;speaker&apos;);\&quot;/>\n    </div>\n\n    <div>\n      <!-- User input for ending an ongoing call. -->\n      <input type=\&quot;button\&quot; value=\&quot;End Call\&quot; onclick=\&quot;endCall();\&quot; />\n    </div>\n\n    <fieldset>\n      <!-- Message output container. -->\n      <legend>Messages</legend>\n      <div id=\&quot;messages\&quot;></div>\n    </fieldset>\n\n  <!-- Media containers. -->\n  Remote Tracks:\n  <div id=\&quot;remote-audio-container\&quot;></div>\n  <div id=\&quot;remote-container\&quot;></div>\n  Local Tracks:\n  <div id=\&quot;local-audio-container\&quot;></div>\n  <div id=\&quot;local-container\&quot;></div>\n</div>\n\n&quot;,&quot;css&quot;:&quot;video {\n  width: 50% !important;\n}\n\n&quot;,&quot;title&quot;:&quot;Javascript SDK Device Handling Demo&quot;,&quot;editors&quot;:101} '><input type="image" src="./TryItOn-CodePen.png"></form>

