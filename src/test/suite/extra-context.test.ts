import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';
import { ExtraContext } from '../../extra-context';
import { Application } from '../../application';

jest.mock('../../application', () => ({
    Application: {
        getInstance: jest.fn().mockReturnValue({
            extConfig: {
                DELAY_BEFORE_COMPL_REQUEST: 150
            }
        })
    }
}));

describe('ExtraContext', () => {
    let extraContext: ExtraContext;
    let onChangeCallback: ((e: { document: { getText: () => string }, contentChanges: any[] }) => void) | undefined;
    
    beforeEach(() => {
        jest.useFakeTimers();
        (vscode.workspace.onDidChangeTextDocument as jest.Mock).mockImplementation(callback => {
            onChangeCallback = callback as typeof onChangeCallback;
            return { dispose: jest.fn() };
        });
        const app = Application.getInstance();
        extraContext = new ExtraContext(app);
    });

    test('tracks edit history with debouncing', () => {
        const change = {
            range: new vscode.Range(new vscode.Position(1, 1), new vscode.Position(1, 4)),
            rangeLength: 3,
            text: 'new',
            rangeOffset: 0,
            fullText: ''
        };

        if (!onChangeCallback) {
            throw new Error('onChangeCallback not initialized');
        }
        onChangeCallback({
            document: {
                getText: () => 'old'
            },
            contentChanges: [change]
        });

        expect(extraContext.getRecentEdits().length).toBe(0);
        jest.advanceTimersByTime(150);
        
        const edits = extraContext.getRecentEdits();
        expect(edits.length).toBe(1);
        expect(edits[0]).toMatchObject({
            position: change.range.start,
            oldText: 'old',
            newText: 'new',
            type: 'replace'
        });
    });

    test('maintains maximum history size', () => {
        for (let i = 0; i < 15; i++) {
            onChangeCallback?.({
                document: {
                    getText: () => `old${i}`
                },
                contentChanges: [{
                    range: new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, 4)),
                    rangeLength: 4,
                    text: `new${i}`,
                    rangeOffset: 0,
                    fullText: ''
                }]
            });
            jest.advanceTimersByTime(150);
        }

        const edits = extraContext.getRecentEdits();
        expect(edits.length).toBe(10);
        expect(edits[0].newText).toBe('new14');
    });

    test('tracks insert and delete operations', () => {
        // Test insert
        onChangeCallback?.({
            document: {
                getText: () => ''
            },
            contentChanges: [{
                range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
                rangeLength: 0,
                text: 'inserted',
                rangeOffset: 0,
                fullText: ''
            }]
        });
        jest.advanceTimersByTime(150);

        let edits = extraContext.getRecentEdits();
        expect(edits.length).toBe(1);
        expect(edits[0].type).toBe('insert');
        expect(edits[0].newText).toBe('inserted');

        // Test delete
        onChangeCallback?.({
            document: {
                getText: () => 'to delete'
            },
            contentChanges: [{
                range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 8)),
                rangeLength: 8,
                text: '',
                rangeOffset: 0,
                fullText: ''
            }]
        });
        jest.advanceTimersByTime(150);

        edits = extraContext.getRecentEdits();
        expect(edits.length).toBe(2);
        expect(edits[0].type).toBe('delete');
        expect(edits[0].oldText).toBe('to delete');
    });
});
