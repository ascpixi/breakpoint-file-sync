import * as vscode from 'vscode';

let configStore = parseConfigValues();

/**
 * Retrieves parsed configuration values. 
 */
export const config = () => configStore;

function tryParseRegex(str: string, kind: string) {
    try {
        return new RegExp(str);
    } catch (ex) {
        vscode.window.showErrorMessage(`Invalid ${kind} regex: ${ex}`);
        return null;
    }
};

export type FileEntry = {
    matchingPath: RegExp,
    name: string
} & ( {
        kind: "json",
    } | {
        kind: "custom",
        format: string,
        filePrefix: string,
        fileSuffix: string,
        endWithNewLine: boolean,
        skipDisabled: boolean,
        undefinedPlaceholder: string
    }
);

type RawFileEntry = {
    matchingPath: string,
    name: string
} & ( {
        kind: "json",
    } | {
        kind: "custom",
        format: string | string[],
        filePrefix?: string,
        fileSuffix?: string,
        endWithNewLine?: boolean,
        skipDisabled?: boolean,
        undefinedPlaceholder?: string
    }
);

function parseConfigValues() {
    const cfg = vscode.workspace.getConfiguration("breakpointFileSync");

    const files = cfg.get<RawFileEntry[]>("files");

    return {
        files: files?.map(x => (
            {
                matchingPath: tryParseRegex(x.matchingPath, "source file"),
                name: x.name,
                kind: x.kind,
                ...(
                    x.kind === "json" ? {} : {
                        format: typeof x.format === "string" ? x.format : x.format.join("\n"),
                        filePrefix: x.filePrefix ?? "",
                        fileSuffix: x.fileSuffix ?? "",
                        endWithNewLine: x.endWithNewLine ?? true,
                        skipDisabled: x.skipDisabled ?? true,
                        undefinedPlaceholder: x.undefinedPlaceholder ?? ""
                    }
                )
            } as FileEntry
        )) ?? []
    };
}

export function reloadConfig() {
    configStore = parseConfigValues();
}