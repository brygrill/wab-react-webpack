require('core-js/stable');
require('regenerator-runtime/runtime');

global.requestAnimationFrame = callback => {
  setTimeout(callback, 0);
};
