import React from 'react';
import { render, wait, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { WidgetProvider } from '../components/Context';

import mock from './__mock__/propsMock';

afterEach(cleanup);

describe('<WidgetProvider />', () => {
  it('renders the widget', async () => {
    // render component
    const { container } = render(
      <WidgetProvider
        wab={mock.wab}
        esriJS={mock.esriJS}
        onOpen={jest.fn}
        onClose={jest.fn}
      >
        <div>children</div>
      </WidgetProvider>,
    );

    // wait for useEffect
    await wait(() => expect(container.firstChild).toMatchSnapshot());
  });
});
