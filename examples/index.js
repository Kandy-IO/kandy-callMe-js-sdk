// Import the libs we need
const express = require('express')
const crypto = require('crypto')
const https = require('https')
const fs = require('fs')
const cors = require('cors')

const app = express()
app.use(cors())
const port = process.env.PORT || 3000

// NOTE: Once you generated the key & cert files, you need to ensure
//       both of them are placed in current folder.
const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
}

// ////////////////////////////// IMPORTANT ///////////////////////////////
// The dummy values (provided below) for:
//   - key
//   - realm
//   - account
//   - callee
// need to be replaced by actual values you got from your administrator.
// NOTE: Caller & Callee are only needed when making an anonymous call in token based mode,
// since the generated token values are based on them.
// ////////////////////////////////////////////////////////////////////////

const key = 'YOUR KEY HERE' // See 'Generating Tokens' tutorial page for CallMe SDK on how to obtain this value
const realm = 'YOUR SCHEMA HERE' // See 'Generating Tokens' tutorial page for CallMe SDK on how to obtain this value

const account = 'YOUR CALLER@YOUR DOMAIN'
const caller = 'sip:' + account
const callee = 'sip:' + 'YOUR CALLEE@YOUR DOMAIN'

const ALGO_FOR_ECB_CIPHER = 'aes-128-ecb'
const ALGO_FOR_CBC_CIPHER = 'aes-256-cbc'

// Initialization vector's length
const IV_LENGTH = 16 // For AES keys, only

// For any incoming request, inspect it and if request is supported then
// process it & reply to it.

// Here request comes for getting the defaut tokens.
// (i.e. tokens that will be generated based on the hardcoded caller/callee values
// provided by this app)
app.get('/callparameters', (req, res) => {
  // Here, the req.route.path will end with: /callparameters
  console.log('Generating token values based on key, caller & callee hardcoded in this script...')
  generateParams(res, account, caller, callee)
})

app.get('/', (req, res) => {
  // If user tries to access server using root url, then ask user for more specific request.
  res.send(
    'Usage: To connect to this server and request tokens, realm & users, use URL: https://localhost:3000/callparameters'
  )
})

// Print this, as a info line , when this server starts...
https
  .createServer(options, app)
  .listen(port, () => console.log(`CallMe Token app is live at https://localhost:${port}`))

function generateParams (res, account, caller, callee) {
  // We'll generate a timestamp at this time
  // (i.e. when this server receives a request for tokens to be generated)
  // because tokens are only valid for a certain period of time and we
  // don't want the tokens to expire prematurelly.
  const timestamp = Date.now()

  if (key.length !== 16 && key.length !== 32) {
    console.error('Key value (for generating account/from/to tokens) must be 16 or 32 characters in length')
    return
  }

  // NOTE: If key length is 32 chars, then IV (Initialization Vector) cannot be empty,
  //       otherwise we get an error (based on validation used by createCipheriv).
  //       Generate a random value which will be reused by all three generated tokens.
  //       (For AES, the IV value must always have 16 chars, regardless if key value is 16 or 32 chars in length)
  const iv = key.length === 16 ? '' : generateRandomIv(IV_LENGTH)

  let accountToken
  let fromToken
  let toToken
  if (key.length === 16) {
    // for ECB algo, iv can be empty
    accountToken = createEcbToken(account, key, timestamp, iv)
    fromToken = createEcbToken(caller, key, timestamp, iv)
    toToken = createEcbToken(callee, key, timestamp, iv)
  } else {
    accountToken = createCbcToken(account, key, timestamp, iv)
    fromToken = createCbcToken(caller, key, timestamp, iv)
    toToken = createCbcToken(callee, key, timestamp, iv)
  }

  // Return a response in the form of a stringified JSON object.
  const generatedParams = { realm, accountToken, fromToken, toToken, caller, callee }
  res.json(generatedParams)
}

/**
 * Generates a random Initialization Vector.
 * @param length - The initialization vector's required length.
 */
function generateRandomIv (length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

/**
 * Creates an encrypted token based on four parameters:
 * @param user - The user specific information
 * @param key  - The secret key used for encrypting the user information
 *               that gets stored in token (it's also used for decrypting it on server side)
 * @param timestamp - The timestamp which marks the creation of this token, thus limiting its
 *                    use beyond a certain duration.
 * @param iv - The initialization vector used by the 'AES-128-ecb' algorithm.
 * @return A CMAC token encrypted based on 'AES-128-ecb' algorithm.
 *         CMAC (Cipher-based Message Authentication Code) is a block cipher-based message authentication code algorithm
 *         and for understanding the generic token type (that CMAC token represents), please refer here:
 *         https://en.wikipedia.org/wiki/One-key_MAC
 *         AES stands for 'Advanced Encryption Standard' specification.
 *         For more info on this specification, see https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 */
function createEcbToken (user, key, timestamp, iv) {
  const keyBuffer = Buffer.from(key)
  const textBuffer = Buffer.from(`${user};${timestamp}`)
  const ivBuffer = Buffer.from(iv)

  const crypter = crypto.createCipheriv(ALGO_FOR_ECB_CIPHER, keyBuffer, ivBuffer)
  const chunks = []
  chunks.push(crypter.update(textBuffer, 'buffer', 'hex'))
  // According to KL Spec, this call is equivalent to: HEX ( AES-128-ECB ( plaintext) )
  chunks.push(crypter.final('hex')) // final HEX function

  const encryptedBuffer = Buffer.from(chunks.join(''), 'hex')
  return encryptedBuffer.toString('hex')
}

// Creates an encrypted token based on four parameters:
// @param user - The user specific information
// @param key  - The secret key used for encrypting the user information
//              that gets stored in token (it's also used for decrypting it on server side)
// @param timestamp - The timestamp which marks the creation of this token, thus limiting its
//                    use beyond a certain duration.
// @param iv - The initialization vector used by the 'AES-256-cbc' algorithm.
// @return A CMAC token encrypted based on 'AES-256-cbc' algorithm.
function createCbcToken (user, key, timestamp, iv) {
  const keyBuffer = Buffer.from(key)

  // According to KL 4.8 Spec, if key is 32 chars, then an extra x-ts is inserted
  const textBuffer = Buffer.from(`${user};x-ts=${timestamp}`)
  const ivBuffer = Buffer.from(iv)

  const crypter = crypto.createCipheriv(ALGO_FOR_CBC_CIPHER, keyBuffer, ivBuffer)

  const chunks = []
  chunks.push(crypter.update(textBuffer, 'buffer', 'hex'))
  chunks.push(crypter.final('hex'))
  const encryptedBuffer = Buffer.from(chunks.join(''), 'hex')
  const ciphertext = encryptedBuffer.toString('hex')

  // Convert letters to upper case (as indicated in Spec),
  // as well as prepend the iv value
  const IVciphertext = `${iv}${ciphertext.toUpperCase()}`

  // According to KL 4.8 REST API spec (page 13) HMAC is generated by:
  // (IVCiphertext ) and the secret key, as input parameters.
  const hmac = crypto
    .createHmac('sha256', key)
    // updating data
    .update(IVciphertext)
    // Encoding to be used
    .digest('hex')

  // Convert letters to upper case, as indicated in Spec
  const HMAC = hmac.toUpperCase()
  const token = HMAC + IVciphertext
  return token
}
