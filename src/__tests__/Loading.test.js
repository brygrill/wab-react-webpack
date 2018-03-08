import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Loading from '../components/Loading';

describe('<Loading />', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Loading />, div);
  });

  it('shows spinning loader', () => {
    const tree = renderer.create(<Loading />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
