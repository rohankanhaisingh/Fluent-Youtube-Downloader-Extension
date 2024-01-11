import { v4 } from "uuid";

const connectionWarningText = document.querySelector("#connection-status-warning") as HTMLParagraphElement;
const connectionStatusText = document.querySelector("#connection-status span") as HTMLSpanElement;

export interface AuthenticationPostBody {
	readonly from: string;
	readonly userAgent: string;
	readonly protocol: string;
	readonly timestamp: number;
	readonly serverUrl: string;
	readonly serverPassword: string | null;
}

export interface ConvertRequestPostBody {
	readonly from: string;
	readonly userAgent: string;
	readonly protocol: string;
	readonly timestamp: number;
	readonly videoUrl: string;
	readonly videoQuality: string;
	readonly requestId: string
}

export interface StorageAuthenticationKeys {
	readonly serverUrl: string | undefined;
	readonly serverPassword: string | undefined;
}

export let baseUrl: URL | null = null;
export let isConnected: boolean = false;
export let lastConnected: number = Date.now();

export function urlContainsSpecialCharacters(url: string) {

	const specialCharacters: RegExp = /["\\/*?<>|]/;

	let hasSpecialCharacters: boolean = false;

	for (let character of url) {
		if (specialCharacters.test(character))
			hasSpecialCharacters = true;
	}

	return hasSpecialCharacters;
}

export function beginsWithProtocol(url: string) {

	return url.startsWith("http://") || url.startsWith("https://");
};

export function saveAuthenticationToLocalStorage(body: AuthenticationPostBody) {

	if (typeof chrome.storage === "undefined") return;

	chrome.storage.local.set(body);
}

export async function autoConnect(): Promise<null | StorageAuthenticationKeys> {

	if (typeof chrome.storage === "undefined") return null;

	const keys = await chrome.storage.local.get(["serverUrl", "serverPassword"]) as StorageAuthenticationKeys;

	if (keys.serverPassword === undefined || keys.serverUrl === undefined) return null;

	await connectToServer(keys.serverUrl, keys.serverPassword);

	return keys;
}

export async function connectToServer(serverUrl: string, serverPassword: string | null) {

	// Make sure that the extension is connected already.
	if (isConnected) {
		connectionWarningText.classList.add("visible");
		connectionWarningText.innerText = "The extension is already connected.";
		return;
	}

	// Check if the given url contains special characters.
	if (urlContainsSpecialCharacters(serverUrl) || beginsWithProtocol(serverUrl)) {
		connectionWarningText.classList.add("visible");
		connectionWarningText.innerText = "Cannot connect to server because the given URL contains invalid characters. The URL must look something like 'localhost:8000'.";
		return;
	}

	try {

		const constructedUrl = new URL("http://" + serverUrl + "/extension/connect");
		baseUrl = new URL("http://" + serverUrl);

		const postBody: AuthenticationPostBody = {
			from: location.href,
			userAgent: navigator.userAgent,
			protocol: location.protocol,
			timestamp: Date.now(),
			serverUrl, serverPassword
		};

		// Make request.
		const request = await fetch(constructedUrl, {
			method: "POST",
			body: JSON.stringify(postBody),
			headers: {
				"Content-Type": "application/json"
			}
		});

		// Parse text from request.
		const requestText = await request.text();

		// Status should be either 500 or 200.
		if (request.status === 500) {

			connectionWarningText.classList.add("visible");
			connectionWarningText.innerText = requestText;
			return;
		}

		// Save authentication data to local storage.
		saveAuthenticationToLocalStorage(postBody);

		lastConnected = Date.now();
		connectionStatusText.innerText = "Connected";
		isConnected = true;
	} catch (err) {

		connectionWarningText.classList.add("visible");
		connectionWarningText.innerText = (err as Error).message;
	}
} 

export async function getActiveConversionThread(): Promise<ConvertRequestPostBody | null> {

	if (!isConnected || baseUrl === null) return null;

	const request = await fetch(new URL(baseUrl + "extension/active-thread"), {
		method: "GET"
	});

	const responseData: ConvertRequestPostBody | null = await request.json();

	return responseData;
}

export async function sendConvertRequest(videoUrl: string, videoQuality: string) {

	if (!isConnected || baseUrl === null) return;

	const requestId: string = v4();

	const postBody: ConvertRequestPostBody = {
		from: location.href,
		userAgent: navigator.userAgent,
		protocol: location.protocol,
		timestamp: Date.now(),
		videoUrl, videoQuality, requestId
	};

	const request = await fetch(new URL(baseUrl + "extension/convert"), {
		method: "POST",
		body: JSON.stringify(postBody),
		headers: {
			"Content-Type": "application/json"
		}
	});

	console.log(request.status);
}