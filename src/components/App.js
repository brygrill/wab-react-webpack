import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import PropTypes from 'prop-types';

import ErrorBoundary from './ErrorBoundary';
import { WidgetProvider } from './Context';
import MyComponent from './MyComponent';

const App = props => {
  return (
    <ErrorBoundary>
      <WidgetProvider
        wab={props.wab}
        esriJS={props.esriJS}
        onOpen={props.onOpen}
        onClose={props.onClose}
      >
        <MyComponent title="WAB Widget" />
      </WidgetProvider>
    </ErrorBoundary>
  );
};

App.propTypes = {
  wab: PropTypes.object,
  esriJS: PropTypes.object,
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

App.defaultProps = {
  wab: {},
  esriJS: {},
};

export default App;
