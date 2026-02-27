
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { DifficultyLevel, QuestionFormat, StudyOutline } from "../types";

// Always use the required initialization format and obtain the API key exclusively from process.env
const getApiKey = () => {
  // @ts-ignore
  return (typeof process !== 'undefined' ? (process.env.API_KEY || process.env.GEMINI_API_KEY) : '') as string;
};

const getAI = () => {
  return new GoogleGenAI({ apiKey: getApiKey() });
};

export const generateStudyOutline = async (text: string): Promise<StudyOutline> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Analyze this study material and create a highly structured learning outline. Break it down into 3-5 distinct concepts. For each concept, provide a title, a short summary, a list of 3 key points, and a 'visualMetaphor' which is a description of a real-world scene that explains the concept visually.\n\nText: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          materialTitle: { type: Type.STRING },
          topics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                visualMetaphor: { type: Type.STRING },
                keyPoints: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["id", "title", "summary", "visualMetaphor", "keyPoints"]
            }
          }
        },
        required: ["materialTitle", "topics"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const createExplainerVideo = async (topicTitle: string, metaphor: string): Promise<string> => {
  const ai = getAI();
  const prompt = `A cinematic, highly detailed educational video for a student. The scene shows: ${metaphor}. Cinematic lighting, 4k, educational and clear representation of ${topicTitle}.`;
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");
  
  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': getApiKey(),
    },
  });
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const paraphraseText = async (text: string, tone: string = 'academic'): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Paraphrase the following text in a ${tone} tone. Keep the original meaning but improve clarity and flow. Ensure words are spaced correctly and no extra white spaces are added:\n\n${text}`,
    config: {
      temperature: 0.7,
    }
  });
  return response.text?.trim() || "Sorry, I couldn't paraphrase that.";
};

export const detectAIContent = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following text and determine if it was likely written by an AI or a human. Provide a confidence percentage and specific reasons for your conclusion. Format as JSON.\n\nText: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isAI: { type: Type.BOOLEAN },
          confidenceScore: { type: Type.NUMBER },
          reasoning: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["isAI", "confidenceScore", "reasoning"]
      }
    }
  });
  return response.text || '';
};

export const checkPlagiarism = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following text for potential plagiarism. Identify sections that look like known academic styles or highly common unoriginal phrasing. Provide a similarity score (0-100) and analysis. Format as JSON.\n\nText: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          similarityScore: { type: Type.NUMBER },
          flaggedPassages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                sourceHint: { type: Type.STRING }
              }
            }
          },
          analysis: { type: Type.STRING }
        },
        required: ["similarityScore", "analysis"]
      }
    }
  });
  return response.text || '';
};

export const generateQuestions = async (
  text: string, 
  count: number = 5, 
  difficulty: DifficultyLevel = 'medium',
  format: QuestionFormat = 'mixed',
  imagePart?: { data: string, mimeType: string }
): Promise<string> => {
  const ai = getAI();
  
  const difficultyPrompt = {
    easy: "STRICTLY fundamental questions focusing on basic definitions, facts, and key terms found explicitly in the text.",
    medium: "Analytical questions that require interpreting relationships and conceptual understanding from the provided source.",
    hard: "Complex reasoning and critical thinking questions derived from synthesizing information explicitly stated in the source."
  }[difficulty];

  const formatPrompt = {
    options: "Generate ONLY multiple-choice questions with 4 distinct options each.",
    open: "Generate ONLY open-ended/short-answer questions. Do not provide options.",
    mixed: "Generate a balanced mix of multiple-choice and open-ended questions."
  }[format];

  const corePrompt = `
You are a precision-oriented educational assessment expert. 
Your task is to generate exactly ${count} study questions BASED EXCLUSIVELY on the source content provided.

SOURCE CONTENT:
---
${text}
---
  `;

  const contents: any = {
    parts: [
      { text: corePrompt }
    ]
  };

  if (imagePart) {
    contents.parts.unshift({
      inlineData: imagePart
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }
            },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["question", "answer", "explanation"]
        }
      }
    }
  });
  return response.text || '';
};

export const editImageWithGemini = async (imageBase64: string, prompt: string, mimeType: string): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64.split(',')[1],
              mimeType: mimeType,
            },
          },
          {
            text: `Follow these instructions to edit the image: ${prompt}`,
          },
        ],
      },
    });

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image editing error:", error);
    return null;
  }
};

export const reviewDocumentAsSupervisor = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `You are an AI academic supervisor assistant called "AI-Supervisor" for the LearnPal 2.0 platform. Your task is to review a student’s document or text before it is submitted to their human supervisor. 

For each document, you must:
1. Detect missing links or gaps in the argument or explanation.
2. Identify weak areas or points that need clarification or stronger evidence.
3. Flag inconsistencies, contradictions, or unclear phrasing.
4. Suggest concrete corrections and improvements in writing, structure, or logic.
5. Refine the overall structure and logical flow of the document.
6. Provide actionable, easy-to-understand feedback that the student can implement before final submission.
7. Maintain an encouraging and professional tone appropriate for MBA-level academic work.

Do not rewrite the entire document; focus on detecting flaws, missing links, or weak areas, and provide clear instructions for correction. Ensure the feedback is comprehensive but concise, as if preparing the document for final supervisor review.

Output your analysis in a structured JSON format.

Text to review:
${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedIssues: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          suggestedImprovements: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          structuralRecommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          overallFeedback: { type: Type.STRING }
        },
        required: ["detectedIssues", "suggestedImprovements", "structuralRecommendations", "overallFeedback"]
      }
    }
  });
  return response.text || '';
};
