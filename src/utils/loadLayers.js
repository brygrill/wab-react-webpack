/* eslint-disable no-console */

import _ from 'lodash';

// Empty object that will house Feature layer objects
// this is returned in promise
const collection = {};

// Get layers from the Map
const getLayerInfo = (LayerInfos, map) => {
  // Get all the layers in the map
  return LayerInfos.getInstance(map, map.itemInfo).then(layerInfosObject => {
    return layerInfosObject.getLayerInfoArray();
  });
};

// Add Feature layer object to collection
const updateCollection = (name, feature, added) => {
  collection[name] = {
    feature,
    added,
  };
};

// Create feature Layer

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

// Add feature layer to map and collection
const addFeatureToMap = async (FeatureLayer, map, name, url, token) => {
  try {
    const featToAdd = createFL(FeatureLayer, name, url, token);

    // Add to map
    map.addLayer(featToAdd);

    // Add to collection
    return updateCollection(name, featToAdd, true);
  } catch (error) {
    return error;
  }
};

// Load layers and add to collection
// this is function that is exposed
const loadLayers = (esriJS, map, layerCollection) => {
  return new Promise((resolve, reject) => {
    try {
      getLayerInfo(esriJS.LayerInfos, map)
        .then(mapLayers => {
          // Map over Layer Collection
          layerCollection.map(item => {
            // Return feature layer obj if feature url from config
            // is found in map layers object
            const foundFeature = _.find(mapLayers, layer => {
              return item.url === layer.layerObject.url;
            });
            // Add to map if not found
            if (!foundFeature) {
              return addFeatureToMap(
                esriJS.FeatureLayer,
                map,
                item.name,
                item.url,
                process.env.TOKEN,
              );
            }
            // Otherwise add feature layer obj to collection
            return updateCollection(item.name, foundFeature.layerObject, false);
          });
        })
        .then(() => {
          // Return collection
          resolve(collection);
        });
    } catch (e) {
      reject(e);
    }
  });
};

export default loadLayers;
