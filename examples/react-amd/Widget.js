/* eslint-disable no-console */
/* eslint-disable arrow-body-style */

// Load External Libs
require({
  paths: {
    react:
      'https://cdnjs.cloudflare.com/ajax/libs/react/16.0.0/umd/react.production.min',
    'react-dom':
      'https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.0.0/umd/react-dom.production.min',
  },
});

// Widget
define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  'jimu/PanelManager',
  'react',
  'react-dom',
  './Component',
], (declare, BaseWidget, PanelManager, React, ReactDOM, Component) => {
  return declare([BaseWidget], {
    baseClass: 'my-widget',

    // ------------------------ //
    //          REACT
    // ------------------------ //
    App() {
      const root = document.getElementById('my-widget-root');
      ReactDOM.render(<Component />, root);
    },
    // ------------------------ //
    //      WIDGET LIFECYCLE
    // ------------------------ //
    startup() {
      console.clear();
      console.info('Start Widget');
      this.App();
    },

    onOpen() {
      console.info('Open Widget');
    },

    onClose() {
      console.info('Close Widget');
    },
  });
});
