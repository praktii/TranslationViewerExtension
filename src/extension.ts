// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

let config: vscode.WorkspaceConfiguration;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage('Welcome to Translation Viewer 0.0.1-alpha!');

	getTranslationFilesFromConfig();

	vscode.workspace.onDidChangeConfiguration(event => {
		const currentConfig = vscode.workspace.getConfiguration('translationPeek');
		if (config !== currentConfig) {
			getTranslationFilesFromConfig();
		}
	});


	const rescanTranslationsCommand = vscode.commands.registerCommand('translationviewer.rescanTranslations', () => {
		getTranslationFilesFromConfig();
	});

	const jumpToTranslationCommand = vscode.commands.registerCommand('translationviewer.jumpToTranslation', () => {
		vscode.window.showInformationMessage('This should jump to a specific translation!');
	});

	const openTranslationFileCommand = vscode.commands.registerCommand('translationviewer.openTranslationFiles', () => {
		vscode.window.showInformationMessage('This should open translation files!');
	});

	const translationTooltipProvider = vscode.languages.registerHoverProvider('*', {
		provideHover(document, position, token) {
			const wordRange = document.getWordRangeAtPosition(position, /[a-zA-Z0-9_]+/);
			if (wordRange) {
				const hoveredLine = document.lineAt(wordRange.start).text;
				const hoveredWord = hoveredLine.substring(wordRange.start.character, wordRange.end.character);
				return new vscode.Hover(`**Translation Key:** ${hoveredWord}\n\n**Translation Value:** ${hoveredLine}`);
				// return new vscode.Hover(`**Translation Key:** ${document.getText(wordRange)}\n\n**Translation Value:** ${hoveredLine}`);
			}
			// return new vscode.Hover(`**Translation Key:** ${document.getText(wordRange)}`);
			// const range = document.getWordRangeAtPosition(position);
			// const word = document.getText(range);
			// if (word) {
			// 	const translationKey = word;
			// 	const translationValue = "Translation value for " + translationKey; // Replace with actual translation retrieval logic
			// 	const translationFilePath = "src\\assets\\i18n\\de-DE.json"; // Replace with actual file path retrieval logic
			// 	const translationFileUri = vscode.Uri.file(translationFilePath);
			// 	const translationFileLink = `[${translationFilePath}](${translationFileUri})`;
			// 	const translationTooltip = new vscode.MarkdownString(`**Translation Key:** ${translationKey}\n\n**Translation Value:** ${translationValue}\n\n**File:** ${translationFileLink}`);
			// 	translationTooltip.isTrusted = true; // Allow links to be clickable
			// 	return new vscode.Hover(translationTooltip, range);
			// }
			// return null;
		}
	});

	context.subscriptions.push(rescanTranslationsCommand);
	context.subscriptions.push(jumpToTranslationCommand);
	context.subscriptions.push(openTranslationFileCommand);
	context.subscriptions.push(translationTooltipProvider);
}

async function getTranslationFilesFromConfig(): Promise<void> {
	const currentConfig = vscode.workspace.getConfiguration('TranslationViewer');
	config = currentConfig;
	const fileNames = getTranslationFileNames(currentConfig);
	const files = await Promise.all(fileNames.map(fileName => getTranslationFile(fileName)));

	files.forEach(file => {
		vscode.window.showInformationMessage(`Translation file found:\r\n ${file.fsPath}`);
	});
}

async function getTranslationFile(fileName: string): Promise<vscode.Uri> {
	return await vscode.workspace.findFiles(`**/${fileName}`).then(files => {
		files = files?.filter(file => !file.path.includes('node_modules'));
		if (!files || !files[0]) {
			vscode.window.showWarningMessage(`TranslationViewer: Translationfile for ${fileName} could not be found!`);
		}
		return files && files[0];
	});
}

const getTranslationFileNames = (config: vscode.WorkspaceConfiguration): string[] => config.get('jsonNames', ['translation.json']) || ['translation.json'];

// This method is called when your extension is deactivated
export function deactivate() {}
