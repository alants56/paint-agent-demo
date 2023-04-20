import {BaseChatModel} from "langchain/chat_models/base";
import type {BaseChatModelParams} from "langchain/chat_models";
import {AIChatMessage, BaseChatMessage,} from "langchain/schema";

import type {ChatGeneration, ChatResult, MessageType,} from "langchain/schema";
import {
    AI_PROMPT,
    HUMAN_PROMPT,
    AnthropicApi,
} from "./Anthropic";
import type {
    CompletionResponse,
    SamplingParameters,
} from "./Anthropic";

function getAnthropicPromptFromMessage(type: MessageType): string {
    switch (type) {
        case "ai":
            return AI_PROMPT;
        case "human":
            return HUMAN_PROMPT;
        case "system":
            return "";
        default:
            throw new Error(`Unknown message type: ${type}`);
    }
}

const DEFAULT_STOP_SEQUENCES = [HUMAN_PROMPT];

interface ModelParams {
    /** Amount of randomness injected into the response. Ranges
     * from 0 to 1. Use temp closer to 0 for analytical /
     * multiple choice, and temp closer to 1 for creative
     * and generative tasks.
     */
    temperature?: number;

    /** Only sample from the top K options for each subsequent
     * token. Used to remove "long tail" low probability
     * responses. Defaults to -1, which disables it.
     */
    topK?: number;

    /** Does nucleus sampling, in which we compute the
     * cumulative distribution over all the options for each
     * subsequent token in decreasing probability order and
     * cut it off once it reaches a particular probability
     * specified by top_p. Defaults to -1, which disables it.
     * Note that you should either alter temperature or top_p,
     * but not both.
     */
    topP?: number;

    /** A maximum number of tokens to generate before stopping. */
    maxTokensToSample: number;

    /** A list of strings upon which to stop generating.
     * You probably want ["\n\nHuman:"], as that's the cue for
     * the next turn in the dialog agent.
     */
    stopSequences?: string[];

    /** Whether to stream the results or not */
    streaming?: boolean;
}

/**
 * Input to AnthropicChat class.
 * @augments ModelParams
 */
interface AnthropicInput extends ModelParams {
    /** Anthropic API key */
    apiKey?: string;

    /** Model name to use */
    modelName: string;

    /** Holds any additional parameters that are valid to pass to {@link
        * https://console.anthropic.com/docs/api/reference |
   * `anthropic.complete`} that are not explicitly specified on this class.
     */
    invocationKwargs?: Kwargs;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Kwargs = Record<string, any>;

/**
 * Wrapper around Anthropic large language models.
 *
 * To use you should have the `@anthropic-ai/sdk` package installed, with the
 * `ANTHROPIC_API_KEY` environment variable set.
 *
 * @remarks
 * Any parameters that are valid to be passed to {@link
    * https://console.anthropic.com/docs/api/reference |
 * `anthropic.complete`} can be passed through {@link invocationKwargs},
 * even if not explicitly available on this class.
 *
 * @augments BaseLLM
 * @augments AnthropicInput
 */
export class AnthropicModel extends BaseChatModel implements AnthropicInput {
    apiKey?: string;

    temperature = 0.9;

    topK = -1;

    topP = -1;

    maxTokensToSample = 2048;

    modelName = "claude-v1.3";

    invocationKwargs?: Kwargs;

    stopSequences?: string[];

    streaming = false;

    // Used for non-streaming requests
    private batchClient: AnthropicApi | undefined;

    // Used for streaming requests
    private streamingClient: AnthropicApi | undefined;

    constructor(
        fields?: Partial<AnthropicInput> &
            BaseChatModelParams & {
            anthropicApiKey?: string;
        }
    ) {
        super(fields ?? {});

        this.apiKey = fields?.anthropicApiKey
        if (!this.apiKey) {
            throw new Error("Anthropic API key not found");
        }

        this.modelName = fields?.modelName ?? this.modelName;
        this.invocationKwargs = fields?.invocationKwargs ?? {};

        this.temperature = fields?.temperature ?? this.temperature;
        this.topK = fields?.topK ?? this.topK;
        this.topP = fields?.topP ?? this.topP;
        this.maxTokensToSample =
            fields?.maxTokensToSample ?? this.maxTokensToSample;
        this.stopSequences = fields?.stopSequences ?? this.stopSequences;

        this.streaming = fields?.streaming ?? false;
    }

    /**
     * Get the parameters used to invoke the model
     */
    invocationParams(): Omit<SamplingParameters, "prompt"> & Kwargs {
        return {
            model: this.modelName,
            temperature: this.temperature,
            top_k: this.topK,
            top_p: this.topP,
            stop_sequences: this.stopSequences ?? DEFAULT_STOP_SEQUENCES,
            max_tokens_to_sample: this.maxTokensToSample,
            stream: this.streaming,
            ...this.invocationKwargs,
        };
    }

    _identifyingParams() {
        return {
            model_name: this.modelName,
            ...this.invocationParams(),
        };
    }

    /**
     * Get the identifying parameters for the model
     */
    identifyingParams() {
        return {
            model_name: this.modelName,
            ...this.invocationParams(),
        };
    }

    private formatMessagesAsPrompt(messages: BaseChatMessage[]): string {
        return (
            messages
                .map((message) => {
                    const messagePrompt = getAnthropicPromptFromMessage(
                        message._getType()
                    );
                    return `${messagePrompt} ${message.text}`;
                })
                .join("") + AI_PROMPT
        );
    }

    /**
     * Call out to Anthropic's endpoint with k unique prompts
     *
     * @param messages - The messages to pass into the model.
     * @param [stopSequences] - Optional list of stop sequences to use when generating.
     *
     * @returns The full LLM output.
     *
     * @example
     * ```ts
     * import { ChatAnthropic } from "langchain/chat_models/openai";
     * const anthropic = new ChatAnthropic();
     * const response = await anthropic.generate(new HumanChatMessage(["Tell me a joke."]));
     * ```
     */
    async _generate(
        messages: BaseChatMessage[],
        stopSequences?: string[]
    ): Promise<ChatResult> {
        if (this.stopSequences && stopSequences) {
            throw new Error(
                `"stopSequence" parameter found in input and default params`
            );
        }

        const params = this.invocationParams();
        params.stop_sequences = stopSequences
            ? stopSequences.concat(DEFAULT_STOP_SEQUENCES)
            : params.stop_sequences;

        const response = await this.completionWithRetry({
            ...params,
            prompt: this.formatMessagesAsPrompt(messages),
        });

        const generations: ChatGeneration[] = response.completion
            .split(AI_PROMPT)
            .map((message) => ({
                text: message,
                message: new AIChatMessage(message),
            }));

        return {
            generations,
        };
    }

    /** @ignore */
    async completionWithRetry(
        request: SamplingParameters & Kwargs
    ): Promise<CompletionResponse> {
        if (!this.apiKey) {
            throw new Error("Missing Anthropic API key.");
        }
        let makeCompletionRequest;
        if (request.stream) {
            if (!this.streamingClient) {
                this.streamingClient = new AnthropicApi(this.apiKey);
            }
            makeCompletionRequest = async () => {
                let currentCompletion = "";
                return this.streamingClient?.completeStream(request, {
                    onUpdate: (data: CompletionResponse) => {
                        if (data.stop_reason) {
                            return;
                        }
                        const part = data.completion;
                        if (part) {
                            const delta = part.slice(currentCompletion.length);
                            currentCompletion += delta ?? "";
                            // eslint-disable-next-line no-void
                            void this.callbackManager.handleLLMNewToken(delta ?? "", true);
                        }
                    },
                });
            };
        } else {
            if (!this.batchClient) {
                this.batchClient = new AnthropicApi(this.apiKey);
            }
            makeCompletionRequest = async () => this.batchClient.complete(request);
        }
        return this.caller.call(makeCompletionRequest);
    }

    _llmType() {
        return "anthropic";
    }

    _combineLLMOutput() {
        return [];
    }
}
