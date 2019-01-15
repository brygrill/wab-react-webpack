/* eslint-disable no-console */
import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';
import styled from 'styled-components';

import { WidgetContext } from './Context';
import MyChildComponent from './MyChildComponent';

const AppStyle = styled.div`
  padding: 0.25rem;
`;

const MyComponent = ({ title }) => {
  const context = useContext(WidgetContext);
  console.log('Widget Context:', context);

  // set state
  const [msg, setMsg] = useState('WAB');

  // set message
  const updateMsg = () => {
    setTimeout(() => {
      setMsg('HELLO');
    }, 5000);
  };

  // lifecycle
  useEffect(() => {
    updateMsg();
  }, []);

  if (context.loading) {
    return <div>Loading...</div>;
  }

  if (context.error) {
    return <div>Error...</div>;
  }

  return (
    <AppStyle>
      <Header>{title}</Header>
      <MyChildComponent msg={msg} />
    </AppStyle>
  );
};

MyComponent.propTypes = {
  title: PropTypes.string,
};

MyComponent.defaultProps = {
  title: 'Hello',
};

export default MyComponent;
