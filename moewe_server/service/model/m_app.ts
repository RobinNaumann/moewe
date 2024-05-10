export interface App {
    id: string;
    project: string;
    name: string;
    config: {[key: string]: string | number | boolean};
}

export const appType = {
    id: "string",
    project: "string",
    name: "string",
    config: "object",
};