import React from 'react';
import PropTypes from 'prop-types';

const Context = React.createContext();
export const WidgetContext = Context.Consumer;

export const WidgetProvider = props => {
  return (
    <Context.Provider value={{ wab: props.wab, esriJS: props.esriJS }}>
      {props.children}
    </Context.Provider>
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

export const withWidgetContext = () => ReactComp => {
  class WithContext extends React.Component {
    render() {
      return (
        <WidgetContext>
          {context => (
            <ReactComp {...context} {...this.props} {...this.state} />
          )}
        </WidgetContext>
      );
    }
  }
  return WithContext;
};
