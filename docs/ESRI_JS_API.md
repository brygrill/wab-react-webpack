## Esri JS API & `this`

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
