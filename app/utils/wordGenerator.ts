import { WORDS } from "./words";

export const generateWords = (count: number = 30) => {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
    }
    return result;
};
