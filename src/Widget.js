/* eslint-disable no-console */
/* eslint-disable arrow-body-style */

// Load Extrenal Libs
require({
  paths: {
    react:
      'https://cdnjs.cloudflare.com/ajax/libs/react/16.2.0/umd/react.production.min',
    'react-dom':
      'https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.2.0/umd/react-dom.production.min',
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
        // test precommit
        console.clear();
        console.log('Start My React Widget');
        this.renderWidget();
      },

      onOpen() {
        console.log('Open My React Widget');
      },

      onClose() {
        console.log('Close My React Widget');
      },
    });
  },
);
