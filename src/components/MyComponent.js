import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';
import styled from 'styled-components';

import { withWidgetContext } from './Context';
import MyChildComponent from './MyChildComponent';

import loadLayers from '../utils/loadLayers';

const Padding = styled.div`
  padding: 0.25rem;
`;

class MyComponent extends Component {
  state = {
    msg: 'WAB',
    layers: null,
    loading: true,
    error: false,
  };

  componentDidMount() {
    this.loadLayers();

    this.updateMsg();
  }

  updateMsg = () => {
    setInterval(() => {
      const { msg } = this.state;
      const newMsg = msg === 'HELLO' ? 'WAB' : 'HELLO';
      this.setState({ msg: newMsg });
    }, 3000);
  };

  loadLayers = async () => {
    // Load Layers
    const { wab, esriJS } = this.props;
    console.log(this.props);
    try {
      const layers = await loadLayers(
        esriJS,
        wab.map,
        wab.config.layerCollection,
      );
      this.setState({ layers, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  };

  render() {
    if (this.state.loading) {
      return <div>Loading...</div>;
    }
    return (
      <Padding>
        <Header>{this.props.title}</Header>
        <MyChildComponent msg={this.state.msg} />
      </Padding>
    );
  }
}

MyComponent.propTypes = {
  title: PropTypes.string,
  wab: PropTypes.object,
  esriJS: PropTypes.object,
};

MyComponent.defaultProps = {
  title: 'Hello',
  wab: {},
  esriJS: {},
};

export default withWidgetContext()(MyComponent);
