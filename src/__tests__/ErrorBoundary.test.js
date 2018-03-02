import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import toJson from 'enzyme-to-json';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import ErrorBoundary from '../components/ErrorBoundary';

configure({ adapter: new Adapter() });

describe('<ErrorBoundary />', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <ErrorBoundary>
        <div>App</div>
      </ErrorBoundary>,
      div,
    );
  });

  it('should display children without error', () => {
    const tree = renderer
      .create(
        <ErrorBoundary>
          <div>App</div>
        </ErrorBoundary>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should display error message when there is error', () => {
    const component = shallow(
      <ErrorBoundary>
        <div>App</div>
      </ErrorBoundary>,
    );
    component.setState({
      error: true,
    });

    expect(toJson(component)).toMatchSnapshot();
  });
});
