export interface TabChangeEventDetail {
	previousIndex: number;
	currentIndex: number;
	previousTab: HTMLElement;
	currentTab: HTMLElement;
	previousPanel: HTMLElement;
	currentPanel: HTMLElement;
}

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
