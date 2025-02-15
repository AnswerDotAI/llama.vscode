import { describe, expect, test } from '@jest/globals';
import * as vscode from 'vscode';

jest.mock('vscode');

describe('Extension', () => {
    test('vscode workspace mock works', () => {
        const mockConfig = { get: jest.fn() };
        (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);
        expect(vscode.workspace.getConfiguration()).toBe(mockConfig);
    });
});
