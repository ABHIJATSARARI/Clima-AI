

import { GoogleGenAI, Type } from "@google/genai";
import type { Location, ClimateRiskType, ActionPlan, Challenge, ComparisonData, RiskData, UserProfile, ChatMessage } from '../types';
import { getWeatherForecast } from "./weatherService"; // Import for function calling
import type { HistoricalData } from "./climateDataService";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const actionPlanSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A brief, 2-3 sentence summary of the climate risk and the general approach for mitigation."
        },
        items: {
            type: Type.ARRAY,
            description: "A list of specific, actionable items.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A short, clear title for the action item." },
                    description: { type: Type.STRING, description: "A detailed description of the action to take." },
                    category: {
                        type: Type.STRING,
                        enum: ['Home', 'Community', 'Farming', 'Conservation'],
                        description: "The category of the action item."
                    },
                    priority: {
                        type: Type.STRING,
                        enum: ['High', 'Medium', 'Low'],
                        description: "The priority level of the action item."
                    },
                    status: {
                        type: Type.STRING,
                        enum: ['To Do'],
                        description: "The initial status of the action item. Always set to 'To Do'."
                    },
                    resources: {
                        type: Type.ARRAY,
                        description: "An optional list of helpful external resources or links.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "The title or name of the resource link." },
                                url: { type: Type.STRING, description: "The full URL to the external resource." }
                            },
                            required: ['title', 'url']
                        }
                    }
                },
                required: ['title', 'description', 'category', 'priority', 'status']
            }
        }
    },
    required: ['summary', 'items']
};

const projectionSchema = {
    type: Type.OBJECT,
    properties: {
        projection: {
            type: Type.ARRAY,
            description: "A list of projected data points for the next 5-10 years.",
            items: {
                type: Type.OBJECT,
                properties: {
                    year: { type: Type.STRING, description: "The projected year (e.g., '2030')." },
                    value: { type: Type.NUMBER, description: "The projected anomaly value for that year." }
                },
                required: ['year', 'value']
            }
        }
    },
    required: ['projection']
};


const challengeSchema = {
    type: Type.OBJECT,
    properties: {
        challenges: {
            type: Type.ARRAY,
            description: "A list of 5 personalized challenges.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A short, clear title for the challenge." },
                    description: { type: Type.STRING, description: "A brief description of the challenge." },
                    category: {
                        type: Type.STRING,
                        enum: ['Energy', 'Water', 'Waste', 'Transport'],
                        description: "The category of the challenge."
                    }
                },
                required: ['title', 'description', 'category']
            }
        }
    },
    required: ['challenges']
};

const comparisonSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A brief, 2-3 sentence text summary comparing the overall climate risk profiles of the two locations."
        },
        comparison: {
            type: Type.ARRAY,
            description: "A list comparing each of the four specific climate risks.",
            items: {
                type: Type.OBJECT,
                properties: {
                    riskType: {
                        type: Type.STRING,
                        enum: ['flood', 'heatwave', 'drought', 'wildfire'],
                    },
                    myLocationScore: {
                        type: Type.INTEGER,
                        description: "An integer risk score from 1 (low risk) to 10 (high risk) for my location."
                    },
                    otherLocationScore: {
                        type: Type.INTEGER,
                        description: "An integer risk score from 1 (low risk) to 10 (high risk) for the other location."
                    }
                },
                required: ['riskType', 'myLocationScore', 'otherLocationScore']
            }
        }
    },
    required: ['summary', 'comparison']
};


const handleApiError = (error: any, context: string): never => {
    console.error(`Error in ${context}:`, error);
    const errorMessage = error.message || (error.toString ? error.toString() : '');

    if (errorMessage.includes('429')) {
        throw new Error('The service is experiencing high demand. Please wait a moment before trying again. (Rate Limit Exceeded)');
    }
    if (errorMessage.includes('503')) {
        throw new Error('The AI model is currently overloaded. Please try again in a few moments. (Service Unavailable)');
    }
    
    throw new Error('An unexpected error occurred while generating AI content. Please try again.');
};

const retryWithBackoff = async <T>(
    apiCall: () => Promise<T>,
    options: { maxRetries?: number; initialDelay?: number; failFastForRateLimit?: boolean } = {}
): Promise<T> => {
    const { maxRetries = 6, initialDelay = 8000 } = options;
    let lastError: any;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await apiCall();
        } catch (error: any) {
            lastError = error;
            const errorMessage = error.message || (error.toString ? error.toString() : '');
            
            const isRateLimitError = errorMessage.includes('429');
            const isServiceUnavailable = errorMessage.includes('503');

            if (!isRateLimitError && !isServiceUnavailable) {
                console.error("Non-retryable error detected. Failing fast.");
                handleApiError(error, 'apiCall');
            }
            
            // Fail fast for rate limit errors after 2 attempts
            if (options.failFastForRateLimit && isRateLimitError && attempt >= 2) {
                console.error(`Rate limit error persisted after ${attempt} attempts. Failing now to activate circuit breaker.`);
                break; 
            }
            
            if (attempt === maxRetries) {
                console.error(`API call failed after ${maxRetries} attempts.`);
                break;
            }

            console.warn(`Retryable error detected. Retrying in ${Math.round(delay / 1000)}s... (Attempt ${attempt}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            delay = delay * 1.5 + Math.random() * 1000;
        }
    }
    
    return handleApiError(lastError, 'apiCall');
};

export const generateActionPlan = async (location: Location, riskType: ClimateRiskType, profile?: UserProfile): Promise<ActionPlan> => {
    return retryWithBackoff(async () => {
        let context = `I live in ${location.displayName} (latitude: ${location.latitude}, longitude: ${location.longitude}).`;
        if (profile) {
            if (profile.homeType) context += ` I live in a ${profile.homeType}.`;
            if (profile.householdDetails.length > 0) context += ` My household includes ${profile.householdDetails.join(', ')}.`;
            if (profile.localEnvironment.length > 0) context += ` My immediate environment is near a ${profile.localEnvironment.join(', ')}.`;
        }

        const prompt = `${context} Generate a personalized action plan to mitigate the risks of ${riskType}. The plan should be highly relevant to my specific context. Provide a brief summary and a list of actionable items according to the provided JSON schema. Ensure every item has a status of 'To Do'. If relevant, include links to helpful external resources.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: actionPlanSchema,
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as ActionPlan;
    });
};

export const generateFutureProjections = async (
    location: Location,
    riskType: ClimateRiskType,
    historicalData: HistoricalData
): Promise<{ year: string; value: number; }[]> => {
    return retryWithBackoff(async () => {
        const historicalTrend = historicalData.data.map(d => `${d.year}: ${d.value.toFixed(2)}${historicalData.unit}`).join(', ');
        const prompt = `
        Act as a climate data scientist. I will provide you with the historical climate data anomaly for ${riskType} risk in ${location.displayName}.
        The historical data is: [${historicalTrend}].
        Based on this historical trend and general climate models for the region, project a quantifiable data trend for the next 5-10 years.
        Provide a JSON object containing an array of 2-3 future data points (e.g., for 2030, 2035). The values should represent the projected anomaly, consistent with the historical data unit (${historicalData.unit}).
        Follow the provided JSON schema exactly.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: projectionSchema,
            },
        });

        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed.projection as { year: string; value: number; }[];
    });
};

export const generateCommunityComparison = async (myLocation: Location, otherLocation: string): Promise<ComparisonData> => {
    return retryWithBackoff(async () => {
        const prompt = `Compare the primary climate risks (flood, heatwave, drought, wildfire) for my location, ${myLocation.displayName}, versus ${otherLocation}. Provide a concise text summary and then assign a risk score from 1 (low risk) to 10 (high risk) for each of the four risks for both locations. Respond with a JSON object that follows the provided schema exactly.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: comparisonSchema,
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as ComparisonData;
    });
};

export const generateDailyTip = async (): Promise<string> => {
    return retryWithBackoff(async () => {
        const prompt = `Give me one unique, actionable, and encouraging tip for reducing my personal carbon footprint today. Make it concise and positive.`;
        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
        });
        return response.text;
    });
};

export const generatePersonalizedChallenges = async (location: Location): Promise<Omit<Challenge, 'completed' | 'id'>[]> => {
    return retryWithBackoff(async () => {
        const prompt = `For a user in ${location.displayName}, generate a list of exactly 5 unique, actionable, and varied challenges to help them reduce their personal carbon footprint. The challenges should cover different categories. The response must follow the provided JSON schema exactly.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: challengeSchema,
            },
        });

        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed.challenges as Omit<Challenge, 'completed' | 'id'>[];
    });
};

export const generateShareableSummary = async (location: Location, riskType: ClimateRiskType, reportData: Partial<RiskData>): Promise<string> => {
     return retryWithBackoff(async () => {
        const highPriorityAction = reportData.actionPlan?.items.find(item => item.priority === 'High')?.title || "developing a preparedness plan";

        const prompt = `Create a concise, shareable summary (like for Twitter/X) about the climate risk of ${riskType} in ${location.displayName}.
        
        The summary should be engaging and informative for a general audience. Start by mentioning the risk and location. Include the key insight that a crucial step for residents is "${highPriorityAction}".
        
        End with a positive call to action and include a relevant hashtag like #ClimateAction, #ClimateReady, or #${riskType}Safety. Keep the entire text under 280 characters.`;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
        });

        return response.text;
    }, { maxRetries: 3, initialDelay: 4000 });
};

// --- AI CHAT WITH FUNCTION CALLING ---

// Tool definitions for the AI Assistant
const tools = {
  functionDeclarations: [
    {
      name: 'get_current_weather',
      description: 'Get the 5-day weather forecast for the user\'s current location.',
      parameters: {
        type: Type.OBJECT,
        properties: {},
        required: []
      },
    },
    {
      name: 'summarize_risk_report',
      description: 'Summarize a previously generated climate risk report for the user. Use this if the user asks for their action items, risks, or preparedness plan.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          riskType: {
            type: Type.STRING,
            description: "The type of climate risk to summarize.",
            enum: ['flood', 'heatwave', 'drought', 'wildfire']
          },
        },
        required: ['riskType']
      },
    },
  ],
};


// Context provided from the App to the tools
interface ToolContext {
    location: Location | null;
    riskData: Partial<Record<ClimateRiskType, Partial<RiskData>>>;
}

export const generateChatResponse = async (
    history: ChatMessage[],
    context: ToolContext,
    setToolStatus: (status: string) => void
): Promise<string> => {
    return retryWithBackoff(async () => {
        const systemInstruction = "You are CLIMA, a friendly and knowledgeable AI assistant specializing in climate science, risk assessment, and preparedness. Your goal is to provide clear, accurate, and accessible answers. You have tools to access real-time weather and user-specific risk reports. Use your tools when a user's question can be answered by them.";

        const contents = history.map(msg => ({
            role: msg.role === 'tool' ? 'model' : msg.role, // The API expects tool responses to have the 'model' role
            parts: msg.role === 'tool'
                ? [{ functionResponse: { name: msg.toolCall!.name, response: { content: msg.text } } }]
                : [{ text: msg.text }],
        }));

        // Initial call to the model
        let response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: contents,
            config: { 
                systemInstruction,
                tools: [tools] 
            },
        });

        const functionCalls = response.functionCalls;
        
        // If the model returns a function call, handle it
        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            let toolResultContent: string;
            
            setToolStatus(`Using tool: ${call.name}...`);

            // Execute the called function
            if (call.name === 'get_current_weather') {
                if (!context.location) {
                    toolResultContent = "I can't get the weather because I don't know the user's location.";
                } else {
                    try {
                        const forecast = await getWeatherForecast(context.location);
                        toolResultContent = `The 5-day forecast is: ${forecast.map(d => `${d.day}: ${d.highTemp}°/${d.lowTemp}°C`).join(', ')}`;
                    } catch (e: any) {
                        toolResultContent = `An error occurred while fetching the weather: ${e.message}`;
                    }
                }
            } else if (call.name === 'summarize_risk_report') {
                const riskType = call.args.riskType as ClimateRiskType;
                const report = context.riskData[riskType];
                if (!report?.actionPlan) {
                    toolResultContent = `The user has not generated a report for ${riskType} risk yet. Ask them to go to the dashboard and generate one first.`;
                } else {
                    const highPriorityItems = report.actionPlan.items.filter(i => i.priority === 'High').map(i => i.title).join(', ');
                    toolResultContent = `For ${riskType} risk, the user's high-priority actions are: ${highPriorityItems || 'None'}. The overall summary is: ${report.actionPlan.summary}`;
                }
            } else {
                toolResultContent = "Unknown tool called.";
            }

            // Send the tool's result back to the model
            const toolResponseHistory = [
                ...contents,
                { role: 'model', parts: [{ functionCall: call }] },
                { role: 'model', parts: [{ functionResponse: { name: call.name, response: { content: toolResultContent } } }] }
            ];

            response = await ai.models.generateContent({
                model: 'gemini-flash-lite-latest',
                contents: toolResponseHistory,
            });
        }
        
        setToolStatus('idle');
        return response.text;
    }, { maxRetries: 4, initialDelay: 3000 });
};