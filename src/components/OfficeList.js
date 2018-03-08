import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Segment, List, Header } from 'semantic-ui-react';
import getOfficeExtent from '../utils/getOfficeExtent';

class OfficeList extends Component {
  state = {
    active: null,
  };

  componentDidMount() {
    this.initOfficesListener();
  }

  initOfficesListener = () => {
    const { officesFeature } = this.props;
    officesFeature.on('click', evt => {
      console.log(evt);
      const office = evt.graphic.attributes.FID;
      this.setState({ active: office });
    });
  };

  handleListItemClick = fid => {
    const { wab, offices } = this.props;
    const extent = getOfficeExtent(offices, fid);
    wab.map.centerAndZoom(extent, 10);
    this.setState({ active: fid });
  };

  render() {
    return (
      <Segment>
        <Header as="h3">EBA Offices</Header>
        <List divided animated selection>
          {this.props.offices.map(item => {
            return (
              <List.Item
                key={item.FID}
                onClick={e => this.handleListItemClick(item.attributes.FID, e)}
                active={this.state.active === item.attributes.FID}
              >
                <List.Header>{item.attributes.Office_Name}</List.Header>
                {item.attributes.Address}
              </List.Item>
            );
          })}
        </List>
      </Segment>
    );
  }
}

OfficeList.propTypes = {
  wab: PropTypes.object,
  officesFeature: PropTypes.object.isRequired,
  offices: PropTypes.array,
};

OfficeList.defaultProps = {
  wab: {},
  offices: [],
};

export default OfficeList;
