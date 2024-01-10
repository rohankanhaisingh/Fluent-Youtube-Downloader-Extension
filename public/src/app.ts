import "./styles/app.scss";

import { FluentInput, initializeFluentDesignSystem } from "./fluent-renderer";

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

async function main() {

	initializeFluentDesignSystem();

	loadCurrentTab().then(function (tab) {
		if (tab !== null) displayActiveVideoURL(tab);
	});
}
window.addEventListener("DOMContentLoaded", main);