import { LlamaResponse } from '../../llama-server';

export interface MockLlamaResponse extends LlamaResponse {
    content: string;
}

export const createMockResponse = (content: string): MockLlamaResponse => ({
    content,
    timings: {
        predicted_ms: 100,
        predicted_n: 10,
        predicted_per_second: 100,
        prompt_ms: 50,
        prompt_n: 5,
        prompt_per_second: 100
    }
});
