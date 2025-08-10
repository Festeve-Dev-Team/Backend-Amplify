import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const createMongoConfig = (configService: ConfigService): MongooseModuleOptions => {
  const uri = configService.get<string>('MONGODB_URI');
  const dbName = configService.get<string>('DB_NAME');
  
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  console.log(`MongoDB connecting to database: ${dbName || 'default'}`);
  console.log(`MongoDB URI configured: ${uri ? 'Yes' : 'No'}`);

  return {
    uri,
    dbName,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    bufferCommands: false, // Disable mongoose buffering
    bufferMaxEntries: 0, // Disable mongoose buffering
    connectionFactory: (connection) => {
      console.log('MongoDB connection established');
      return connection;
    },
  };
};
