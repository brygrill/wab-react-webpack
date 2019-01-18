import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import loadLayers from '../utils/loadLayers';

const defaultContext = {
  onOpen() {},
  onClose() {},
};

export const WidgetContext = React.createContext(defaultContext);

export const WidgetProvider = ({ wab, esriJS, onOpen, onClose, children }) => {
  // set state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [layers, setLayers] = useState(null);

  // load layers
  const loadMapLyrs = async () => {
    try {
      const lyrs = await loadLayers(
        esriJS,
        wab.map,
        wab.config.layerCollection,
      );
      setLayers(lyrs);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(true);
    }
  };

  useEffect(() => {
    loadMapLyrs();
  }, []);

  return (
    <WidgetContext.Provider
      value={{
        wab,
        esriJS,
        onOpen,
        onClose,
        loading,
        error,
        layers,
        version: process.env.VERSION || null,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
};

WidgetProvider.propTypes = {
  wab: PropTypes.object,
  esriJS: PropTypes.object,
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

WidgetProvider.defaultProps = {
  wab: {},
  esriJS: {},
  children: null,
};
