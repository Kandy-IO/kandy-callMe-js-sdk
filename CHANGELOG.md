# Change Log

Kandy.js change log.

- This project adheres to [Semantic Versioning](http://semver.org/).
- This change log follows [keepachangelog.com](http://keepachangelog.com/) recommendations.

## 4.35.1 - 2022-01-17

Please note that the changelog entry for v4.35.0 regarding the `defaultPeerConfig` has been clarified. It was previously missing key information about the `call.iceServers` configuration.

### Fixed

- Fixed a compatibility issue introduced in v4.35.0 where the `updateConfig` API would set Call configurations differently than when set originally during SDK initialization. `KJS-504`
- Updated configuration tutorial for call configuration to demonstrate the new `defaultPeerConfig` configuration object. `KJS-499`
- Fixed a Call issue where errors would not be reported to the application in certain scenarios when a failure occurred at the WebRTC level of a call operation. `KJS-508`

## 4.35.0 - 2021-12-21

### Added

- Added a Call config `defaultPeerConfig` to allow for a complete configuration of an RTCPeerConnection. `KJS-370`
  - `defaultPeerConfig` supports the same set of properties defined in RTCConfiguration. See [RTCConfiguration properties](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection) for details.
  - Please note that an existing configuration, `call.iceServers`, has been moved to be within `defaultPeerConfig`. The previous format is still accepted for backwards-compatibility, but we recommend updating your configuration to reflect this change. It will be deprecated and removed in the future.

### Fixed

- Fixed behaviour where a call would still connect when no ICE candidates were found. Calls that experience this will now fail instead. `KJS-329`
- Fixed a backwards compatibility issue with the `client.media.renderTracks` API. `KJS-457`
- Fixed a Call issue where unexpected tracks would appear after call operations if video was added to the call at some point. `KJS-382`, `KJS-267`

## 4.34.0 - 2021-11-26

### Added

- Added a new object property `mediaOffered` to `CallObject` (for an incoming call) to reflect what caller has offered in terms of media. `KJS-334`
- Added the ability to use the `call.replaceTrack` API on a call as long as it is on-going. `KJS-347`
  - Previously the operation required the call to be in the 'Connected' state only.

### Fixed

- Fixed an issue where the media direction wasn't being set correctly when adding video to a transceiver that we are reusing, this resulted in
  the call losing remote video when local video is added. `KJS-396`
- Fixed the issue where the websocket cleanup was not triggered when a lost connection was detected. `KJS-424`
- Fixed an issue where if no css selector is passed when calling `client.media.renderTracks` API, it would result in an exception. Now it is
  handled as an error and logged accordingly. `KJS-419`
- Fixed an issue where calls would occasionally get stuck in `Initiating` state if no user info was provided. `KJS-421`
- Fixed an issue where if the client updated the notifications config and set idCacheLength to 0 (disable duplicate checking) it wouldn't be
  used by the SDK and it would continue to check for duplicate notifications. `KJS-427`

## 4.33.0 - 2021-10-29

### Added

- Added improved handling for local network errors occurring during add media and remove media operations for calls. `KJS-184`
- Added two properties: `isLocal` & media `id` on the `media:sourceMuted` & `media:sourceUnmuted` events. These events are sent to application level. `KJS-78`
- A new `connectivity.resetConnection` API to allow for a reset of websocket connection. This can be invoked by the application when it detects unstable network conditions. `KJS-373`
- Added new `fetch` API. `kandy.fetch` allows the client to send any Kandy REST request through the SDK. `KJS-374`

### Fixed

- Fixed a Call issue where EarlyMedia could be enabled on Firefox even though it cannot support it. `KJS-366`
  - A warning will be logged on SDK initialization and the configuration will be disabled.

## 4.32.0 - 2021-09-24

### Added

- Added public documentation for `config.call.normalizeDestination`. `KJS-103`
- Added an extra property `iceCollectionDelay` as part of `extraInfo` parameter that is passed to `iceCollectionCheck` function. This will further improve the application's side in making a decision whether it has collected good enough ICE candidates. `KJS-253`
- Updated the _Generating Tokens_ tutorial to specify that SDK supports greater length keys when generating the auth tokens. `KJS-158`

### Fixed

- Update notifications plugin state when a websocket connection is removed to indicate the websocket channel is no longer enabled. `KJS-209`
- Fixed a Call issue where the start/stop video APIs were failing. `KJS-251`
- Fixed a Call issue where receiving a compressed SDP would cause the operation to fail `KJS-328`

## 4.31.0 - 2021-08-30

### Added

- Added support for additional parameters that are passed into the `config.call.iceCollectionCheck` function, in order for application to better decide when it collected good enough ICE candidates for the media call. `KJS-202`
- Added Call functionality to restart media after a connection failure. `KJS-86`, `KJS-68`
  - A new `call.mediaRestart` API has been added to trigger the restart operation. Please see its description for more information.
  - A new `call:mediaRestart` event has been added to signify the result of the operation.
- Added exception handling to the SDP handler pipeline. If any handler throws an exception, it's now logged and execution continues with the next handler in the pipeline. `KJS-46`
- Added previous media connection state to `call:mediaConnectionChange` event data. `KJS-96`
- Added improved Call handling for local network errors occurring during hold and unhold midcall operations. `KJS-127`

### Fixed

- Fixed a Call issue for slow-start operations where the call would not enter 'On Hold' state in certain scenarios. `KJS-259`
- Fixed an issue with the `updateConfig()` API where it would merge arrays instead of replace them. `KJS-205`
- Updated internal timing provided to the `call.iceCollectionCheck` configuration function to be more accurate. `KJS-123`
  - The `elapsedTime` parameter will be the actual time rather than based on the `call.iceCollectionDelay` value.

## 4.30.1 - 2021-08-11

### Fixed

- Fixed a Call issue where a call would not enter 'On Hold' state when the remote endpoint holds the call in certain scenarios. `KAA-2654`

## 4.30.0 - 2021-07-30

### Added

- Added new Call tutorial for Device Handling. `KJS-152`

### Changed

- Changed the domain names used in configuration for all turn/stun servers to the newly public ones (for Kandy's tutorials). `KJS-89`

## Fixed

- Improved YAML SDP log output by not repeating the final SDP if there has been no changes from the `logHandlers`.

## 4.29.0 - 2021-06-25

### SDP Semantics Defaults

With this release we're announcing the default SDP semantics are changing to the standard compliant `unified-plan` semantics. Only users on Chrome version `92` and earlier are impacted by this change. This is happening now that Google Chrome M91 is published and all interoperability work is finished. In subsequent releases `plan-b` support will be removed entirely. For more information see the release notes for SDK version `4.18.0`.

### Added

- Added a new property to the `CallObject` called `mediaConnectionState`, which tracks the underlying media connection state of a call. `KJS-141`, `KJS-223`
  - A new call event [`call:mediaConnectionChange`](https://kandy-io.github.io/kandy-callMe-js-sdk/docs/#calleventcallmediaconnectionchange) is also emitted every time the media connection state is changed.
- Added a new property to the call config called `callAuditTimer`, which sets the time interval to follow when auditing a call. If not specified in the call config object, the default of 25000 milliseconds will be used. `KJS-106`
- Added the ability to customize the `X-CPaaS-Agent` header's value by appending any custom string to its value. `KJS-159`

### Fixed

- Reworked Call audits so that the audits are performed with more consistency with respect to the interval. `KJS-105`
- Switched from using String.prototype.replaceAll to String.prototype.replace and using regex to do the correct string replacement. Some browsers don't yet
  support replaceAll. `KJS-82`
- Fixed a Call issue where a remote hold operation would not be processed correctly in some scenarios. `KAA-2639`

## 4.28.0 - 2021-05-28

### Added

- Added a Call configuration check to ensure the SDK is not configured to use SDP Semantic 'Plan-B' with a Chrome version that no longer supports it.
  - Please be aware that SDP Semantic 'Plan-B' is being deprecated. It is only supported on Chrome and only prior to version M93.

### Fixed

- Fixed a Call issue on Chrome where remote video tracks would not be ended when the remote participant removed them from the Call in certain scenarios. `KAA-2628`
  - This issue still exists on non-Chromium based browsers for the time being.
- Fixed a few documentation issues to clarify some information.
  - Clarified the information retrieved from the `call.getStats` API. `KAA-2281`
  - Clarified that only locally set CustomParameters are stored on a Call. Please see the `call.CustomParameter` object. `KAA-2603`

## 4.27.0 - 2021-04-30

### Added

- Improved the logging of [SDP handler functions](https://kandy-io.github.io/kandy-callMe-js-sdk/docs/#callsdphandlerfunction). `KJS-99`
  - In [`DEBUG` mode](https://kandy-io.github.io/kandy-callMe-js-sdk/docs/#loggerlevels) and lower, each SDP handler function applied to the SDP and the changes that may have resulted.
  - The final SDP is logged with all of the changes that have been applied.
  - The entire report is logged to the console in [YAML format](https://yaml.org/).

### Fixed

- Changed how [`destroy`](https://kandy-io.github.io/kandy-callMe-js-sdk/docs/#apidestroy) is used to prevent errors when destroying inside an event. `KJS-123`
- Fixed an issue where minimizing the SDK caused an error. `KJS-141`
- Added handling websocket error and close scenarios instead of waiting for the heartbeat to fail to either retry connection or just notify the app and clean up subscription. `KJS-61`
- Added missing 'Call API:' logs to call plugin api interface. `KJS-124`

## 4.26.0 - 2021-03-26

### Fixed

- Updated the Handling Media Tracks tutorial for more clarity. `KJS-109`

## 4.25.0 - 2021-02-26

### Added

- Added a new _Handling Media Tracks_ tutorial. `KJS-28`
  - Explains how to manage the medias during an ongoing call.

## 4.24.2 - 2021-02-22

This is a hotfix release, reverting some changes introduced in 4.24.0 and 4.24.1 causing regressions.

As we've become aware, some of the changes we've done in an attempt to correct the issue `KAA-2599` have caused some regressions. We've attempted to correct those issues with 4.24.1 but there are still issues being discovered. In this release we are reverting to the behavior before this change was introduced.

### Technical background on the issue

In some configurations of Kandy, the SDK doesn't receive any SSRC attributes in SDP payloads. This causes a change in behavior in the Chrome browser where `MediaStreamTrack` and `MediaStream` ids take on a value that is no longer unique. This breaks a fundamental assumption that the SDK has about media tracks and streams. In 4.24.0 we attempted what seemed to be an innocuous workaround and our results were positive. However, shortly after we started receiving reports of issues in regular call scenarios (where SSRC is present). 4.24.1 was an attempt at fixing those issues, but after it's release we started noticing new cases that were not accounted for.

Because of the core nature of the assumption of id uniqueness in the SDK we've decided to revert all the changes related to trying to cover for this case and will be addressing this more thoroughly in a future release.

### Changed

- Reverted all changes done for `KAA-2599` and `KAA-2605`.

## 4.24.1 - 2021-02-10 [YANKED]

⚠️ **Post-release note**: This version of the SDK continues to cause regressions with call audio after hold/un-hold call operations and has been yanked.

### Fixed

- Fixed a Call issue where there was no audio after an un-hold operation. `KAA-2605`

## 4.24.0 - 2021-01-29 [YANKED]

⚠️ **Post-release note**: This version of the SDK revealed a major regression issue with call audio after hold/un-hold call operations and has been yanked.

### Added

- Added explicit warning around the connectivity plugin when using `server` for the `responsibleParty` and a `pingInterval`. `KJS-58`
  - `pingInterval` is ignored when the server is responsible for pings. This has been made more explicit now.

### Changed

- Updated Logging tutorial to download logs in NDJSON format. `KJS-25`
- Updated error messages when an action is performed on an invalid call state.

### Fixed

- Fixed issue where Kandy.js would ignore a new track if it had the same id as another track on another peer. `KAA-2599`

## 4.23.0 - 2020-12-21

### Added

- Added a request authorization event: `request:error` `KAA-1076`
  - This event is specific for authorization issues when communicating with the server and notifies an application that the user's credentials should be updated/fixed. This event is emitted _in addition_ to any regular error event for an operation that may be emitted.

### Fixed

- Fixed a Call issue where a crash would occur when a remote SDP offer does not have a media-level direction attribute. `KAA-2585`
- Fixed an issue where log handlers set in the config were not being applied to WebRTC related logs.`KAA-2528`

## 4.22.0 - 2020-11-27

### Added

- Added SDK metadata to `call:statsReceived` event's payload. `KAA-2557`
- Added a new Call Statistics tutorial. `KAA-2559`
  - Explains how to retrieve statistics for calls and what the statistics can be used for.

### Fixed

- Fixed issue where call is not successfully put on hold if only one side is sharing video. `KAA-2555`
- Minor documentation fixes.
- Update the Call `MediaConstraint` format description to include the "direct value" approach. `KAA-2565`
- Fixed an issue where if an error occurred during the user connect before the call, further call attempts would not work. `KAA-2529`
- Fixed an issue where failed anonymous calls didn't delete the subscription when denied media access. `KAA-2530`
- Fixed issue where the user subscription was being removed if internet connectivity was lost for too long. `KAA-2538`

### Changed

- Changed `call.getStats` Call API to return a Promise, so that caller can get the report of the call as part of invoking this API. `KAA-2558`

## 4.21.0 - 2020-10-30

### Fixed

- Fixed a Call 4.X/3.X interop issue where a remote hold operation would be misinterpreted in some scenarios. `KAA-2463`

### Changed

- Action logs are now disabled by default. The client can provide either a boolean or an object with action log configuration details. If `logActions` is set to `true`, the default settings for action logs will be used. See [Config documentation](https://kandy-io.github.io/kandy-callMe-js-sdk/docs/#config). `KAA-2504`

## 4.20.0 - 2020-10-02

### Added

- Added a new media API `media.initializeDevices`to get the list of available media devices with permission from the users-end device. `KAA-2445`
- Improved debugging logs for network operations. `KAA-2503`
  - Added new debug level logs for REST request and response information.
  - Added new debug level logs for messages sent and received on the websocket.
  - Added new section to the Logging tutorial to better describe the log levels.
- Added the ability to name the redux store instance for debugging with redux devtools extension.

### Fixed

- Fixed documentation for `renderTracks` function to correctly use `track.trackId` instead of the incorrect `track.id`. `KAA-2502`
- Fixed a Media issue for `Unified-Plan` calls where a remote track would incorrectly be marked as muted when created. `KAA-2519`

### Changed

- Updated tutorial codepens to be more robust around authentication and subscription operations. `KAA-2491`
- Removed `Creating LogManager` debug log since it was only in place to work around a bug in Chrome that has been fixed. `KAA-2494`

## 4.19.0 - 2020-08-28

### SDP Semantics Defaults

We've decided to wait to change the default SDP Semantics to `unified-plan`. We've identified some issues in some solutions that we would like to resolve before making the change. It's still a good idea to prepare and test your application with unified plan turned on in order to be ready when the change takes place.

### Added

- Added a new Logging tutorial. `KAA-2464`
  - Explains how the SDK's logging system works and how an application can customize its behaviour.

## 4.18.0 - 2020-07-31

### Important update

With this release we're announcing the deprecation of `plan-b` SDP semantics and the intent to change the default SDP semantics to the standard compliant `unified-plan` semantics in an upcoming release.

This change has been on the horizon since the WebRTC standard committee chose `unified-plan` as the way forward. Since then, Chrome has been on a path to make this change and eventually remove `plan-b`
as a supported option.
You can read about Chrome's transition plan here:
[https://webrtc.org/getting-started/unified-plan-transition-guide](https://webrtc.org/getting-started/unified-plan-transition-guide)

Browsers other than Chrome or Chrome-based browsers are unaffected by this change since they don't support `plan-b` and have supported `unified-plan` for a while.

#### What does this mean for developers

`unified-plan` support is available today and you can start testing your application today. In order to do so you need to change the sdpSemantics option in your configuration when creating the
SDK like so:

```javascript
import { create } from '@kandy-io/callme-sdk'
const client = create({
  call: {
    sdpSemantics: 'unified-plan'
    // ...
  }
})
```

The above configuration will become the default in an upcoming release.

Additionally, in order to have the same user experience when performing mid-call operations, your application will need to make sure to handle 2 events that you may not have needed previously:

- `media:sourceMuted` - Triggered when a track is muted at the source.
- `media:sourceUnmuted` - Triggered when a track is unmuted at the source.

These events will indicate when tracks (especially video tracks) should be displayed/rendered or not.

To learn in detail how to use these events, please visit our tutorials.
Choose the configuration that applies to you:

- [Kandy-US](https://kandy-io.github.io/kandy-link-js-sdk/tutorials/?config=us#/Configurations)
- [Kandy-EMEA](https://kandy-io.github.io/kandy-link-js-sdk/tutorials/?config=emea#/Configurations)
- [Kandy-UAE](https://kandy-io.github.io/kandy-link-js-sdk/tutorials/?config=uae#/Configurations)

> Note: The tutorials above are for the non-anonymous version of the SDK but the configuration still applies.

### Added

- Added bandwidth control parameter for anonymous calls. `KAA-2403`
- Added new Call API `call.setSdpHandlers` for setting SDP Handlers after the SDK has been initialized. `KAA-2322`
- Added new tutorials. `KAA-2432`

### Fixed

- Fixed an issue preventing the playing of video tracks during a call on iOS Safari. `KAA-2382`
- Fixed erroneous validation messages being thrown by valid call configurations.
- Fixed an issue preventing the proper termination of an audio+video outgoing call when camera was already in use. `KAA-2426`
- Fixed a Call issue where a failed anonymous call start would not be reported as an error. `KAA-2440`
- Fixed issue where uncaught errors in `setLocalDescription` were crashing the saga. These events are now being properly handled. `KAA-2460`
- Fixed `media:sourceMuted` and `media:sourceUnmuted` events by adding `trackId` data instead of passing it in a single element array. `KAA-2455`

### Changed

- Updated the `webrtc-adapter` package (6.4.4 -> 7.6.3). `KAA-2381`
- Added a small note to the documentation to inform that screensharing is not supported on iOS Safari. `KAA-2429`

## 4.17.0 - 2020-06-26

### Added

- Added new parameter validation to all configs used with the `create` function. Incorrect parameters will log a `VALIDATION` message. `KAA-2223`
- Added new session level bandwidth limit parameter to the call API. The parameter is `call` and should be passed in the same options object as `audio` and `video` bandwidth controls. `KAA-2108`
- Added documentation about `CodecSelectors` for `sdpHandlers.createCodecRemover`.
- Added Call functionality for the `makeAnonymous` API to start a call with screenshare. `KAA-2424`
  - See the `callOptions.screen` and `callOptions.screenOptions` parameters in the documentation.
- Added callId parameter passed to SDP pipeline handlers `call.SdpHandlerFunction`. `KAA-2242`

### Fixed

- Fixed a Call issue where the callee would not receive a `call:newTrack` event for the remote tracks when answering the call. `KAA-2380`
- Fixed a Call issue where SDP Handlers were not given the opportunity to act on a local SDP before it was sent to the remote endpoint. `KAA-2136`
- Fixed issue where `call.states` JS doc block was not included as part of public documentation for callMe SDK. `KAA-2366`
- Fixed the custom header (sent by any request to backend & used for analytics) so that its value reflects the actual platform (or service) used by SDK. `KAA-2395`
- Fixed an issue where replacing a track and then ending it wasn't emitting the proper `call:trackEnded` event. `KAA-2370` `KAA-2387`
- Normalized error data returned from all REST requests to internal components. Doesn't impact public API. `KAA-2348`
- Fixed an issue with `sdpHandlers.createCodecRemover` where it wasn't handling multiple codecs selectors with the same name. `KAA-2416`
- Fixed a Call issue the `makeAnonymous` API would not use the `audioOptions` and `videoOptions` options when starting a call. `KAA-2424`

### Changed

- Changed `call.getAvailableCodecs` Call API to return a Promise, so that caller can get the list of codecs as part of invoking this API, without the need to setup a separate event listener. This does not impact the existing use of API. `KAA-2423`

## 4.16.0 - 2020-05-29

### Added

- Added new call config option 'mediaBrokerOnly'. When set to true the SDK will not try to recreate a calls PeerConnection. This is intended for backends configured to disallow peer to peer connections. `KAA-2259`
- Added new Call API `call.getAvailableCodecs` which can be used to return a list of available codecs supported by the browser. `KAA-2275`
- Added a configuration parameter that allows the user to choose the authentication method for the WebSocket.`KAA-2279`
- Added new Call option for configuring DSCP markings on the media traffic. `KAA-2256`
- DSCP controls can be configured with the `call.make`, `call.answer`, `call.addMedia`, and `call.startVideo` Call APIs.
- Added `removeBundling` flag to the call config for users that want to turn it off. `KAA-2338`

### Fixed

- Removed the need for remote party properties (callNotificationParams) to be present in notifications. `KAA-2271`
- Fixed Firefox calling Chrome issue related to media bundling. `KAA-2282`
- Fixed the triggering of call:trackEnded event (on caller's side) when a media track is removed as well as duplication of such event (on callee's side) when plan-b is used. `KAA-2343`
- Fixed an issue with removing media for a 'Connected' Call (after an earlier attempt was made while the Call was 'On Hold') `KAA-2353`

### Changed

- Improved the `call.startVideo` API to allow for configuring additional options such as bandwidth.
- The default for `removeBundling` has been changed to be `false`, thereby enabling media bundling. `KAA-2338`

## 4.15.0 - 2020-04-30

### Added

- Added the handling of mute/unmute events which are being generated when a media source is muted/unmuted by triggers that are outside of SDK's control. `KAA-1641`

### Fixed

- Removed the need for remote party properties (callNotificationParams) to be present in a sessionProgress notification. `KAA-2271`

### Changed

- Improved logs for Calls. `KAA-2219`
- Improved behaviour when loading SDK into browser that doesn't support WebRTC. `KAA-2238` `KAA-2258`

## 4.14.0 - 2020-03-27

### Fixed

- Fixed an issue where an existing local video track could not be replaced by a screen sharing track. `KAA-2144`

### Added

- Add Call support for receiving early media. `KAA-2099`
  - When enabled via configuration (see `config.call.earlyMedia`), an outgoing Call may enter the "Early Media" state if the remote end responds with a provisional answer. This allows the Call to receive media before it has been answered.
- Added checking for media willSend and willReceive when a Hold operation is received in case the remote side answered an audio only call with audio and video. `KAA-2209`

## 4.13.0 - 2020-02-28

### Added

- Added a destroy function to allow users to wipe the SDK state and render the SDK unusable. `KAA-2181`
  - This is useful when a user is finished with the SDK and wants their data to not be available to the next SDK consumer. After destroy is called, the SDK must be recreated for an application to continue working.
- Added a new call configuration to trigger a resync of all active calls upon connecting to the websocket. `KAA-2154`
  - The new call configuration `resyncOnConnect` is disabled by default.
  - The resync feature requires Kandy Link 4.7.1+.

### Fixed

- Fixed a Call issue where a slow-start, remote hold operation, when entering a "dual hold" state, was not being processed correctly. `KAA-2183`
- Fixed problems with Firefox Hold/Unhold under `plan-b` sdpSemantics by making it impossible to start the SDK in `plan-b` under any browser that is not Chrome. `KAA-2174`

## 4.12.0 - 2020-01-31

### Added

- Added Call support for receiving custom parameters throughout a call. `KAA-2084`
  - A `call:customParameters` event is emitted which contains the custom parameters when they are received.
  - This feature requires Kandy Link 4.7+.
- Added SDP Handler functionality to allow modifying a local SDP after it has been set locally but before sending it to the remote endpoint. `KAA-2136`
  - A `step` property has been added to the `SdpHandlerInfo` parameter given to a `SdpHandlerFunction`. This indicates whether the next step is to `set` the SDP locally or `send` the SDP to the remote endpoint.

### Fixed

- Fixed an issue where PUSH notification channel was closed by default. `KAA-719`
- Fixed a Call issue where remote hold and unhold operations would not be handled properly if the remote application is using a v3.X Kandy SDK. `KAA-2105`
- Fixed a Call issue where Call configurations for the ICE collection process were not used for incoming calls. `KAA-2184`
  - See `KAA-1469` in v4.10.0 for affected configurations.
- Fixed an SDP Handler issue where `SdpHandlerInfo.type` was undefined the first time an SDP Handler is called on receiving a call.
- Fixed the issue where there was no refresh subscription and the Call will be torn down when the subscription expires. `KAA-2145`
- Fixed a midcall issue where removal of a remote media track did not trigger an event notification to application level (when using unified-plan). `KAA-2150`
- Fixed issue with anonymous calls where the SDK throws an error if you make an anonymous call with invalid credentials. Now a more correct error will be shown. `KAA-2180`

## 4.11.1 - 2020-01-02

### Fixed

- Fixed documentation issue, introduced in 4.11.0, where portions of the documentation were missing. `KAA-2151`

## 4.11.0 - 2019-12-20

### Added

- Added new Logger functionality to allow applications to customize the format of information that the SDK logs.
  - See `config.logs.handler`, `config.logs.logActions.handler`, `logger.LogHandler`, and `logger.LogEntry`.
  - An application can now provide a `LogHandler` function to the SDK via configuration. The SDK will use this function for logging information. By default, the SDK will continue to log information to the console.

### Fixed

- Fixed a Call issue where some slow-start midcall operations (eg. transfer, unhold) would fail. `KAA-2110`
  - This fix re-introduces a previous issue fixed in v4.9.0: `KAA-1890`.
- Fixed an issue where call was failing when the user(caller) has no user@domain format. `KAA-2131`
- Fixed an issue where the user is not unsubscribing when the call ends. `KAA-2113`
- Fixed an issue where callee(s) would not get notified when caller stops screen sharing through browser control. `KAA-2093`

## 4.10.0 - 2019-11-29

### Added

- Added Call support for setting and sending custom parameters. `KAA-2063`
- Added new Call configurations to provide flexibility for the ICE collection process. `KAA-1469`
  - See `config.call` for new configs: `iceCollectionDelay`, `maxIceTimeout`, and `iceCollectionCheck`.
  - These configs should only be needed when the ICE collection process does not complete normally. This should not happen in most scenarios, but can be determined if there is a delay (of 3 seconds or the value set for `maxIceTimeout`) during call establishment.
  - These configurations allow an application to customize the ICE collection process according to their network / scenario, in order to workaround issues.

### Fixed

- Fixed public documentation hyperlinks for custom type definitions. `KAA-2011`
- Fixed a Call configuration issue where midcall operations may be slow when no ICE server configurations were provided.

## 4.9.0 - 2019-11-01

### Added

- Added Call functionality where local media tracks are deleted if they are not being used for the call. `KAA-1890`
- Added a `call:operation` event which is fired by call operations to keep track of operation progress. `KAA-1949`
- Added call related API docs to help with migration from 3.x API. `KAA-2062`
- Added the emission of an event when call state changes from Initiating to Initiated. `KAA-2080`

### Changed

- Improved Call screenshare functionality. `KAA-2000`
  - Added explicit screenshare options for APIs, separate from video options. See the `call.make`, `call.answer`, and `call.addMedia` APIs.
  - A browser extension is no longer required for screensharing on Google Chrome.
  - A Call can now be started and/or answered with screenshare.

### Fixed

- Fixed an issue where the "to" information of the call wasn't being set to where the call was actually sent. `KAA-2014`
- Fixed the inconsistent order of media events for both incoming & outgoing calls. `KAA-1757`
- Fixed an issue where the SIP number normalization was unnecessarily removing an '@' symbol. `KAA-1793`
- Fixed the issue where an active call did not hang up when the call audit failed. `KAA-2003`
- Fixed documentation to reflect the correct default value for checkConnectivity parameter. `KAA-1876`
- Fixed public doc links for call and media.

## 4.8.0 - 2019-09-27

### Fixed

- Fixed the ordering and nesting of types & namespaces in public documentation. `KAA-1880`
- Fixed an issue where local call logs were reporting a duration of 0 for all incoming calls. `KAA-1794`

### Changed

- Changed the public API documentation groupings to namespaces. `KAA-1918`

### Added

- Added `displayName` option to `makeAnonymous` call api. `KAA-1909`

## 4.7.0 - 2019-08-30

### Fixed

- Fixed an issue causing some BasicError objects to have a misleading message rather than a message about the operation that failed. `KAA-1947`
- Fixed an issue where call audits weren't being sent.`KAA-1944`

## 4.6.0 - 2019-08-01

### Added

- Initial release of 4.x callMe SDK. It supports making anonymous calls using the new 4.x call stack.
