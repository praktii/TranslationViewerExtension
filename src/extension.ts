import * as vscode from 'vscode';
import { TextDecoder } from 'util';

function getValue(obj: any, key: string, firstOnly: boolean = true): string[] {
	const result: string[] = [];
	const keyChain = key.split('.');
	for (let i = 0; i < keyChain.length; i++) {
		const key = keyChain[i];
		if (obj.hasOwnProperty(key) &&
			(typeof obj[key] === "object")) {
			getValue(obj[key], keyChain.splice(1).join('.'), firstOnly).map(r => result.push(r));
		} else {
			const res = Object.entries(obj).find((e: any) => e[0] === key) as any;
			if (res) {
				return [res[1].toString()];
			}
		}
	}
	if (firstOnly) { return [result[0]]; }
	return result;
}

let config: vscode.WorkspaceConfiguration;
let info: {
	prefix?: string,
	translationValueMode?: string,
	content?: any,
	fileTypes: vscode.DocumentSelector
} = {
	fileTypes: ['typescript', 'javascript', 'html']
};

let translationFileList: string[] = [];

export async function activate(context: vscode.ExtensionContext): Promise<void> {

	loadConfig();

	const rescanTranslationsCommand = vscode.commands.registerCommand('translationviewer.rescanTranslations', () => {
		loadConfig();
	});

	const jumpToTranslationCommand = vscode.commands.registerCommand('translationviewer.jumpToTranslation', () => {
		vscode.window.showInformationMessage('This should jump to the desired translation!');
	});

	const openTranslationFileCommand = vscode.commands.registerCommand('translationviewer.openTranslationFiles', () => {
		vscode.window.showInformationMessage('This should open translation files!');
	});

	vscode.workspace.onDidChangeConfiguration(_ => {
		const currentConfig = vscode.workspace.getConfiguration('translationPeek');
		if (config !== currentConfig) {
			loadConfig();
		}
	});

	let hoverProvider = vscode.languages.registerHoverProvider(info.fileTypes, {
		provideHover(document, position, _) {
			const wordBorders = document.getWordRangeAtPosition(position, /[A-Z_\.0-9a-z]+/);
			if (wordBorders) {
				const hoveredLine = document.lineAt(wordBorders.start).text;
				const hoveredWord = hoveredLine.substring(wordBorders?.start.character, wordBorders?.end.character);
				if (!info.prefix || hoveredWord.startsWith(info.prefix)) {
					const translations = Object.entries(info.content)
						.map(element => getValue(element[1], hoveredWord, info.translationValueMode === 'first'))
						.filter(trans => trans?.length);
					const hoverText = new vscode.MarkdownString(translations?.join('\\\r\n'));

					if(hoverText.value === '\\\r\n') return;
					

					if (hoveredWord) {
						const translationKey = hoveredWord;
						const translationValue = hoverText.value;

						const fileLinks: string[] = [];
						translationFileList.forEach(file => {
							const fileLink = `[${file}](${vscode.Uri.file(file)})`;
							fileLinks.push(fileLink);
						});

						const translationTooltip = new vscode.MarkdownString(`**Translation Key:** ${translationKey}\n\n**Translation Value:**\n\n${translationValue}\n\n**File:**\n\n${fileLinks.join('\n\n')}`);
						translationTooltip.isTrusted = true;
						return translationTooltip && new vscode.Hover(translationTooltip, wordBorders);
					}
				}
			}
		}
	});
	
	context.subscriptions.push(rescanTranslationsCommand);
	context.subscriptions.push(jumpToTranslationCommand);
	context.subscriptions.push(openTranslationFileCommand);
	context.subscriptions.push(hoverProvider);
}

async function loadConfig(): Promise<void> {
	const currentConfig = vscode.workspace.getConfiguration('TranslationViewer');
	config = currentConfig;
	info.prefix = getTranslationPrefix(config);
	info.translationValueMode = getTranslationValueMode(config);
	info.fileTypes = getFileTypes(config);

	getTranslationFilesFromConfig();
}

async function getTranslationFilesFromConfig(): Promise<void> {
	translationFileList = [];
	const fileNames = getTranslationFileNames(config);
	const files = await Promise.all(fileNames.map(fileName => getTranslationFile(fileName)));
	const contents = await Promise.all(files.filter(f => !!f).map(async (file, i) => ({ [fileNames[i].split('.')[0]]: await getTranslationContent(file) })));
	info.content = contents.reduce((p, c) => ({ ...p, ...c }), {});

	files.forEach(file => {
		if(file) {
			vscode.window.showInformationMessage(`TranslationViewer: Translation file found:\r\n ${file.fsPath}`);
			translationFileList.push(file.fsPath);
		}
	});
}

async function getTranslationFile(fileName: string): Promise<vscode.Uri> {
	return await vscode.workspace.findFiles(`**/${fileName}`).then(files => {
		files = files?.filter(file => !file.path.includes('node_modules'));
		if (!files || !files[0]) {
			vscode.window.showWarningMessage(`TranslationViewer: No translation file for ${fileName} could be found!`);
		}
		return files && files[0];
	});
}

async function getTranslationContent(file: vscode.Uri): Promise<string> {
	return vscode.workspace.fs.readFile(file).then(contents => {
		const translationText = new TextDecoder("utf-8").decode(contents);
		try {
			return JSON.parse(translationText);
		} catch (e) {
			vscode.window.showWarningMessage(`TranslationViewer: Translationfile could not be parsed!`);
			return {};
		}
	});
}

const getTranslationPrefix = (config: vscode.WorkspaceConfiguration): string => config.get('prefix', '').toString();
const getTranslationFileNames = (config: vscode.WorkspaceConfiguration): string[] => config.get('jsonNames', ['translation.json']) || ['translation.json'];
const getTranslationValueMode = (config: vscode.WorkspaceConfiguration): 'first' | 'all' => (config.get('take', 'first') as any).toString() || 'first';
const getFileTypes = (config: vscode.WorkspaceConfiguration): vscode.DocumentSelector => config.get('fileTypes', ['typescript', 'javascript']) || ['typescript', 'javascript'];
