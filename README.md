# Breakpoint File Sync VSCode Extension
Automatically synchronizes breakpoints with specified files.

(<a href="https://github.com/ascpixi/vscode-breakpoint-file-sync"><code>GitHub</code></a> | <a href="https://github.com/ascpixi/vscode-breakpoint-file-sync/issues"><code>Issue Tracker</code></a>)

## Features
The extension:
- supports multiple breakpoint files,
- provides the ability to define custom serialization schemes via string substition,
- automaticaly updates files on breakpoint changes.

## Extension Settings

This extension contributes a single setting - `breakpointFileSync.files`, which is an array of objects with the following attributes:

- `matchingPath`: A regular expression that matches the paths of source files that should be included in the file. (`string`)
- `name`: The name of the file. If not absolute, will be relative to the workspace folder. (`string`)
- `kind`: Describes the type of serialization to use. (`"json"` or `"custom"`)

If `kind` is set to `"custom"`, the following attributes are also available:
- `filePrefix`: A string to prepend before any breakpoint entries to the generated file. (`string`, optional)
- `format`: The format of the breakpoint entries. If an array, all of its entries will be joined with a new-line character. Available variables: `$path`, `$absPath`, `$filename`, `$line`, `$condition`, `$hitCount`. (`string[]` or `string`)
- `fileSuffix`: A string to append after all breakpoint entries to the generated file. (`string`, optional)
- `endWithNewLine`: If `true`, all breakpoint entries will end with a new-line character (\\n). (`boolean`, optional, defaults to `true`)
- `skipDisabled`: If `true`, disabled breakpoints will not be included. (`boolean`, optional, defaults to `true`)
- `undefinedPlaceholder`: If a given variable is not available (e.g. not provided), but is referenced in the 'format' field, this value will be used as a placeholder. (`string`, optional, defaults to `""`)

### Example
```json
{
    "breakpointFileSync.files": [
        {
            "kind": "json",
            "matchingPath": ".*\\/?.*\\.cs",
            "name": "csharpbreakpoints.json"
        },
        {
            "kind": "custom",
            "matchingPath": ".*\\/?.*\\.ts",
            "name": "tsbreakpoints.yml",
            "filePrefix": "breakpoints:\n",
            "undefinedPlaceholder": "null",
            "format": [
                "  - path: $absPath",
                "    line: $line",
                "    condition: $condition"
            ]
        }
    ]
}
```

`csharpbreakpoints.json`
```json
[{"path":"breakpointable.cs","absPath":"c:\\Users\\asc\\Desktop\\myproj\\breakpointable.cs","filename":"breakpointable.cs","line":10},{"path":"breakpointable.cs","absPath":"c:\\Users\\asc\\Desktop\\myproj\\breakpointable.cs","filename":"breakpointable.cs","line":14}]
```

`tsbreakpoints.yml`
```yaml
breakpoints:
  - path: c:\Users\asc\Desktop\myproj\breakpointable.ts
    line: 12
    condition: null
  - path: c:\Users\asc\Desktop\myproj\breakpointable.ts
    line: 13
    condition: null
```

Do note that line numbers are **zero-based**. What you see in VS Code as line 1 will be serialized as line 0.
