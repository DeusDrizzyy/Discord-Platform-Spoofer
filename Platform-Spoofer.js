(() => {
	"use strict";

	const KEY = "__Platform-Spoofer";
	const ROOT_ID = "platform-spoofer-root";
	const STYLE_ID = "platform-spoofer-style";
	const IDENTIFY = 2;

	const PLATFORMS = Object.freeze({
		windows: { label: "Windows", description: "Discord Desktop", browser: "Discord Client" },
		web: { label: "Web", description: "Discord Web", browser: "Discord Web" },
		android: { label: "Android", description: "Discord Mobile", browser: "Discord Android" },
		ios: { label: "iOS", description: "Discord Mobile", browser: "Discord iOS" },
		xbox: { label: "Xbox", description: "Discord Console", browser: "Discord Embedded" },
		playstation: { label: "PlayStation", description: "Discord Console", browser: "Discord Embedded" },
		vr: { label: "VR", description: "Discord VR", browser: "Discord VR" },
	});

	const previous = window[KEY];
	const hadPrevious = Boolean(previous);

	try {
		previous?.destroy?.(false);
	} catch {}

	document.getElementById(ROOT_ID)?.remove();
	document.getElementById(STYLE_ID)?.remove();

	const chunks = window.webpackChunkdiscord_app;
	if (!chunks?.push) throw new Error("[Platform-Spoofer] Webpack runtime not found.");

	let _mods = webpackChunkdiscord_app.push([[Symbol()], {}, r => r.c]);
	webpackChunkdiscord_app.pop();

	if (!_mods) throw new Error("[Platform-Spoofer] Webpack cache not found.");

	const findByProps = (...props) => {
		for (const module of Object.values(_mods)) {
			try {
				const exports = module?.exports;
				if (!exports || exports === window) continue;
				const candidates = [exports, exports.default, ...Object.values(exports)];

				for (const target of candidates) {
					if (target && target !== window && target[Symbol.toStringTag] !== "IntlMessagesProxy" && props.every(prop => prop in Object(target))) {
						return target;
					}
				}
			} catch {}
		}

		return null;
	};

	const Gateway = findByProps("getSocket");
	if (!Gateway || typeof Gateway.getSocket !== "function") throw new Error("[Platform-Spoofer] Gateway module not found.");

	const socket = Gateway.getSocket();
	if (!socket || typeof socket.send !== "function") throw new Error("[Platform-Spoofer] Gateway socket not found.");

	const originalSend = socket.send;
	const controller = new AbortController();
	const { signal } = controller;

	let platform = "windows";
	let root = null;
	let destroyed = false;

	const patchedSend = function (op, data, ...args) {
		if (op === IDENTIFY && data?.properties) {
			const browser = PLATFORMS[platform].browser;

			if (data.properties.browser !== browser) {
				data = { ...data, properties: { ...data.properties, browser } };
			}
		}

		return Reflect.apply(originalSend, this, [op, data, ...args]);
	};

	const reconnect = () => {
		const current = Gateway.getSocket();
		if (!current) return false;

		current.sessionId = null;
		current.seq = 0;

		const ws = current.webSocket;
		if (ws && ws.readyState < WebSocket.CLOSING) {
			ws.close(1000);
			return true;
		}

		return false;
	};

	const syncMenu = () => {
		if (!root) return;

		for (const button of root.querySelectorAll("[data-platform]")) {
			const selected = button.dataset.platform === platform;

			button.dataset.selected = String(selected);
			button.setAttribute("aria-pressed", String(selected));
		}

		const status = root.querySelector("[data-current]");
		if (status) status.textContent = PLATFORMS[platform].label;
	};

	const setPlatform = value => {
		if (destroyed) return false;
		value = String(value).toLowerCase();

		if (value === "desktop") value = "windows";
		if (!Object.hasOwn(PLATFORMS, value)) return false;
		if (platform === value) return true;

		platform = value;

		syncMenu();
		reconnect();

		console.log(`[Platform-Spoofer] Platform changed to ${PLATFORMS[platform].label}.`);
		return true;
	};

	const createMenu = () => {
		if (root) return root;
		const style = document.createElement("style");

		style.id = STYLE_ID;
		style.textContent = `
			#${ROOT_ID} { position: fixed; inset: 0; z-index: 1000000; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(0, 0, 0, .6); font-family: var(--font-primary, "gg sans", sans-serif); color: var(--text-default, var(--text-normal, #dbdee1)); }
			#${ROOT_ID}[hidden] { display: none; }
			#${ROOT_ID} * { box-sizing: border-box; }
			#${ROOT_ID} .ps-modal { width: min(460px, 100%); background: var(--modal-background, var(--background-primary, #313338)); border: 1px solid var(--border-subtle, rgba(255, 255, 255, .08)); border-radius: 12px; box-shadow: var(--elevation-high, 0 12px 32px rgba(0, 0, 0, .4)); overflow: hidden; }
			#${ROOT_ID} .ps-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 20px 20px 16px; }
			#${ROOT_ID} .ps-title { margin: 0; font-size: 20px; line-height: 24px; font-weight: 700; color: var(--header-primary, var(--text-default, #f2f3f5)); }
			#${ROOT_ID} .ps-subtitle { margin: 4px 0 0; font-size: 14px; line-height: 18px; color: var(--text-muted, var(--header-secondary, #b5bac1)); }
			#${ROOT_ID} button { font: inherit; }
			#${ROOT_ID} .ps-close { width: 32px; height: 32px; border: 0; border-radius: 6px; background: transparent; color: var(--interactive-normal, #b5bac1); font-size: 22px; line-height: 30px; cursor: pointer; }
			#${ROOT_ID} .ps-close:hover { background: var(--background-modifier-hover, rgba(255,255,255,.06)); color: var(--interactive-hover, #dbdee1); }
			#${ROOT_ID} .ps-current { margin: 0 20px 14px; padding: 10px 12px; border-radius: 8px; background: var(--background-secondary, var(--background-base-lower, #2b2d31)); color: var(--text-muted, #b5bac1); font-size: 13px; }
			#${ROOT_ID} .ps-current strong { color: var(--text-default, #dbdee1); font-weight: 600; }
			#${ROOT_ID} .ps-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; padding: 0 20px 20px; }
			#${ROOT_ID} .ps-option { min-width: 0; min-height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px; border: 1px solid transparent; border-radius: 8px; background: var(--background-secondary, var(--background-base-lower, #2b2d31)); color: var(--text-default, #dbdee1); text-align: left; cursor: pointer; }
			#${ROOT_ID} .ps-option:hover { background: var(--background-modifier-hover, rgba(255,255,255,.06)); }
			#${ROOT_ID} .ps-option[data-selected="true"] { background: var(--background-modifier-selected, rgba(255,255,255,.1)); border-color: var(--brand-500, #5865f2); }
			#${ROOT_ID} .ps-option-title { display: block; overflow: hidden; font-size: 15px; font-weight: 600; white-space: nowrap; text-overflow: ellipsis; }
			#${ROOT_ID} .ps-option-description { display: block; margin-top: 2px; overflow: hidden; font-size: 12px; color: var(--text-muted, #b5bac1); white-space: nowrap; text-overflow: ellipsis; }
			#${ROOT_ID} .ps-radio { flex: 0 0 auto; width: 18px; height: 18px; padding: 3px; border: 2px solid var(--interactive-normal, #b5bac1); border-radius: 50%; background-clip: content-box; }
			#${ROOT_ID} .ps-option[data-selected="true"] .ps-radio { border-color: var(--brand-500, #5865f2); background-color: var(--brand-500, #5865f2); }
			#${ROOT_ID} .ps-option:focus-visible, #${ROOT_ID} .ps-close:focus-visible, #${ROOT_ID} .ps-unload:focus-visible { outline: 2px solid var(--brand-500, #5865f2); outline-offset: 2px; }
			#${ROOT_ID} .ps-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 20px; background: var(--background-secondary, var(--background-base-lower, #2b2d31)); }
			#${ROOT_ID} .ps-shortcut { font-size: 12px; color: var(--text-muted, #b5bac1); }
			#${ROOT_ID} .ps-shortcut kbd { padding: 3px 6px; border: 1px solid var(--border-subtle, rgba(255,255,255,.1)); border-radius: 4px; background: var(--background-primary, #313338); color: var(--text-default, #dbdee1); font-family: inherit; }
			#${ROOT_ID} .ps-unload { border: 0; border-radius: 6px; padding: 7px 12px; background: var(--button-danger-background, var(--red-400, #da373c)); color: var(--white-500, #fff); cursor: pointer; font-weight: 500; }
			#${ROOT_ID} .ps-unload:hover { background: var(--button-danger-background-hover, var(--red-430, #a12828)); color: var(--white-500, #fff); }
			@media (max-width: 520px) { #${ROOT_ID} .ps-grid { grid-template-columns: 1fr; } }
		`;

		document.head.appendChild(style);
		root = document.createElement("div");
		root.id = ROOT_ID;

		root.innerHTML = `
			<div class="ps-modal" role="dialog" aria-modal="true" aria-labelledby="platform-spoofer-title">
			  <div class="ps-header">
			    <div>
			      <h2 class="ps-title" id="platform-spoofer-title">Platform Spoofer - by _Dr1zzyx_</h2>
			      <p class="ps-subtitle">Keep your account status set to "online"; you won't see the change yourself, but other users will see it.</p>
			    </div>
			    <button class="ps-close" data-action="close" type="button" aria-label="Close">×</button>
			  </div>
			  <div class="ps-current"> Current platform: <strong data-current>Windows</strong>
			  </div>
			  <div class="ps-grid"> ${Object.entries(PLATFORMS)
					.map(
						([id, value]) => ` <button class="ps-option" type="button" data-platform="${id}" aria-pressed="false">
			      <span>
			        <span class="ps-option-title">${value.label}</span>
			        <span class="ps-option-description">${value.description}</span>
			      </span>
			      <span class="ps-radio" aria-hidden="true"></span>
			    </button> `
					)
					.join("")} </div>
			  <div class="ps-footer">
			    <span class="ps-shortcut"> Toggle menu: <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>
			    </span>
			    <button class="ps-unload" data-action="unload" type="button"> Unload </button>
			  </div>
			</div>
		`;

		document.body.appendChild(root);

		root.addEventListener(
			"click",
			event => {
				const target = event.target;
				if (!(target instanceof Element)) return;

				if (target === root || target.closest('[data-action="close"]')) {
					closeMenu();
					return;
				}

				if (target.closest('[data-action="unload"]')) {
					destroy();
					return;
				}

				const option = target.closest("[data-platform]");
				if (option) setPlatform(option.dataset.platform);
			},
			{ signal }
		);

		syncMenu();
		return root;
	};

	const openMenu = () => {
		if (destroyed) return;
		const element = createMenu();

		element.hidden = false;
		syncMenu();
		element.querySelector(`[data-platform="${platform}"]`)?.focus({ preventScroll: true });
	};

	const closeMenu = () => {
		if (root) root.hidden = true;
	};

	const toggleMenu = () => {
		if (!root || root.hidden) {
			openMenu();
			return;
		}

		closeMenu();
	};

	const destroy = (restore = true) => {
		if (destroyed) return;
		destroyed = true;

		if (socket.send === patchedSend) socket.send = originalSend;
		controller.abort();

		root?.remove();
		document.getElementById(STYLE_ID)?.remove();

		root = null;
		if (window[KEY]?.destroy === destroy) delete window[KEY];
		if (restore) reconnect();

		console.log("[Platform-Spoofer] Unloaded.");
	};

	document.addEventListener(
		"keydown",
		event => {
			if (!event.repeat && event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey && event.code === "KeyP") {
				event.preventDefault();
				event.stopPropagation();

				toggleMenu();
				return;
			}

			if (event.key === "Escape" && root && !root.hidden) {
				event.preventDefault();
				closeMenu();
			}
		},
		{ capture: true, signal }
	);

	socket.send = patchedSend;

	window[KEY] = Object.freeze({
		set: setPlatform,
		open: openMenu,
		close: closeMenu,
		toggle: toggleMenu,
		reconnect,
		destroy,

		get platform() {
			return platform;
		},

		get browser() {
			return PLATFORMS[platform].browser;
		},
	});

	if (hadPrevious) reconnect();
	openMenu();
	console.log("[Platform-Spoofer] Loaded. Press Alt + Shift + P to toggle the menu.");
})();
