import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import OfficeList from './OfficeList';

import loadLayers from '../utils/loadLayers';
import queryOffices from '../utils/queryOffices';

class Entry extends Component {
  state = {
    loading: true,
    error: false,
    layers: null,
    offices: [],
  };

  componentDidMount() {
    this.loadLayers();
    this.props.wab.map.setLevel(8);
  }

  loadLayers = async () => {
    // Load Layers
    const { wab, esriJS } = this.props;
    try {
      const layers = await loadLayers(
        esriJS,
        wab.map,
        wab.config.layerCollection,
      );
      const offices = await queryOffices(esriJS, wab.config.layerCollection[0]);
      this.setState({ layers, offices, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  };

  render() {
    if (this.state.loading) {
      return <Loading />;
    }

    if (this.state.error) {
      return <ErrorMessage />;
    }

    return (
      <div className="my-react-widget-back">
        <OfficeList
          wab={this.props.wab}
          officesFeature={this.state.layers.offices.feature}
          offices={this.state.offices}
        />
      </div>
    );
  }
}

Entry.propTypes = {
  wab: PropTypes.object,
  esriJS: PropTypes.object,
};

Entry.defaultProps = {
  wab: {},
  esriJS: {},
};

export default Entry;
