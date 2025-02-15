import { describe, expect, test, jest } from '@jest/globals';
import * as vscode from 'vscode';
import { Configuration } from '../../configuration';

jest.mock('vscode');

describe('Configuration', () => {
    let config: Configuration;
    
    beforeEach(() => {
        (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
            get: jest.fn((key: string, defaultValue?: any) => {
                const values: { [key: string]: any } = {
                    'edit_prediction_enabled': true,
                    'edit_context_window': 50,
                    'edit_debounce_ms': 300,
                    'edit_history_size': 10
                };
                return values[key] ?? defaultValue;
            })
        });
        config = new Configuration();
    });

    test('loads edit prediction configuration', () => {
        expect(config.edit_prediction_enabled).toBe(true);
        expect(config.edit_context_window).toBe(50);
        expect(config.edit_debounce_ms).toBe(300);
        expect(config.edit_history_size).toBe(10);
    });

    test('uses default values for edit prediction settings', () => {
        (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
            get: jest.fn((key: string, defaultValue?: any) => defaultValue)
        });
        config = new Configuration();

        expect(config.edit_prediction_enabled).toBe(true);
        expect(config.edit_context_window).toBe(50);
        expect(config.edit_debounce_ms).toBe(300);
        expect(config.edit_history_size).toBe(10);
    });
});
