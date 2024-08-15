import * as vscode from 'vscode';
import { config, reloadConfig, FileEntry } from './config';

export function activate(context: vscode.ExtensionContext) {
    const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(event => {
        if (!event.affectsConfiguration("breakpointFileSync")) {
            return;
        }

        reloadConfig();
        refreshFiles();
    });

    context.subscriptions.push(configChangeDisposable);

    vscode.debug.onDidChangeBreakpoints(refreshFiles);

    refreshFiles();
}

export function deactivate() {}

function refreshFiles() {
    for (const entry of config().files) {
        generateFile(entry);
    }
}

function generateFile(entry: FileEntry) {
    let strData: string;

    if (entry.kind === "json") {
        const data = vscode.debug.breakpoints
            .filter(x => x instanceof vscode.SourceBreakpoint)
            .filter(x => entry.matchingPath.test(vscode.workspace.asRelativePath(x.location.uri.fsPath)))
            .map(x => ({
                "path": vscode.workspace.asRelativePath(x.location.uri.fsPath),
                "absPath": x.location.uri.fsPath,
                "filename": x.location.uri.fsPath.replaceAll("\\", "/").split("/").pop(),
                "line": x.location.range.start.line,
                "condition": x.condition,
                "hitCount": x.hitCondition
            }));

        strData = JSON.stringify(data);
    } else if (entry.kind === "custom") {
        strData = entry.filePrefix;
    
        for (const breakpoint of vscode.debug.breakpoints) {
            if (
                (!(breakpoint instanceof vscode.SourceBreakpoint)) ||
                (!breakpoint.enabled && entry.skipDisabled) ||
                (!entry.matchingPath.test(vscode.workspace.asRelativePath(breakpoint.location.uri.fsPath)))
            ) {
                continue;
            }
    
            const position = breakpoint.location.range.start;
            const absPath = breakpoint.location.uri.fsPath;
            const relPath = vscode.workspace.asRelativePath(absPath);
    
            strData += entry.format
                .replaceAll("$path", relPath)
                .replaceAll("$absPath", absPath)
                .replaceAll("$filename", relPath.split("/").pop() ?? entry.undefinedPlaceholder)
                .replaceAll("$line", position.line.toString())
                .replaceAll("$condition", breakpoint.condition ?? entry.undefinedPlaceholder)
                .replaceAll("$hitCount", breakpoint.hitCondition ?? entry.undefinedPlaceholder);
    
            if (entry.endWithNewLine) {
                strData += "\n";
            }
        }

        strData += entry.fileSuffix;
    } else {
        vscode.window.showErrorMessage(`Unknown serialization kind: ${(entry as any).kind}`);
        return;
    }

    const filePath = entry.name;
    let absolutePath: string;

    if (vscode.workspace.workspaceFolders) {
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        absolutePath = vscode.Uri.joinPath(workspaceFolder.uri, filePath).fsPath;
    } else {
        absolutePath = vscode.Uri.file(filePath).fsPath;
    }

    vscode.workspace.fs.writeFile(
        vscode.Uri.file(absolutePath),
        new TextEncoder().encode(strData)
    );
}
