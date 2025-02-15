import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';
import { Completion } from '../../completion';
import { Application } from '../../application';
import { EditHistory } from '../../extra-context';

jest.mock('../../application', () => ({
    Application: {
        getInstance: jest.fn().mockReturnValue({
            extConfig: {
                edit_prediction_enabled: true,
                edit_context_window: 50,
                edit_debounce_ms: 300,
                edit_history_size: 10
            },
            extraContext: {
                getRecentEdits: jest.fn(),
                chunks: []
            },
            llamaServer: {
                constructEditPredictionPrompt: jest.fn(),
                getFIMCompletion: jest.fn()
            }
        })
    }
}));

describe('Completion', () => {
    let completion: Completion;
    let app: Application;
    
    beforeEach(() => {
        app = Application.getInstance();
        completion = new Completion(app);
    });

    test('returns edit prediction when enabled and edits available', async () => {
        const recentEdits: EditHistory[] = [{
            timestamp: Date.now(),
            position: new vscode.Position(1, 0),
            oldText: 'oldFunction',
            newText: 'newFunction',
            type: 'replace'
        }];

        (app.extraContext.getRecentEdits as jest.Mock).mockReturnValue(recentEdits);
        (app.llamaServer.constructEditPredictionPrompt as jest.Mock).mockReturnValue('test prompt');
        (app.llamaServer.getFIMCompletion as jest.Mock).mockResolvedValue({
            content: 'predicted edit'
        } as import('../../llama-server').LlamaResponse);

        const result = await completion.getCompletionItems(
            { getText: () => '', lineAt: () => ({ text: '' }) } as any,
            new vscode.Position(0, 0),
            { triggerKind: vscode.InlineCompletionTriggerKind.Automatic } as any,
            { isCancellationRequested: false } as any
        );

        expect(result).toHaveLength(1);
        expect((result as any)[0].text).toBe('predicted edit');
    });

    test('returns null for edit prediction when disabled', async () => {
        app.extConfig.edit_prediction_enabled = false;

        const result = await completion.getCompletionItems(
            { getText: () => '', lineAt: () => ({ text: '' }) } as any,
            new vscode.Position(0, 0),
            { triggerKind: vscode.InlineCompletionTriggerKind.Automatic } as any,
            { isCancellationRequested: false } as any
        );

        expect(result).toBeNull();
    });
});
