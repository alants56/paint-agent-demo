import {Tool} from "langchain/tools";
import type {DrawParams} from "@/agent/DrawParams";

export default class DrawTool extends Tool {
    description: string;
    name: string;
    draw: (arg: DrawParams[]) => string;

    constructor({name, description, draw}: { name: string, description: string, draw: (arg: DrawParams[]) => string }) {
        super();
        this.name = name;
        this.description = description;
        this.draw = draw;
    }


    protected _call(arg: string): Promise<string> {
        console.log(this.name, "   arg ====", arg)

        let params: DrawParams[];

        const convertToValidJson = (invalidJson: string): string => {
            // 匹配非法 JSON 字符串中的键并在其周围添加双引号
            return invalidJson.replace(/(\w+)(\s*:\s*)/g, '"$1"$2');
        }

        try {
            arg = convertToValidJson(`[${arg}]`);
            params = JSON.parse(arg);
        } catch (e) {
            return Promise.resolve("invalid arg");
        }

        if (this.draw) {
            return Promise.resolve(this.draw(params));
        } else {
            return Promise.resolve("undefined draw");
        }
    }


}
