const { query } = require('./connection');

async function seedDatabase() {
    console.log('Starting database seeding...');
    
    try {
        // Seed products
        await seedProducts();
        
        // Seed project guides
        await seedProjectGuides();
        
        // Seed stores
        await seedStores();
        
        // Seed compatibility rules
        await seedCompatibilityRules();
        
        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Database seeding failed:', error);
        throw error;
    }
}

async function seedProducts() {
    console.log('Seeding products...');
    
    const products = [
        {
            sku: 'FAU-001',
            name: 'Moen Arbor Single Handle Kitchen Faucet',
            description: 'High-arc kitchen faucet with pull-down sprayer featuring spot-resistant stainless finish',
            category: 'plumbing',
            price: 179.99,
            availability: true,
            storeLocation: 'Aisle 12, Bay A',
            imageUrl: '/images/moen-arbor-faucet.jpg',
            compatibility: ['standard sink holes', 'granite countertops', 'undermount sinks']
        },
        {
            sku: 'FAU-002',
            name: 'Delta Leland Kitchen Faucet',
            description: 'Traditional style kitchen faucet with diamond seal technology and lifetime warranty',
            category: 'plumbing',
            price: 198.50,
            availability: true,
            storeLocation: 'Aisle 12, Bay B',
            compatibility: ['standard sink holes', 'marble countertops', 'drop-in sinks']
        },
        {
            sku: 'FAU-003',
            name: 'Kohler Simplice Bar Sink Faucet',
            description: 'Compact bar sink faucet with high-arc spout and single handle operation',
            category: 'plumbing',
            price: 142.75,
            availability: true,
            storeLocation: 'Aisle 12, Bay C',
            compatibility: ['bar sinks', 'prep sinks', 'small spaces']
        },
        {
            sku: 'TOOL-001',
            name: 'Adjustable Wrench Set',
            description: '3-piece adjustable wrench set (8", 10", 12") with comfortable grip handles',
            category: 'tools',
            price: 24.99,
            availability: true,
            storeLocation: 'Aisle 5, Bay C',
            compatibility: ['plumbing installations', 'general repairs', 'automotive work']
        },
        {
            sku: 'TOOL-002',
            name: 'Basin Wrench',
            description: 'Essential plumbing tool for reaching tight spaces under sinks',
            category: 'tools',
            price: 18.95,
            availability: true,
            storeLocation: 'Aisle 5, Bay D',
            compatibility: ['faucet installation', 'sink repairs', 'tight spaces']
        },
        {
            sku: 'SUPP-001',
            name: 'Braided Water Supply Lines',
            description: '24-inch braided stainless steel water supply lines (pair)',
            category: 'plumbing-supplies',
            price: 12.99,
            availability: true,
            storeLocation: 'Aisle 13, Bay A',
            compatibility: ['kitchen faucets', 'bathroom faucets', 'standard connections']
        },
        {
            sku: 'SUPP-002',
            name: 'Plumber\'s Putty',
            description: '14oz plumber\'s putty for sealing and setting fixtures',
            category: 'plumbing-supplies',
            price: 4.99,
            availability: true,
            storeLocation: 'Aisle 13, Bay B',
            compatibility: ['faucet installation', 'drain assembly', 'fixture sealing']
        },
        {
            sku: 'ELEC-001',
            name: 'GFCI Outlet 20A',
            description: '20-amp GFCI outlet with LED indicator and weather-resistant cover',
            category: 'electrical',
            price: 22.50,
            availability: true,
            storeLocation: 'Aisle 8, Bay A',
            compatibility: ['bathroom installation', 'kitchen installation', 'outdoor use']
        },
        {
            sku: 'PAIN-001',
            name: 'Benjamin Moore Advance Paint',
            description: 'Premium interior paint with alkyd-like durability and latex cleanup',
            category: 'paint',
            price: 67.99,
            availability: true,
            storeLocation: 'Aisle 2, Bay A',
            compatibility: ['interior walls', 'trim work', 'cabinets']
        },
        {
            sku: 'HARD-001',
            name: 'Stainless Steel Screws',
            description: '1/4" x 2" stainless steel screws (25-pack) with corrosion resistance',
            category: 'hardware',
            price: 8.75,
            availability: false,
            storeLocation: 'Aisle 7, Bay C',
            compatibility: ['outdoor projects', 'marine applications', 'kitchen fixtures']
        }
    ];
    
    for (const product of products) {
        await query(
            `INSERT INTO products 
             (sku, name, description, category, price, availability, store_location, image_url, compatibility)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (sku) DO NOTHING`,
            [
                product.sku,
                product.name,
                product.description,
                product.category,
                product.price,
                product.availability,
                product.storeLocation,
                product.imageUrl,
                product.compatibility
            ]
        );
    }
    
    console.log(`Seeded ${products.length} products`);
}

async function seedProjectGuides() {
    console.log('Seeding project guides...');
    
    const faucetGuide = {
        projectType: 'faucet_installation',
        title: 'Kitchen Faucet Installation',
        description: 'Complete step-by-step guide to installing a new kitchen faucet safely and correctly',
        difficulty: 'BEGINNER',
        estimatedTime: '1-2 hours',
        steps: [
            {
                stepNumber: 1,
                title: 'Gather tools and materials',
                description: 'Collect all necessary tools including adjustable wrench, basin wrench, flashlight, and bucket. Ensure you have supply lines and plumber\'s putty.',
                tips: ['Lay out all tools before starting', 'Have a towel ready for cleanup'],
                warnings: ['Make sure new faucet fits your sink configuration']
            },
            {
                stepNumber: 2,
                title: 'Turn off water supply',
                description: 'Locate shut-off valves under the sink and turn them clockwise to stop water flow. If valves are stuck, you may need to turn off water at the main.',
                tips: ['Test faucet after closing valves to ensure water is off'],
                warnings: ['Never skip this step - water damage can be extensive']
            },
            {
                stepNumber: 3,
                title: 'Disconnect supply lines',
                description: 'Use adjustable wrench to disconnect hot and cold water supply lines from the old faucet. Have bucket ready to catch remaining water.',
                tips: ['Take photos of connections for reference', 'Label hot and cold lines'],
                warnings: ['Don\'t force connections - use penetrating oil if stuck']
            },
            {
                stepNumber: 4,
                title: 'Remove old faucet',
                description: 'Use basin wrench to remove mounting nuts from under the sink. Lift old faucet out from above once all connections are removed.',
                tips: ['Basin wrench makes this job much easier', 'Have helper support faucet from above'],
                warnings: ['Mounting nuts may be very tight - be patient']
            },
            {
                stepNumber: 5,
                title: 'Clean mounting area',
                description: 'Remove old putty, caulk, and debris from around sink holes. Clean surface with mild detergent and dry thoroughly.',
                tips: ['Use plastic scraper to avoid scratching sink', 'Ensure surface is completely clean for good seal']
            },
            {
                stepNumber: 6,
                title: 'Install new faucet',
                description: 'Apply plumber\'s putty or gasket as specified in instructions. Insert faucet through mounting holes and secure with provided hardware from underneath.',
                tips: ['Don\'t over-tighten mounting nuts', 'Ensure faucet is aligned properly before final tightening'],
                warnings: ['Follow manufacturer\'s instructions exactly for warranty coverage']
            },
            {
                stepNumber: 7,
                title: 'Connect supply lines',
                description: 'Attach new supply lines to faucet connections, ensuring hot goes to left and cold to right. Hand tighten plus 1/4 turn with wrench.',
                tips: ['Use thread sealant tape if recommended', 'Don\'t cross-thread connections'],
                warnings: ['Over-tightening can crack connections - snug is enough']
            },
            {
                stepNumber: 8,
                title: 'Test installation',
                description: 'Turn water supply valves back on slowly. Test all faucet functions including sprayer if equipped. Check all connections for leaks.',
                tips: ['Run both hot and cold water for several minutes', 'Check connections again after 24 hours'],
                warnings: ['If leaks occur, turn off water immediately and check connections']
            }
        ],
        requiredTools: [
            'Adjustable wrench set',
            'Basin wrench',
            'Flashlight',
            'Bucket',
            'Screwdriver set',
            'Towels'
        ],
        requiredMaterials: [
            {
                name: 'New kitchen faucet',
                category: 'Faucet',
                essential: true
            },
            {
                name: 'Water supply lines',
                category: 'Plumbing supplies',
                essential: true
            },
            {
                name: 'Plumber\'s putty or gasket',
                category: 'Plumbing supplies',
                essential: true
            },
            {
                name: 'Thread sealant tape',
                category: 'Plumbing supplies',
                essential: false
            }
        ]
    };
    
    await query(
        `INSERT INTO project_guides 
         (project_type, title, description, difficulty, estimated_time, steps, required_tools, required_materials)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (project_type, difficulty) DO NOTHING`,
        [
            faucetGuide.projectType,
            faucetGuide.title,
            faucetGuide.description,
            faucetGuide.difficulty,
            faucetGuide.estimatedTime,
            JSON.stringify(faucetGuide.steps),
            faucetGuide.requiredTools,
            JSON.stringify(faucetGuide.requiredMaterials)
        ]
    );
    
    console.log('Seeded project guides');
}

async function seedStores() {
    console.log('Seeding stores...');
    
    const stores = [
        {
            name: 'Main Street Hardware',
            address: '123 Main Street, Anytown, USA 12345',
            phone: '(555) 123-4567',
            apiConfig: {
                inventoryEndpoint: 'https://api.mainstreethardware.com/inventory',
                apiKey: 'demo-key-123',
                updateInterval: 300
            },
            settings: {
                timezone: 'America/New_York',
                language: 'en',
                currency: 'USD',
                taxRate: 0.0825
            }
        },
        {
            name: 'Builders Supply Co.',
            address: '456 Industrial Blvd, Construction City, USA 54321',
            phone: '(555) 987-6543',
            apiConfig: {
                inventoryEndpoint: 'https://api.builderssupply.com/products',
                apiKey: 'demo-key-456',
                updateInterval: 600
            },
            settings: {
                timezone: 'America/Chicago',
                language: 'en',
                currency: 'USD',
                taxRate: 0.075
            }
        }
    ];
    
    for (const store of stores) {
        await query(
            `INSERT INTO stores (name, address, phone, api_config, settings)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (name) DO NOTHING`,
            [store.name, store.address, store.phone, store.apiConfig, store.settings]
        );
    }
    
    console.log(`Seeded ${stores.length} stores`);
}

async function seedCompatibilityRules() {
    console.log('Seeding compatibility rules...');
    
    const rules = [
        {
            productA: 'Moen Arbor Kitchen Faucet',
            productB: 'Braided Water Supply Lines',
            compatible: true,
            notes: 'Standard 3/8" connections are compatible with braided supply lines',
            confidence: 'high'
        },
        {
            productA: 'Delta Leland Kitchen Faucet',
            productB: 'Basin Wrench',
            compatible: true,
            notes: 'Basin wrench is essential tool for installing any under-mount faucet including Delta Leland',
            confidence: 'high'
        },
        {
            productA: 'Kitchen Faucet',
            productB: 'Plumber\'s Putty',
            compatible: true,
            notes: 'Plumber\'s putty creates watertight seal for most faucet installations',
            confidence: 'high'
        },
        {
            productA: 'GFCI Outlet',
            productB: 'Kitchen Faucet',
            compatible: false,
            notes: 'Electrical outlets and plumbing fixtures serve different functions and are not directly compatible',
            confidence: 'high'
        },
        {
            productA: 'Stainless Steel Screws',
            productB: 'Kitchen Installation',
            compatible: true,
            notes: 'Stainless steel screws are ideal for kitchen environments due to moisture resistance',
            confidence: 'medium'
        }
    ];
    
    for (const rule of rules) {
        await query(
            `INSERT INTO compatibility_rules (product_a, product_b, compatible, notes, confidence)
             VALUES ($1, $2, $3, $4, $5)`,
            [rule.productA, rule.productB, rule.compatible, rule.notes, rule.confidence]
        );
    }
    
    console.log(`Seeded ${rules.length} compatibility rules`);
}

// Run seeding if this file is executed directly
if (require.main === module) {
    const { initializeDatabase } = require('./connection');
    
    initializeDatabase()
        .then(() => seedDatabase())
        .then(() => {
            console.log('All done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedDatabase };