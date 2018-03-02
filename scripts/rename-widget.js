const pjson = require('../package.json');
const replace = require('replace-in-file');

const options1 = {
  files: [
    'webpack.config.js',
    'webpack.prod.config.js',
    'gulpfile.js',
    'src/manifest.json',
    'src/config.json',
  ],
  from: /MyReactWidget/g,
  to: pjson.widgetName,
};

const options2 = {
  files: [
    'src/Widget.html',
    'src/Widget.js',
  ],
  from: /my-react-widget/g,
  to: pjson.widgetName.split(/(?=[A-Z])/).join('-').toLowerCase(),
};

// Replace MyReactWidget
replace(options1)
  .then(changes => {
    console.log('Modified files:', changes.join(', '));
  })
  .catch(error => {
    console.error('Error occurred:', error);
  });

// replace my-react-widget
replace(options2)
  .then(changes => {
    console.log('Modified files:', changes.join(', '));
  })
  .catch(error => {
    console.error('Error occurred:', error);
  });
