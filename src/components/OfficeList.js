import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Segment, List } from 'semantic-ui-react';

import Loading from './Loading';

class Officelist extends Component {
  state = {
    loading: true,
    active: null,
    offices: [],
  };

  componentDidMount() {
    this.initOfficeLocationsListener();
    // query office feature service
  }

  initOfficesListener = () => {
    const { officesFeature } = this.props;
    officesFeature.on('click', evt => {
      const office = evt.graphic.attributes.office;
      this.setState({ active: office });
    });
  };

  render() {
    if (this.state.loading) {
      return <Loading />;
    }

    return (
      <Segment>
        <List divided animated selection>
          {this.state.offices.map((item) => {
            return (
              <List.Item key={item.id}>
                <List.Header>{item.office}</List.Header>
                {item.location}
              </List.Item>
            );
          })}
        </List>
      </Segment>
    );
  }
}

Officelist.propTypes = {
  officesFeature: PropTypes.object.isRequired,
};

export default Officelist;
