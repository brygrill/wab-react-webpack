import React from 'react';
import '@testing-library/react/cleanup-after-each';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ErrorMessage from '../components/ErrorMessage';

afterEach(cleanup);

describe('<ErrorMessage />', () => {
  it('renders as expected', async () => {
    const { container } = render(<ErrorMessage />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
