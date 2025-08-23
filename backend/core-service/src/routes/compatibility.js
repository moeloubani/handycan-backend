const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

// Check compatibility between two products
router.post('/check', async (req, res) => {
    try {
        const { productA, productB } = req.body;
        
        if (!productA || !productB) {
            return res.status(400).json({ 
                error: 'Both productA and productB are required' 
            });
        }
        
        // First check if we have a specific compatibility rule
        const ruleResult = await query(
            `SELECT * FROM compatibility_rules 
             WHERE (product_a ILIKE $1 AND product_b ILIKE $2) 
                OR (product_a ILIKE $2 AND product_b ILIKE $1)
             ORDER BY created_at DESC 
             LIMIT 1`,
            [productA, productB]
        );
        
        if (ruleResult.rows.length > 0) {
            const rule = ruleResult.rows[0];
            return res.json({
                compatible: rule.compatible,
                productA,
                productB,
                notes: rule.notes,
                confidence: rule.confidence,
                source: 'database_rule'
            });
        }
        
        // If no specific rule, try to infer from product categories and compatibility arrays
        const productInfo = await query(
            `SELECT sku, name, category, compatibility 
             FROM products 
             WHERE sku ILIKE $1 OR name ILIKE $1 OR sku ILIKE $2 OR name ILIKE $2`,
            [`%${productA}%`, `%${productB}%`]
        );
        
        // Analyze based on available product information
        const compatibility = analyzeCompatibility(productA, productB, productInfo.rows);
        
        res.json(compatibility);
        
    } catch (error) {
        console.error('Check compatibility error:', error);
        res.status(500).json({ error: 'Failed to check compatibility' });
    }
});

// Add compatibility rule (for admin)
router.post('/rule', async (req, res) => {
    try {
        const { productA, productB, compatible, notes, confidence = 'medium' } = req.body;
        
        const result = await query(
            `INSERT INTO compatibility_rules (product_a, product_b, compatible, notes, confidence)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [productA, productB, compatible, notes, confidence]
        );
        
        res.status(201).json(result.rows[0]);
        
    } catch (error) {
        console.error('Add compatibility rule error:', error);
        res.status(500).json({ error: 'Failed to add compatibility rule' });
    }
});

// Get all compatibility rules
router.get('/rules', async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        
        const result = await query(
            'SELECT * FROM compatibility_rules ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        
        res.json({
            rules: result.rows,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: result.rows.length === parseInt(limit)
            }
        });
        
    } catch (error) {
        console.error('Get compatibility rules error:', error);
        res.status(500).json({ error: 'Failed to get compatibility rules' });
    }
});

// Update compatibility rule
router.put('/rule/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { productA, productB, compatible, notes, confidence } = req.body;
        
        const result = await query(
            `UPDATE compatibility_rules 
             SET product_a = $1, product_b = $2, compatible = $3, notes = $4, confidence = $5
             WHERE id = $6
             RETURNING *`,
            [productA, productB, compatible, notes, confidence, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Compatibility rule not found' });
        }
        
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('Update compatibility rule error:', error);
        res.status(500).json({ error: 'Failed to update compatibility rule' });
    }
});

// Analyze compatibility based on product information
function analyzeCompatibility(productA, productB, productInfo) {
    // Default response
    let result = {
        compatible: null,
        productA,
        productB,
        notes: 'No specific compatibility information available.',
        confidence: 'low',
        source: 'inference'
    };
    
    if (productInfo.length === 0) {
        return result;
    }
    
    // Find matching products
    const matchA = productInfo.find(p => 
        p.sku.toLowerCase().includes(productA.toLowerCase()) || 
        p.name.toLowerCase().includes(productA.toLowerCase())
    );
    
    const matchB = productInfo.find(p => 
        p.sku.toLowerCase().includes(productB.toLowerCase()) || 
        p.name.toLowerCase().includes(productB.toLowerCase())
    );
    
    // Check if both products are found
    if (matchA && matchB) {
        // Same category usually means compatible
        if (matchA.category === matchB.category) {
            result.compatible = true;
            result.confidence = 'medium';
            result.notes = `Both products are in the ${matchA.category} category and are likely compatible.`;
        } else {
            // Check compatibility arrays
            const compatibilityA = matchA.compatibility || [];
            const compatibilityB = matchB.compatibility || [];
            
            const aCompatibleWithB = compatibilityA.some(comp => 
                matchB.name.toLowerCase().includes(comp.toLowerCase()) ||
                matchB.category.toLowerCase().includes(comp.toLowerCase())
            );
            
            const bCompatibleWithA = compatibilityB.some(comp => 
                matchA.name.toLowerCase().includes(comp.toLowerCase()) ||
                matchA.category.toLowerCase().includes(comp.toLowerCase())
            );
            
            if (aCompatibleWithB || bCompatibleWithA) {
                result.compatible = true;
                result.confidence = 'high';
                result.notes = 'Products have been verified as compatible based on compatibility specifications.';
            } else {
                result.compatible = false;
                result.confidence = 'medium';
                result.notes = `Products are in different categories (${matchA.category} vs ${matchB.category}) and no cross-compatibility found.`;
            }
        }
    } else if (matchA || matchB) {
        const match = matchA || matchB;
        const searchTerm = matchA ? productB : productA;
        
        // Check if the unknown product is mentioned in compatibility
        const compatibility = match.compatibility || [];
        const isCompatible = compatibility.some(comp => 
            searchTerm.toLowerCase().includes(comp.toLowerCase())
        );
        
        if (isCompatible) {
            result.compatible = true;
            result.confidence = 'medium';
            result.notes = `${match.name} is compatible with ${searchTerm} based on product specifications.`;
        } else {
            result.compatible = null;
            result.confidence = 'low';
            result.notes = `Found ${match.name} but need more information about ${searchTerm} to determine compatibility.`;
        }
    }
    
    return result;
}

module.exports = router;