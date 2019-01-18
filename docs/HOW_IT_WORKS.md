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
