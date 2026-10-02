<div align="center">

<img src="https://cdn.discordapp.com/assets/content/355f009edf130bbd113eb59339cf96fbf3ec337388a7da2dd296fb3b6e7b4b7c.png" alt="Discord Platform Spoofer" width="240">

# Discord Platform Spoofer

**A lightweight platform spoofer for the Discord desktop client with a native-style interface.**

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Discord](https://img.shields.io/badge/Discord-Desktop-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Runs In](https://img.shields.io/badge/Runs%20in-DevTools%20Console-blue?style=for-the-badge&logo=googlechrome&logoColor=white)
![Dependencies](https://img.shields.io/badge/Dependencies-None-success?style=for-the-badge)
![Purpose](https://img.shields.io/badge/Purpose-Research%20%26%20Inspection-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)


</div>

---

Discord Platform Spoofer lets you change the platform reported by your Discord session directly from a simple in-client menu.

The script modifies only the Gateway `IDENTIFY` platform information and uses Discord's native theme variables to automatically match your current client theme.

## Features

- Native-style platform selector
- Switch platforms without using the console again
- `Alt + Shift + P` shortcut to open or close the menu
- Automatically follows Discord's light/dark/custom theme
- Safe cleanup when unloaded or executed again

## Supported Platforms

- Windows
- Web
- Android
- iOS
- Xbox
- PlayStation
- VR

> Xbox and PlayStation currently use the same `Discord Embedded` Gateway value.

## Usage

1. Open the **Discord desktop client**.
2. Open **Developer Tools**.
3. Go to the **Console** tab.
4. Paste and run the script.

The platform selector will open automatically.

After that, use:

```text
Alt + Shift + P
```

to open or close the menu at any time.

---
## Console API

The menu is the recommended way to use the script, but basic controls are also available from the console.

Open the menu:

```js
__platformSpoofer.open()
```

Change platform:

```js
__platformSpoofer.set("android")
```

Reconnect:

```js
__platformSpoofer.reconnect()
```

Unload:

```js
__platformSpoofer.destroy()
```
---

## Notes

- Discord's internal modules can change without notice, so future client updates may require adjustments to the script.
- The script only affects the current Discord session and does not persist after fully restarting or reloading the client.

## Disclaimer

This project is intended for development and research purposes.

Discord client modifications are not officially supported and may violate Discord's Terms of Service.

This project is not affiliated with, endorsed by, or associated with Discord Inc.

---
### Preview of the recent version's menu:

<img src="https://dr1zzyx.rede-imperium.com/y9bXTmMljQ.png" alt="Discord Platform Spoofer" width="558">

### If you select "VR," this is what your status will look like:

<img src="https://dr1zzyx.rede-imperium.com/i5xy9UWaq3.png" alt="Discord Platform Spoofer" width="50%">