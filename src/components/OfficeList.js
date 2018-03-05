import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Segment, List, Header } from 'semantic-ui-react';

class OfficeList extends Component {
  state = {
    active: null,
  };

  componentDidMount() {
    this.initOfficeLocationsListener();
  }

  initOfficesListener = () => {
    const { officesFeature } = this.props;
    officesFeature.on('click', evt => {
      const office = evt.graphic.attributes.office;
      this.setState({ active: office });
    });
  };

  render() {
    return (
      <Segment>
        <Header as="h3">EBA Offices</Header>
        <List divided animated selection>
          {this.props.offices.map(item => {
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

OfficeList.propTypes = {
  officesFeature: PropTypes.object.isRequired,
  offices: PropTypes.array,
};

OfficeList.defaultProps = {
  offices: [],
};

export default OfficeList;
