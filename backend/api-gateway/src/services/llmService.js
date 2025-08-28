const axios = require('axios');

class LLMService {
    constructor() {
        this.groqApiKey = process.env.GROQ_API_KEY;
        this.groqBaseUrl = 'https://api.groq.com/openai/v1';
        this.conversationCache = new Map(); // In production, use Redis
        
        if (!this.groqApiKey) {
            console.warn('GROQ_API_KEY not found, using mock responses');
        }
    }

    async processMessage({ message, conversationId, storeId }) {
        try {
            // Get conversation history
            const history = this.getConversationHistory(conversationId) || [];
            
            // Build messages for LLM
            const messages = [
                {
                    role: 'system',
                    content: this.getSystemPrompt(storeId)
                },
                ...history,
                {
                    role: 'user',
                    content: message
                }
            ];

            // If no API key, return mock response
            if (!this.groqApiKey) {
                return this.getMockResponse(message);
            }

            // Call Groq API
            const response = await axios.post(
                `${this.groqBaseUrl}/chat/completions`,
                {
                    model: 'llama3-70b-8192',
                    messages,
                    temperature: 0.7,
                    max_tokens: 1000,
                    tools: this.getAvailableTools(),
                    tool_choice: 'auto'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.groqApiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const assistantMessage = response.data.choices[0].message;
            
            // Update conversation history
            this.updateConversationHistory(conversationId, [
                { role: 'user', content: message },
                assistantMessage
            ]);

            return {
                content: assistantMessage.content,
                toolCalls: assistantMessage.tool_calls || [],
                conversationId
            };

        } catch (error) {
            console.error('LLM Service Error:', error.response?.data || error.message);
            
            // Fallback to mock response on API error
            return this.getMockResponse(message);
        }
    }

    getSystemPrompt(storeId) {
        return `You are HandyCan, a helpful hardware store assistant AI. You help customers with:

1. Project guidance (installation, repairs, building)
2. Tool and material recommendations
3. Product information and availability
4. Step-by-step instructions
5. Compatibility checking

IMPORTANT GUIDELINES:
- Always be helpful, friendly, and encouraging
- Ask clarifying questions to better understand their needs
- Recommend specific products when appropriate
- Provide step-by-step guidance for complex projects
- Consider safety and best practices
- If you need product information, use the search_products tool
- If you need project guidance, use the get_project_guide tool
- If checking compatibility, use the check_compatibility tool

Current store context: ${storeId || 'General hardware store'}

Be conversational and supportive. Remember that many customers may be DIY beginners.`;
    }

    getAvailableTools() {
        return [
            {
                type: 'function',
                function: {
                    name: 'search_products',
                    description: 'Search for products in the store inventory',
                    parameters: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'Search query for products'
                            },
                            category: {
                                type: 'string',
                                description: 'Product category to filter by'
                            }
                        },
                        required: ['query']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_project_guide',
                    description: 'Get step-by-step guide for a specific project',
                    parameters: {
                        type: 'object',
                        properties: {
                            projectType: {
                                type: 'string',
                                description: 'Type of project (e.g., faucet_installation, deck_building)'
                            },
                            difficulty: {
                                type: 'string',
                                enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
                                description: 'Difficulty level'
                            }
                        },
                        required: ['projectType']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'check_compatibility',
                    description: 'Check if two products are compatible with each other',
                    parameters: {
                        type: 'object',
                        properties: {
                            productA: {
                                type: 'string',
                                description: 'First product name or SKU'
                            },
                            productB: {
                                type: 'string',
                                description: 'Second product name or SKU'
                            }
                        },
                        required: ['productA', 'productB']
                    }
                }
            }
        ];
    }

    getMockResponse(message) {
        // Mock responses for development
        if (message.toLowerCase().includes('faucet')) {
            return {
                content: "I'd love to help you with your faucet installation! Let me gather some information about products that might work for your project.",
                toolCalls: [
                    {
                        function: {
                            name: 'search_products',
                            arguments: { query: 'kitchen faucet', category: 'plumbing' }
                        }
                    },
                    {
                        function: {
                            name: 'get_project_guide',
                            arguments: { projectType: 'faucet_installation', difficulty: 'BEGINNER' }
                        }
                    }
                ],
                conversationId: 'mock-conversation'
            };
        }

        return {
            content: "I'm here to help with your hardware store needs! What project are you working on today?",
            toolCalls: [],
            conversationId: 'mock-conversation'
        };
    }

    async generateFinalResponse({ originalMessage, llmResponse, toolResults, conversationId }) {
        if (toolResults.length === 0) {
            return {
                content: llmResponse,
                conversationId
            };
        }

        // Build context with tool results
        let contextualResponse = llmResponse + "\n\n";
        
        // Track which tools have been processed to avoid duplicates
        const processedTools = new Set();
        
        toolResults.forEach(result => {
            const toolKey = `${result.toolCall}-${JSON.stringify(result.arguments)}`;
            if (processedTools.has(toolKey)) {
                return; // Skip duplicate tool calls
            }
            processedTools.add(toolKey);
            
            if (result.result && !result.error) {
                switch (result.toolCall) {
                    case 'search_products':
                        if (result.result.products?.length > 0) {
                            contextualResponse += "**Here are some products I found:**\n";
                            result.result.products.slice(0, 3).forEach(product => {
                                contextualResponse += `• ${product.name} - $${product.price} (${product.availability ? 'In stock' : 'Out of stock'})\n`;
                            });
                        }
                        break;
                    case 'get_project_guide':
                        if (result.result && result.result.guide) {
                            const guide = result.result.guide;
                            contextualResponse += `\n**${guide.title || 'Project Guide'}**\n`;
                            contextualResponse += `Difficulty: ${guide.difficulty}\n`;
                            contextualResponse += `Estimated time: ${guide.estimatedTime}\n\n`;
                            contextualResponse += "**First few steps:**\n";
                            if (guide.steps && guide.steps.length > 0) {
                                guide.steps.slice(0, 3).forEach(step => {
                                    contextualResponse += `${step.stepNumber}. ${step.title}\n`;
                                });
                            }
                        }
                        break;
                }
            } else if (result.error) {
                // Handle errors gracefully without exposing technical details
                if (result.toolCall === 'get_project_guide') {
                    // Silently skip project guide errors since we have fallback content
                    console.log('Project guide not available, using fallback response');
                }
            }
        });

        return {
            content: contextualResponse,
            conversationId
        };
    }

    getConversationHistory(conversationId) {
        if (!conversationId) return [];
        return this.conversationCache.get(conversationId) || [];
    }

    updateConversationHistory(conversationId, newMessages) {
        if (!conversationId) return;
        
        const history = this.conversationCache.get(conversationId) || [];
        const updatedHistory = [...history, ...newMessages];
        
        // Keep last 20 messages to prevent context overflow
        if (updatedHistory.length > 20) {
            updatedHistory.splice(0, updatedHistory.length - 20);
        }
        
        this.conversationCache.set(conversationId, updatedHistory);
    }
}

module.exports = new LLMService();