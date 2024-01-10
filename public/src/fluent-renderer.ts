const loadedStyleSheets: { [K: string]: CSSStyleSheet } = {};

export type OnAttributeChangeCallback = (oldValue: string | null, newValue: string | null, record: MutationRecord) => void;
export type FluentComponentType = "FluentButton" | "FluentSelect" | "FluentInput" | "FluentToggle" | "FluentSpinner";

declare global {
	interface HTMLElement {
		componentType: FluentComponentType | undefined;
	}
}

export class OktaiDeBoktai extends HTMLElement{
	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });
		shadowRoot.innerHTML = "<span>Click me</span>";

		shadowRoot.querySelector("span")?.addEventListener("click", function (e) {
			console.log(e);
		});
	}

	static initialize(): void {
		return customElements.define("oktai-de-boktai", OktaiDeBoktai);
	}
}

export class FluentButton extends HTMLElement {

	public componentType: FluentComponentType = "FluentButton";

	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });

		const buttonElement = document.createElement("button");
		buttonElement.setAttribute("part", "control");
		buttonElement.innerHTML = "<span part='content'><slot></slot></span>";

		shadowRoot.appendChild(buttonElement);
		
		FluentButton.getCss().then(css => FluentButton.setCss(shadowRoot, css));
	}

	static setCss(shadowRoot: ShadowRoot, css: string) {

		const styleSheet = new CSSStyleSheet();
		styleSheet.replaceSync(css);

		shadowRoot.adoptedStyleSheets.push(styleSheet);
	}

	static getCss(): Promise<string> {

		return new Promise(function (resolve, reject) {

			resolve(":host{width:auto;height:auto;min-height:calc(8*var(--design-unit)*1px);position:relative;box-sizing:border-box;outline:none;font-family:var(--default-font-family);font-size:var(--base-font-size);border-radius:var(--border-radius);display:inline-flex;user-select:none}:host>button[part=control]{width:100%;background:padding-box linear-gradient(var(--control-background-color), var(--control-background-color)),border-box linear-gradient(var(--control-primary-border-color), var(--control-secondary-border-color));border:1px solid rgba(0,0,0,0);box-sizing:border-box;display:inline-flex;justify-content:center;line-height:34px;align-items:center;padding:var(--fluent-button-padding);white-space:nowrap;outline:none;text-decoration:none;color:var(--control-primary-text-color);border-radius:inherit;fill:inherit;cursor:inherit;font-family:inherit}:host>button[part=control]:not(:active):hover{background:padding-box linear-gradient(var(--control-background-color-hover), var(--control-background-color-hover)),border-box linear-gradient(var(--control-primary-border-color-hover), var(--control-secondary-border-color-hover));color:var(--control-secondary-text-color)}:host ::slotted(:not(b,i,span,italic,bold,p,h1,h2,h3,h4,h5,h6,u)){display:none}");
		});
	}

	static initialize() {
		customElements.define("fluent-button", FluentButton);
	}
}

export class FluentSelect extends HTMLElement {

	public componentType: FluentComponentType = "FluentSelect";

	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });

		FluentSelect.constructElement(shadowRoot);
		FluentSelect.setEventListeners(shadowRoot, this);
		FluentSelect.getCss().then(css => FluentSelect.setCss(shadowRoot, css));

		const fluentOptionElements: NodeListOf<HTMLElement> = this.querySelectorAll("fluent-option"),
			firstOptionElement: HTMLElement = fluentOptionElements[0];

		const currentValueElement: HTMLDivElement | null = shadowRoot.querySelector("[part=current-value]");

		if (currentValueElement !== null) {

			firstOptionElement.setAttribute("active", "");

			const currentValue: string | null = firstOptionElement.getAttribute("value");

			if (currentValue !== null) {

				(currentValueElement.querySelector("span") as HTMLSpanElement).innerText = firstOptionElement.innerText;
				this.setAttribute("value", currentValue);
			}
		}
	
	}

	/**
	 * Public method part of the Fluent Select web component.
	 * Finds the option based on the specified value and enables it.
	 * It will return null if the specified value has not been found.
	 * @param optionValue
	 */
	public setOptionValue(optionValue: string): null | Element {

		const shadowRoot: ShadowRoot | null = this.shadowRoot;

		if (shadowRoot === null) return null;

		const currentValueElement: HTMLDivElement | null = shadowRoot.querySelector("[part=current-value]"),
			dropdownElement: HTMLDivElement | null = shadowRoot.querySelector("[part=dropdown]");

		if (currentValueElement === null || dropdownElement === null) return null;

		const slotElement: HTMLSlotElement | null = dropdownElement.querySelector("slot");

		if (slotElement === null) return null;

		const slottedItems: Element[] = slotElement.assignedElements();
		const foundItem = slottedItems.filter(item => item.getAttribute("value") === optionValue);

		if (foundItem.length !== 1) return null;

		slottedItems.forEach(_node => _node.removeAttribute("active"));

		const actualItem: Element = foundItem[0],
			itemValue: string | null = actualItem.getAttribute("value");

		(currentValueElement.querySelector("span") as HTMLSpanElement).innerText = actualItem.innerHTML;
		actualItem.setAttribute("active", "true");

		this.setAttribute("value", itemValue !== null ? itemValue : "");

		return actualItem;
	}

	// Static functions

	static setEventListeners(shadowRoot: ShadowRoot, mainElement: FluentSelect) {

		const currentValueElement: HTMLDivElement | null = shadowRoot.querySelector("[part=current-value]"),
			dropdownElement: HTMLDivElement | null = shadowRoot.querySelector("[part=dropdown]");

		if (currentValueElement === null || dropdownElement === null) return;

		currentValueElement.addEventListener("click", function () {
			if (!mainElement.classList.contains("in-dropdown"))
				mainElement.classList.add("in-dropdown");
		});

		const slotElement: HTMLSlotElement | null = dropdownElement.querySelector("slot");

		if (slotElement === null) return;

		const slottedItems: Element[] = slotElement.assignedElements();

		slottedItems.forEach(function (node: Element) {

			node.addEventListener("click", function () {

				slottedItems.forEach(_node => _node.removeAttribute("active"));

				node.setAttribute("active", "");

				const nodeValue: string | null = node.getAttribute("value");

				(currentValueElement.querySelector("span") as HTMLSpanElement)
					.innerText = node.innerHTML;

				mainElement.setAttribute("value", nodeValue !== null ? nodeValue : "");

				if (mainElement.classList.contains("in-dropdown"))
					mainElement.classList.remove("in-dropdown");
			});
		});
	}

	static constructElement(shadowRoot: ShadowRoot) {
		const controlElement = document.createElement("div");
		controlElement.setAttribute("part", "control");

		const currentValueElement = document.createElement("div");
		currentValueElement.setAttribute("part", "current-value");
		currentValueElement.innerHTML = "<span></span><img src='/static/media/icons/windows-icon-down.png' alt='Dropdown'/>";

		const dropdownElement = document.createElement("div");
		dropdownElement.setAttribute("part", "dropdown");
		dropdownElement.innerHTML = "<slot></slot>";

		controlElement.appendChild(currentValueElement);
		controlElement.appendChild(dropdownElement);
		shadowRoot.appendChild(controlElement);
	}

	static setCss(shadowRoot: ShadowRoot, css: string) {

		const styleSheet = new CSSStyleSheet();
		styleSheet.replaceSync(css);

		shadowRoot.adoptedStyleSheets.push(styleSheet);
	}

	static getCss(): Promise<string> {
		return new Promise(function (resolve, reject) {
			resolve(`@keyframes fadein{0%{opacity:0;-moz-transform:scale(0.98);-ms-transform:scale(0.98);-o-transform:scale(0.98);-webkit-transform:scale(0.98);transform:scale(0.98)}100%{opacity:1;-moz-transform:none;-ms-transform:none;-o-transform:none;-webkit-transform:none;transform:none}}:host{width:auto;height:auto;position:relative;box-sizing:border-box;outline:none;font-family:var(--default-font-family);font-size:var(--base-font-size);border-radius:var(--border-radius);display:inline-flex;user-select:none}:host>div[part=control]{width:100%;height:auto;min-width:var(--fluent-select-min-width);min-height:var(--fluent-select-min-height);background:padding-box linear-gradient(var(--control-background-color), var(--control-background-color)),border-box linear-gradient(var(--control-primary-border-color), var(--control-secondary-border-color));padding:var(--fluent-select-padding);border:1px solid rgba(0,0,0,0);border-radius:inherit;box-sizing:border-box;display:inline-flex;justify-content:left}:host>div[part=control]>div[part=current-value]{width:100%;height:100%;display:grid;grid-template-columns:auto var(--fluent-select-min-height);gap:var(--fluent-select-gap);align-items:center}:host>div[part=control]>div[part=current-value]>span{text-overflow:ellipsis;overflow:hidden;white-space:nowrap}:host>div[part=control]>div[part=current-value]>img{width:100%;height:100%;pointer-events:none;user-select:none;width:var(--fluent-select-icon-size);height:var(--fluent-select-icon-size);margin:auto;-moz-filter:var(--icon-filter);-webkit-filter:var(--icon-filter);filter:var(--icon-filter)}:host>div[part=control]>div[part=dropdown]{width:100%;height:auto;position:absolute;left:0;top:0;z-index:1;display:none;grid-auto-rows:var(--fluent-select-grid-auto-rows);padding:var(--fluent-select-padding);background:padding-box linear-gradient(var(--control-background-color), var(--control-background-color)),border-box linear-gradient(var(--control-primary-border-color), var(--control-secondary-border-color));box-sizing:border-box;border:1px solid rgba(0,0,0,0);border-radius:inherit;box-shadow:0 0 10px rgba(0, 0, 0, var(--fluent-select-box-shadow-opacity));-moz-animation:fadein var(--transition-duration) var(--transition-key);-o-animation:fadein var(--transition-duration) var(--transition-key);-webkit-animation:fadein var(--transition-duration) var(--transition-key);animation:fadein var(--transition-duration) var(--transition-key)}:host>div[part=control]>div[part=dropdown] ::slotted(fluent-option){width:calc(100% - 10px);height:var(--fluent-select-option-height);position:relative;content:"";padding:var(--fleunt-select-option-padding);border-radius:var(--border-radius)}:host>div[part=control]>div[part=dropdown] ::slotted(fluent-option)::before{width:1px;height:0;position:absolute;top:0;bottom:0;left:0;content:"";margin:auto;border-radius:5px;background:var(--accent-color);z-index:1;-moz-transition:height var(--transition-duration),width var(--transition-duration) var(--transition-key);-o-transition:height var(--transition-duration),width var(--transition-duration) var(--transition-key);-webkit-transition:height var(--transition-duration),width var(--transition-duration) var(--transition-key);transition:height var(--transition-duration),width var(--transition-duration) var(--transition-key)}:host>div[part=control]>div[part=dropdown] ::slotted(fluent-option:not([active]):hover){background:var(--control-background-color-hover)}:host>div[part=control]>div[part=dropdown] ::slotted(fluent-option:not([active]):hover)::before{height:30%}:host>div[part=control]>div[part=dropdown] ::slotted(fluent-option:not([active]):active)::before{height:30%;width:3px}:host>div[part=control]>div[part=dropdown] ::slotted(fluent-option[active]){background:var(--control-background-color-active)}:host>div[part=control]>div[part=dropdown] ::slotted(fluent-option[active])::before{height:60%;width:3px}:host(.in-dropdown)>div[part=control]>div[part=dropdown]{display:grid}`);
		});
	}

	static initialize() {
		customElements.define("fluent-select", FluentSelect);
	}
}

export class FluentInput extends HTMLElement {

	public componentType: FluentComponentType = "FluentInput";

	private attributeChangeEvents: { [K: string]: OnAttributeChangeCallback } = {}; 
	private mutationObserver = new MutationObserver(mutations => this.handleObserverMutation(mutations));

	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });

		this.mutationObserver.observe(this, { attributeFilter: ["value"] });

		FluentInput.constructElement(shadowRoot);
		FluentInput.getCss().then(css => FluentInput.setCss(shadowRoot, css));
		FluentInput.setEventListeners(shadowRoot, this);
		FluentInput.setAttributes(shadowRoot, this);
	}

	private handleObserverMutation(mutationRecord: MutationRecord[]) {

		const self: FluentInput = this;

		mutationRecord.forEach(function (record: MutationRecord) {

			if (record.attributeName === null) return;

			const oldValue: string | null = record.oldValue,
				newValue: string | null = self.getAttribute(record.attributeName);

			if (typeof self.attributeChangeEvents[record.attributeName] === "function")
				self.attributeChangeEvents[record.attributeName](oldValue, newValue, record);
		});
	}

	public setValue(value: string) {

		const shadowRoot: ShadowRoot | null = this.shadowRoot;

		if (shadowRoot === null) return;

		const inputField: HTMLInputElement | null = shadowRoot.querySelector("[part=input]");

		if (inputField === null) return;

		inputField.setAttribute("value", value);
		this.setAttribute("value", value);
	}

	public onAttributeChange(attributeName: string, cb: OnAttributeChangeCallback): FluentInput {

		this.attributeChangeEvents[attributeName] = cb;

		return this;
	}

	static constructElement(shadowRoot: ShadowRoot) {
		const controlElement = document.createElement("div");
		controlElement.setAttribute("part", "control");

		const contentElement = document.createElement("span");
		contentElement.setAttribute("part", "content");

		const inputElement = document.createElement("input");
		inputElement.setAttribute("part", "input");

		contentElement.appendChild(inputElement);
		controlElement.appendChild(contentElement);
		shadowRoot.appendChild(controlElement);
	}

	static setAttributes(shadowRoot: ShadowRoot, mainElement: FluentInput) {

		const inputField: HTMLInputElement | null = shadowRoot.querySelector("[part=input]");

		if (inputField === null) return;

		const reservedAttributes = ["id", "class"];

		const allAttributes: string[] = mainElement.getAttributeNames();

		allAttributes.forEach(function (attributeName: string) {

			if (reservedAttributes.includes(attributeName)) return;

			const attributeValue: string | null = mainElement.getAttribute(attributeName);

			if (attributeValue === null) return;

			inputField.setAttribute(attributeName, attributeValue);
		});
	}

	static setEventListeners(shadowRoot: ShadowRoot, mainElement: FluentInput) {

		const inputElement: HTMLInputElement | null = shadowRoot.querySelector("[part=input]");

		if (inputElement === null) return;

		inputElement.addEventListener("focus", function () {

			if (!mainElement.classList.contains("focused"))
				mainElement.classList.add("focused");
		});

		inputElement.addEventListener("blur", function () {

			if (mainElement.classList.contains("focused"))
				mainElement.classList.remove("focused");
		});

		inputElement.addEventListener("input", function () {

			mainElement.setAttribute("value", inputElement.value);
		});
	}

	static setCss(shadowRoot: ShadowRoot, css: string) {

		const styleSheet = new CSSStyleSheet();
		styleSheet.replaceSync(css);

		shadowRoot.adoptedStyleSheets.push(styleSheet);
	}

	static getCss(): Promise<string> {
		return new Promise(function (resolve, reject) {
			resolve(`@keyframes fluent-input-stroke-animation{0%{width:var(--fluent-input-stroke-start-size);opacity:0}100%{width:calc(100% - var(--fluent-input-stroke-size)*2);opacity:1}}:host{width:auto;height:auto;min-height:calc(8*var(--design-unit)*1px);position:relative;box-sizing:border-box;outline:none;font-family:var(--default-font-family);font-size:var(--base-font-size);border-radius:var(--border-radius);display:inline-flex;user-select:none}:host>div[part=control]{width:100%;display:contents;border-radius:inherit}:host>div[part=control]>span[part=content]{width:100%;height:100%;display:block;position:relative;content:"";border-radius:inherit}:host>div[part=control]>span[part=content]>input[part=input]{width:100%;height:auto;min-height:var(--fluent-input-min-height);background:padding-box linear-gradient(var(--control-background-color), var(--control-background-color)),border-box linear-gradient(var(--control-primary-border-color), var(--control-secondary-border-color));border:1px solid rgba(0,0,0,0);box-sizing:border-box;display:inline-flex;justify-content:center;line-height:34px;align-items:center;padding:var(--fluent-input-padding);white-space:nowrap;outline:none;text-decoration:none;color:var(--control-primary-text-color);border-radius:inherit;fill:inherit;cursor:inherit;font-family:inherit}:host>div[part=control]>span[part=content]>input[part=input]:not(:focus):hover{background:padding-box linear-gradient(var(--control-background-color-hover), var(--control-background-color-hover)),border-box linear-gradient(var(--control-primary-border-color-hover), var(--control-secondary-border-color-hover));color:var(--control-secondary-text-color)}:host>div[part=control]>span[part=content]::before{width:calc(100% - var(--fluent-input-stroke-size)*2);height:100%;position:absolute;display:none;pointer-events:none !important;user-select:none !important;content:"";left:0;right:0;bottom:0;margin:auto;border:var(--fluent-input-stroke-size) solid rgba(0,0,0,0);border-bottom-color:var(--accent-color);border-radius:var(--border-radius);-moz-animation:fluent-input-stroke-animation var(--transition-duration) var(--transition-key);-o-animation:fluent-input-stroke-animation var(--transition-duration) var(--transition-key);-webkit-animation:fluent-input-stroke-animation var(--transition-duration) var(--transition-key);animation:fluent-input-stroke-animation var(--transition-duration) var(--transition-key)}:host(.focused)>div[part=control]>span[part=content]::before{display:block}`);
		});
	}

	static initialize() {
		customElements.define("fluent-input", FluentInput);
	}
}

export class FluentToggle extends HTMLElement {

	public componentType: FluentComponentType = "FluentToggle";

	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });

		FluentToggle.constructElement(shadowRoot);
		FluentToggle.setEventListeners(shadowRoot, this);
		FluentToggle.getCss().then(css => FluentToggle.setCss(shadowRoot, css));
	}

	// Public methods
	public setActive() {

		if (!this.classList.contains("active"))
			this.classList.add("active");

		FluentToggle.setActiveAttribute(this);
		FluentToggle.changeLabelOnClick(this);
		FluentToggle.dispatchCustomEvent(this, "true");
	}

	public setInactive() {

		if (this.classList.contains("active"))
			this.classList.remove("active");

		FluentToggle.setActiveAttribute(this);
		FluentToggle.changeLabelOnClick(this);
		FluentToggle.dispatchCustomEvent(this, "false");

	}

	static dispatchCustomEvent(mainElement: FluentToggle, attributeValue: string) {

		const event = new CustomEvent("active", {
			bubbles: true,
			detail: { attributeValue}
		});

		mainElement.dispatchEvent(event);
	}

	static changeLabelOnClick(mainElement: FluentToggle) {

		const hasActiveClass: boolean = mainElement.classList.contains("active");

		const forAttribute: string | null = mainElement.getAttribute("for");

		if (forAttribute === null) return;

		const targetElement: HTMLElement | null = document.querySelector(forAttribute);

		if (targetElement === null) return;

		const activeValueAttribute: string | null = mainElement.getAttribute("active-value"),
			inActiveValueAttribute: string | null = mainElement.getAttribute("inactive-value");

		if (activeValueAttribute === null || inActiveValueAttribute === null) return;

		const triggerValue: string = hasActiveClass ? activeValueAttribute : inActiveValueAttribute;

		targetElement.innerText = triggerValue;
	}

	static setActiveAttribute(mainElement: FluentToggle) {

		const hasActiveClass: boolean = mainElement.classList.contains("active");

		if (hasActiveClass)
			return mainElement.setAttribute("active", "true");

		mainElement.setAttribute("active", "false");
	}

	static setEventListeners(shadowRoot: ShadowRoot, mainElement: FluentToggle) {

		mainElement.addEventListener("click", function () {

			if (!mainElement.classList.contains("active")) {

				mainElement.classList.add("active");
				FluentToggle.dispatchCustomEvent(mainElement, "true");
			} else {

				mainElement.classList.remove("active");
				FluentToggle.dispatchCustomEvent(mainElement, "false");
			}

			FluentToggle.setActiveAttribute(mainElement);
			FluentToggle.changeLabelOnClick(mainElement);
		});
	}

	static constructElement(shadowRoot: ShadowRoot) {
		const controlElement = document.createElement("div");
		controlElement.setAttribute("part", "control");

		const thumbElement = document.createElement("div");
		thumbElement.setAttribute("part", "thumb");

		controlElement.appendChild(thumbElement);
		shadowRoot.appendChild(controlElement);
	}

	static setCss(shadowRoot: ShadowRoot, css: string) {

		const styleSheet = new CSSStyleSheet();
		styleSheet.replaceSync(css);

		shadowRoot.adoptedStyleSheets.push(styleSheet);
	}

	static getCss(): Promise<string> {
		return new Promise(function (resolve, reject) {
			return resolve(`:host{width:auto;height:auto;position:relative;box-sizing:border-box;outline:none;font-family:var(--default-font-family);font-size:var(--base-font-size);border-radius:var(--fluent-toggle-border-radius);display:inline-flex;user-select:none}:host>div[part=control]{border:1px solid var(--control-secondary-border-color);background:none;width:var(--fluent-toggle-width);height:var(--fluent-toggle-height);padding:var(--fluent-toggle-padding);border-radius:inherit;fill:inherit;cursor:inherit;outline:none;white-space:nowrap;align-items:center;display:inline-flex;-moz-transition:all var(--transition-duration) var(--transition-key);-o-transition:all var(--transition-duration) var(--transition-key);-webkit-transition:all var(--transition-duration) var(--transition-key);transition:all var(--transition-duration) var(--transition-key)}:host>div[part=control]>div[part=thumb]{width:var(--fluent-toggle-thumb-size);height:var(--fluent-toggle-thumb-size);background:var(--accent-color);border-radius:50%;-moz-transition:all var(--transition-duration) var(--transition-key);-o-transition:all var(--transition-duration) var(--transition-key);-webkit-transition:all var(--transition-duration) var(--transition-key);transition:all var(--transition-duration) var(--transition-key)}:host(:hover)>div[part=control]>div[part=thumb]{width:var(--fluent-toggle-thumb-width-hover)}:host(.active)>div[part=control]{background:var(--accent-color)}:host(.active)>div[part=control]>div[part=thumb]{-moz-transform:translateX(calc(var(--fluent-toggle-width) - var(--fluent-toggle-horizontal-padding) * 2));-ms-transform:translateX(calc(var(--fluent-toggle-width) - var(--fluent-toggle-horizontal-padding) * 2));-o-transform:translateX(calc(var(--fluent-toggle-width) - var(--fluent-toggle-horizontal-padding) * 2));-webkit-transform:translateX(calc(var(--fluent-toggle-width) - var(--fluent-toggle-horizontal-padding) * 2));transform:translateX(calc(var(--fluent-toggle-width) - var(--fluent-toggle-horizontal-padding) * 2));background:var(--fluent-toggle-active-color)}`);
		});
	}

	static initialize() {
		customElements.define("fluent-toggle", FluentToggle);
	}
}

export class FluentSpinner extends HTMLElement {

	public componentType: FluentComponentType = "FluentSpinner";

	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });

		FluentSpinner.constructElement(shadowRoot, this);
		FluentSpinner.getCss().then(css => FluentSpinner.setCss(shadowRoot, css));
	}

	static constructElement(shadowRoot: ShadowRoot, mainElement: FluentSpinner) {

		const spinnerElement = document.createElement("svg");
		spinnerElement.setAttribute("part", "spinner");
		spinnerElement.setAttribute("viewBox", "0 0 16 16");

		const backgroundCircleElement = document.createElement("circle");
		backgroundCircleElement.setAttribute("part", "background");
		backgroundCircleElement.setAttribute("cx", "8px");
		backgroundCircleElement.setAttribute("cy", "8px");
		backgroundCircleElement.setAttribute("r", "7px");

		const indicatorCircleElemenet = document.createElement("circle");
		indicatorCircleElemenet.setAttribute("part", "indicator");
		indicatorCircleElemenet.setAttribute("cx", "8px");
		indicatorCircleElemenet.setAttribute("cy", "8px");
		indicatorCircleElemenet.setAttribute("r", "7px");

		spinnerElement.appendChild(backgroundCircleElement);
		spinnerElement.appendChild(indicatorCircleElemenet);
		shadowRoot.appendChild(spinnerElement);
	}

	static setCss(shadowRoot: ShadowRoot, css: string) {

		const styleSheet = new CSSStyleSheet();
		styleSheet.replaceSync(css);

		shadowRoot.adoptedStyleSheets.push(styleSheet);
	}

	static getCss(): Promise<string> {
		return new Promise(function (resolve, reject) {
			return resolve(`@keyframes fluent-spinner-animation{0%{stroke-dasharray:.01px,43.97px;transform:rotate(0deg)}50%{stroke-dasharray:21.99px,21.99px;transform:rotate(450deg)}100%{stroke-dasharray:.01px,43.97px;transform:rotate(1080deg)}}:host{align-items:center;outline:none;display:flex;width:32px;height:32px}:host>svg[part=spinner]{height:100%;width:100%}:host>svg[part=spinner]>circle[part=background]{fill:none;stroke-width:2px}:host>svg[part=spinner]>circle[part=indicator]{stroke:var(--accent-color);fill:none;stroke-width:2px;stroke-linecap:round;transform-origin:50% 50%;transform:rotate(-90deg);transition:all .2s ease-in-out 0s;animation:2s linear 0s infinite normal none running fluent-spinner-animation}`);
		});
	}

	static initialize() {
		customElements.define("fluent-spinner", FluentSpinner);
	}
}

export function isFluentComponent(component: HTMLElement): FluentComponentType | boolean {

	if (typeof component.componentType === "string")
		return component.componentType;

	return false;
}

export function initializeFluentDesignSystem() {

	FluentButton.initialize();
	FluentSelect.initialize();
	FluentInput.initialize();
	FluentToggle.initialize();
	FluentSpinner.initialize();
	OktaiDeBoktai.initialize();
}