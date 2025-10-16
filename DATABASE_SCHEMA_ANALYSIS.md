# Firebase to MongoDB Migration - Database Schema Analysis

## Overview
This document provides a comprehensive analysis of all Firestore collections and their data structures in the idea2mvp application, prepared for migration to MongoDB.

## Current Firestore Collections

### 1. **users** Collection
**Purpose**: User profiles and authentication data
**Document ID**: Firebase Auth UID

```typescript
interface UserDocument {
  uid: string;                    // Firebase Auth UID
  email: string;                  // User email
  displayName?: string;           // User's display name
  photoURL?: string;              // Profile picture URL
  bio?: string;                   // User biography
  linkedin?: string;              // LinkedIn profile
  website?: string;               // Personal website
  role: 'user' | 'admin';         // User role
  isActive: boolean;              // Account status
  emailVerified: boolean;         // Email verification status
  hasCompletedOnboarding?: boolean; // Onboarding completion flag
  onboardingCompletedAt?: Date;   // When onboarding was completed
  createdAt: Date;                // Account creation date
  updatedAt: Date;                // Last update date
  lastLoginAt?: Date;             // Last login timestamp
  createdViaAdmin?: boolean;      // Created by admin flag
  syncedFromFirebaseAuth?: boolean; // Sync flag
  syncedAt?: Date;                // Sync timestamp
  provider?: string;              // Auth provider (email, google, etc.)
  
  // Notification preferences
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  projectUpdates?: boolean;
  securityAlerts?: boolean;
  
  // Appearance preferences
  darkMode?: boolean;
}
```

### 2. **userOnboarding** Collection
**Purpose**: User onboarding form data
**Document ID**: Firebase Auth UID

```typescript
interface OnboardingDocument {
  // Current onboarding fields
  userType: string;               // Type of user (startup, business, etc.)
  projectName: string;            // Project name
  projectDescription: string;     // Project description
  industry: string;               // Industry sector
  timeline: string;               // Project timeline
  budget: number;                 // Project budget
  services: string[];             // Selected services
  primaryGoal: string;            // Primary project goal
  contactPreference: string;      // Preferred contact method
  
  // Legacy fields (for existing users)
  startupIdea?: string;
  briefDescription?: string;
  stage?: string;
  incubationModel?: string;
  thesis?: string;
  domain?: string;
  investmentType?: string;
  companyName?: string;
  rdProject?: string;
  teamStructure?: string;
  rdScope?: string;
  pocBudget?: number;
  
  // System fields
  isComplete?: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. **userProgress** Collection
**Purpose**: User project progress tracking
**Document ID**: Firebase Auth UID

```typescript
interface UserProgressDocument {
  userId: string;                 // User ID
  overall: number;                // Overall progress (0-100)
  phases: {
    discovery: number;            // Requirements gathering phase
    design: number;               // UI/UX design phase
    development: number;          // Development phase
    testing: number;              // Testing phase
    launch: number;               // Launch phase
    support: number;              // Support phase
  };
  milestonesCompleted: number;    // Completed milestones count
  totalMilestones: number;        // Total milestones
  lastUpdated?: Date;             // Last progress update
  currentStatus?: {
    currentPhase: string;         // Current phase
    currentSubstep: string;       // Current substep
    phaseProgress: number;        // Phase progress (0-100)
    substepProgress: number;      // Substep progress (0-100)
    updatedAt: Date;
    updatedBy?: string;           // Admin who updated
    notes?: string;
  };
}
```

### 4. **blogs** Collection
**Purpose**: Blog posts and articles
**Document ID**: Auto-generated

```typescript
interface BlogDocument {
  id: string;                     // Document ID
  title: string;                  // Blog title
  excerpt: string;                // Short description
  content: string;                // Full blog content
  author: string;                 // Author name
  category: "All" | "Web App" | "Mobile App" | "SaaS Platform";
  slug: string;                   // URL slug
  image: string;                  // Featured image URL
  featured: boolean;              // Featured post flag
  published: boolean;             // Published status
  createdAt: Date;                // Creation date
  updatedAt: Date;                // Last update date
}
```

### 5. **portfolio** Collection
**Purpose**: Portfolio items and case studies
**Document ID**: Auto-generated

```typescript
interface PortfolioDocument {
  id: string;                     // Document ID
  title: string;                  // Project title
  category: "Web App" | "Mobile App" | "SaaS Platform";
  description: string;            // Project description
  image: string;                  // Featured image
  client: string;                 // Client name
  timeline: string;               // Project timeline
  teamSize: string;               // Team size
  technologies: string[];         // Technologies used
  metrics: {
    userGrowth?: string;          // User growth metrics
    funding?: string;             // Funding information
    timeToMarket?: string;        // Time to market
    revenue?: string;             // Revenue metrics
    userRating?: string;          // User rating
  };
  testimonial: {
    quote: string;                // Client testimonial
    author: string;               // Testimonial author
    position: string;             // Author position
    company: string;              // Author company
    avatar: string;               // Author avatar
  };
  process: Array<{
    phase: string;                // Process phase
    description: string;          // Phase description
    duration: string;             // Phase duration
  }>;
  mockups: Array<{
    device: "laptop" | "mobile" | "tablet";
    image: string;                // Mockup image
    alt: string;                  // Alt text
  }>;
  results: string[];              // Project results
  featured: boolean;              // Featured project flag
  published: boolean;             // Published status
  slug: string;                   // URL slug
  createdAt: Date;                // Creation date
  updatedAt: Date;                // Last update date
}
```

### 6. **services** Collection
**Purpose**: Service offerings and pricing
**Document ID**: Auto-generated

```typescript
interface ServiceDocument {
  id: string;                     // Document ID
  title: string;                  // Service title
  description: string;            // Service description
  icon: string;                   // Service icon
  category: string;               // Service category
  order: number;                  // Display order
  serviceDetails?: {
    title: string;
    leftSection: {
      title: string;
      services: Array<{
        icon: string;
        title: string;
        description: string;
        price?: string;           // Stripe price ID
        amount?: string;          // Display price
        paymentLink?: string;     // Payment link
      }>;
    };
    rightSection: {
      services: Array<{
        icon: string;
        title: string;
        description: string;
        price?: string;
        amount?: string;
        paymentLink?: string;
      }>;
    };
  };
  createdAt: Date;                // Creation date
  updatedAt: Date;                // Last update date
}
```

### 7. **testimonials** Collection
**Purpose**: Client testimonials
**Document ID**: Auto-generated

```typescript
interface TestimonialDocument {
  id: string;                     // Document ID
  name: string;                   // Client name
  position: string;               // Client position
  company: string;                // Client company
  content: string;                // Testimonial content
  rating?: number;                // Rating (1-5)
  featured?: boolean;             // Featured testimonial
  published: boolean;             // Published status
  createdAt: Date;                // Creation date
  updatedAt: Date;                // Last update date
}
```

### 8. **contactSubmissions** Collection
**Purpose**: Contact form submissions
**Document ID**: Auto-generated

```typescript
interface ContactSubmissionDocument {
  id: string;                     // Document ID
  name: string;                   // Contact name
  email: string;                  // Contact email
  company?: string;               // Company name
  phone?: string;                 // Phone number
  subject: string;                // Subject line
  message: string;                // Message content
  type: 'general' | 'support' | 'partnership' | 'consultation';
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  userId?: string;                // Associated user ID
  source: 'contact-form' | 'dashboard' | 'website';
  createdAt: Date;                // Submission date
  updatedAt: Date;                // Last update date
  respondedAt?: Date;             // Response date
}
```

### 9. **newsletterSubscriptions** Collection
**Purpose**: Newsletter subscriptions
**Document ID**: Auto-generated

```typescript
interface NewsletterSubscriptionDocument {
  id: string;                     // Document ID
  email: string;                  // Subscriber email
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribedAt: Date;             // Subscription date
  unsubscribedAt?: Date;          // Unsubscription date
  source: string;                 // Subscription source
}
```

### 10. **purchases** Collection
**Purpose**: Stripe purchase records
**Document ID**: Auto-generated

```typescript
interface PurchaseDocument {
  id: string;                     // Document ID
  userId?: string;                // User ID (if logged in)
  userEmail: string;              // Customer email
  userName?: string;              // Customer name
  
  // Stripe details
  stripeSessionId: string;        // Stripe session ID
  stripeCustomerId?: string;      // Stripe customer ID
  stripeProductId: string;        // Stripe product ID
  stripePriceId?: string;         // Stripe price ID
  stripePaymentIntentId: string;  // Payment intent ID
  
  // Product details
  productName: string;            // Product name
  productDescription?: string;    // Product description
  category: string;               // Product category
  serviceType: string;            // Service type
  serviceId?: string;             // Internal service ID
  
  // Purchase details
  quantity: number;               // Quantity purchased
  unitPrice: number;              // Unit price (in cents)
  totalAmount: number;            // Total amount (in cents)
  currency: string;               // Currency code
  
  // Status
  status: string;                 // Purchase status
  paymentStatus: 'paid' | 'pending' | 'failed';
  
  // Timestamps
  purchasedAt: Date;              // Purchase date
  createdAt: Date;                // Record creation date
  updatedAt: Date;                // Last update date
  paidAt?: Date;                  // Payment completion date
  
  // Additional metadata
  metadata: Record<string, any>;  // Additional data
}
```

### 11. **serviceConsumption** Collection
**Purpose**: Service usage tracking
**Document ID**: Auto-generated

```typescript
interface ServiceConsumptionDocument {
  id: string;                     // Document ID
  userId: string;                 // User ID
  userEmail: string;              // User email
  userName: string;               // User name
  
  // Service details
  serviceId: string;              // Service ID
  serviceName: string;            // Service name
  serviceCategory: string;        // Service category
  serviceType: string;            // Service type
  
  // Purchase reference
  purchaseId: string;             // Purchase ID
  stripeProductId: string;        // Stripe product ID
  totalAmount: number;            // Total amount
  currency: string;               // Currency
  
  // Status
  status: 'purchased' | 'active' | 'completed' | 'cancelled';
  
  // Timestamps
  startDate: Date;                // Service start date
  endDate?: Date;                 // Service end date
  purchasedAt: Date;              // Purchase date
  createdAt: Date;                // Record creation date
  updatedAt: Date;                // Last update date
  
  // Notes
  notes?: string;                 // Additional notes
}
```

### 12. **projectTracking** Collection
**Purpose**: Admin project tracking
**Document ID**: `${userId}_${projectId}`

```typescript
interface ProjectTrackingDocument {
  projectId: string;              // Project ID
  userId: string;                 // User ID
  projectName: string;            // Project name
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  progress: number;               // Progress percentage
  milestones: Array<{
    id: string;                   // Milestone ID
    title: string;                // Milestone title
    description: string;          // Milestone description
    phase: string;                // Project phase
    status: 'pending' | 'in-progress' | 'completed' | 'delayed';
    assignedTo?: string;          // Assigned team member
    startDate?: Date;             // Start date
    dueDate?: Date;               // Due date
    completedDate?: Date;         // Completion date
    adminNotes?: string;          // Admin notes
  }>;
  lastUpdated: Date;              // Last update date
  adminNotes?: string;            // Admin notes
}
```

### 13. **accountDeletionRequests** Collection
**Purpose**: Account deletion requests
**Document ID**: Firebase Auth UID

```typescript
interface AccountDeletionRequestDocument {
  userId: string;                 // User ID
  email: string;                  // User email
  reason?: string;                // Deletion reason
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  requestedAt: Date;              // Request date
  processedAt?: Date;             // Processing date
  notes?: string;                 // Admin notes
}
```

## MongoDB Migration Considerations

### 1. **Collection Mapping**
- Each Firestore collection maps to a MongoDB collection
- Document IDs can be preserved or use MongoDB's ObjectId
- Consider using compound indexes for better query performance

### 2. **Data Type Conversions**
- Firestore Timestamps → MongoDB Date objects
- Firestore Arrays → MongoDB Arrays
- Firestore Maps → MongoDB Objects
- Firestore References → MongoDB ObjectId references

### 3. **Indexing Strategy**
```javascript
// Recommended MongoDB indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "createdAt": -1 })

db.blogs.createIndex({ "published": 1, "createdAt": -1 })
db.blogs.createIndex({ "slug": 1 }, { unique: true })
db.blogs.createIndex({ "category": 1 })

db.portfolio.createIndex({ "published": 1, "featured": 1 })
db.portfolio.createIndex({ "slug": 1 }, { unique: true })
db.portfolio.createIndex({ "category": 1 })

db.purchases.createIndex({ "userId": 1 })
db.purchases.createIndex({ "userEmail": 1 })
db.purchases.createIndex({ "stripeSessionId": 1 }, { unique: true })
db.purchases.createIndex({ "purchasedAt": -1 })

db.serviceConsumption.createIndex({ "userId": 1 })
db.serviceConsumption.createIndex({ "status": 1 })
db.serviceConsumption.createIndex({ "serviceCategory": 1 })

db.contactSubmissions.createIndex({ "status": 1 })
db.contactSubmissions.createIndex({ "createdAt": -1 })
db.contactSubmissions.createIndex({ "type": 1 })
```

### 4. **Schema Validation**
```javascript
// Example MongoDB schema validation for users collection
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["uid", "email", "role", "isActive", "createdAt", "updatedAt"],
      properties: {
        uid: { bsonType: "string" },
        email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
        role: { enum: ["user", "admin"] },
        isActive: { bsonType: "bool" },
        emailVerified: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
})
```

### 5. **Migration Script Structure**
```javascript
// Migration script structure
const migrationScript = {
  // 1. Connect to both databases
  // 2. Read from Firestore collections
  // 3. Transform data format
  // 4. Insert into MongoDB collections
  // 5. Verify data integrity
  // 6. Update application configuration
}
```

## Next Steps for Migration

1. **Set up MongoDB database and collections**
2. **Create migration scripts for each collection**
3. **Implement data validation and transformation**
4. **Update application code to use MongoDB drivers**
5. **Test migration with sample data**
6. **Plan for zero-downtime migration**
7. **Update authentication system (if needed)**
8. **Update API endpoints and services**

This analysis provides a complete foundation for migrating from Firebase Firestore to MongoDB while maintaining all existing functionality and data integrity.
