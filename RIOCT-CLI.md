# rioct-cli

Rioct-cli is the command line compiler tool that turns `.html` templates into actual React JavaScript code.

## Install

Install from `npm` with:

```
npm install -g rioct-cli
```

## Usage

```
rioct-cli filename.html [options]
```

if compiled successfully, it will produce the following files:

- `filename.rt` intermediate file (for debugging purposes)
- `filename.tag.js` the compiled javascript template


## Options

- `--trace` catches all runtime errors and dumps them to the console. This option wraps template
expression and all possible faulty code around a `try`/`catch` block, allowing to intercept
exceptions and reporting them to console (normal behaviour is that runtime errors get "swallowed"
by `react`).

- `--use-rioct-rutime` adds the dependency `rioct` for managing extra features like:
   - `<style>` extraction and injection into DOM,
   - component registration via `@Rioct.template()` decorator
   - automatic component mounting with `Rioct.mount()`
   - dynamic styles with `Rioct.updateStyles()`

- `--brackets` characters used as expression delimiters. Separate open and close delimiters by a space
character. Default is `{ }`. When launching from prompt, you might need to enclose delimiters in quotes,
e.g. `rioct --brackets "{{ }}"`.

- `--normalize-html-whitespace` removes repeating whitespace from HTML text (enabled on by default).

- `--check-undefined` reports an error if an expression is `undefined`.

## Using the compiled template

Compiled files contains a `function()` that is called by `react` to render the component.

Some use cases:

### ES6

```js
import * as fn from 'filename.tag';
// alternatively
const fn = require('filename.tag');

class MyComponent extends React.Component {
   // component logic here
}

MyComponent.prototype.render = fn;
```

### TypeScript

```
import fn = require('filename.tag');

class MyComponent extends React.Component {
   render = fn;
}
```

### TypeScript + Webpack loader


