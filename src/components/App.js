import React from 'react';
import PropTypes from 'prop-types';

import ErrorBoundary from './ErrorBoundary';
import { WidgetProvider } from './Context';
import MyComponent from './MyComponent';

import 'semantic-ui-css/semantic.min.css';

const App = props => {
  return (
    <ErrorBoundary>
      <WidgetProvider wab={props.wab} esriJS={props.esriJS}>
        <MyComponent title="WAB Widget" />
      </WidgetProvider>
    </ErrorBoundary>
  );
};

App.propTypes = {
  wab: PropTypes.object,
  esriJS: PropTypes.object,
};

App.defaultProps = {
  wab: {},
  esriJS: {},
};

export default App;
