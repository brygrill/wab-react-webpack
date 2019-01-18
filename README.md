# WAB React + Webpack Template

A template for building Esri Web AppBuilder widgets with React and ES6.

## Usage

Fork this repo or download
[the latest release](https://github.com/brygrill/wab-react-webpack/releases).

### Install Node and Yarn

- [Node v8.12.0](https://nodejs.org/en/)
- [Yarn v1.13.0](https://yarnpkg.com/lang/en/docs/install/)

### Install Dependencies

- `yarn`: install dependencies

### Commands

- `yarn rename`: rename the widget to the value set at `widgetName` in
  `package.json`. Only run once!
- `yarn start`: run webpack and gulp, start a dev server at
  https://localhost:3000/ with Browsersync, automatically reload on changes
- `yarn test`: run Jest
- `yarn test:watch`: run Just in watch mode
- `yarn format`: run prettier (prettier also run before each commit)
- `yarn deploy`: copy custom widget folders to `dist`, ready to be added to
  client apps.

## Setup

- `src`: React widget. Webpack watches JS files. Gulp watches everything else.
- `app`: Esri WAB application shell. Strictly for developing.
- `app/widgets/MyReactWidget`: Actual widget that can run in browser,
  output/destination from `src`.

## NPM

Any package can be installed from NPM:  
`yarn install moment`  
This package will be bundled with webpack.

## JS API

## Styles

## Env Variables

Webpack will set `NODE_ENV` to `development` during dev and `production` for a
production build. It will also load variables from an `.env` file.

Create file:

```shell
# this file is gitignored
# from root
touch .env
```

Add variables:

```shell
TOKEN=123456afssafas
API_KEY=asdfasdfasdfasdfasdf
```

Use:

```javascript
const token = process.env.TOKEN;
```

## Update Widget Name

Throughout the app, the widget is referred to as `MyReactWidget`. To change
this, update in the following files:

- `webpack.config.js`
- `webpack.prod.config.js`
- `gulpfile.js`
- `src/manifest.json`
- `src/config.json`
- `src/Widget.html`
- `src/Widget.js`

To rename the widget, set the `widgetName` value in `package.json` and run the
rename command:

```shell
$ yarn rename
```

This will update the widget name in the above files. This will only work the
first time, when renaming from `MyReactWidget`.

## Customize Basemap

The basemap and bounding box can be configured in this section of the web app'ss
config (`app/config.json`). Update the `portalUrl`, `itemId`, and `mapOptions`.

```json
"map": {
  "3D": false,
  "2D": true,
  "position": {
    "left": 0,
    "top": 0,
    "right": 0,
    "bottom": 0
  },
  "itemId": "45d9dea5f9ce4303ac4469fe82f82b0a",
  "mapOptions": {
    "extent": {
      "xmin": -8388019.249579016,
      "ymin": 4849162.172270128,
      "xmax": -8329927.1080823615,
      "ymax": 4883023.775800415,
      "spatialReference": {
        "wkid": 102100
      }
    }
  },
  "id": "map",
  "portalUrl": "http://geoit.maps.arcgis.com/"
},
```

## Testing

Jest is available for test. There are sample tests in `src/__tests__`. Run tests
with `yarn test`. Watch files and run tests on change with `yarn test:watch`.

See the [Jest docs](https://facebook.github.io/jest/) for more info.

## Docs
