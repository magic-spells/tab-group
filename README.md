# Tab Group

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)

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

## Animated Transitions

Add CSS animation classes to smoothly transition between panels. The component orchestrates the lifecycle — you define the animations.

```html
<tab-group animate-out-class="fade-out" animate-in-class="fade-in" animate-timeout="500">
  ...
</tab-group>
```

| Attribute | Description | Default |
|---|---|---|
| `animate-out-class` | CSS class added to the outgoing panel during exit | none (instant) |
| `animate-in-class` | CSS class added to the incoming panel during enter | none (instant) |
| `animate-timeout` | Fallback timeout in ms if `animationend` never fires | `500` |

```css
@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

tab-panel.fade-out {
  animation: fade-out 0.25s ease-out forwards;
}

tab-panel.fade-in {
  animation: fade-in 0.25s ease-out forwards;
}
```

Either attribute works independently. No attributes = original instant behavior. ARIA updates and the `tabchange` event always fire immediately, before any animation. Rapid clicks cancel cleanly via AbortController.

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

### Attributes

| Attribute | Element | Description | Default |
|---|---|---|---|
| `animate-out-class` | `<tab-group>` | CSS class for exit animation on outgoing panel | none |
| `animate-in-class` | `<tab-group>` | CSS class for enter animation on incoming panel | none |
| `animate-timeout` | `<tab-group>` | Fallback timeout (ms) if `animationend` doesn't fire | `500` |

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
  Made by <a href="https://github.com/coryschulz">Cory Schulz</a>
</p>
