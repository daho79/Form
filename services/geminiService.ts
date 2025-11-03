
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType } from "../types";

const FORM_GENERATION_MODEL = 'gemini-2.5-flash';

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "The question text."
      },
      type: {
        type: Type.STRING,
        enum: [QuestionType.TEXT, QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOXES, QuestionType.DROPDOWN],
        description: "The type of question."
      },
      required: {
        type: Type.BOOLEAN,
        description: "Whether the question is required."
      },
      options: {
        type: Type.ARRAY,
        description: "A list of option strings for multiple choice, checkbox, or dropdown questions. Empty for text questions.",
        items: {
          type: Type.STRING
        }
      }
    },
    required: ["title", "type", "required"],
    propertyOrdering: ["title", "type", "required", "options"],
  },
};


export const generateFormQuestions = async (topic: string): Promise<Omit<Question, 'id'>[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: FORM_GENERATION_MODEL,
            contents: `Generate a list of relevant questions for a form about "${topic}". The questions should be diverse and practical for collecting information.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const generatedQuestions = JSON.parse(jsonText);

        return generatedQuestions.map((q: any) => ({
            title: q.title || 'Untitled Question',
            type: q.type || QuestionType.TEXT,
            required: q.required || false,
            options: (q.options || []).map((opt: string) => ({
                id: crypto.randomUUID(),
                value: opt,
            })),
        }));

    } catch (error) {
        console.error("Error generating form questions with Gemini:", error);
        throw new Error("Failed to generate questions. Please check your API key and try again.");
    }
};
