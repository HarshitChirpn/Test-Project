import { api } from '@/lib/api';

export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  type: 'general' | 'support' | 'partnership' | 'consultation';
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  userId?: string;
  source: 'contact-form' | 'dashboard' | 'website';
  createdAt?: Date;
  updatedAt?: Date;
  respondedAt?: Date;
}

export interface NewsletterSubscription {
  id?: string;
  email: string;
  name: string;
  source: 'blog' | 'contact-form' | 'dashboard' | 'website';
  subscribed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  unsubscribedAt?: Date;
}

export const contactService = {
  // Submit a contact form
  async submitContactForm(data: Omit<ContactSubmission, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<{ success: boolean; error?: any }> {
    try {
      const submission = {
        name: data.name,
        email: data.email,
        company: data.company || '',
        phone: data.phone || '',
        subject: data.subject,
        message: data.message,
        type: data.type,
        priority: data.priority,
        userId: data.userId,
        source: data.source
      };

      const result = await api.post('/contact/submissions', submission);

      console.log('✅ Contact form submitted successfully');
      return { success: result.success };
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return { success: false, error };
    }
  },

  // Subscribe to newsletter
  async subscribeToNewsletter(email: string, name?: string, source: NewsletterSubscription['source'] = 'blog'): Promise<{ success: boolean; error?: any }> {
    try {
      const subscription = {
        name: name || '',
        email: email,
        subject: 'Newsletter Subscription',
        message: `Newsletter subscription from ${source}`,
        type: 'general' as const,
        priority: 'low' as const,
        source: source
      };

      const result = await api.post('/contact/submissions', subscription);

      console.log('✅ Newsletter subscription successful');
      return { success: result.success };
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return { success: false, error };
    }
  },

  // Get all contact submissions (admin only)
  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    try {
      const result = await api.get('/contact/submissions');

      if (result.success && result.data?.submissions) {
        return result.data.submissions;
      }

      return [];
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      return [];
    }
  },

  // Get newsletter subscriptions (admin only)
  async getNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    try {
      const result = await api.get('/contact/submissions');

      if (result.success && result.data?.submissions) {
        // Filter for newsletter subscriptions
        const newsletterSubmissions = result.data.submissions.filter((sub: any) =>
          sub.subject === 'Newsletter Subscription'
        );

        return newsletterSubmissions.map((submission: any) => ({
          id: submission._id,
          email: submission.email,
          name: submission.name,
          source: submission.source as NewsletterSubscription['source'],
          subscribed: true,
          createdAt: submission.createdAt,
          updatedAt: submission.updatedAt
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching newsletter subscriptions:', error);
      return [];
    }
  }
};
