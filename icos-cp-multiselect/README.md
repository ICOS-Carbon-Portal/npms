# ICOS Carbon Portal Multiselect widget

## Description
Searchable multi-select dropdown with tag input.

## Installation
`npm install @icos-cp/multiselect`

## Requirements
- **React** (peer dependency)
- **Bootstrap 5 CSS** is recommended due to use of `--bs-*` variables; has
  fallbacks in case Bootstrap is not present
- **Font Awesome** - two icons (`fa-caret-down` and `fa-times`) used, with
  no fallback

## Usage

See existing implementation in the 
[data repository](https://github.com/ICOS-Carbon-Portal/data/), within the
`portal` and `stats` apps.

## Credits
The design of this component was informed by
[react-widgets](https://github.com/jquense/react-widgets)' `Multiselect` (MIT
License, © 2014 Jason Quense), which it replaces as this project's multiselect
dropdown.
