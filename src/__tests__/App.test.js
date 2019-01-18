import React from 'react';
import { render, wait, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';

import App from '../components/App';

const mock = {
  wab: {
    map: null,
    id: 0,
    config: {
      layerCollection: [],
    },
  },
  esriJS: {
    LayerInfos: jest.fn,
    FeatureLayer: jest.fn,
  },
};

afterEach(cleanup);

// https://testing-library.com/docs/react-testing-library/example-intro
describe('<App />', () => {
  it('renders the widget', async () => {
    // render component
    const { container, getByText, queryByText } = render(
      <App
        wab={mock.wab}
        esriJS={mock.esriJS}
        onOpen={jest.fn}
        onClose={jest.fn}
      />,
    );

    // test inital render
    expect(getByText('Loading...')).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();

    // wait for useEffect
    await wait(() =>
      expect(queryByText(/Loading\.\.\./i)).not.toBeInTheDocument(),
    );

    // this will be error bc we cant access the JS api from the test
    // but can test post useEffect
    expect(getByText('Error...')).toBeInTheDocument();
  });
});
