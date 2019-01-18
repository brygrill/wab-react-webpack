import React from 'react';
import 'react-testing-library/cleanup-after-each';
import { render, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';

import ErrorMessage from '../components/ErrorMessage';

afterEach(cleanup);

describe('<ErrorMessage />', () => {
  it('renders as expected', async () => {
    const { container } = render(<ErrorMessage />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
