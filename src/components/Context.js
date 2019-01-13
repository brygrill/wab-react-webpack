import React from 'react';
import PropTypes from 'prop-types';

export const WidgetContext = React.createContext();

export const WidgetProvider = ({ wab, esriJS, children }) => {
  return (
    <WidgetContext.Provider value={{ wab, esriJS }}>
      {children}
    </WidgetContext.Provider>
  );
};

WidgetProvider.propTypes = {
  wab: PropTypes.object,
  esriJS: PropTypes.object,
  children: PropTypes.node,
};

WidgetProvider.defaultProps = {
  wab: {},
  esriJS: {},
  children: null,
};
