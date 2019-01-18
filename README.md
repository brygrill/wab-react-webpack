# :globe_with_meridians: Web AppBuilder + React Template

A template for building custom WAB widgets with React and modern JS.

> ### Heads Up! As of v1.2, components have been migrated to [Hooks](https://reactjs.org/docs/hooks-intro.html).

## How It Works

Webpack bundles all source code into a single React component. That component is
rendered in `Widget.js` with React DOM. See [the docs](docs/HOW_IT_WORKS.md) for
more details.

## Getting Started

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
- `yarn lint`: lint files with ESLint
- `yarn deploy`: copy custom widget folders to `dist`, ready to be added to
  client apps.

## Docs

- [Usage](docs/USAGE.md)
- [Setup](docs/SETUP.md)
- [How it works](docs/HOW_IT_WORKS.md)
- [Using the Esri JS API](docs/ESRI_JS_API.md)

## License

Licensed under the MIT License. See [License](LICENSE) for more info.
