export interface Project {
    id: string;
    name: string;
    about: string;
    created_at: number;
    config: any;
}

export const projectType = {
    id: "string",
    name: "string",
    about: "string",
    created_at: "number",
    config: "object",
};