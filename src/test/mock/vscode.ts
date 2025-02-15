// Mock minimal vscode API needed for tests
export class Position {
    constructor(public readonly line: number, public readonly character: number) {}
}

export class Range {
    constructor(
        public readonly start: Position,
        public readonly end: Position
    ) {}
}

export class InlineCompletionItem {
    public readonly insertText: string;
    public readonly range?: Range;

    constructor(
        insertText: string,
        range?: Range
    ) {
        this.insertText = insertText;
        this.range = range;
    }
}

export enum InlineCompletionTriggerKind {
    Automatic = 0,
    Invoke = 1
}

export class InlineCompletionList {
    items: InlineCompletionItem[];
    constructor(items: InlineCompletionItem[]) {
        this.items = items;
    }
    static isInlineCompletionList(obj: any): obj is InlineCompletionList {
        return obj instanceof InlineCompletionList;
    }
}

export const workspace = {
    getConfiguration: jest.fn(),
    onDidChangeTextDocument: jest.fn().mockImplementation(callback => ({
        dispose: jest.fn()
    }))
};

export const languages = {
    getLanguages: jest.fn().mockResolvedValue(['typescript', 'javascript'])
};

export class CancellationTokenSource {
    token = { isCancellationRequested: false };
    dispose() {}
}

export interface CompletionItem {
    label: string;
    kind?: number;
    detail?: string;
    documentation?: string;
}

export class CompletionList {
    isIncomplete?: boolean;
    items: CompletionItem[];
    constructor(items: CompletionItem[] = [], isIncomplete = false) {
        this.items = items;
        this.isIncomplete = isIncomplete;
    }
}

export type CommandExecutor = <T = unknown>(command: string, ...rest: any[]) => Thenable<T>;

export const commands = {
    registerCommand: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    executeCommand: jest.fn() as jest.Mock<ReturnType<CommandExecutor>>
};

export class TextDocument {
    constructor(public readonly uri: string) {}
    getText(): string { return ''; }
    lineAt(line: number): { text: string } { return { text: '' }; }
}

export interface TextEditorEdit {
    replace(location: Range, newText: string): void;
    insert(location: Position, newText: string): void;
    delete(location: Range): void;
}

export interface TextEditor {
    document: TextDocument;
    selection: Selection;
    selections: Selection[];
    visibleRanges: Range[];
    options: {
        tabSize: number;
        insertSpaces: boolean;
    };
    viewColumn: number;
    edit(callback: (editBuilder: TextEditorEdit) => void, options?: {
        readonly undoStopBefore: boolean;
        readonly undoStopAfter: boolean;
    }): Thenable<boolean>;
    insertSnippet(snippet: any, location?: Range | Position | readonly Range[] | readonly Position[], options?: { undoStopBefore: boolean; undoStopAfter: boolean }): Thenable<boolean>;
    setDecorations(decorationType: any, rangesOrOptions: any): void;
    revealRange(range: Range, revealType?: number): void;
    show(column?: number): void;
    hide(): void;
}

export class Selection extends Range {
    constructor(
        anchor: Position,
        active: Position
    ) {
        super(anchor, active);
        this.anchor = anchor;
        this.active = active;
    }
    anchor: Position;
    active: Position;
}

export const window = {
    activeTextEditor: undefined as TextEditor | undefined,
    showInformationMessage: jest.fn(),
    createTextEditorDecorationType: jest.fn()
};

export const ExtensionContext = jest.fn();
