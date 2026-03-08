export interface TabChangeEventDetail {
	previousIndex: number;
	currentIndex: number;
	previousTab: HTMLElement;
	currentTab: HTMLElement;
	previousPanel: HTMLElement;
	currentPanel: HTMLElement;
}

/**
 * Accessible tab group web component.
 *
 * **Animation attributes** (set on the `<tab-group>` element):
 *
 * - `animate-out-class` — CSS class added to the outgoing panel during exit animation.
 *   Omit for instant hide.
 * - `animate-in-class` — CSS class added to the incoming panel during enter animation.
 *   Omit for instant show.
 * - `animate-timeout` — Fallback timeout in ms if `animationend` never fires (default `500`).
 *
 * Either animation attribute works independently. No attributes = original instant behavior.
 */
export default class TabGroup extends HTMLElement {
	/** The tab-list element within this tab group. */
	tabList: HTMLElement | null;

	/** Array of tab-button elements. */
	tabButtons: HTMLElement[];

	/** Array of tab-panel elements. */
	tabPanels: HTMLElement[];

	/** Activates the tab at the given index. */
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
