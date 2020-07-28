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

````javascript
let callee = 'user1@example.com';
let callOptions = { ... }
};
```

2. Build 'credentials' object, based on the three encrypted tokens and the token realm you got from your administrator in the previous tutorial page - see [Generating Tokens Quickstart](Generating%20Tokens). The caller address is encrypted in the `accountToken`.

```javascript
const credentials = {
  accountToken,
  fromToken,
  toToken
  realm
}
```

Note: The caller address is already encrypted in the `accountToken`

3. Make the call with the above information:
```javascript
let callId = client.call.makeAnonymous(callee, credentials, callOptions)
```

### Regular Anonymous Call

For this type of anonymous calls, the user needs to define only the callee, and then invoke the makeAnonymous Call API:

```javascript
let callee = 'user1@example.com'
let callOptions = { ... }

let callId = client.call.makeAnonymous(callee, {}, callOptions)
````

## User Interface

TBD

## Limitations on Anonymous Calls

Once the Anonymous Call SDK is initialized, it does not receive any incoming notifications such as the ones for an incoming call. Therefore, an anonymous user cannot receive calls.
Once an anonymous call is established, the call cannot be transferred in any way using the Anonymous Call SDK.

As an example, when an anonymous user calls support@company.com, the anonymous user cannot transfer that call. If needed, the agent should transfers the user to another agent.

To summarize, the following actions cannot be performed with the Anonymous Call SDK:

- Accept an incoming call
- Peform any type of call transfer
- Perform a "join" on two ongoing calls

## Live Demo

Do you want to try this example for yourself? Click the button below to get started.

### Instructions for Demo

TBD

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Anonymous Calls Demo\n */\n\nconst credentials = {\n  accountToken,\n  fromToken,\n  toToken\n  realm\n}\n\nlet callee = &apos;user1@example.com&apos;\nlet callOptions = { ... }\n\nlet callId = client.call.makeAnonymous(callee, {}, callOptions)\n\n&quot;,&quot;html&quot;:&quot;&quot;,&quot;css&quot;:&quot;video {\n  width: 50% !important;\n}\n\n&quot;,&quot;title&quot;:&quot;Javascript SDK Anonymous Calls Demo&quot;,&quot;editors&quot;:101,&quot;js_external&quot;:&quot;https://localhost:3000/kandy/kandy.newCallMe.js&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>

_Note: You’ll be sent to an external website._

