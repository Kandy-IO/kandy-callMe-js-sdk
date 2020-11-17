# Change Log

Kandy.js change log.

- This project adheres to [Semantic Versioning](http://semver.org/).
- This change log follows [keepachangelog.com](http://keepachangelog.com/) recommendations.

## 4.22.0 - beta

### Fixed

- Fixed issue where call is not successfully put on hold if only one side is sharing video. `KAA-2555`
- Minor documentation fixes.
- Update the Call `MediaConstraint` format description to include the "direct value" approach. `KAA-2565`
- Fixed an issue where if an error occured during the user connect before the call, further call attempts would not work. `KAA-2529`

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
