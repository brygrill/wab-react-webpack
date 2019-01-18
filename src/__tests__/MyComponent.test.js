import React from 'react';
import 'react-testing-library/cleanup-after-each';
import { render, cleanup, wait } from 'react-testing-library';
import 'jest-dom/extend-expect';

import MyComponent from '../components/MyComponent';

afterEach(cleanup);

// https://testing-library.com/docs/example-react-context
describe('<MyComponent />', () => {
  it('renders main component without error', async () => {
    const { container, getByText } = render(<MyComponent />);
    expect(container.firstChild).toMatchSnapshot();
    expect(getByText('WAB')).toBeInTheDocument();

    // wait for useEffect
    await wait(() =>
      expect(getByText('WAB React Widget Template')).toBeInTheDocument(),
    );
  });
});
