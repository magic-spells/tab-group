# ✨ Tab Group

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.1.0-brightgreen)

A lightweight, accessible tab interface web component with keyboard navigation and rich customization options.

🔍 **[Live Demo](https://magic-spells.github.io/tab-group/demo/)** - See it in action!

## 🚀 Features

- **Fully Accessible** - Built following WAI-ARIA Tab pattern guidelines
- **Custom Events** - Listen for tab changes with detailed event data
- **Keyboard Navigation** - Complete keyboard support for accessibility
- **Auto Consistency** - Ensures tab buttons and panels stay in sync
- **Theme Support** - Extensive CSS variable customization
- **Zero Dependencies** - Lightweight and standalone
- **Easy Integration** - Works with any framework or vanilla JS

## 📦 Installation

```bash
# npm
npm install @magic-spells/tab-group

# yarn
yarn add @magic-spells/tab-group

# pnpm
pnpm add @magic-spells/tab-group
```

## 🔧 Usage

### Basic Implementation

```html
<!-- Import the component -->
<script type="module">
  import '@magic-spells/tab-group';
</script>

<!-- Use the component -->
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
    console.log('Tab changed!');

    // Access detailed event data
    const {
      previousIndex, // Index of previous tab
      currentIndex, // Index of current tab
      previousTab, // Previous tab element
      currentTab, // Current tab element
      previousPanel, // Previous panel element
      currentPanel, // Current panel element
    } = event.detail;

    // Do something with the data
    console.log(
      `Changed from tab ${previousIndex} to tab ${currentIndex}`
    );
  });
```

## 🎨 Styling

### CSS Variables

The Tab Group component can be extensively customized using CSS variables:

```css
tab-group {
  /* Base colors */
  --color-background: #ffffff;
  --color-text: #333333;
  --color-border: #dddddd;
  --color-border-hover: #bbbbbb;
  --color-primary: #3366ff;
  --color-hover: #f0f5ff;
  --color-focus: #b3cbff;

  /* Panel styling */
  --panel-background: white;
  --panel-border: 1px solid var(--color-border);
  --panel-padding: 1rem;
  --panel-radius: 0 0 0.5rem 0.5rem;
  --panel-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  /* Tab list styling */
  --tab-list-gap: 0.25rem;
  --tab-list-padding: 0.5rem 0.5rem 0;
  --tab-list-background: transparent;
  --tab-list-border-bottom: 1px solid var(--color-border);
  --tab-list-radius: 0.5rem 0.5rem 0 0;

  /* Tab button styling */
  --tab-button-radius: 0.25rem 0.25rem 0 0;
  --tab-active-background: white;
  --tab-active-color: var(--color-primary);
  --tab-active-font-weight: 500;
  --tab-active-shadow: none;
  --tab-active-transform: translateY(0);

  /* Tab indicator styling */
  --tab-indicator-height: 2px;
  --tab-indicator-color: var(--color-primary);
  --tab-indicator-left: 0;
  --tab-indicator-right: 0;
}
```

### SCSS Integration

This package provides multiple ways to integrate with your SCSS workflow:

```scss
// Option 1: Use the main entry point (recommended)
@use "@magic-spells/tab-group/scss" with (
  $color-primary: #3366ff,
  $border-radius: 0.5rem
);

// Option 2: Import individual files
@use "@magic-spells/tab-group/scss/variables" with (
  $color-primary: #3366ff,
  $border-radius: 0.5rem
);
@use "@magic-spells/tab-group/scss/tab-group";

// Option 3: Direct paths (if needed)
@use "node_modules/@magic-spells/tab-group/dist/tab-group.scss";
@use "node_modules/@magic-spells/tab-group/dist/scss/tab-group";
```

#### Available SCSS Variables

You can customize the appearance by overriding these SCSS variables:

```scss
// Colors
$color-background: #ffffff !default;
$color-text: #333333 !default;
$color-border: #dddddd !default;
$color-border-hover: #bbbbbb !default;
$color-border-dark: #999999 !default;
$color-primary: #3366ff !default;
$color-hover: #f0f5ff !default;
$color-focus: #b3cbff !default;

// Border radius
$border-radius: 0.5rem !default;

// Box shadow
$box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !default;

// Tab list
$tab-list-gap: 0.25rem !default;
$tab-list-padding: 0.5rem 0.5rem 0 !default;
$tab-list-background: transparent !default;
$tab-list-border-bottom: 1px solid $color-border !default;
$tab-list-radius: $border-radius $border-radius 0 0 !default;

// Tab button
$tab-button-radius: 0.25rem 0.25rem 0 0 !default;
$tab-active-background: white !default;
$tab-active-color: $color-primary !default;
$tab-active-font-weight: 500 !default;
$tab-active-shadow: none !default;
$tab-active-transform: translateY(0) !default;

// Tab indicator
$tab-indicator-height: 2px !default;
$tab-indicator-color: $color-primary !default;
$tab-indicator-left: 0 !default;
$tab-indicator-right: 0 !default;

// Panel
$panel-background: white !default;
$panel-border: 1px solid $color-border !default;
$panel-padding: 1rem !default;
$panel-radius: 0 0 $border-radius $border-radius !default;
$panel-shadow: $box-shadow !default;
```

## 🌈 Theme Examples

### Dark Theme

```css
tab-group {
  --color-background: #2d3748;
  --color-text: #e2e8f0;
  --color-border: #4a5568;
  --color-border-hover: #718096;
  --color-primary: #4299e1;
  --color-hover: #1a202c;
  --color-focus: #2c5282;
  --panel-background: #1e293b;
  --panel-border: 1px solid #4a5568;
  --panel-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  --tab-active-color: #63b3ed;
  --tab-indicator-color: #63b3ed;
}
```

### Rounded Pills Theme

```css
tab-group {
  --border-radius: 0.5rem;
  --color-primary: #9f7aea;
  --color-focus: #e9d8fd;
  --tab-button-radius: 999px;
  --tab-list-padding: 0.75rem 0.5rem 0;
  --tab-list-gap: 0.5rem;
  --panel-radius: 1rem;
  --panel-shadow: 0 4px 12px rgba(159, 122, 234, 0.15);
  --panel-border: 1px solid #e9d8fd;
  --panel-padding: 1.5rem;
  --tab-active-background: #9f7aea;
  --tab-active-color: white;
  --tab-active-font-weight: 500;
  --tab-active-transform: translateY(-3px);
  --tab-active-shadow: 0 4px 8px rgba(159, 122, 234, 0.3);
  --tab-indicator-height: 0;
}
```

## ⌨️ Accessibility

The Tab Group component follows the [WAI-ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) with:

- Proper ARIA roles, states, and properties
- Keyboard navigation:
  - `Tab` to focus the active tab button
  - `←` / `↑` to move to the previous tab
  - `→` / `↓` to move to the next tab
  - `Home` to move to the first tab
  - `End` to move to the last tab

## 🛠️ API Reference

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

## 🌟 Examples

Check out more examples in the [demo directory](https://github.com/magic-spells/tab-group/tree/main/demo).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ✨ by <a href="https://github.com/cory-schulz">Cory Schulz</a>
</p>
