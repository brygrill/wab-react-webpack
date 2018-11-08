import React from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';

const MyChildComponent = props => {
  return (
    <Segment>
      <h3>{props.msg}</h3>
    </Segment>
  );
};

MyChildComponent.propTypes = {
  msg: PropTypes.string,
};

MyChildComponent.defaultProps = {
  msg: 'Hello World',
};

export default MyChildComponent;
