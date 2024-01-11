import "./styles/app.scss";

import { FluentButton, FluentInput, FluentSelect, initializeFluentDesignSystem } from "./fluent-renderer";
import { autoConnect, connectToServer, sendConvertRequest, StorageAuthenticationKeys } from "./connection";

const connectToServerButton = document.querySelector<FluentButton>("#server-connect-button"),
	serverPasswordInput = document.querySelector<FluentInput>("#server-password"),
	serverUrlInput = document.querySelector<FluentInput>("#server-url"),
	connectionWarningText = document.querySelector<HTMLParagraphElement>("#connection-status-warning"),
	downloadButton = document.querySelector<FluentButton>("#download-button"),
	videoUrlInput = document.querySelector<FluentInput>("#video-url"),
	videoQualitySelect = document.querySelector<FluentSelect>("#video-quality");

function isNull(variables: any[]): boolean {

	let variableIsNull: boolean = false;

	for (let variable of variables)
		if (variable === null) variableIsNull = true;

	return variableIsNull;
}

function isYoutubeUrl(url: string): boolean {

	const urlPatterns: RegExp[] = [
		/https:\/\/www\.youtube\.com\/watch\?v=/,
		/https:\/\/www\.youtube\.com\/embed\//,
		/https:\/\/youtu\.be\//
	];

	// Check if the given URL match any of the URL patterns.
	return urlPatterns.some(function (pattern) {
		return pattern.test(url);
	});
}

async function loadCurrentTab(): Promise<chrome.tabs.Tab | null> {

	if (typeof chrome.tabs === "undefined") return null;

	// Get current page URL
	const activeTabs: chrome.tabs.Tab[] = await chrome.tabs.query({ active: true, currentWindow: true });

	// Return null if no tabs has been found.
	if (activeTabs.length === 0) return null;

	return activeTabs[0];
}

function displayActiveVideoURL(tab: chrome.tabs.Tab) {

	// First check if the URL is a YouTube URL.
	if (!isYoutubeUrl(tab.url as string)) return;

	// Get the video title element.
	const videoTitleElement = document.querySelector<HTMLDivElement>("#video-title"),
		videoUrlElement = document.querySelector<FluentInput>("#video-url");

	// Safe catching null references.
	if (videoTitleElement === null || videoUrlElement === null) return;

	const titleSpanElement = videoTitleElement.querySelector<HTMLSpanElement>("span");

	if (titleSpanElement === null) return;

	titleSpanElement.innerText = tab.title as string;
	videoUrlElement.setValue(tab.url as string);
}

function handleConnectButton() {

	if (connectToServerButton === null || serverPasswordInput === null || serverUrlInput === null || connectionWarningText === null) return;

	connectToServerButton.addEventListener("click", function () {

		const serverPassword: string | null = (serverPasswordInput as FluentInput).getAttribute("value");
		const serverUrl: string | null = (serverUrlInput as FluentInput).getAttribute("value");

		// Reset the warning text state.
		connectionWarningText.classList.remove("visible");

		// The server can be null if the server does not require a password to connect.
		// But the URL must be given correctly.
		if (serverUrl === null || serverUrl === "") {

			(connectionWarningText as HTMLParagraphElement).classList.add("visible");
			(connectionWarningText as HTMLParagraphElement).innerText = "The given URL must be a string type. It cannot be 'null' or an empty string.";
			return;
		}

		connectToServer(serverUrl, serverPassword);
	});
}

function handleDownloadButton() {

	if (downloadButton === null || videoUrlInput === null || videoQualitySelect === null) return;

	downloadButton.addEventListener("click", function () {

		const videoUrl: string | null = videoUrlInput.getAttribute("value"),
			videoQuality: string | null = videoQualitySelect.getAttribute("value");

		if (videoQuality === null || videoUrl === null) return;

		sendConvertRequest(videoUrl, videoQuality);
	});
}

async function main() {

	initializeFluentDesignSystem();

	// Automatically connect to Fluent Youtube Downloader extension server.
	const isConnected: null | StorageAuthenticationKeys = await autoConnect();

	if (isConnected !== null)
		serverPasswordInput?.setValue(isConnected.serverPassword as string);

	loadCurrentTab().then(function (tab) {
		if (tab !== null) displayActiveVideoURL(tab);
	});

	handleConnectButton();
	handleDownloadButton();
}
window.addEventListener("DOMContentLoaded", main);