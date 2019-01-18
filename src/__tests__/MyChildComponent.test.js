import React from 'react';
import 'react-testing-library/cleanup-after-each';
import { render, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';

import MyChildComponent from '../components/MyChildComponent';

afterEach(cleanup);

describe('<MyChildComponent />', () => {
  it('renders as expected', async () => {
    const { container } = render(<MyChildComponent />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with props as expected', async () => {
    const { container } = render(<MyChildComponent msg="Test" open={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
