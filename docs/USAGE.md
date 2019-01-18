## Usage

Start writing React components in `App.js`. Read on or check out the `docs`
folder for more details.

- `src`: React widget. Webpack watches JS files. Gulp watches everything else.
- `app`: Esri WAB application shell. Strictly for developing.
- `app/widgets/MyReactWidget`: Actual widget that can run in browser,
  output/destination from `src`.

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
