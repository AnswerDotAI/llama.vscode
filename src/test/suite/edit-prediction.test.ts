import { describe, expect, test } from '@jest/globals';
import * as vscode from 'vscode';

describe('Edit Prediction', () => {
    test('vscode Position mock works', () => {
        const pos = new vscode.Position(1, 2);
        expect(pos.line).toBe(1);
        expect(pos.character).toBe(2);
    });
});
