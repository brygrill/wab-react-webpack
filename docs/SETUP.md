# SETUP

Develop your widget as a React app with ES6 modules:

```javascript
// App.js

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
```

Expose your widget as a React component:

```javascript
// index.js

import App from './components/App';

module.exports = App;
```

Configure webpack to expose component to
[all module definitions](https://webpack.js.org/configuration/output/#module-definition-systems)
and set React as an
[external dependancy](https://webpack.js.org/configuration/externals/):

```javascript
// webpack.config.js

module.exports = {
  entry: ['babel-polyfill', './src/index.js'],
  devtool: 'eval-source-map',
  mode: 'development',
  output: {
    library: 'EBAWidget',
    libraryTarget: 'umd',
    filename: 'App.js',
    path: path.resolve(__dirname, 'app/widgets/MyReactWidget'),
  },
  // ...
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    },
    reactDOM: {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom',
    },
  },
};
```

Load React and render your component in `Widget.js` using AMD:

```javascript
// Widget.js

require({
  paths: {
    react:
      'https://cdnjs.cloudflare.com/ajax/libs/react/16.2.0/umd/react.production.min',
    'react-dom':
      'https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.2.0/umd/react-dom.production.min',
  },
});

// Widget
define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  'jimu/LayerInfos/LayerInfos',
  'esri/layers/FeatureLayer',
  'react',
  'react-dom',
  './App',
], (declare, BaseWidget, LayerInfos, FeatureLayer, React, ReactDOM, App) => {
  return declare([BaseWidget], {
    baseClass: 'my-react-widget',
    // ------------------------ //
    //          REACT
    // ------------------------ //
    renderWidget() {
      const wab = {
        map: this.map,
        config: this.config,
        id: this.id,
      };
      const esriJS = {
        LayerInfos,
        FeatureLayer,
      };
      const root = document.getElementById('my-react-widget-root');
      ReactDOM.render(<App wab={wab} esriJS={esriJS} />, root);
    },
    // ------------------------ //
    //      WIDGET LIFECYCLE
    // ------------------------ //
    startup() {
      this.renderWidget();
    },
  });
});
```
