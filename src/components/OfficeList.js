import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Segment, List, Header } from 'semantic-ui-react';

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
      const office = evt.graphic.attributes.FID;
      this.setState({ active: office });
    });
  };

  handleListItemClick = fid => {
    console.log(fid);
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
                onClick={e => this.handleListItemClick(item.FID, e)}
                active={this.state.active === item.FID}
              >
                <List.Header>{item.Office_Name}</List.Header>
                {item.Address}
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
