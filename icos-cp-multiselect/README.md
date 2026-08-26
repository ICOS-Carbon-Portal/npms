# ICOS Carbon Portal Multiselect widget

## Description
Searchable multi-select dropdown with tag input.

## Installation
`npm install icos-cp-multiselect`

## Requirements
- **React 18** (peer dependency).
- **Bootstrap 5 CSS** is optional but recommended. The widget styles itself
  from `--bs-*` custom variables with hardcoded fallbacks, so it looks correct
  without Bootstrap and picks up the host theme (including dark mode) with it.
- **Font Awesome** must be loaded by the host application. The caret and the
  tag-remove glyphs are `fas fa-caret-down` and `fas fa-times`; without Font
  Awesome they render as empty boxes and the remove button becomes an invisible
  (though still clickable) target.

## Usage

```jsx
import { Multiselect } from 'icos-cp-multiselect';

const [selected, setSelected] = useState([]);
const [open, setOpen] = useState(false);

<Multiselect
	data={stations}
	value={selected}
	textField="name"
	dataKey="id"
	open={open}
	onToggle={setOpen}
	onChange={setSelected}
	placeholder="Filter stations"
	inputProps={{'aria-label': 'Stations'}}
/>
```

`open` and `value` are both controlled — the component keeps no copy of either,
so `onToggle` and `onChange` must be wired up for it to do anything.

## Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `T[]` | The items to choose from. Selected items are removed from the list. |
| `value` | `T[]` | The selected items, rendered as tags. Controlled. |
| `textField` | `keyof T` | The field holding an item's label. Omit for `string[]`/`number[]`, where the item is its own label. |
| `dataKey` | `keyof T` | The field identifying an item. **Recommended** — see below. |
| `open` | `boolean` | Whether the dropdown is open. Controlled. |
| `onToggle` | `(open: boolean) => void` | Called when the widget wants to open or close. |
| `onChange` | `(value: T[]) => void` | Called with the next selection. |
| `onSearch` | `(searchTerm: string) => void` | Called as the search term changes, and with `''` when it is cleared. Pair with `filter={false}` for external search. |
| `filter` | `false \| 'contains' \| 'startsWith' \| (item, term) => boolean` | How to filter locally. Defaults to `'contains'`. `false` disables local filtering. |
| `placeholder` | `string` | Shown in the input while nothing is selected. |
| `className` | `string` | Added to the root element. |
| `inputProps` | input attributes | Forwarded to the search input. Use this to give it an accessible name. |
| `renderListItem` | `({item, searchTerm}) => ReactNode` | Custom option rendering. |
| `renderTagValue` | `({item}) => ReactNode` | Custom tag rendering. |

### `dataKey`

Without a `dataKey`, items are compared by reference and keyed by their text.
That means selected items won't be filtered out of the list if `data` is rebuilt
on each render, and items sharing a label will collide as React keys. Pass a
`dataKey` whenever the items have a stable identifier.

### `filter` and `onSearch`

Local filtering runs on the `data` you pass in, so if `onSearch` triggers a
fetch that matches on fields other than `textField`, the default `'contains'`
filter will hide those results. Pass `filter={false}` to leave filtering
entirely to the caller.

Note that react-widgets' `Multiselect` defaults to `'startsWith'`; this
component defaults to `'contains'`, and `filter="startsWith"` restores the
react-widgets behaviour.

## Keyboard

| Key | Action |
|-----|--------|
| `ArrowDown` | Open the list, or move the highlight down |
| `ArrowUp` | Move the highlight up; from nothing highlighted, wraps to the last item |
| `Home` / `End` | Highlight the first / last item |
| `Enter` | Select the highlighted item |
| `Escape` | Close the list and clear the search |
| `Backspace` | With an empty search, remove the last tag |

Tabbing out of the widget closes it and clears the search, as does clicking
outside it.

## Styling

The popup is rendered inline rather than in a portal, so an ancestor with
`overflow: hidden` will clip it. Its stacking order can be retuned with the
`--cp-multiselect-z-index` custom property (default `1005`).

Open/close is a CSS animation and honours `prefers-reduced-motion`.

## Credits
The design of this component was informed by
[react-widgets](https://github.com/jquense/react-widgets)' `Multiselect` (MIT
License, © 2014 Jason Quense), which it replaces as this project's multiselect
dropdown.
