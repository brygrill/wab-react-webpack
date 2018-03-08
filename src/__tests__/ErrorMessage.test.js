import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import ErrorMessage from '../components/ErrorMessage';

describe('<ErrorMessage />', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<ErrorMessage />, div);
  });

  it('displays error message', () => {
    const tree = renderer.create(<ErrorMessage />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
