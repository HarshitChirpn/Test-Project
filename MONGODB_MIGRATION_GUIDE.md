# MongoDB Migration Guide for idea2mvp

## Overview
This guide will help you migrate your Firebase Firestore database to MongoDB while maintaining all functionality.

## Prerequisites

### 1. Install MongoDB
```bash
# Install MongoDB locally
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb

# Or use MongoDB Atlas (Cloud)
# Sign up at https://www.mongodb.com/atlas
```

### 2. Install Dependencies
```bash
# Install MongoDB dependencies
npm install mongodb firebase-admin dotenv

# Install TypeScript types
npm install --save-dev @types/mongodb @types/node typescript
```

### 3. Download Firebase Service Account
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `firebase-service-account.json` in your project root

## Migration Steps

### Step 1: Setup MongoDB
```bash
# Start MongoDB service
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Ubuntu: sudo systemctl start mongod

# Or use MongoDB Atlas (no local setup needed)
```

### Step 2: Configure Environment
```bash
# Copy the MongoDB environment file
cp .env.mongodb .env

# Edit .env with your MongoDB connection details
# For local MongoDB: MONGODB_URI=mongodb://localhost:27017
# For MongoDB Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/idea2mvp
```

### Step 3: Run Migration
```bash
# Run the migration script
node mongodb-setup.js

# Or use npm script
npm run migrate
```

### Step 4: Verify Migration
```bash
# Connect to MongoDB and verify collections
mongosh idea2mvp

# List collections
show collections

# Check document counts
db.users.countDocuments()
db.blogs.countDocuments()
db.portfolio.countDocuments()
# ... etc for each collection
```

## MongoDB Collections Created

The migration creates the following collections with proper validation and indexes:

### 1. **users**
- **Purpose**: User profiles and authentication data
- **Indexes**: email (unique), role, createdAt, isActive
- **Validation**: Required fields, email format, role enum

### 2. **userOnboarding**
- **Purpose**: User onboarding form data
- **Indexes**: userType, industry, createdAt, isComplete
- **Validation**: Required onboarding fields

### 3. **userProgress**
- **Purpose**: User project progress tracking
- **Indexes**: userId (unique), overall, lastUpdated
- **Validation**: Progress percentages, phase structure

### 4. **blogs**
- **Purpose**: Blog posts and articles
- **Indexes**: slug (unique), published+createdAt, category, featured
- **Validation**: Required blog fields, category enum

### 5. **portfolio**
- **Purpose**: Portfolio items and case studies
- **Indexes**: slug (unique), published+featured, category, createdAt
- **Validation**: Required portfolio fields, category enum

### 6. **services**
- **Purpose**: Service offerings and pricing
- **Indexes**: order, category, createdAt
- **Validation**: Required service fields

### 7. **purchases**
- **Purpose**: Stripe purchase records
- **Indexes**: userId, userEmail, stripeSessionId (unique), purchasedAt, paymentStatus
- **Validation**: Required purchase fields, payment status enum

### 8. **serviceConsumption**
- **Purpose**: Service usage tracking
- **Indexes**: userId, status, serviceCategory, purchasedAt
- **Validation**: Required consumption fields, status enum

### 9. **contactSubmissions**
- **Purpose**: Contact form submissions
- **Indexes**: status, createdAt, type, priority, email
- **Validation**: Required contact fields, type/priority enums

## Data Transformation

The migration script automatically transforms:

- **Firestore Timestamps** → **MongoDB Date objects**
- **Document IDs** → **MongoDB _id fields**
- **Nested objects** → **MongoDB embedded documents**
- **Arrays** → **MongoDB arrays**
- **Firestore references** → **MongoDB ObjectId references**

## Application Updates

### 1. Update Environment Variables
```bash
# Add to your .env file
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=idea2mvp
```

### 2. Update Service Files
Replace Firebase imports with MongoDB:
```typescript
// Old Firebase import
import { db } from '@/lib/firebase';

// New MongoDB import
import { getMongoDBService } from '@/lib/mongodb';
```

### 3. Update Database Operations
```typescript
// Old Firebase operation
const docRef = doc(db, 'users', userId);
const docSnap = await getDoc(docRef);

// New MongoDB operation
const mongoService = await getMongoDBService();
const user = await mongoService.getUserById(userId);
```

## MongoDB Atlas (Cloud) Setup

### 1. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Sign up for free account
3. Create a new cluster

### 2. Configure Database Access
1. Go to Database Access
2. Add new database user
3. Set username and password
4. Grant read/write permissions

### 3. Configure Network Access
1. Go to Network Access
2. Add IP address (0.0.0.0/0 for all IPs)
3. Or add your specific IP addresses

### 4. Get Connection String
1. Go to Clusters
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Update MONGODB_URI in .env

## Security Considerations

### 1. Environment Variables
- Never commit .env files to version control
- Use different databases for development/production
- Rotate database credentials regularly

### 2. MongoDB Security
- Enable authentication
- Use strong passwords
- Restrict network access
- Enable SSL/TLS connections

### 3. Data Validation
- All collections have schema validation
- Required fields are enforced
- Data types are validated
- Enums are restricted to valid values

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check MongoDB service is running
   - Verify connection string
   - Check firewall settings

2. **Authentication Failed**
   - Verify username/password
   - Check database user permissions
   - Ensure network access is configured

3. **Migration Errors**
   - Check Firebase service account permissions
   - Verify Firestore rules allow reading
   - Check MongoDB disk space

4. **Validation Errors**
   - Review data types in source data
   - Check required fields
   - Verify enum values

### Logs and Monitoring
```bash
# MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Application logs
node mongodb-setup.js 2>&1 | tee migration.log
```

## Performance Optimization

### 1. Indexes
- All collections have optimized indexes
- Compound indexes for common queries
- Unique indexes for data integrity

### 2. Connection Pooling
- MongoDB driver handles connection pooling
- Configure pool size based on load
- Monitor connection usage

### 3. Query Optimization
- Use projection to limit returned fields
- Implement pagination for large datasets
- Use aggregation pipelines for complex queries

## Backup and Recovery

### 1. MongoDB Backup
```bash
# Create backup
mongodump --db idea2mvp --out ./backup

# Restore backup
mongorestore --db idea2mvp ./backup/idea2mvp
```

### 2. MongoDB Atlas Backup
- Automatic backups enabled by default
- Point-in-time recovery available
- Cross-region backup replication

## Next Steps

1. **Test Migration**: Verify all data migrated correctly
2. **Update Application**: Replace Firebase calls with MongoDB
3. **Performance Testing**: Test application with MongoDB
4. **Deploy**: Deploy updated application
5. **Monitor**: Monitor performance and errors
6. **Cleanup**: Remove Firebase dependencies (optional)

## Support

For issues with this migration:
1. Check MongoDB documentation
2. Review migration logs
3. Verify data integrity
4. Test with sample data first

The migration maintains all existing functionality while providing better performance and scalability with MongoDB.

