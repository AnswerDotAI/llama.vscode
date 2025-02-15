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
    constructor(
        public readonly text: string,
        public readonly range: Range
    ) {}
}

export enum InlineCompletionTriggerKind {
    Automatic = 0,
    Explicit = 1
}

export const workspace = {
    getConfiguration: jest.fn()
};

export const window = {
    activeTextEditor: undefined,
    showInformationMessage: jest.fn()
};

export const ExtensionContext = jest.fn();
