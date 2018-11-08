# WAB React + Webpack Template

A template for building Esri Web AppBuilder widgets with React and Webpack

## Concept

Develop your widget as a React app with ES6 modules:

```javascript
// App.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ErrorBoundary from './ErrorBoundary';
import MyComponent from './MyComponent';

import '../css/App.css';

const propTypes = {
  wab: PropTypes.object,
  esriJS: PropTypes.object,
};

const defaultProps = {
  wab: {},
  esriJS: {},
};

export default class App extends Component {
  render() {
    return (
      <div>
        <ErrorBoundary>
          <MyComponent
            title="WAB Widget"
            wab={this.props.wab}
            esriJS={this.props.esriJS}
          />
        </ErrorBoundary>
      </div>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;
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
  output: {
    library: 'MyReactWidget',
    libraryTarget: 'umd',
    filename: 'App.js',
    path: path.resolve(__dirname, 'app/widgets/MyReactWidget'),
  },
  // ...
  externals: [
    {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react',
      },
    },
    {
      'react-dom': {
        root: 'ReactDOM',
        commonjs2: 'react-dom',
        commonjs: 'react-dom',
        amd: 'react-dom',
      },
    },
  ],
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

## Usage

Fork or download this repo or download
[the latest release](https://github.com/brygrill/wab-react-webpack/releases).

### Install Node and Yarn

- [Node](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/lang/en/docs/install/)

### Install Dependencies

- `yarn`: install dependencies

### Commands

- `yarn rename`: rename the widget to the value set at `widgetName` in
  `package.json`. Only run once!
- `yarn start`: run webpack and gulp, start a dev server at
  https://localhost:3000/ with Browsersync, automatically reload on changes
- `yarn test`: run Jest
- `yarn test:watch`: run Just in watch mode
- `yarn format`: run prettier (prettier also run before each commit)
- `yarn deploy`: copy custom widget folders to `dist`, ready to be added to
  client apps.

## Env Setup

- `src`: React widget. Webpack watches JS files. Gulp watches everything else.
- `app`: Esri WAB application shell. Strictly for developing.
- `app/widgets/MyReactWidget`: Actual widget that can run in browser,
  output/destination from `src`.

## How it works

When you run `yarn start` webpack bundles all React code from `src/index.js` to
`app/widgets/MyReactWidget/App.js`. Webpack is configured to output a file that
can run within the AMD module system Esri uses. It does not bundle React or
React DOM (see [Dependencies](#dependencies) below).

Gulp runs `Widget.js` (the main entry point for the widget) through babel to
`app/widgets/MyReactWidget/Widget.js`. Gulp also runs a task to copy all other
necessary files (css, html, json, images). Gulp starts a local server with
browsersync at https://localhost:3000. It watches all files in `src` and will
run the necessary tasks on save.

Changing JS files that webpack is watching (ie imported to `App.js` or its
children) will trigger webpack to run. Changing `Widget.js` or any CSS/HTML/JSON
will trigger Gulp.

### Widget.js

`Widget.js` is the entry point for the widget. It uses the AMD module system
that all Esri applications use. It imports `./App.js` as a relative import. This
works because once the broswer starts they are already sitting next to each
other at `app/widgets/MyReactWidget/App.js` and
`app/widgets/MyReactWidget/Widget.js`.

### Dependencies

React and React DOM are not bundled with the widget. They are loaded via CDN in
`Widget.js`. This was done so that React DOM can load `App.js` to the DOM at
widget `startup()`. If React DOM is bundled with `App.js` it will fire before
the widget's DOM node is created, and will not be able to load.

Here is the top of Widget.js, where React and React DOM are loaded:

```javascript
require({
  paths: {
    react:
      'https://cdnjs.cloudflare.com/ajax/libs/react/16.0.0/umd/react.production.min',
    'react-dom':
      'https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.0.0/umd/react-dom.production.min',
  },
});

// Widget
define(
  [
    'dojo/_base/declare',
    'jimu/BaseWidget',
    'jimu/LayerInfos/LayerInfos',
    'esri/layers/FeatureLayer',
    'react',
    'react-dom',
    './App',
  ],
  (declare, BaseWidget, LayerInfos, FeatureLayer, React, ReactDOM, App) => {
```

Here is another way to load React and React DOM, via
[Esri docs](https://developers.arcgis.com/javascript/latest/sample-code/widgets-frameworks-react/index.html)

### Esri JS API & `this`

Trying to use the Esri JS API within webpack would be a challange. So `App.js`
(`components/App.js`) takes all the necessary API functionality as a prop. In
`Widget.js` import all the Esri JS API classes like normal, then create an
object and attach them as methods. Pass the object into the `esriJS` prop. The
same goes for accessing the widget's `this` (`this.map`, `this.config`, etc).
Pass them into the `wab` prop.

```javascript
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
```

In the app, set them as a function param:

```javascript
const createFL = (FeatureLayer, name, url, token) => {
  console.info('Adding feature to map: ', name);
  const featURL =
    process.env.NODE_ENV !== 'production' ? `${url}?token=${token}` : url;
  const featToAdd = new FeatureLayer(featURL, {
    mode: FeatureLayer.MODE_ONDEMAND,
    outFields: ['*'],
  });
  return featToAdd;
};
```

And call them within a component:

```jsx
componentDidMount() {
  // load layers
  this.loadSetLayers();
}

loadSetLayers = async () => {
  // Load Layers
  const { wab, esriJS } = this.props;
  try {
    const layers = await loadLayers(
      esriJS, // this is eventually passed into createFL as esriJS.FeatureLayer
      wab.map,
      wab.config.layerCollection,
    );
    this.setState({ layers });
  } catch (error) {
    this.setState({ error: true });
  }
}
```

## Loading Layers

There is a built in utility function the will load layers the widget needs on
the fly. Configure the URLs in `src/config.json`. If you are using protected
layers, add a token to your [environmental variables](#env-variables). This
helps to avoid being prompted for credentials every time the app reloads.

Layer Collection array should be structured like this:

```json
"layerCollection": [
  { "name": "", "url": "https://services.arcgis.com/1nZgnYZACdwzrFHH/arcgis/rest/services/geographIT_Offices/FeatureServer/0" }
]
```

## Env Variables

Webpack will set `NODE_ENV` to `development` during dev and `production` for a
production build. It will also load variables from an `.env` file.

Create file:

```shell
# this file is gitignored
# from root
touch .env
```

Add variables:

```shell
TOKEN=123456afssafas
API_KEY=asdfasdfasdfasdfasdf
```

Use:

```javascript
const token = process.env.TOKEN;
```

## Update Widget Name

Throughout the app, the widget is referred to as `MyReactWidget`. To change
this, update in the following files:

- `webpack.config.js`
- `webpack.prod.config.js`
- `gulpfile.js`
- `src/manifest.json`
- `src/config.json`
- `src/Widget.html`
- `src/Widget.js`

To rename the widget, set the `widgetName` value in `package.json` and run the
rename command:

```shell
$ yarn rename
```

This will update the widget name in the above files. This will only work the
first time, when renaming from `MyReactWidget`.

## Customize Basemap

The basemap and bounding box can be configured in this section of the web app'ss
config (`app/config.json`). Update the `portalUrl`, `itemId`, and `mapOptions`.

```json
"map": {
  "3D": false,
  "2D": true,
  "position": {
    "left": 0,
    "top": 0,
    "right": 0,
    "bottom": 0
  },
  "itemId": "45d9dea5f9ce4303ac4469fe82f82b0a",
  "mapOptions": {
    "extent": {
      "xmin": -8388019.249579016,
      "ymin": 4849162.172270128,
      "xmax": -8329927.1080823615,
      "ymax": 4883023.775800415,
      "spatialReference": {
        "wkid": 102100
      }
    }
  },
  "id": "map",
  "portalUrl": "http://geoit.maps.arcgis.com/"
},
```

## Testing

Jest is available for test. There are sample tests in `src/__tests__`. Run tests
with `yarn test`. Watch files and run tests on change with `yarn test:watch`.

See the [Jest docs](https://facebook.github.io/jest/) for more info.
