import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';
import styled from 'styled-components';

import { WidgetContext } from './Context';
import MyChildComponent from './MyChildComponent';

import loadLayers from '../utils/loadLayers';

const AppStyle = styled.div`
  padding: 0.25rem;
`;

const MyComponent = ({ title }) => {
  // context will include wab and esriJS
  const context = useContext(WidgetContext);

  // set state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState('WAB');
  const [layers, setLayers] = useState(null);

  // load layers
  const loadMapLyrs = async () => {
    const { wab, esriJS } = context;
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
      setError(err);
    }
  };

  // set message
  // TODO: need to adjust, this only sees initial msg since there is no this.state.msg
  const updateMsg = () => {
    setInterval(() => {
      const newMsg = msg === 'HELLO' ? 'WAB' : 'HELLO';
      setMsg(newMsg);
    }, 3000);
  };

  // lifecycle
  useEffect(() => {
    loadMapLyrs();
    updateMsg();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
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
