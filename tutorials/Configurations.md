---
layout: page
categories: quickstarts-javascript
title: Configurations
permalink: /quickstarts/javascript/newCallMe/Configurations
position: 1
categories:
  - getting_started
---

# Configurations

The first step for any application is to initialize the SDK. When doing this, you can customize certain features by providing a configuration object. The configuration object is separated by feature and is provided to the SDK Factory as seen in the example below.

### Anonymous Call

The Anonymous Call configs are used to initialize call/network settings and they are no different from the regular Call settings. This can customize how the library interacts with the network or provide the library with resources for low-level network operations.

```javascript
call: {
  // Specify the TURN/STUN servers that should be used.
  iceServers: [
    { urls: '$KANDYTURN1$' },
    { urls: '$KANDYSTUN1$' },
    { urls: '$KANDYTURN2$' },
    { urls: '$KANDYSTUN2$' }
  ],
  // Other feature configs.
  ...
}
```

In most cases, the default values will suffice for an application, but specifying your own configurations allows you to customize certain behaviours.

This quickstart will showcase a few samples of why you may want to use certain configurations. For a full list of the possible configurations, see the Configuration Documentation.

## Example Configurations

### Authentication

The Authentication configs are used to specify the backend service that Kandy.js should connect to. The value(s) provided are the host for the Kandy Link server that the application is targeting.
Also if the Kandy Link is deployed on the premises, it will be up to the user to define the host.
Note: It is important to always include these configurations.

```javascript
authentication: {
    subscription: {
        server: '$SUBSCRIPTIONFQDN$'
    },
    websocket: {
        server: '$WEBSOCKETFQDN$'
    }
}
```

Examples of the Kandy Link Systems include:

NA:

- RESTURL: spidr-ucc.genband.com port 443
- WebSocketURL: spidr-ucc.genband.com port 443
- iceServers:
  - turn-ucc-1.genband.com port 3478 for STUN and 443 for TURNS
  - turn-ucc-2.genband.com port 3478 for STUN and 443 for TURNS

EMEA:

- RESTURL: spidr-em.genband.com port 443
- WebSocketURL: spidr-em.genband.com port 443
- iceServers:
  - turn-em-1.genband.com port 3478 for STUN and 443 for TURNS
  - turn-em-2.genband.com port 3478 for STUN and 443 for TURNS

APAC:

- RESTURL: spidr-ap.genband.com port 443
- WebSocketURL: spidr-ap.genband.com port 443
- iceServers:
  - turn-ap-1.genband.com port 3478 for STUN and 443 for TURNS
  - turn-ap-2.genband.com port 3478 for STUN and 443 for TURNS

### Logs

The Logs configs are used to change the severity of logging output from Kandy.js. This allows for more logged messages, such as debug information, warnings, and errors, which can help to explain what Kandy is doing.

```javascript
logs: {
  // Set the log level to 'debug' to output more detailed logs. Default is 'warn'.
  logLevel: 'debug'
}
```

### Connectivity

The Connectivity configs are used to customize the behaviour of the websocket and connectivity checks. These settings should only be needed if the default configs are not sufficient, and you want to tweak the behaviour for your application's scenario.

```javascript
connectivity: {
       // Specify that a keepAlive ping should be sent every 60 seconds,
    // and if unable to connect should try to reconnect 3 times before
    // throwing an error. Specify to wait 10 seconds before attempting
    // to connect, and double that time every connection attempt, while
    // keeping maximum wait time under 300 seconds.
    pingInterval: 60000, // milliseconds
    reconnectLimit: 3,
    reconnectDelay: 10000, // milliseconds
    reconnectTimeMultiplier: 2,
    reconnectTimeLimit: 300000, // milliseconds
    autoReconnect: true,
    maxMissedPings: 3,
    checkConnectivity: true
}
```

