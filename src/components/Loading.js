import React from 'react';
import PropTypes from 'prop-types';
import { Dimmer, Loader } from 'semantic-ui-react';

const Loading = props => {
  return (
    <Dimmer active inverted>
      <Loader size="small">{props.content}</Loader>
    </Dimmer>
  );
};

Loading.propTypes = {
  content: PropTypes.string,
};

Loading.defaultProps = {
  content: 'Loading',
};

export default Loading;
