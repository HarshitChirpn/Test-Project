# Frontend Migration Instructions - Firebase to MongoDB Backend

## ✅ Already Complete

1. ✅ Backend API with all endpoints running
2. ✅ `src/lib/api.ts` - Centralized API utility
3. ✅ `src/lib/auth.ts` - Updated to use backend API
4. ✅ `src/services/userService.ts` - Updated to use backend API
5. ✅ `.env` - Backend URL configured

## 🔄 Files That Need Simple Updates

All service files need to import and use the `api` utility instead of `getMongoDBService()`.

### Pattern to Follow:

**Old Pattern:**
```typescript
import { getMongoDBService } from '@/lib/mongodb';

async someFunction() {
  const mongoService = await getMongoDBService();
  const data = await mongoService.someMethod();
  return data;
}
```

**New Pattern:**
```typescript
import { api } from '@/lib/api';

async someFunction() {
  const result = await api.get('/endpoint');
  return result.data;
}
```

## 📝 Files to Update

### 1. `src/services/onboardingService.ts`
Replace all MongoDB calls with API calls:

```typescript
import { api } from '@/lib/api';

export const onboardingService = {
  async saveOnboardingData(userId: string, data: Partial<OnboardingData>) {
    const result = await api.post(`/onboarding/${userId}`, data);
    return { success: result.success };
  },

  async getOnboardingData(userId: string) {
    const result = await api.get(`/onboarding/${userId}`);
    return result.data?.onboarding || null;
  },

  async completeOnboarding(userId: string) {
    const result = await api.post(`/onboarding/${userId}/complete`, {});
    return { success: result.success };
  },

  async resetOnboarding(userId: string) {
    const result = await api.delete(`/onboarding/${userId}`);
    return { success: result.success };
  }
};
```

### 2. `src/services/progressService.ts`
```typescript
import { api } from '@/lib/api';

export const progressService = {
  async getUserProgress(userId: string) {
    const result = await api.get(`/progress/${userId}`);
    return result.data?.progress || null;
  },

  async updateUserProgress(userId: string, progressData: Partial<UserProgress>) {
    const result = await api.put(`/progress/${userId}`, progressData);
    return { success: result.success };
  },

  async calculateProgressFromOnboarding(userId: string) {
    // This is a client-side calculation, keep as is
    const onboarding = await onboardingService.getOnboardingData(userId);
    // ... rest of calculation logic
  }
};
```

### 3. `src/services/dashboardService.ts`
```typescript
import { api } from '@/lib/api';

export const dashboardService = {
  async getDashboardStats() {
    // For admin stats
    const users = await api.get('/users');
    const purchases = await api.get('/purchases');
    // Calculate stats from data
  },

  async getRecentActivity(limit: number = 10) {
    // Fetch from multiple endpoints
  },

  async getSystemHealth() {
    const health = await api.get('/../health'); // Note: /health is not under /api
    return health.data;
  },

  async getUserDashboardData(userId: string) {
    const user = await api.get(`/users/${userId}`);
    const onboarding = await api.get(`/onboarding/${userId}`);
    const progress = await api.get(`/progress/${userId}`);
    const purchases = await api.get(`/purchases/user/${userId}`);
    // Combine and return
  }
};
```

### 4. `src/services/contactService.ts`
```typescript
import { api } from '@/lib/api';

export const contactService = {
  async submitContactForm(data: Omit<ContactSubmission, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
    const result = await api.post('/contact/submissions', data);
    return { success: result.success };
  },

  async subscribeToNewsletter(email: string, name?: string, source = 'blog') {
    const result = await api.post('/contact/submissions', {
      name: name || '',
      email,
      subject: 'Newsletter Subscription',
      message: `Newsletter subscription from ${source}`,
      type: 'general',
      priority: 'low',
      source
    });
    return { success: result.success };
  },

  async getAllContactSubmissions() {
    const result = await api.get('/contact/submissions');
    return result.data?.submissions || [];
  },

  async getNewsletterSubscriptions() {
    const result = await api.get('/contact/submissions?type=general');
    const submissions = result.data?.submissions || [];
    return submissions.filter(sub => sub.subject === 'Newsletter Subscription');
  }
};
```

### 5. `src/services/purchasedServicesService.ts`
```typescript
import { api } from '@/lib/api';

export const purchasedServicesService = {
  async getPurchasedServices(userId: string) {
    const result = await api.get(`/purchases/user/${userId}`);
    return result.data?.purchases || [];
  },

  async getServiceConsumption(userId: string) {
    const result = await api.get(`/contact/consumption/user/${userId}`);
    return result.data?.consumptions || [];
  },

  async createServiceConsumption(data: any) {
    const result = await api.post('/contact/consumption', data);
    return { success: result.success };
  }
};
```

### 6. `src/services/projectTrackingService.ts`
```typescript
import { api } from '@/lib/api';

export const projectTrackingService = {
  async getProjectsByUserId(userId: string) {
    const result = await api.get(`/progress/${userId}/projects`);
    return result.data?.projects || [];
  },

  async saveProjectTracking(projectData: any) {
    const result = await api.post('/progress/projects', projectData);
    return { success: result.success };
  }
};
```

## 🔧 Context Files to Update

### 1. `src/contexts/BlogContext.tsx`
Replace MongoDB service with API calls:

```typescript
import { api } from '@/lib/api';

// In BlogProvider:
const fetchBlogs = async () => {
  try {
    const result = await api.get('/blogs');
    if (result.success && result.data?.blogs) {
      setBlogs(result.data.blogs);
    }
  } catch (error) {
    console.error('Error fetching blogs:', error);
  }
};
```

### 2. `src/contexts/PortfolioContext.tsx`
```typescript
import { api } from '@/lib/api';

const fetchPortfolio = async () => {
  const result = await api.get('/portfolio');
  if (result.success) {
    setPortfolioItems(result.data?.portfolio || []);
  }
};
```

### 3. `src/contexts/ServicesContext.tsx`
```typescript
import { api } from '@/lib/api';

const fetchServices = async () => {
  const result = await api.get('/services');
  if (result.success) {
    setServices(result.data?.services || []);
  }
};
```

### 4. `src/contexts/AdminContext.tsx`
```typescript
import { api } from '@/lib/api';

// Update all CRUD operations:
const createBlog = async (data: any) => {
  const result = await api.post('/blogs', data);
  return result.success;
};

const updateBlog = async (id: string, data: any) => {
  const result = await api.put(`/blogs/${id}`, data);
  return result.success;
};

const deleteBlog = async (id: string) => {
  const result = await api.delete(`/blogs/${id}`);
  return result.success;
};
```

## 🗑️ Remove Firebase References

### 1. Delete or Comment Out
- `src/lib/firebase.ts` (already deleted)
- Any remaining imports from `firebase/*`

### 2. Update package.json
Remove Firebase dependencies (optional, can keep for now):
```bash
npm uninstall firebase
```

### 3. Remove MongoDB Client imports
Replace all:
```typescript
import { getMongoDBService } from '@/lib/mongodb';
```
With:
```typescript
import { api } from '@/lib/api';
```

## 🚀 Start Both Servers

### 1. Backend (Terminal 1):
```bash
cd backend
npm run dev
```

Should see:
```
✅ Connected to MongoDB Atlas
🚀 Server running on port 5000
```

### 2. Frontend (Terminal 2):
```bash
npm run dev
```

Should see:
```
VITE ready in X ms
Local: http://localhost:8081
```

## 🧪 Testing Checklist

After updates, test these flows:

- [ ] User Registration (POST /api/auth/register)
- [ ] User Login (POST /api/auth/login)
- [ ] View Blogs (GET /api/blogs)
- [ ] View Services (GET /api/services)
- [ ] View Portfolio (GET /api/portfolio)
- [ ] Submit Onboarding (POST /api/onboarding/:userId)
- [ ] View User Progress (GET /api/progress/:userId)
- [ ] Submit Contact Form (POST /api/contact/submissions)
- [ ] Purchase Service (creates record via Stripe webhook)

## 📊 API Endpoint Reference

All endpoints are documented in `backend/API_DOCUMENTATION.md`

Quick reference:
- **Auth**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Blogs**: `/api/blogs/*`
- **Portfolio**: `/api/portfolio/*`
- **Services**: `/api/services/*`
- **Purchases**: `/api/purchases/*`
- **Onboarding**: `/api/onboarding/*`
- **Progress**: `/api/progress/*`
- **Contact**: `/api/contact/*`

## ⚡ Quick Migration Script

For each service file:

1. Add import: `import { api } from '@/lib/api';`
2. Remove import: `import { getMongoDBService } from '@/lib/mongodb';`
3. Replace `await getMongoDBService()` with `await api.get/post/put/delete()`
4. Update return values to use `result.data`
5. Test the functionality

## 🎯 Priority Order

1. **Auth & User Services** ✅ (Done)
2. **Blog, Portfolio, Services Contexts** (Public data)
3. **Onboarding & Progress Services** (User flows)
4. **Dashboard & Admin Services** (Admin functions)
5. **Contact & Purchase Services** (Final touches)

## 💡 Tips

- Keep Stripe configuration as is - it's separate from Firebase/MongoDB
- The backend handles all database operations now
- Frontend just needs to call REST APIs
- All authentication uses JWT tokens (stored in localStorage)

## 🆘 If Something Breaks

1. Check backend is running (`http://localhost:5000/health`)
2. Check browser console for errors
3. Check backend terminal for API errors
4. Verify `.env` has correct `VITE_API_BASE_URL`
5. Clear localStorage and try fresh login

---

**Next Step:** Update the service files one by one using the patterns above!
