import React from 'react';
import ReactDOM from 'react-dom';
import toJson from 'enzyme-to-json';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import MyComponent from '../components/MyComponent';

configure({ adapter: new Adapter() });

const mockObj = {};

describe('<MyComponent />', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<MyComponent wab={mockObj} esriJS={mockObj} />, div);
  });

  it('initially shows loader', () => {
    const component = shallow(<MyComponent wab={mockObj} esriJS={mockObj} />);

    component.setState({
      loading: true,
    });

    expect(toJson(component)).toMatchSnapshot();
  });

  it('shows children after load', () => {
    const component = shallow(<MyComponent wab={mockObj} esriJS={mockObj} />);

    component.setState({
      loading: false,
    });

    expect(toJson(component)).toMatchSnapshot();
  });
});
