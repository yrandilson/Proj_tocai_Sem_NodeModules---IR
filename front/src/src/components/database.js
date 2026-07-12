import { DataSource } from 'typeorm';
// Import your entities here to register them with TypeORM
// import { Rating } from '../entities/Rating';
// import { User } from '../entities/User';
// import { Proposal } from '../entities/Proposal';
// import { Item } from '../entities/Item'; // Assuming Item is also an entity
export const AppDataSource = new DataSource({
    type: 'sqlite', // Example: 'postgres', 'mysql', 'sqlite', etc.
    host: 'localhost', // Your database host
    port: 5432, // Your database port
    username: 'your_username', // Your database username
    password: 'your_password', // Your database password
    database: 'your_database_name', // Your database name
    synchronize: true, // Set to false in production! This creates schema automatically.
    logging: false, // Set to true to see SQL queries
    entities: [], // Add your entities here, e.g., [Rating, User, Proposal, Item]
    migrations: [],
    subscribers: [],
});
//# sourceMappingURL=database.js.map