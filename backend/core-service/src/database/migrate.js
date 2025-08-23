const { initializeDatabase } = require('./connection');
const { seedDatabase } = require('./seed');

async function migrate() {
    console.log('Starting database migration...');
    
    try {
        // Initialize database and create tables
        await initializeDatabase();
        console.log('Database migration completed successfully!');
        
        // Only seed in development
        if (process.env.NODE_ENV !== 'production') {
            console.log('Development environment detected, seeding database...');
            await seedDatabase();
            console.log('Database seeding completed!');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrate();
}

module.exports = { migrate };