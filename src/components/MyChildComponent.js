import React from 'react';
import PropTypes from 'prop-types';

const MyChildComponent = props => {
  return (
    <div>
      <h3>{props.msg}</h3>
    </div>
  );
};

MyChildComponent.propTypes = {
  msg: PropTypes.string,
};

MyChildComponent.defaultProps = {
  msg: 'Hello World',
};

export default MyChildComponent;
