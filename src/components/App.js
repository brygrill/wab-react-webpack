import React from 'react';
import PropTypes from 'prop-types';

import ErrorBoundary from './ErrorBoundary';
import Entry from './Entry';

import '../css/App.css';

const App = props => {
  return (
    <ErrorBoundary>
      <Entry
        title="WAB Widget"
        wab={props.wab}
        esriJS={props.esriJS}
      />
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
