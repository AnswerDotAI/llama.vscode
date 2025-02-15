import * as vscode from 'vscode';
import { LlamaResponse } from '../../llama-server';

export type GetCompletionItemsFunction = (
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
) => Promise<vscode.InlineCompletionList | vscode.InlineCompletionItem[] | null>;

// No need for jest module augmentation, we'll use type casting

export type GetFIMCompletionFunction = (
    inputPrefix: string,
    inputSuffix: string,
    prompt: string,
    chunks: any[],
    nindent: number
) => Promise<LlamaResponse | undefined>;
