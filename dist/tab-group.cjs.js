'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * @module TabGroup
 * A fully accessible tab group web component
 */

let instanceCount = 0;

/**
 * @class TabGroup
 * the parent container that coordinates tabs and panels
 */
class TabGroup extends HTMLElement {
	/**
	 * @function ensureConsistentTabsAndPanels
	 * makes sure there is an equal number of <tab-button> and <tab-panel> elements.
	 * if there are more panels than tabs, inject extra tab buttons.
	 * if there are more tabs than panels, inject extra panels.
	 */
	ensureConsistentTabsAndPanels() {
		// get current tabs and panels scoped to direct children only
		let tabs = this.querySelectorAll(':scope > tab-list > tab-button');
		let panels = this.querySelectorAll(':scope > tab-panel');

		// if there are more panels than tabs
		if (panels.length > tabs.length) {
			const difference = panels.length - tabs.length;
			// try to find a <tab-list> to insert new tabs
			let tabList = this.querySelector(':scope > tab-list');
			if (!tabList) {
				// if not present, create one and insert it at the beginning
				tabList = document.createElement('tab-list');
				this.insertBefore(tabList, this.firstChild);
			}
			// inject extra <tab-button> elements into the tab list
			for (let i = 0; i < difference; i++) {
				const newTab = document.createElement('tab-button');
				newTab.textContent = 'default tab';
				tabList.appendChild(newTab);
			}
		}
		// if there are more tabs than panels
		else if (tabs.length > panels.length) {
			const difference = tabs.length - panels.length;
			// inject extra <tab-panel> elements at the end of the tab group
			for (let i = 0; i < difference; i++) {
				const newPanel = document.createElement('tab-panel');
				newPanel.innerHTML = '<p>default panel content</p>';
				this.appendChild(newPanel);
			}
		}
	}

	/**
	 * called when the element is connected to the dom
	 */
	connectedCallback() {
		// assign a stable instance id on first connect
		if (!this._instanceId) {
			this._instanceId = `tg-${instanceCount++}`;
		}

		// ensure that the number of <tab-button> and <tab-panel> elements match
		this.ensureConsistentTabsAndPanels();

		// find the <tab-list> element (should be exactly one)
		this.tabList = this.querySelector(':scope > tab-list');
		if (!this.tabList) return;

		// find all <tab-button> elements inside the <tab-list>
		this.tabButtons = Array.from(
			this.tabList.querySelectorAll('tab-button')
		);

		// find all <tab-panel> elements inside the <tab-group>
		this.tabPanels = Array.from(this.querySelectorAll(':scope > tab-panel'));

		const prefix = this._instanceId;

		// initialize each tab-button with roles, ids and aria attributes
		this.tabButtons.forEach((tab, index) => {
			const tabId = `${prefix}-tab-${index}`;
			const panelId = `${prefix}-panel-${index}`;
			tab.id = tabId;
			tab.setAttribute('role', 'tab');
			tab.setAttribute('aria-controls', panelId);

			// first tab is active by default
			if (index === 0) {
				tab.setAttribute('aria-selected', 'true');
				tab.setAttribute('tabindex', '0');
			} else {
				tab.setAttribute('aria-selected', 'false');
				tab.setAttribute('tabindex', '-1');
			}
		});

		// initialize each tab-panel with roles, ids and aria attributes
		this.tabPanels.forEach((panel, index) => {
			const panelId = `${prefix}-panel-${index}`;
			panel.id = panelId;
			panel.setAttribute('role', 'tabpanel');
			panel.setAttribute('aria-labelledby', `${prefix}-tab-${index}`);

			// hide panels except for the first one
			panel.hidden = index !== 0;
		});

		// set up keyboard navigation and click delegation on the <tab-list>
		this.tabList.setAttribute('role', 'tablist');

		// store bound handlers so we can remove them in disconnectedCallback
		if (!this._onKeyDown) {
			this._onKeyDown = (e) => this.onKeyDown(e);
			this._onClick = (e) => this.onClick(e);
		}
		this.tabList.addEventListener('keydown', this._onKeyDown);
		this.tabList.addEventListener('click', this._onClick);
	}

	/**
	 * called when the element is disconnected from the dom
	 */
	disconnectedCallback() {
		if (this._animationController) {
			this._animationController.abort();
			this._animationController = null;
		}
		if (this.tabList && this._onKeyDown) {
			this.tabList.removeEventListener('keydown', this._onKeyDown);
			this.tabList.removeEventListener('click', this._onClick);
		}
	}

	/**
	 * reads animation attributes from the element
	 */
	_getAnimateConfig() {
		const outClass = this.getAttribute('animate-out-class');
		const inClass = this.getAttribute('animate-in-class');
		const timeout = parseInt(this.getAttribute('animate-timeout'), 10) || 500;
		return { outClass, inClass, timeout, hasAnimation: !!(outClass || inClass) };
	}

	/**
	 * adds a class and waits for animationend (or timeout), with abort support
	 */
	_waitForAnimation(element, className, timeout, signal) {
		return new Promise((resolve) => {
			if (signal.aborted) {
				resolve();
				return;
			}

			element.classList.add(className);

			let timer;
			const cleanup = () => {
				element.classList.remove(className);
				clearTimeout(timer);
				element.removeEventListener('animationend', onEnd);
				signal.removeEventListener('abort', onAbort);
				resolve();
			};

			const onEnd = (e) => {
				if (e.target === element) cleanup();
			};

			const onAbort = () => cleanup();

			element.addEventListener('animationend', onEnd);
			signal.addEventListener('abort', onAbort);
			timer = setTimeout(cleanup, timeout);
		});
	}

	/**
	 * orchestrates out-animation → swap → in-animation
	 */
	async _animateTransition(oldPanel, newPanel, config, controller) {
		const { signal } = controller;

		// Phase 1: animate out
		if (config.outClass && oldPanel) {
			await this._waitForAnimation(oldPanel, config.outClass, config.timeout, signal);
		}
		if (signal.aborted) return;

		// Phase 2: swap hidden
		if (oldPanel) oldPanel.hidden = true;
		newPanel.hidden = false;

		// Phase 3: animate in
		if (config.inClass) {
			if (signal.aborted) return;
			// force reflow so the browser sees the element before animating
			newPanel.offsetHeight;
			await this._waitForAnimation(newPanel, config.inClass, config.timeout, signal);
		}
	}

	/**
	 * @function setActiveTab
	 * activates a tab and updates aria attributes
	 * @param {number} index - index of the tab to activate
	 */
	setActiveTab(index) {
		if (index < 0 || index >= this.tabButtons.length) return;
		const previousIndex = this.tabButtons.findIndex(
			(tab) => tab.getAttribute('aria-selected') === 'true'
		);

		// cancel any in-flight animation
		if (this._animationController) {
			this._animationController.abort();
			this._animationController = null;
			// force-hide all panels (clean slate)
			this.tabPanels.forEach((panel) => {
				panel.hidden = true;
			});
		}

		// update each tab-button (ARIA updates fire immediately)
		this.tabButtons.forEach((tab, i) => {
			const isActive = i === index;
			tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
			tab.setAttribute('tabindex', isActive ? '0' : '-1');
			if (isActive) {
				tab.focus();
			}
		});

		// dispatch event only if the tab actually changed
		if (previousIndex !== index) {
			const detail = {
				previousIndex,
				currentIndex: index,
				previousTab: this.tabButtons[previousIndex],
				currentTab: this.tabButtons[index],
				previousPanel: this.tabPanels[previousIndex],
				currentPanel: this.tabPanels[index],
			};
			this.dispatchEvent(
				new CustomEvent('tabchange', { detail, bubbles: true })
			);
		}

		const config = this._getAnimateConfig();
		const oldPanel = previousIndex >= 0 ? this.tabPanels[previousIndex] : null;
		const newPanel = this.tabPanels[index];

		if (!config.hasAnimation || previousIndex === index) {
			// instant switch (original behavior)
			this.tabPanels.forEach((panel, i) => {
				panel.hidden = i !== index;
			});
			return;
		}

		// animated transition
		const controller = new AbortController();
		this._animationController = controller;

		// old panel was already force-hidden by abort above, so if we aborted
		// a previous animation, skip animate-out (old panel is already gone)
		const skipOut = oldPanel && oldPanel.hidden;

		if (skipOut) {
			// just animate in the new panel
			newPanel.hidden = false;
			if (config.inClass) {
				newPanel.offsetHeight;
				this._waitForAnimation(newPanel, config.inClass, config.timeout, controller.signal).then(() => {
					if (this._animationController === controller) {
						this._animationController = null;
					}
				});
			} else {
				this._animationController = null;
			}
		} else {
			// full out → swap → in sequence
			this._animateTransition(oldPanel, newPanel, config, controller).then(() => {
				if (this._animationController === controller) {
					this._animationController = null;
				}
			});
		}
	}

	/**
	 * @function onClick
	 * handles click events on the <tab-list> via event delegation
	 * @param {MouseEvent} e - the click event
	 */
	onClick(e) {
		// check if the click occurred on or within a <tab-button>
		const tabButton = e.target.closest('tab-button');
		if (!tabButton) return;

		// determine the index of the clicked tab-button
		const index = this.tabButtons.indexOf(tabButton);
		if (index === -1) return;

		// activate the tab with the corresponding index
		this.setActiveTab(index);
	}

	/**
	 * @function onKeyDown
	 * handles keyboard navigation for the tabs
	 * @param {KeyboardEvent} e - the keydown event
	 */
	onKeyDown(e) {
		// only process keys if focus is on a <tab-button>
		const targetIndex = this.tabButtons.indexOf(e.target);
		if (targetIndex === -1) return;

		let newIndex = targetIndex;
		switch (e.key) {
			case 'ArrowLeft':
			case 'ArrowUp':
				// move to the previous tab (wrap around if necessary)
				newIndex =
					targetIndex > 0 ? targetIndex - 1 : this.tabButtons.length - 1;
				e.preventDefault();
				break;
			case 'ArrowRight':
			case 'ArrowDown':
				// move to the next tab (wrap around if necessary)
				newIndex = (targetIndex + 1) % this.tabButtons.length;
				e.preventDefault();
				break;
			case 'Home':
				// jump to the first tab
				newIndex = 0;
				e.preventDefault();
				break;
			case 'End':
				// jump to the last tab
				newIndex = this.tabButtons.length - 1;
				e.preventDefault();
				break;
			default:
				return; // ignore other keys
		}
		this.setActiveTab(newIndex);
	}
}

/**
 * @class TabList
 * a container for the <tab-button> elements
 */
class TabList extends HTMLElement {}

/**
 * @class TabButton
 * a single tab button element
 */
class TabButton extends HTMLElement {}

/**
 * @class TabPanel
 * a single tab panel element
 */
class TabPanel extends HTMLElement {}

// define the custom elements (guarded against double-registration and SSR)
if (typeof window !== 'undefined' && window.customElements) {
	if (!customElements.get('tab-group'))
		customElements.define('tab-group', TabGroup);
	if (!customElements.get('tab-list'))
		customElements.define('tab-list', TabList);
	if (!customElements.get('tab-button'))
		customElements.define('tab-button', TabButton);
	if (!customElements.get('tab-panel'))
		customElements.define('tab-panel', TabPanel);
}

exports.default = TabGroup;
//# sourceMappingURL=tab-group.cjs.js.map
