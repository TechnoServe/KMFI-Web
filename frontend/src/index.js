/** **
 * Entry point for the React application.
 * Wraps the root component with Redux and Chakra UI providers.
 *
 * @module index
 */

import ReactDOM from 'react-dom';
import React from 'react';
import {Provider} from 'react-redux';
import {ChakraProvider} from '@chakra-ui/react';
import store from 'store';
import App from './app';

import 'styles/normalize.css';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';

import 'theme/style.css';

// Render the root component wrapped with Redux Provider and Chakra UI Theme Provider into the DOM
ReactDOM.render(
  // Redux Provider to make the Redux store available throughout the app
  <Provider store={store}>
    {/* // Chakra UI Provider to enable Chakra component styling */}
    <ChakraProvider>
      {/* // Main application component */}
      <App />
    </ChakraProvider>
  </Provider>,
  // Mount the application to the root DOM element
  document.getElementById('root')
);
