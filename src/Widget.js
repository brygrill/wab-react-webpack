/* eslint-disable no-console */

// Load Extrenal Libs
require({
  paths: {
    react:
      'https://cdnjs.cloudflare.com/ajax/libs/react/16.8.6/umd/react.production.min',
    'react-dom':
      'https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.8.6/umd/react-dom.production.min',
  },
});

// Widget
define([
  'dojo/_base/declare',
  'dojo/aspect',
  'jimu/BaseWidget',
  'jimu/LayerInfos/LayerInfos',
  'esri/layers/FeatureLayer',
  'react',
  'react-dom',
  './App',
], (
  declare,
  aspect,
  BaseWidget,
  LayerInfos,
  FeatureLayer,
  React,
  ReactDOM,
  App,
) => {
  return declare([BaseWidget], {
    baseClass: 'my-react-widget',
    // ------------------------ //
    //          REACT
    // ------------------------ //
    renderWidget() {
      // props
      const wab = {
        map: this.map,
        config: this.config,
        id: this.id,
      };
      const esriJS = {
        LayerInfos,
        FeatureLayer,
      };
      // open/close handlers
      const onOpen = func => {
        aspect.after(this, 'onOpen', func, true);
      };
      const onClose = func => {
        aspect.after(this, 'onClose', func, true);
      };
      const root = document.getElementById('my-react-widget-root');
      ReactDOM.render(
        <App wab={wab} esriJS={esriJS} onOpen={onOpen} onClose={onClose} />,
        root,
      );
    },
    // ------------------------ //
    //      WIDGET LIFECYCLE
    // ------------------------ //
    startup() {
      console.clear();
      this.renderWidget();
    },
  });
});
