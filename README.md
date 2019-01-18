# WAB React + Webpack Template

A template for building Esri Web AppBuilder widgets with React and modern JS.

> ### Heads Up: as of v1.2, components have been migrated to [Hooks](https://reactjs.org/docs/hooks-intro.html).

## Getting Started

Fork this repo or download
[the latest release](https://github.com/brygrill/wab-react-webpack/releases).

### Install Node and Yarn

- [Node v8.12.0](https://nodejs.org/en/)
- [Yarn v1.13.0](https://yarnpkg.com/lang/en/docs/install/)

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
- `yarn lint`: lint files with ESLint
- `yarn deploy`: copy custom widget folders to `dist`, ready to be added to
  client apps.

## Usage

- `src`: React widget. Webpack watches JS files. Gulp watches everything else.
- `app`: Esri WAB application shell. Strictly for developing.
- `app/widgets/MyReactWidget`: Actual widget that can run in browser,
  output/destination from `src`.

### Hooks

All components besides `ErrorBoundary.js` have been migrated to
[Hooks](https://reactjs.org/docs/hooks-intro.html). Keep in mind that hooks are
not in the latest production version of React yet. Class components can still be
used and will work the same as they always have.

### Context

The props passed into `Widget.js` are made available to the rest of the app
through the [Context API](https://reactjs.org/docs/context.html). Access them
directly by importing `WidgetContext` and `useContext`:

```javascript
// see MyComponent.js for full example
import { WidgetContext } from './Context';

const MyComponent = () => {
  const context = useContext(WidgetContext);
  ...
}
```

### NPM

Any package can be installed from NPM:

```shell
# This package will be bundled with webpack
$ yarn install moment

# This package will be available in development
$ yarn install @babel/my-babel-plugin --dev
```

### JS API

Import Esri JS API classes into `Widget.js` via AMD:

```javascript
define([
  ...
  'jimu/LayerInfos/LayerInfos',
  'esri/layers/FeatureLayer',
  'esri/graphic'
  ...
], (
  ...
  LayerInfos,
  FeatureLayer,
  Graphic
  ...
)
```

Add them to the `esriJS` object:

```javascript
const esriJS = {
  LayerInfos,
  FeatureLayer,
  Graphic,
};
```

Access `Graphic` from the `esriJS` prop:

```javascript
const newGraphic = (attr, geom, symbol) => {
  const graphic = new props.esriJS.Graphic();
  graphic.setAttributes(attr);
  graphic.setGeometry(geom);
  graphic.setSymbol(symbol);
  return graphic;
};
```

### Styles

The widget is styled with [Semantic UI React](https://react.semantic-ui.com/).

Styles can be added using CSS-in-JS via
[styled-components](https://www.styled-components.com/):

```javascript
// css prop:
return (
  <div css="font-size: 0.7rem; color: #999999ab;">
    Version: {context.version}
  </div>
);

// or component:
import styled from 'styled-components';
const Version = styled.div`
  font-size: 0.7rem;
  color: #999999ab;
`;

return <Version>Version: {context.version}</Version>;
```

Traditional CSS can be added to `/css/style.css` which is loaded by WAB. Or CSS
can be imported into a component and processed by webpack:

```css
/* version.css */
widget-version {
  font-size: 0.7rem;
  color: #999999ab;
}
```

```javascript
// Version.js
import './version.css';

return <div className="widget-version">Version: {context.version}</div>;
```

### Testing

Jest and react-testing-library are available for running tests. There are sample
tests in `src/__tests__`. Run tests with `yarn test`. Watch files and run tests
on change with `yarn test:watch`.

See the [Jest docs](https://facebook.github.io/jest/) or
[react-testing-library docs](react-testing-library) for more info.

### Env Variables

Webpack will set `NODE_ENV` to `development` during dev and `production` for a
production build. It will also load variables from an `.env` file.

Create file:

```shell
# this file is gitignored
# from root
$ touch .env
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

### Update Widget Name

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

### Customize Basemap

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

### Docs

See the docs folder for implementation details:

- [Setup](docs/SETUP.md)
- [How it works](docs/HOW_IT_WORKS.md)
- [Esri JS API](docs/ESRI_JS_API.md)

### License

Licensed under the MIT License. See [License](LICENSE) for more info.
