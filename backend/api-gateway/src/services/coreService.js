const axios = require('axios');

class CoreService {
    constructor() {
        this.coreServiceUrl = process.env.CORE_SERVICE_URL || 'http://localhost:3002';
    }

    async searchProducts({ query, category, storeId }) {
        try {
            const response = await axios.post(`${this.coreServiceUrl}/api/products/search`, {
                query,
                category,
                storeId
            });
            return response.data;
        } catch (error) {
            console.error('Error searching products:', error.message);
            return this.getMockProductResults(query, category);
        }
    }

    async getProjectGuide({ projectType, difficulty }) {
        try {
            const response = await axios.get(`${this.coreServiceUrl}/api/guides/${projectType}`, {
                params: { difficulty }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting project guide:', error.message);
            return this.getMockProjectGuide(projectType, difficulty);
        }
    }

    async checkCompatibility({ productA, productB }) {
        try {
            const response = await axios.post(`${this.coreServiceUrl}/api/compatibility/check`, {
                productA,
                productB
            });
            return response.data;
        } catch (error) {
            console.error('Error checking compatibility:', error.message);
            return this.getMockCompatibilityResult(productA, productB);
        }
    }

    // Mock responses for development
    getMockProductResults(query, category) {
        const mockProducts = [
            {
                sku: 'FAU-001',
                name: 'Moen Arbor Single Handle Kitchen Faucet',
                description: 'High-arc kitchen faucet with pull-down sprayer',
                category: 'plumbing',
                price: 179.99,
                availability: true,
                storeLocation: 'Aisle 12, Bay A',
                compatibility: ['standard sink holes', 'granite countertops']
            },
            {
                sku: 'FAU-002',
                name: 'Delta Leland Kitchen Faucet',
                description: 'Traditional style with diamond seal technology',
                category: 'plumbing',
                price: 198.50,
                availability: true,
                storeLocation: 'Aisle 12, Bay B',
                compatibility: ['standard sink holes', 'marble countertops']
            },
            {
                sku: 'TOOL-001',
                name: 'Adjustable Wrench Set',
                description: '3-piece adjustable wrench set (8", 10", 12")',
                category: 'tools',
                price: 24.99,
                availability: true,
                storeLocation: 'Aisle 5, Bay C',
                compatibility: ['plumbing installations', 'general repairs']
            }
        ];

        // Filter based on query and category
        let filteredProducts = mockProducts;
        
        if (category) {
            filteredProducts = filteredProducts.filter(p => 
                p.category.toLowerCase().includes(category.toLowerCase())
            );
        }
        
        if (query) {
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.description.toLowerCase().includes(query.toLowerCase())
            );
        }

        return {
            products: filteredProducts,
            totalCount: filteredProducts.length,
            query,
            category
        };
    }

    getMockProjectGuide(projectType, difficulty) {
        const guides = {
            'faucet_installation': {
                id: 'guide-faucet-001',
                title: 'Kitchen Faucet Installation',
                description: 'Complete guide to installing a new kitchen faucet',
                difficulty: difficulty || 'BEGINNER',
                estimatedTime: '1-2 hours',
                steps: [
                    {
                        stepNumber: 1,
                        title: 'Turn off water supply',
                        description: 'Locate the shut-off valves under the sink and turn them clockwise to stop water flow.',
                        tips: ['Use a flashlight to see clearly under the sink'],
                        warnings: ['Make sure water is completely off before proceeding']
                    },
                    {
                        stepNumber: 2,
                        title: 'Remove old faucet',
                        description: 'Disconnect supply lines and remove mounting nuts to lift out the old faucet.',
                        tips: ['Take a photo before disconnecting for reference'],
                        warnings: ['Have a bucket ready to catch any remaining water']
                    },
                    {
                        stepNumber: 3,
                        title: 'Clean the sink surface',
                        description: 'Remove old putty or caulk and clean the mounting surface.',
                        tips: ['Use a plastic scraper to avoid scratching the sink']
                    },
                    {
                        stepNumber: 4,
                        title: 'Install new faucet',
                        description: 'Place the new faucet through the mounting holes and secure with provided hardware.',
                        tips: ['Apply plumber\'s putty or gasket as specified in instructions']
                    },
                    {
                        stepNumber: 5,
                        title: 'Connect supply lines',
                        description: 'Attach hot and cold water supply lines to the faucet.',
                        warnings: ['Don\'t overtighten - hand tight plus 1/4 turn with wrench']
                    },
                    {
                        stepNumber: 6,
                        title: 'Test the installation',
                        description: 'Turn water supply back on and test all functions.',
                        tips: ['Check for leaks at all connection points']
                    }
                ],
                requiredTools: [
                    'Adjustable wrench',
                    'Basin wrench',
                    'Flashlight',
                    'Bucket',
                    'Plumber\'s putty or silicone'
                ],
                requiredMaterials: [
                    'New faucet',
                    'Supply lines (if not included)',
                    'Plumber\'s putty or gasket'
                ]
            }
        };

        return {
            guide: guides[projectType] || {
                error: 'Project guide not found',
                availableGuides: Object.keys(guides)
            }
        };
    }

    getMockCompatibilityResult(productA, productB) {
        // Simple mock compatibility logic
        const compatible = Math.random() > 0.3; // 70% compatibility rate for demo
        
        return {
            compatible,
            productA,
            productB,
            notes: compatible 
                ? `${productA} and ${productB} are compatible and can be used together.`
                : `${productA} and ${productB} may not be fully compatible. Please check specifications or consult with store staff.`,
            confidence: compatible ? 'high' : 'medium'
        };
    }
}

module.exports = new CoreService();