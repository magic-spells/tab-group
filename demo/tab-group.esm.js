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
	 * attributes watched by the browser.
	 * `active` is the 0-based index of the selected tab, and is reflected by
	 * the component whenever the active tab changes.
	 */
	static get observedAttributes() {
		return ['active'];
	}

	/**
	 * @function ensureConsistentTabsAndPanels
	 * makes sure there is an equal number of <tab-button> and <tab-panel> elements.
	 * if there are more panels than tabs, inject extra tab buttons.
	 * if there are more tabs than panels, inject extra panels.
	 *
	 * this only ever runs once, on first connect. later dom mutations never
	 * generate filler elements.
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

		// ensure that the number of <tab-button> and <tab-panel> elements match.
		// first connect only — later mutations are left exactly as authored.
		if (!this._fillersChecked) {
			this._fillersChecked = true;
			this.ensureConsistentTabsAndPanels();
		}

		// collect the tab-list, buttons and panels, then write roles / ids / aria
		this._collect();
		if (!this.tabList) return;
		this._wire();

		// pick the initial tab: an authored `active` attribute wins, else 0.
		// applied silently — no tabchange on first paint.
		if (!this._ready) {
			const authored = this._parseIndex(this.getAttribute('active'));
			const initial = authored === null ? 0 : authored;
			// applied directly rather than through _select: the first paint is a
			// state write, never a transition, so animation classes never run
			this._applyState(initial);
			this._reflect(this.tabButtons.length ? initial : null);
			this._ready = true;
		}

		// store bound handlers so we can remove them in disconnectedCallback.
		// they live on the <tab-group> itself rather than the <tab-list>, so a
		// replaced or late-added tab-list keeps working with no re-wiring.
		if (!this._onKeyDown) {
			this._onKeyDown = (e) => this.onKeyDown(e);
			this._onClick = (e) => this.onClick(e);
		}
		this.addEventListener('keydown', this._onKeyDown);
		this.addEventListener('click', this._onClick);

		// watch for tabs / panels being added, removed or reordered, and for
		// `disabled` flipping on a tab-button
		if (!this._observer) {
			this._observer = new MutationObserver(() => this._sync());
		}
		this._observer.observe(this, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['disabled'],
		});
	}

	/**
	 * called when the element is disconnected from the dom
	 */
	disconnectedCallback() {
		if (this._animationController) {
			this._animationController.abort();
			this._animationController = null;
		}
		if (this._onKeyDown) {
			this.removeEventListener('keydown', this._onKeyDown);
			this.removeEventListener('click', this._onClick);
		}
		if (this._observer) this._observer.disconnect();
	}

	/**
	 * responds to the `active` attribute being set from outside
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		if (name !== 'active') return;
		// ignore our own reflection writes, and anything before first connect
		// (connectedCallback reads the authored value itself)
		if (this._reflecting || !this._ready) return;

		const index = this._parseIndex(newValue);
		// non-numeric, out of range, or disabled → ignored, current tab stays.
		// put the real index back so readers never see a bogus value.
		if (index === null) {
			const current = this.activeIndex;
			this._reflect(current === -1 ? null : current);
			return;
		}
		// already active → no-op: no event, no animation
		if (index === this.activeIndex) return;

		this._select(index, { emit: true, focus: false });
	}

	/**
	 * the index of the currently active tab, or -1 if there is none
	 * @type {number}
	 */
	get activeIndex() {
		if (!this.tabButtons) return -1;
		return this.tabButtons.findIndex(
			(tab) => tab.getAttribute('aria-selected') === 'true'
		);
	}

	/**
	 * the active tab index. setting it behaves exactly like setting the
	 * `active` attribute.
	 * @type {number}
	 */
	get active() {
		return this.activeIndex;
	}

	set active(value) {
		const index = this._parseIndex(value);
		if (index === null) return;
		if (index === this.activeIndex) return;
		this._select(index, { emit: true, focus: false });
	}

	/**
	 * @function _parseIndex
	 * validates a candidate index — returns a usable number, or null when the
	 * value is non-numeric, out of range, or points at a disabled tab
	 */
	_parseIndex(value) {
		if (value === null || value === undefined || value === '') return null;
		const index = Number(value);
		if (!Number.isInteger(index)) return null;
		if (!this.tabButtons || index < 0 || index >= this.tabButtons.length) {
			return null;
		}
		if (this._isDisabled(this.tabButtons[index])) return null;
		return index;
	}

	/**
	 * @function _isDisabled
	 * true when a tab-button carries the `disabled` attribute
	 */
	_isDisabled(tab) {
		return !!tab && tab.hasAttribute('disabled');
	}

	/**
	 * @function _collect
	 * re-reads the tab-list, buttons and panels from the dom. buttons and
	 * panels are paired by dom index:
	 * `:scope > tab-list > tab-button` ↔ `:scope > tab-panel`
	 */
	_collect() {
		this.tabList = this.querySelector(':scope > tab-list');
		this.tabButtons = this.tabList
			? Array.from(this.tabList.querySelectorAll(':scope > tab-button'))
			: [];
		this.tabPanels = Array.from(this.querySelectorAll(':scope > tab-panel'));
	}

	/**
	 * @function _wire
	 * (re)writes roles, ids and aria wiring for every tab and panel
	 */
	_wire() {
		const prefix = this._instanceId;

		this.tabList.setAttribute('role', 'tablist');

		this.tabButtons.forEach((tab, index) => {
			tab.id = `${prefix}-tab-${index}`;
			tab.setAttribute('role', 'tab');

			// only claim a panel that actually exists. counts can mismatch after
			// a mutation, and we never generate fillers to paper over it.
			if (this.tabPanels[index]) {
				tab.setAttribute('aria-controls', `${prefix}-panel-${index}`);
			} else {
				tab.removeAttribute('aria-controls');
			}

			if (this._isDisabled(tab)) {
				tab.setAttribute('aria-disabled', 'true');
			} else {
				tab.removeAttribute('aria-disabled');
			}

			// make sure a newly added button has a selection state to read
			if (!tab.hasAttribute('aria-selected')) {
				tab.setAttribute('aria-selected', 'false');
				tab.setAttribute('tabindex', '-1');
			}
		});

		this.tabPanels.forEach((panel, index) => {
			panel.id = `${prefix}-panel-${index}`;
			panel.setAttribute('role', 'tabpanel');
			if (this.tabButtons[index]) {
				panel.setAttribute('aria-labelledby', `${prefix}-tab-${index}`);
			} else {
				panel.removeAttribute('aria-labelledby');
			}
		});
	}

	/**
	 * @function _sync
	 * called by the MutationObserver after tabs / panels are added, removed or
	 * reordered, or a `disabled` attribute changes. never generates fillers,
	 * and never throws on a count mismatch.
	 */
	_sync() {
		if (!this._ready) return;

		// remember the active tab so we can follow it across a reorder
		const previousButtons = this.tabButtons || [];
		const previousPanels = this.tabPanels || [];
		const previousIndex = this.activeIndex;
		const previousTab = previousButtons[previousIndex] || null;
		const previousPanel = previousPanels[previousIndex] || null;

		this._collect();
		if (!this.tabList) return;
		this._wire();

		// the active tab survived: re-point the reflected index and panel
		// visibility at its (possibly new) position — same tab, so no event
		const movedIndex = previousTab ? this.tabButtons.indexOf(previousTab) : -1;
		if (movedIndex !== -1) {
			this._applyState(movedIndex);
			this._reflect(movedIndex);
			return;
		}

		// the active tab is gone: fall back to the nearest enabled tab at the
		// same position
		const fallback = this._nearestEnabled(previousIndex < 0 ? 0 : previousIndex);
		if (fallback === -1) {
			this._reflect(null);
			return;
		}

		this._applyState(fallback);
		this._reflect(fallback);

		if (previousTab) {
			this._emit(previousIndex, fallback, previousTab, previousPanel);
		}
	}

	/**
	 * @function _nearestEnabled
	 * finds the closest enabled tab to `index`, searching forward then back.
	 * returns -1 when there is no enabled tab.
	 */
	_nearestEnabled(index) {
		const count = this.tabButtons.length;
		for (let offset = 0; offset < count; offset++) {
			const forward = index + offset;
			if (forward < count && !this._isDisabled(this.tabButtons[forward])) {
				return forward;
			}
			const back = index - offset;
			if (
				back >= 0 &&
				back < count &&
				!this._isDisabled(this.tabButtons[back])
			) {
				return back;
			}
		}
		return -1;
	}

	/**
	 * @function _reflect
	 * writes the `active` attribute without re-entering attributeChangedCallback
	 */
	_reflect(index) {
		this._reflecting = true;
		if (index === null) {
			this.removeAttribute('active');
		} else {
			this.setAttribute('active', String(index));
		}
		this._reflecting = false;
	}

	/**
	 * @function _applyState
	 * writes aria-selected / tabindex on every button and shows the matching
	 * panel instantly. used for structural re-syncs, never for user activation.
	 */
	_applyState(index) {
		this.tabButtons.forEach((tab, i) => {
			const isActive = i === index;
			tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
			// the active tab stays tabbable so the tablist is always reachable
			tab.setAttribute('tabindex', isActive ? '0' : '-1');
		});
		this.tabPanels.forEach((panel, i) => {
			panel.hidden = i !== index;
		});
	}

	/**
	 * @function _emit
	 * dispatches the tabchange event
	 */
	_emit(previousIndex, index, previousTab, previousPanel) {
		const detail = {
			previousIndex,
			currentIndex: index,
			previousTab: previousTab ?? this.tabButtons[previousIndex],
			currentTab: this.tabButtons[index],
			previousPanel: previousPanel ?? this.tabPanels[previousIndex],
			currentPanel: this.tabPanels[index],
		};
		this.dispatchEvent(
			new CustomEvent('tabchange', { detail, bubbles: true, composed: true })
		);
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
		if (newPanel) newPanel.hidden = false;

		// Phase 3: animate in
		if (config.inClass && newPanel) {
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
		this._select(index, { emit: true, focus: true });
	}

	/**
	 * @function _select
	 * the single activation path — shared by clicks, keyboard navigation, the
	 * `active` attribute and the `active` property
	 * @param {number} index - index of the tab to activate
	 * @param {{emit?: boolean, focus?: boolean}} options
	 */
	_select(index, { emit = true, focus = true } = {}) {
		if (!this.tabButtons) return;
		if (index < 0 || index >= this.tabButtons.length) return;
		// a disabled tab can never become active
		if (this._isDisabled(this.tabButtons[index])) return;

		const previousIndex = this.activeIndex;

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
			if (isActive && focus) {
				tab.focus();
			}
		});

		// the `active` attribute is always the source of truth for readers
		this._reflect(index);

		// dispatch event only if the tab actually changed
		if (emit && previousIndex !== index) {
			this._emit(previousIndex, index);
		}

		const config = this._getAnimateConfig();
		const oldPanel = previousIndex >= 0 ? this.tabPanels[previousIndex] : null;
		const newPanel = this.tabPanels[index];

		// nothing to animate out of when there was no previous selection
		if (!config.hasAnimation || previousIndex === index || previousIndex < 0) {
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
			if (newPanel) newPanel.hidden = false;
			if (config.inClass && newPanel) {
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
	 * handles click events, delegated on the <tab-group>
	 * @param {MouseEvent} e - the click event
	 */
	onClick(e) {
		// check if the click occurred on or within a <tab-button>
		const tabButton = e.target.closest && e.target.closest('tab-button');
		if (!tabButton) return;

		// determine the index of the clicked tab-button. only our own tabs
		// count, so nested tab-groups never hijack each other.
		const index = this.tabButtons.indexOf(tabButton);
		if (index === -1) return;

		// disabled tabs are not activatable
		if (this._isDisabled(tabButton)) return;

		// activate the tab with the corresponding index
		this.setActiveTab(index);
	}

	/**
	 * @function onKeyDown
	 * handles keyboard navigation for the tabs
	 * @param {KeyboardEvent} e - the keydown event
	 */
	onKeyDown(e) {
		// only process keys if focus is on one of our own <tab-button> elements
		const targetIndex = this.tabButtons.indexOf(e.target);
		if (targetIndex === -1) return;

		let newIndex;
		switch (e.key) {
			case 'ArrowLeft':
			case 'ArrowUp':
				// move to the previous enabled tab (wrap around if necessary)
				newIndex = this._roving(targetIndex, -1);
				e.preventDefault();
				break;
			case 'ArrowRight':
			case 'ArrowDown':
				// move to the next enabled tab (wrap around if necessary)
				newIndex = this._roving(targetIndex, 1);
				e.preventDefault();
				break;
			case 'Home':
				// jump to the first enabled tab
				newIndex = this._roving(-1, 1);
				e.preventDefault();
				break;
			case 'End':
				// jump to the last enabled tab
				newIndex = this._roving(this.tabButtons.length, -1);
				e.preventDefault();
				break;
			default:
				return; // ignore other keys
		}
		if (newIndex === -1) return;
		this.setActiveTab(newIndex);
	}

	/**
	 * @function _roving
	 * walks from `from` in `direction`, wrapping, until it lands on an enabled
	 * tab. returns -1 when every tab is disabled.
	 */
	_roving(from, direction) {
		const count = this.tabButtons.length;
		if (count === 0) return -1;
		let index = from;
		for (let step = 0; step < count; step++) {
			index = (((index + direction) % count) + count) % count;
			if (!this._isDisabled(this.tabButtons[index])) return index;
		}
		return -1;
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

export { TabGroup as default };
//# sourceMappingURL=tab-group.esm.js.map
