import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import OfficeList from '../components/OfficeList';

const offices = [
  { FID: 1, Office_Name: 'One', Address: '123 Main St' },
  { FID: 2, Office_Name: 'Two', Address: '123 Broad St' },
];

// mocking onclick handler here...
const officesFeature = {
  on() {
    console.log('on');
  },
};

describe('<OfficeList />', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <OfficeList officesFeature={officesFeature} offices={offices} />,
      div,
    );
  });

  it('shows list of offices', () => {
    const tree = renderer
      .create(<OfficeList officesFeature={officesFeature} offices={offices} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
