'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * @module TabGroup
 * A fully accessible tab group web component
 */

/**
 * @class TabGroup
 * the parent container that coordinates tabs and panels
 */
class TabGroup extends HTMLElement {
	// static counter to ensure global unique ids for tabs and panels
	static tabCount = 0;
	static panelCount = 0;

	constructor() {
		super();
		// ensure that the number of <tab-button> and <tab-panel> elements match
		// note: in some scenarios the child elements might not be available in the constructor,
		// so adjust as necessary or consider running this check in connectedCallback()
		this.ensureConsistentTabsAndPanels();
	}

	/**
	 * @function ensureConsistentTabsAndPanels
	 * makes sure there is an equal number of <tab-button> and <tab-panel> elements.
	 * if there are more panels than tabs, inject extra tab buttons.
	 * if there are more tabs than panels, inject extra panels.
	 */
	ensureConsistentTabsAndPanels() {
		// get current tabs and panels within the tab group
		let tabs = this.querySelectorAll("tab-button");
		let panels = this.querySelectorAll("tab-panel");

		// if there are more panels than tabs
		if (panels.length > tabs.length) {
			const difference = panels.length - tabs.length;
			// try to find a <tab-list> to insert new tabs
			let tabList = this.querySelector("tab-list");
			if (!tabList) {
				// if not present, create one and insert it at the beginning
				tabList = document.createElement("tab-list");
				this.insertBefore(tabList, this.firstChild);
			}
			// inject extra <tab-button> elements into the tab list
			for (let i = 0; i < difference; i++) {
				const newTab = document.createElement("tab-button");
				newTab.textContent = "default tab";
				tabList.appendChild(newTab);
			}
		}
		// if there are more tabs than panels
		else if (tabs.length > panels.length) {
			const difference = tabs.length - panels.length;
			// inject extra <tab-panel> elements at the end of the tab group
			for (let i = 0; i < difference; i++) {
				const newPanel = document.createElement("tab-panel");
				newPanel.innerHTML = "<p>default panel content</p>";
				this.appendChild(newPanel);
			}
		}
	}

	/**
	 * called when the element is connected to the dom
	 */
	connectedCallback() {
		const _ = this;

		// find the <tab-list> element (should be exactly one)
		_.tabList = _.querySelector("tab-list");
		if (!_.tabList) return;

		// find all <tab-button> elements inside the <tab-list>
		_.tabButtons = Array.from(_.tabList.querySelectorAll("tab-button"));

		// find all <tab-panel> elements inside the <tab-group>
		_.tabPanels = Array.from(_.querySelectorAll("tab-panel"));

		// initialize each tab-button with roles, ids and aria attributes
		_.tabButtons.forEach((tab, index) => {
			const tabIndex = TabGroup.tabCount++;

			// generate a unique id for each tab, e.g. "tab-0", "tab-1", ...
			const tabId = `tab-${tabIndex}`;
			tab.id = tabId;

			// generate a corresponding panel id, e.g. "panel-0"
			const panelId = `panel-${tabIndex}`;
			tab.setAttribute("role", "tab");
			tab.setAttribute("aria-controls", panelId);

			// first tab is active by default
			if (index === 0) {
				tab.setAttribute("aria-selected", "true");
				tab.setAttribute("tabindex", "0");
			} else {
				tab.setAttribute("aria-selected", "false");
				tab.setAttribute("tabindex", "-1");
			}
		});

		// initialize each tab-panel with roles, ids and aria attributes
		_.tabPanels.forEach((panel, index) => {
			const panelIndex = TabGroup.panelCount++;
			const panelId = `panel-${panelIndex}`;
			panel.id = panelId;

			panel.setAttribute("role", "tabpanel");
			panel.setAttribute("aria-labelledby", `tab-${panelIndex}`);

			// hide panels except for the first one
			panel.hidden = index !== 0;
		});

		// set up keyboard navigation and click delegation on the <tab-list>
		_.tabList.setAttribute("role", "tablist");
		_.tabList.addEventListener("keydown", (e) => _.onKeyDown(e));
		_.tabList.addEventListener("click", (e) => _.onClick(e));
	}

	/**
	 * @function setActiveTab
	 * activates a tab and updates aria attributes
	 * @param {number} index - index of the tab to activate
	 */
	setActiveTab(index) {
		const _ = this;
		const previousIndex = _.tabButtons.findIndex(tab => tab.getAttribute("aria-selected") === "true");

		// update each tab-button
		_.tabButtons.forEach((tab, i) => {
			const isActive = i === index;
			tab.setAttribute("aria-selected", isActive ? "true" : "false");
			tab.setAttribute("tabindex", isActive ? "0" : "-1");
			if (isActive) {
				tab.focus();
			}
		});

		// update each tab-panel
		_.tabPanels.forEach((panel, i) => {
			panel.hidden = i !== index;
		});

		// dispatch event only if the tab actually changed
		if (previousIndex !== index) {
			const detail = {
				previousIndex,
				currentIndex: index,
				previousTab: _.tabButtons[previousIndex],
				currentTab: _.tabButtons[index],
				previousPanel: _.tabPanels[previousIndex],
				currentPanel: _.tabPanels[index]
			};
			_.dispatchEvent(new CustomEvent('tabchange', { detail, bubbles: true }));
		}
	}

	/**
	 * @function onClick
	 * handles click events on the <tab-list> via event delegation
	 * @param {MouseEvent} e - the click event
	 */
	onClick(e) {
		const _ = this;
		// check if the click occurred on or within a <tab-button>
		const tabButton = e.target.closest("tab-button");
		if (!tabButton) return;

		// determine the index of the clicked tab-button
		const index = _.tabButtons.indexOf(tabButton);
		if (index === -1) return;

		// activate the tab with the corresponding index
		_.setActiveTab(index);
	}

	/**
	 * @function onKeyDown
	 * handles keyboard navigation for the tabs
	 * @param {KeyboardEvent} e - the keydown event
	 */
	onKeyDown(e) {
		const _ = this;
		// only process keys if focus is on a <tab-button>
		const targetIndex = _.tabButtons.indexOf(e.target);
		if (targetIndex === -1) return;

		let newIndex = targetIndex;
		switch (e.key) {
			case "ArrowLeft":
			case "ArrowUp":
				// move to the previous tab (wrap around if necessary)
				newIndex = targetIndex > 0 ? targetIndex - 1 : _.tabButtons.length - 1;
				e.preventDefault();
				break;
			case "ArrowRight":
			case "ArrowDown":
				// move to the next tab (wrap around if necessary)
				newIndex = (targetIndex + 1) % _.tabButtons.length;
				e.preventDefault();
				break;
			case "Home":
				// jump to the first tab
				newIndex = 0;
				e.preventDefault();
				break;
			case "End":
				// jump to the last tab
				newIndex = _.tabButtons.length - 1;
				e.preventDefault();
				break;
			default:
				return; // ignore other keys
		}
		_.setActiveTab(newIndex);
	}
}

/**
 * @class TabList
 * a container for the <tab-button> elements
 */
class TabList extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		// additional logic or styling can be added here if desired
	}
}

/**
 * @class TabButton
 * a single tab button element
 */
class TabButton extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		// note: role and other attributes are handled by the parent
	}
}

/**
 * @class TabPanel
 * a single tab panel element
 */
class TabPanel extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		// note: role and other attributes are handled by the parent
	}
}

// define the custom elements
customElements.define("tab-group", TabGroup);
customElements.define("tab-list", TabList);
customElements.define("tab-button", TabButton);
customElements.define("tab-panel", TabPanel);

exports.TabGroup = TabGroup;
exports.default = TabGroup;
//# sourceMappingURL=tab-group.cjs.js.map
