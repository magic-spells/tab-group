# Tab Group

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.1.0-brightgreen)

A lightweight, accessible tab interface web component with keyboard navigation. Ships only structural CSS — you bring your own styles.

[Live Demo](https://magic-spells.github.io/tab-group/demo/) - See it in action!

## Features

- **Fully Accessible** - Built following WAI-ARIA Tab pattern guidelines
- **Custom Events** - Listen for tab changes with detailed event data
- **Keyboard Navigation** - Complete keyboard support for accessibility
- **Auto Consistency** - Ensures tab buttons and panels stay in sync
- **Zero Opinions** - No cosmetic CSS; style it however you want
- **Zero Dependencies** - Lightweight and standalone
- **Easy Integration** - Works with any framework or vanilla JS

## Installation

```bash
npm install @magic-spells/tab-group
```

## Usage

```html
<script type="module">
  import '@magic-spells/tab-group';
</script>

<tab-group>
  <tab-list>
    <tab-button>First Tab</tab-button>
    <tab-button>Second Tab</tab-button>
    <tab-button>Third Tab</tab-button>
  </tab-list>

  <tab-panel>
    <h3>First Tab Content</h3>
    <p>This is the content for the first tab.</p>
  </tab-panel>

  <tab-panel>
    <h3>Second Tab Content</h3>
    <p>This is the content for the second tab.</p>
  </tab-panel>

  <tab-panel>
    <h3>Third Tab Content</h3>
    <p>This is the content for the third tab.</p>
  </tab-panel>
</tab-group>
```

### Listening for Tab Changes

```javascript
document
  .querySelector('tab-group')
  .addEventListener('tabchange', (event) => {
    const { previousIndex, currentIndex } = event.detail;
    console.log(`Changed from tab ${previousIndex} to tab ${currentIndex}`);
  });
```

## Styling

The component ships only structural CSS (display modes, overflow, hidden state). All visual styling is yours. Target the custom elements and ARIA attributes directly:

```css
tab-list {
  gap: 0.25rem;
  border-bottom: 1px solid #ddd;
}

tab-button {
  padding: 0.5rem 1rem;
  border-bottom: 2px solid transparent;
}

tab-button[aria-selected="true"] {
  color: #3366ff;
  border-bottom-color: #3366ff;
}

tab-panel {
  padding: 1rem;
}
```

Or use Tailwind utility classes — no overrides needed.

### What the component CSS includes

```css
tab-group  { display: block; }
tab-list   { display: flex; overflow-x: auto; overflow-y: hidden; }
tab-button { display: block; cursor: pointer; user-select: none; }
tab-panel[hidden] { display: none; }
```

That's it. No fonts, colors, spacing, borders, transitions, shadows, or media queries.

## Accessibility

The Tab Group component follows the [WAI-ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) with:

- Proper ARIA roles, states, and properties
- Keyboard navigation:
  - `Tab` to focus the active tab button
  - `←` / `↑` to move to the previous tab
  - `→` / `↓` to move to the next tab
  - `Home` to move to the first tab
  - `End` to move to the last tab

## API Reference

### Components

| Element        | Description                            |
| -------------- | -------------------------------------- |
| `<tab-group>`  | Container for the entire tab interface |
| `<tab-list>`   | Container for tab buttons              |
| `<tab-button>` | Individual tab trigger                 |
| `<tab-panel>`  | Content container for each tab         |

### Events

| Event       | Detail                                                                                  | Description                       |
| ----------- | --------------------------------------------------------------------------------------- | --------------------------------- |
| `tabchange` | `{ previousIndex, currentIndex, previousTab, currentTab, previousPanel, currentPanel }` | Fired when the active tab changes |

## Examples

Check out more examples in the [demo directory](https://github.com/magic-spells/tab-group/tree/main/demo).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with magic by <a href="https://github.com/cory-schulz">Cory Schulz</a>
</p>
