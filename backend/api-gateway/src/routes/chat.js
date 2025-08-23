const express = require('express');
const router = express.Router();
const llmService = require('../services/llmService');
const coreService = require('../services/coreService');

// Chat endpoint
router.post('/message', async (req, res) => {
    try {
        const { message, conversationId, storeId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Processing chat message:', { message, conversationId, storeId });

        // Get response from LLM service
        const llmResponse = await llmService.processMessage({
            message,
            conversationId,
            storeId
        });

        // If LLM response includes tool calls, execute them
        let toolResults = [];
        if (llmResponse.toolCalls && llmResponse.toolCalls.length > 0) {
            toolResults = await executeToolCalls(llmResponse.toolCalls, storeId);
        }

        // Generate final response with tool results
        const finalResponse = await llmService.generateFinalResponse({
            originalMessage: message,
            llmResponse: llmResponse.content,
            toolResults,
            conversationId
        });

        res.json({
            response: finalResponse.content,
            conversationId: finalResponse.conversationId,
            timestamp: new Date().toISOString(),
            metadata: {
                toolsUsed: toolResults.length > 0,
                processingTime: Date.now() - req.startTime
            }
        });

    } catch (error) {
        console.error('Chat processing error:', error);
        res.status(500).json({ 
            error: 'Failed to process message',
            message: 'I apologize, but I encountered an error. Please try again.'
        });
    }
});

// Execute tool calls from LLM
async function executeToolCalls(toolCalls, storeId) {
    const results = [];
    
    for (const toolCall of toolCalls) {
        try {
            let result;
            
            switch (toolCall.function.name) {
                case 'search_products':
                    result = await coreService.searchProducts({
                        query: toolCall.function.arguments.query,
                        category: toolCall.function.arguments.category,
                        storeId
                    });
                    break;
                    
                case 'get_project_guide':
                    result = await coreService.getProjectGuide({
                        projectType: toolCall.function.arguments.projectType,
                        difficulty: toolCall.function.arguments.difficulty
                    });
                    break;
                    
                case 'check_compatibility':
                    result = await coreService.checkCompatibility({
                        productA: toolCall.function.arguments.productA,
                        productB: toolCall.function.arguments.productB
                    });
                    break;
                    
                default:
                    console.warn('Unknown tool call:', toolCall.function.name);
                    result = { error: `Unknown tool: ${toolCall.function.name}` };
            }
            
            results.push({
                toolCall: toolCall.function.name,
                arguments: toolCall.function.arguments,
                result
            });
            
        } catch (error) {
            console.error(`Error executing tool ${toolCall.function.name}:`, error);
            results.push({
                toolCall: toolCall.function.name,
                arguments: toolCall.function.arguments,
                error: error.message
            });
        }
    }
    
    return results;
}

// Get conversation history
router.get('/conversation/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const history = await llmService.getConversationHistory(conversationId);
        res.json(history);
    } catch (error) {
        console.error('Error fetching conversation history:', error);
        res.status(500).json({ error: 'Failed to fetch conversation history' });
    }
});

module.exports = router;