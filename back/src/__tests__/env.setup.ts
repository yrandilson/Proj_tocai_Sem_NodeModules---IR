process.env.NODE_ENV = 'test';
process.env.DB_TYPE = 'sqlite';
process.env.DB_DATABASE = ':memory:';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
