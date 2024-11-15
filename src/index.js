import axios from 'axios';

export default class SwiftSellClientAPI {
  constructor(config = {}) {
    // destructuring the config object
    const {
      apiKey,
      swiftSellOrigin,
      onPostMessageReceived = () => {},
    } = config;

    // Validate required config values
    if (!apiKey) {
      throw new Error('API key is required.');
    }
    if (!swiftSellOrigin) {
      throw new Error('SwiftSell domain is required.');
    }

    // get additional configuration values from query string
    const urlParams = new URLSearchParams(window.location.search);
    const additionalConfig = Array.from(urlParams.keys()).reduce(
      (acc, key) => ({
        ...acc,
        [key]: urlParams.get(key),
      }),
      {},
    );

    // Store our config vals
    this.config = {
      apiKey,
      swiftSellOrigin,
      onPostMessageReceived,
      ...additionalConfig,
    };

    this.xhr = axios.create({
      baseURL: `${this.config.swiftSellOrigin}/api/public/v1/`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    });

    // Bind postMessage event listener
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  /**
   * Send a message to the parent window
   * @param {Object} message The message to send
   * @param {string} message.action The action type of message
   * @param {Object} message.payload The payload data of message
   */
  postMessage(message) {
    if (window.parent) {
      const data = {
        target: 'SwiftSell',
        data: {
          ...message,
        },
      };
      window.parent.postMessage(data, this.config.swiftSellOrigin); // Replace '*' with a specific origin for security.
    } else {
      console.warn('No parent window found to send message.');
    }
  }

  /**
   * Handle messages from the parent window
   * @param {MessageEvent} event The message event
   */
  handleMessage(event) {
    // For security, validate event.origin
    if (
      event.origin !== this.config.swiftSellOrigin ||
      event?.data?.target !== 'SwiftSellClient'
    ) {
      return;
    }

    // Call the provided callback function
    this.config.onPostMessageReceived(event?.data?.data);
  }

  /**
   * Perform a GET request.
   * @param {string} url The URL to send the request to.
   * @param {Object} [options] The request options.
   * @returns {Promise<Object>} The response data.
   */
  async get(path, options = {}) {
    try {
      const response = await this.xhr.get(path, options);
      return response?.data;
    } catch (error) {
      console.error('GET request failed:', error);
    }
  }

  /**
   * Perform a POST request.
   * @param {string} url The URL to send the request to.
   * @param {Object} data The data to send in the request body.
   * @param {Object} [options] Additional request options.
   * @returns {Promise<Object>} The response data.
   */
  async post(url, data, options = {}) {
    try {
      const response = await this.xhr.post(url, data, options);
      if (response?.data) {
        this.postMessage({
          action: 'API_POST_SUCCESS',
          payload: {
            url,
            response: response?.data,
          },
        });
      }
      return response?.data;
    } catch (error) {
      console.error('POST request failed:', error);
    }
  }

  /**
   * Get a configuration value.
   * @param {string} key - The configuration key.
   * @returns {*} The configuration value.
   */
  getConfig(key) {
    return this.config[key];
  }
}
