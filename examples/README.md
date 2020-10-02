# About

This is an example application server which generates the three encrypted tokens
used in token-based anonymous calling.

This type of anonymous calling is documented in the CallMe 4.x SDK, as part of its
associated Tutorial.

This example demonstrates an https server written using Express which provides an example REST API for fetching anonymous tokens that can be used to make calls.

# Use of certificates

In order to serve the `callme-token-server` example app to `localhost`, and then access it from our Tutorial's example code (running within external CodePen site), you will need to access a secure URL (i.e. Access this server using an https request). Accessing a secure URL requires the use of certificates.

Therefore, you can use a tool like [mkcert](https://github.com/FiloSottile/mkcert) to generate certificates and keys, as well as to install a local Certificate Authority (CA) in the system and browser trust stores. This tool can be used for development purposes only. Once generated, these certificates need to be placed where the expressjs server is currently looking for them, which is in examples/callme-token-server folder.

# Usage

## Running this example application server

To run this application server, run this command in a terminal:

```html
yarn start
```

## Connecting and requesting tokens from this application server

In a browser, access the following URL:

### To generate the tokens:

- http://localhost:3000/callparameters

The values (for both the generated tokens and realm) should be displayed in the browser page as a stringified JSON object.
