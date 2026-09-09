export interface TabChangeEventDetail {
	/**
	 * Index of the previously active tab, or `-1` when there was none. When the
	 * active tab is removed from the DOM this is its index in the *old* list,
	 * which no longer addresses anything in the current one.
	 */
	previousIndex: number;
	currentIndex: number;
	/**
	 * The previously active tab. `undefined` when there was no previous
	 * selection; when the active tab was removed this is the detached element.
	 */
	previousTab: HTMLElement | undefined;
	currentTab: HTMLElement;
	/**
	 * The previously active panel. `undefined` when there was no previous
	 * selection; when the active tab was removed this is the detached element.
	 */
	previousPanel: HTMLElement | undefined;
	currentPanel: HTMLElement;
}

/**
 * Accessible tab group web component.
 *
 * **Attributes** (set on the `<tab-group>` element):
 *
 * - `active` — 0-based index of the active tab. Set it to switch tabs; the
 *   component reflects it back whenever the active tab changes by click or
 *   keyboard, so it is always the source of truth. Out-of-range, non-numeric,
 *   or disabled indices are ignored. Programmatic activation updates the
 *   roving `tabindex` but does not move focus.
 * - `animate-out-class` — CSS class added to the outgoing panel during exit animation.
 *   Omit for instant hide.
 * - `animate-in-class` — CSS class added to the incoming panel during enter animation.
 *   Omit for instant show.
 * - `animate-timeout` — Fallback timeout in ms if `animationend` never fires (default `500`).
 *
 * Either animation attribute works independently. No attributes = original instant behavior.
 *
 * **`<tab-button>` attributes:**
 *
 * - `disabled` — the tab cannot be activated by click, keyboard roving, or the
 *   `active` attribute. The component writes `aria-disabled="true"`.
 *
 * Tabs and panels may be added, removed, or reordered after mount; the
 * component re-pairs them by DOM index. Filler tabs/panels are generated only
 * once, at first connect.
 */
export default class TabGroup extends HTMLElement {
	/** The tab-list element within this tab group. */
	tabList: HTMLElement | null;

	/** Array of tab-button elements (recomputed on every DOM mutation). */
	tabButtons: HTMLElement[];

	/** Array of tab-panel elements (recomputed on every DOM mutation). */
	tabPanels: HTMLElement[];

	/**
	 * The active tab index. Setting it behaves exactly like setting the
	 * `active` attribute: no focus is moved, invalid or disabled indices are
	 * ignored, and a no-op set fires nothing.
	 */
	active: number;

	/** The index of the currently active tab, or -1 if there is none. */
	readonly activeIndex: number;

	/** Activates the tab at the given index and moves focus to it. */
	setActiveTab(index: number): void;

	addEventListener(
		type: 'tabchange',
		listener: (event: CustomEvent<TabChangeEventDetail>) => void,
		options?: boolean | AddEventListenerOptions,
	): void;
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions,
	): void;
}
