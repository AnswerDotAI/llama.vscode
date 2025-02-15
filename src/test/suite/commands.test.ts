import { describe, expect, test, jest } from '@jest/globals';
import * as vscode from 'vscode';
import { Commands } from '../../commands';
import { Application } from '../../application';
import { createMockResponse } from '../mock/llama-server';
import { LlamaResponse } from '../../llama-server';
import { GetCompletionItemsFunction, GetFIMCompletionFunction } from '../mock/completion';

jest.mock('vscode');
jest.mock('../../application');

describe('Commands', () => {
    let commands: Commands;
    let app: Application;
    let context: vscode.ExtensionContext;
    
    beforeEach(() => {
        app = {
            completion: {
                getCompletionItems: jest.fn()
            },
            extConfig: {
                edit_prediction_enabled: true,
                edit_context_window: 50
            },
            extraContext: {
                getRecentEdits: jest.fn().mockReturnValue([{
                    timestamp: Date.now(),
                    position: new vscode.Position(0, 0),
                    oldText: 'oldFunction',
                    newText: 'newFunction',
                    type: 'replace'
                }]),
                chunks: []
            },
            llamaServer: {
                constructEditPredictionPrompt: jest.fn().mockReturnValue('test prompt'),
                getFIMCompletion: jest.fn().mockImplementation(async () => createMockResponse('predicted edit')),
                getFIMCompletionWithCache: jest.fn()
            }
        } as any;

        context = {
            subscriptions: []
        } as any;

        commands = new Commands(app);
    });

    test('registers edit prediction command', () => {
        commands.registerEditPredictionCommands(context);
        expect(context.subscriptions.length).toBe(1);
    });

    test('shows edit prediction when triggered', async () => {
        const document = {
            uri: 'test.ts',
            getText: () => 'test code',
            lineAt: () => ({ text: 'test code' })
        } as any;
        const editor: vscode.TextEditor = {
            document,
            selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
            selections: [new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0))],
            visibleRanges: [new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0))],
            options: {
                tabSize: 4,
                insertSpaces: true
            },
            viewColumn: 1,
            edit: (callback: (editBuilder: vscode.TextEditorEdit) => void) => Promise.resolve(true),
            insertSnippet: () => Promise.resolve(true),
            setDecorations: () => {},
            revealRange: () => {},
            show: () => {},
            hide: () => {}
        };

        vscode.window.activeTextEditor = editor;
        
        const prediction = {
            insertText: 'predicted edit',
            range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0))
        } as vscode.InlineCompletionItem;

        // Set up active editor
        Object.defineProperty(vscode.window, 'activeTextEditor', { value: editor });

        // Set up window.activeTextEditor
        Object.defineProperty(vscode.window, 'activeTextEditor', { value: editor, configurable: true });

        // Mock completion items to return prediction
        const mockGetCompletionItems = jest.fn();
        mockGetCompletionItems.mockReturnValue(Promise.resolve([prediction]));
        Object.defineProperty(app.completion, 'getCompletionItems', { value: mockGetCompletionItems });

        // Mock commands registration
        type CommandCallback = (...args: any[]) => Promise<vscode.InlineCompletionItem[] | undefined>;
        const mockRegisterCommand = jest.fn().mockImplementation((...args: any[]) => {
            const [commandId, callback] = args;
            if (commandId === 'llama-vscode.showEditPrediction') {
                return { dispose: jest.fn() };
            }
            return { dispose: jest.fn() };
        });
        Object.defineProperty(vscode.commands, 'registerCommand', { value: mockRegisterCommand });

        // Register commands and get the callback
        commands.registerEditPredictionCommands(context);
        const registeredCommand = mockRegisterCommand.mock.calls[0];
        expect(registeredCommand[0]).toBe('llama-vscode.showEditPrediction');
        const commandCallback = registeredCommand[1] as CommandCallback;
        // Execute command callback
        const result = await commandCallback();
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result!.length).toBe(1);
        expect(result![0].insertText).toBe('predicted edit');
    });

    test('handles no editor case', async () => {
        (vscode.window as any).activeTextEditor = undefined;
        
        commands.registerEditPredictionCommands(context);
        const command = (vscode.commands.registerCommand as jest.Mock).mock.calls[0][1] as () => Promise<vscode.InlineCompletionItem[] | undefined>;
        
        const result = await command();
        expect(result).toBeUndefined();
    });
});
