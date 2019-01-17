import React from 'react';
import 'react-testing-library/cleanup-after-each';
import { render, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';

import MyComponent from '../components/MyComponent';

afterEach(cleanup);

describe('<MyComponent />', () => {
  it('renders without crashing', () => {
    const { container, getByText } = render(<MyComponent />);
    expect(container.firstChild).toMatchSnapshot();
    expect(getByText('WAB')).toBeInTheDocument();
  });
});
