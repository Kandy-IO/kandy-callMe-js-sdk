# Change Log

Kandy.js change log.

- This project adheres to [Semantic Versioning](http://semver.org/).
- This change log follows [keepachangelog.com](http://keepachangelog.com/) recommendations.

## 4.9.0 - beta

### Added

- Added Call functionality where local media tracks are deleted if they are not being used for the call. `KAA-1890`
- Add Call support for receiving early media. `KAA-1975`
  - When enabled via configuration (see `config.call.earlyMedia`), an outgoing Call may enter the "Early Media" state if the remote end responds with a provisional answer. This allows the Call to receive media before it has been answered.
- Added a `call:operation` event which is fired by call operations to keep track of operation progress. `KAA-1949`

### Changed

- Improved Call screenshare functionality. `KAA-2000`
  - Added explicit screenshare options for APIs, separate from video options. See the `call.make`, `call.answer`, and `call.addMedia` APIs.
  - A browser extension is no longer required for screensharing on Google Chrome.
  - A Call can now be started and/or answered with screenshare.

### Fixed

- Fixed an issue where the "to" information of the call wasn't being set to where the call was actually sent. `KAA-2014`
- Fixed the inconsistent order of media events for both incoming & outgoing calls. `KAA-1757`

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
