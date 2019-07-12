import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { StateMock } from '@react-mock/state';
import '@testing-library/jest-dom/extend-expect';

import ErrorBoundary from '../components/ErrorBoundary';

afterEach(cleanup);

// https://react-testing-examples.com/jest-rtl/local-state/
describe('<ErrorBoundary />', () => {
  it('renders the app without error', () => {
    const { container, getByText } = render(
      <StateMock state={{ error: false }}>
        <ErrorBoundary>
          <div>App</div>
        </ErrorBoundary>
      </StateMock>,
    );

    expect(getByText('App')).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders err message when there is error', () => {
    const { container, getByText } = render(
      <StateMock state={{ error: true }}>
        <ErrorBoundary>
          <div>App</div>
        </ErrorBoundary>
      </StateMock>,
    );

    expect(getByText('Sorry — something has gone wrong.')).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });
});
