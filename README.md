# Rioct

Rioct is a HTML templating language for [React](https://facebook.github.io/react/),
built on top of [react-templates](https://github.com/wix/react-templates), of which it
extends the syntax and adds new features.

# List of packages

- `rioct-cli` is the command line compiler tool that turns `.html` templates into actual React JavaScript code.
- `rioct` is a TypeScript-friendly library to help consume compiled templates. The package is optional
and it's needed only for some advanced features. To use this package, TypeScript is not required (but recommended).
- `rioct-loader` is a webpack loader for Rioct templates, so that you can `require()` directly
template files from JavaScript.

# Topics

- [rioct-cli](RIOCT-CLI.md)
- rioct
- templating language reference

