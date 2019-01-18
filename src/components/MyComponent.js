/* eslint-disable no-console */
import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';

import { WidgetContext } from './Context';
import MyChildComponent from './MyChildComponent';

const MyComponent = ({ title }) => {
  const context = useContext(WidgetContext);
  // context object will contain:
  /*
    {
      wab,
      esriJS,
      onOpen,
      onClose,
      loading,
      error,
      layers,
      version
    }
  */
  // console.log('Widget Context:', context);

  // set state
  const [msg, setMsg] = useState('WAB');
  const [open, setOpen] = useState(true);

  // set message
  const updateMsg = newMsg => {
    setTimeout(() => {
      setMsg(newMsg);
    }, 1000);
  };

  // handle widget open and close
  const handleOpen = () => {
    console.log('Open widget');
    setOpen(true);
  };

  const handleClose = () => {
    console.log('Close widget');
    setOpen(false);
  };

  // lifecycle
  useEffect(() => {
    // init open/close handlers
    context.onOpen(handleOpen);
    context.onClose(handleClose);
    // set msg
    updateMsg('WAB React Widget Template');
  }, []);

  if (context.loading) {
    return <div>Loading...</div>;
  }

  if (context.error) {
    return <div>Error...</div>;
  }

  return (
    <div css="padding: 0.25rem;">
      <Header>{title}</Header>
      <MyChildComponent msg={msg} open={open} />
      <div css="font-size: 0.7rem; color: #999999ab;">
        Version: {context.version}
      </div>
    </div>
  );
};

MyComponent.propTypes = {
  title: PropTypes.string,
};

MyComponent.defaultProps = {
  title: 'Hello',
};

export default MyComponent;
