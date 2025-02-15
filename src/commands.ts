import * as vscode from 'vscode';
import { Application } from './application';

export class Commands {
    private app: Application;

    constructor(application: Application) {
        this.app = application;
    }

    registerEditPredictionCommands(context: vscode.ExtensionContext) {
        // Register command for showing edit predictions with alt/alt-tab
        const showEditPrediction = vscode.commands.registerCommand(
            'llama-vscode.showEditPrediction',
            async () => {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    return undefined;
                }

                // Get current position and trigger edit prediction
                const position = editor.selection.active;
                const document = editor.document;

                // Create a completion context with explicit trigger for LSP conflict handling
                const completionContext: vscode.InlineCompletionContext = {
                    triggerKind: vscode.InlineCompletionTriggerKind.Invoke,
                    selectedCompletionInfo: undefined
                };

                // Create cancellation token
                const tokenSource = new vscode.CancellationTokenSource();
                try {
                    // Get predictions from completion provider
                    const predictions = await this.app.completion.getCompletionItems(
                        document,
                        position,
                        completionContext,
                        tokenSource.token
                    );

                    if (!predictions) {
                        return undefined;
                    }

                    // Return predictions based on type
                    if (Array.isArray(predictions)) {
                        return predictions;
                    }
                    
                    if (predictions instanceof vscode.InlineCompletionList) {
                        return predictions.items;
                    }
                    
                    return undefined;
                } finally {
                    tokenSource.dispose();
                }
            }
        );

        // Add command to subscriptions
        context.subscriptions.push(showEditPrediction);
    }
}
