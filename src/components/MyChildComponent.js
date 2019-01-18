import React from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';

const MyChildComponent = ({ msg, open }) => {
  return (
    <Segment>
      <h3>{msg}</h3>
      {open && <h5>Widget Open</h5>}
    </Segment>
  );
};

MyChildComponent.propTypes = {
  msg: PropTypes.string,
  open: PropTypes.bool,
};

MyChildComponent.defaultProps = {
  msg: 'Hello World',
  open: true,
};

export default MyChildComponent;
