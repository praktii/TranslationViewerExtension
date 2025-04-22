# TranslationViewer

A Visual Studio Code extension to help developers easily view and manage i18n translation keys across multiple JSON files.

## ✨ Features

- 🧠 **Hover Preview**: Instantly see the value of a translation key on hover.
- 🌍 **Multi-language Support**: View translations across different languages side by side.
- 📁 **JSON Support**: Works with standard JSON translation files.

## ⚗️ More to come

- **Commands**: Commands for better UX.
- **Jump to key**: Jump from the hovered key in your code directly to the translation value. 

## 📦 Installation

1. Open **Visual Studio Code**.
2. Go to the **Extensions** panel.
3. Search for **TranslationViewer**.
4. Click **Install**.

## 🚀 Usage

1. Open your project containing translation files.
2. Ensure your translations are stored in properly structured JSON files.
3. Hover over translation keys in your code to preview values.
4. Use the viewer to edit translations inline across different locales.

## ⚙️ Configuration

Add the following settings to your VS Code `settings.json` to configure translation file paths and default language:

```json
{
  "translationViewer.translationFiles": [
    "de-DE.json",
    "en-EN.json",
  ],
}
```

| Setting                              | Description                                      |
|--------------------------------------|--------------------------------------------------|
| `translationViewer.translationFiles` | Array of paths to your JSON translation files.   |
| `translationViewer.prefix`  | Prefix that is in front of the translation keys.   |
| `translationViewer.filetypes`  | Array of file types that are currently supported.   |

## 🛠 Development

To build and run this extension locally:

```bash
git clone https://github.com/praktii/TranslationViewerExtension.git
cd TranslationViewerExtension
npm install
code .
```

Then press `F5` in VS Code to launch the extension in a new Extension Development Host window.

## 🙌 Contributing

Got ideas or found a bug? PRs and issues are welcome!

1. Fork the repo
2. Create a new branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 📸 Some screenshots

![Settings via json](https://raw.githubusercontent.com/praktii/TranslationViewerExtension/master/assets/readme/readme_settings_json.png)
![Setting via menu](https://raw.githubusercontent.com/praktii/TranslationViewerExtension/master/assets/readme/readme_settings_menu.png)
![Tooltip](https://raw.githubusercontent.com/praktii/TranslationViewerExtension/master/assets/readme/readme_hoverexample.png)

---

> Built with ❤️ by [@praktii](https://github.com/praktii)