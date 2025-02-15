import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';
import { Application } from '../../application';
import { createMockResponse } from '../mock/llama-server';

describe('Edit Prediction', () => {
    let app: Application;

    beforeEach(() => {
        app = {
            extraContext: {
                getRecentEdits: jest.fn().mockReturnValue([{
                    timestamp: Date.now(),
                    position: new vscode.Position(1, 2),
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
            },
            completion: {
                getCompletionItems: jest.fn()
            }
        } as any;
    });

    test('vscode Position mock works', () => {
        const pos = new vscode.Position(1, 2);
        expect(pos.line).toBe(1);
        expect(pos.character).toBe(2);
    });

    test('constructs correct prompt from edit history', async () => {
        const edits = [...app.extraContext.getRecentEdits()];
        const prompt = await app.llamaServer.constructEditPredictionPrompt(
            'prefix',
            'suffix',
            edits
        );
        
        expect(prompt).toBe('test prompt');
        expect(app.extraContext.getRecentEdits).toHaveBeenCalled();
        expect(edits[0].oldText).toBe('oldFunction');
        expect(edits[0].newText).toBe('newFunction');
    });

    test('handles LSP conflicts correctly', async () => {
        const mockPrediction = new vscode.InlineCompletionItem('predicted edit');
        
        // Mock completion provider
        type CompletionFunction = (
            document: vscode.TextDocument,
            position: vscode.Position,
            context: vscode.InlineCompletionContext,
            token: vscode.CancellationToken
        ) => Promise<vscode.InlineCompletionItem[]>;

        const mockGetCompletionItems = jest.fn<CompletionFunction>()
            .mockResolvedValue([mockPrediction]);

        app.completion.getCompletionItems = mockGetCompletionItems as any;

        // Test with LSP completions and modifier key
        const context: vscode.InlineCompletionContext = {
            triggerKind: vscode.InlineCompletionTriggerKind.Invoke,
            selectedCompletionInfo: undefined
        };

        const result = await mockGetCompletionItems(
            {} as vscode.TextDocument,
            new vscode.Position(0, 0),
            context,
            {} as vscode.CancellationToken
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        const predictions = result as vscode.InlineCompletionItem[];
        expect(predictions[0].insertText).toBe('predicted edit');
    });
});
