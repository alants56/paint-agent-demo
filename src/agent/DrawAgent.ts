import {OpenAI} from "langchain/llms/openai";
import {AgentExecutor, ZeroShotAgent} from "langchain/agents";
import {LLMChain} from "langchain";
import type DrawTool from "@/agent/DrawTool";
import {AnthropicApi} from "@/llm/anthropic/Anthropic";
import {AnthropicModel} from "@/llm/anthropic/AnthropicModel";

const OPEN_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export default class DrawAgent {
    private agentExecutor: AgentExecutor | undefined;

    constructor({tools}: { tools: DrawTool[] }) {
        const model = new OpenAI({temperature: 0, openAIApiKey: OPEN_API_KEY});
        //const model = new AnthropicModel({anthropicApiKey:ANTHROPIC_API_KEY})
        const prefix = `Imagine you are an AI painting master, specializing in assisting users in breaking down their drawing requests into basic geometric shapes (limited to circles, rectangles, and lines). When users provide you with a drawing request related to a painting, you will delve into the analysis of the request and use the aforementioned simple shapes to illustrate the creative process, thereby offering them support. Please make sure to answer each step in detail to accurately draw the corresponding geometric shapes (circles, lines, or rectangles). You have access to the following tools:`;
        const suffix = `Begin! Remember to speak as a pirate when giving your final answer by Chinese. Most importantly Action Input is a JSON contains "x","y","width","height","radius", "radiusX","radiusY","points"(a JSON only contains x1,y1,x2,y2).Use lots of "Args"

Question: {input}
{agent_scratchpad}`;

        console.log("tools ==== ", tools);

        const createPromptArgs = {
            suffix,
            prefix,
            inputVariables: ["input", "agent_scratchpad"],
        };

        const prompt = ZeroShotAgent.createPrompt(tools, createPromptArgs);

        console.log("prompt ==== ", prompt.template);


        const allowedTools = [];
        tools.forEach((item) => {
            allowedTools.push(item.name);
        })

        const llmChain = new LLMChain({llm: model, prompt})
        const agent = new ZeroShotAgent({
            llmChain,
            allowedTools: ["drawCircle", "drawRect", "drawLine", "drawEllipse", "Clear"],
        })


        this.agentExecutor = AgentExecutor.fromAgentAndTools({agent, tools});
    }

    async run({input}: { input: string }) {
        console.log("run ==== ", input);
        const result = await this.agentExecutor?.call({input});
        return result;
    }

}
