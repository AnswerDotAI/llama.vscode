import { describe, expect, test, jest } from '@jest/globals';
import * as vscode from 'vscode';
import { LlamaServer } from '../../llama-server';
import { Application } from '../../application';
import { EditHistory } from '../../extra-context';

jest.mock('../../application', () => ({
    Application: {
        getInstance: jest.fn().mockReturnValue({
            extConfig: {
                endpoint: 'http://localhost:8012',
                openai_prompt_template: '<|fim_prefix|>{inputPrefix}{prompt}<|fim_suffix|>{inputSuffix}<|fim_middle|>'
            }
        })
    }
}));

describe('LlamaServer', () => {
    let server: LlamaServer;
    
    beforeEach(() => {
        const app = Application.getInstance();
        server = new LlamaServer(app);
    });

    test('constructs edit prediction prompt', () => {
        const recentEdits: EditHistory[] = [
            {
                timestamp: Date.now(),
                position: new vscode.Position(1, 0),
                oldText: 'oldFunction',
                newText: 'newFunction',
                type: 'replace'
            },
            {
                timestamp: Date.now() - 1000,
                position: new vscode.Position(2, 0),
                oldText: '',
                newText: 'addedLine',
                type: 'insert'
            }
        ];

        const inputPrefix = 'function hello() {\n';
        const inputSuffix = '\n    return world;\n}';
        
        const prompt = server.constructEditPredictionPrompt(inputPrefix, inputSuffix, recentEdits);
        
        expect(prompt).toContain('<|fim_prefix|>');
        expect(prompt).toContain('<|fim_suffix|>');
        expect(prompt).toContain('<|fim_middle|>');
        expect(prompt).toContain('oldFunction -> newFunction');
        expect(prompt).toContain('addedLine');
        expect(prompt).toContain(inputPrefix);
        expect(prompt).toContain(inputSuffix);
    });
});
