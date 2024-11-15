# SwiftSellClientAPI

SwiftSellClientAPI is a browser JavaScript library that allows you to interact with SwiftSell from a child window or iframe. It provides methods for communicating with the parent window via the postMessage API, and to interact with a limited set of SwiftSell API endpoints directly.

## Prerequisites

You will need the following information before you can use the SwiftSellClientAPI:

- API Key provided by SwiftSell
- The domain of the SwiftSell installation

## Installation

There are two ways to install the SwiftSellClientAPI:

1. **Directly from CDN**:

   ```html
   <!-- specific version -->
   <script src="https://cdn.jsdelivr.net/npm/swiftsell-client-api@0.0.1/SwiftSellClientAPI.min.js"></script>

   <!-- latest version (omit the version in the URL) -->
   <script src="https://cdn.jsdelivr.net/npm/swiftsell-client-api/SwiftSellClientAPI.min.js"></script>
   ```

2. **Import as a module**:
   ```bash
   npm install swiftsell-client-api
   ```
   ```javascript
   import SwiftSellClientAPI from 'swiftsell-client-api';
   ```

## Usage

### Initialization

```javascript
const ssAPI = new SwiftSellClientAPI({
  apiKey: '', // API Key provided by SwiftSell (required)
  domain: '', // The domain of the SwiftSell installation (required)
  onPostMessageReceived: (data) => {
    // (optional)
    // Handle postMessage received from parent window
  },
});
```

Here is a sample of initialization and a sample of handling postMessage received from the parent window:

```javascript
const ssApi = new SwiftSellClientAPI({
  apiKey: '123456...',
  swiftSellOrigin: 'https://swiftsell.app',
  onPostMessageReceived: function (data) {
    // handle data received from the parent window, e.g. display it on the page
    // data will be an object with the action and payload properties
    switch (data.action) {
      case 'SOME_ACTION':
        // handle the action
        break;
      case 'DISPLAY_DATA':
        // example of an action... display the payload on the page
        document.getElementById('message-container').innerHTML = JSON.stringify(
          data.payload,
        );
        break;
      default:
      // handle other actions
    }
  },
});
```

### Configuration

Initialize the SwiftSellClientAPI with the following configuration options:

- `apiKey` **STRING**: API Key provided by SwiftSell (required)
- `domain` **STRING**: The domain of the SwiftSell installation (required)
- `onPostMessageReceived` **FUNC**: Callback function to handle postMessage received from the parent window (optional)

Additionally, the SwiftSellClientAPI will store any search parameters in the URL at the time of intialization in it's internal state. This is so the parent window can easily pass additional options to the SwiftSellClientAPI for use in the child window. Example:

```javascript
// URL: https://example.com?quoteId=12345
const ssApi = new SwiftSellClient({...});
const quoteId = ssApi.getConfig('quoteId'); // 12345
```

### Methods

**`getConfig(key: string): any`**

Get a configuration value by key. Always available keys are:

- apiKey
- swiftSellOrigin
- onPostMessageReceived

Any additional keys are those passed through as search parameters in the URL at the time of initialization. You should be expecting these based on prior planning with the SwiftSell team. For example, if you were creating an embedded configurator, you might expect a `quoteId` and possibly additional values to be passed through.
\
\
**`postMessage({ action: string, payload: any }): void`**

Send a message to the parent window. The message will be an object with an `action` and `payload` property. The `action` property is a string that the parent window can use to determine how to handle the message. The `payload` property is any data that you want to send to the parent window. Example:

```javascript
ssApi.postMessage({
  action: 'QUOTE_UPDATED',
  payload: {
    quoteId: '123456',
    total: 1000,
  },
});
```

\
\
**`get(path: string, options: axios config object): Promise<any>`**

Make a GET request to the SwiftSell API. The `path` parameter is the path to the API endpoint you want to call. The `options` parameter is an object that will be passed to the axios library. Example:

```javascript
ssApi.get('/quote/123456').then((response) => {
  console.log(response.data);
});
```

\
\
**`post(path: string, data: any, options: axios config object): Promise<any>`**

Make a POST request to the SwiftSell API. The `path` parameter is the path to the API endpoint you want to call. The `data` parameter is the data you want to send to the API. The `options` parameter is an object that will be passed to the axios library. Example:

```javascript
ssApi.post('/quote/123456', { total: 1000 }).then((response) => {
  console.log(response.data);
});
```

### Available API Endpoints

Currently, the API endpoints available for use with this library are private. Please contact the SwiftSell team for more information.

## Common Use Case

Putting it all together, here's an example scenario of where and how you might utilize the SwiftSellClientAPI:

You have a stand alone web application that allows users to configure products via a CPQ (Configure, Price, Quote) tool. Your main site handling orders and payments is running SwiftSell. You want to embed the CPQ tool in your SwiftSell site so that users can configure products and add them to their cart without leaving the site (and without using the SwiftSell configurator). The product configuration should be seamless with the rest of the SwiftSell site.

The flow of data should look something like this:

- SwiftSell (parent) embeds the CPQ tool (child) in an iframe, passing the quoteId of the current quote to the child via search params in the URL.

```html
<iframe
  src="https://your-awesome-configurator.com?quoteId=12345"
  ...etc
></iframe>
```

- The child initializes the SwiftSellClientAPI with the quoteId and apiKey passed in the URL.

```javascript
const ssApi = new SwiftSellClientAPI({
  apiKey: '1234567980...',
  swiftSellOrigin: 'https://my-awesome-swiftsell-site.com',
  onPostMessageReceived: function (data) {
    // handle data received from the parent window (probably don't need this for this example)
  },
});
```

- The child makes a GET request to the SwiftSell API to get some data from the quote.

```javascript
const quoteId = ssApi.getConfig('quoteId');
const quote = await ssApi.get(`/quote/${quoteId}`);
```

- User configures the product in the child.
- User clicks a button to add the product to their cart.
- The child makes a POST request to the SwiftSell API to update the quote with the new product.

```javascript
const quoteId = ssApi.getConfig('quoteId');
const product = { ... };
const updatedQuote = await ssApi.post(`/quote/${quoteId}/addProduct`, product);
```

- The child sends a message to the parent to let it know that the configuration is complete

```javascript
ssApi.postMessage({
  action: 'CONFIGURATION_COMPLETE',
  payload: null,
});
```

- The parent window receives the message and updates the UI to reflect the new product in the cart.
- Everyone rejoices in the seamless user experience! 🎉
