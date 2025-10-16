import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
admin.initializeApp();

// Initialize Stripe (only if we have a key)
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  });
}

interface UserData {
  uid?: string;
  email: string;
  displayName?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
  password?: string;
}

// Middleware to verify admin access
const verifyAdmin = async (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userRecord = await admin.auth().getUser(context.auth.uid);
  const customClaims = userRecord.customClaims || {};
  
  if (!customClaims.admin) {
    throw new functions.https.HttpsError('permission-denied', 'User must be an admin');
  }
};

/**
 * Cloud Function: List all Firebase Auth users
 */
export const listUsers = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);
  
  try {
    const maxResults = data.maxResults || 100;
    const listUsersResult = await admin.auth().listUsers(maxResults);
    
    const users = listUsersResult.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
      customClaims: userRecord.customClaims,
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
      photoURL: userRecord.photoURL,
      providerData: userRecord.providerData
    }));

    return { 
      success: true, 
      users,
      totalUsers: users.length 
    };
  } catch (error) {
    console.error('Error listing users:', error);
    throw new functions.https.HttpsError('internal', 'Failed to list users');
  }
});

/**
 * Cloud Function: Create new Firebase Auth user
 */
export const createUser = functions.https.onCall(async (data: UserData, context) => {
  await verifyAdmin(context);
  
  try {
    const { email, password, displayName, role = 'user' } = data;
    
    if (!email || !password) {
      throw new functions.https.HttpsError('invalid-argument', 'Email and password are required');
    }

    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
      emailVerified: false,
    });

    // Set custom claims for role
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: role === 'admin' ? 'true' : 'false'
    });

    // Create Firestore document
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      role: role,
      isActive: true,
      emailVerified: userRecord.emailVerified,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      createdViaAdmin: true,
    });

    return {
      success: true,
      message: `User ${email} created successfully`,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: role
      }
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new functions.https.HttpsError('internal', `Failed to create user: ${error}`);
  }
});

/**
 * Cloud Function: Update user role and custom claims
 */
export const updateUserRole = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);
  
  try {
    const { uid, role } = data;
    
    if (!uid || !role || !['admin', 'user'].includes(role)) {
      throw new functions.https.HttpsError('invalid-argument', 'Valid UID and role (admin/user) are required');
    }

    // Update Firebase Auth custom claims
    await admin.auth().setCustomUserClaims(uid, {
      admin: role === 'admin' ? 'true' : 'false'
    });

    // Update Firestore document
    await admin.firestore().collection('users').doc(uid).update({
      role: role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: `User role updated to ${role}`,
      uid,
      role
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update user role');
  }
});

/**
 * Cloud Function: Enable/Disable Firebase Auth user
 */
export const updateUserStatus = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);
  
  try {
    const { uid, disabled } = data;
    
    if (!uid || typeof disabled !== 'boolean') {
      throw new functions.https.HttpsError('invalid-argument', 'UID and disabled status are required');
    }

    // Update Firebase Auth user status
    await admin.auth().updateUser(uid, { disabled });

    // Update Firestore document
    await admin.firestore().collection('users').doc(uid).update({
      isActive: !disabled,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: `User ${disabled ? 'disabled' : 'enabled'} successfully`,
      uid,
      disabled
    };
  } catch (error) {
    console.error('Error updating user status:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update user status');
  }
});

/**
 * Cloud Function: Delete Firebase Auth user
 */
export const deleteUser = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);
  
  try {
    const { uid } = data;
    
    if (!uid) {
      throw new functions.https.HttpsError('invalid-argument', 'UID is required');
    }

    // Prevent admin from deleting themselves
    if (uid === context.auth?.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Cannot delete your own account');
    }

    // Delete from Firebase Auth
    await admin.auth().deleteUser(uid);

    // Delete from Firestore
    await admin.firestore().collection('users').doc(uid).delete();

    return {
      success: true,
      message: 'User deleted successfully',
      uid
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new functions.https.HttpsError('internal', 'Failed to delete user');
  }
});

/**
 * Cloud Function: Sync Firebase Auth users to Firestore
 * Creates missing Firestore documents for existing Firebase Auth users
 */
export const syncUsersToFirestore = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);
  
  try {
    const listUsersResult = await admin.auth().listUsers();
    const firebaseAuthUsers = listUsersResult.users;
    
    let syncedCount = 0;
    let existingCount = 0;
    
    for (const userRecord of firebaseAuthUsers) {
      try {
        // Check if Firestore document exists
        const userDoc = await admin.firestore().collection('users').doc(userRecord.uid).get();
        
        if (!userDoc.exists) {
          // Determine role from custom claims
          const customClaims = userRecord.customClaims || {};
          const role = customClaims.admin === 'true' ? 'admin' : 'user';
          
          // Create Firestore document
          await admin.firestore().collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName || userRecord.email?.split('@')[0] || 'User',
            role: role,
            isActive: !userRecord.disabled,
            emailVerified: userRecord.emailVerified,
            photoURL: userRecord.photoURL,
            createdAt: new Date(userRecord.metadata.creationTime),
            lastLoginAt: userRecord.metadata.lastSignInTime ? new Date(userRecord.metadata.lastSignInTime) : new Date(),
            syncedFromFirebaseAuth: true,
            syncedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          
          syncedCount++;
          console.log(`✅ Synced user: ${userRecord.email}`);
        } else {
          existingCount++;
          console.log(`✅ User already exists: ${userRecord.email}`);
        }
      } catch (userError) {
        console.error(`❌ Error syncing user ${userRecord.email}:`, userError);
      }
    }

    return {
      success: true,
      message: `Sync completed: ${syncedCount} users synced, ${existingCount} already existed`,
      syncedCount,
      existingCount,
      totalFirebaseAuthUsers: firebaseAuthUsers.length
    };
  } catch (error) {
    console.error('Error syncing users:', error);
    throw new functions.https.HttpsError('internal', 'Failed to sync users');
  }
});

/**
 * Cloud Function: Auto-sync user on sign-in (Firestore trigger)
 */
export const onUserSignIn = functions.auth.user().onCreate(async (user) => {
  try {
    console.log(`New user signed up: ${user.email} (${user.uid})`);
    
    // Create Firestore document for new user
    await admin.firestore().collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      role: 'user', // Default role for new users
      isActive: true,
      emailVerified: user.emailVerified,
      photoURL: user.photoURL,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      provider: user.providerData[0]?.providerId || 'email',
    });
    
    console.log(`✅ Created Firestore document for new user: ${user.email}`);
  } catch (error) {
    console.error(`❌ Error creating Firestore document for user ${user.email}:`, error);
  }
});



// Portfolio Cloud Functions

/**
 * Get all portfolio items
 */
export const getPortfolioItems = functions.https.onCall(async (data, context) => {
  const portfolioCollection = await admin.firestore().collection('portfolio').orderBy('createdAt', 'desc').get();
  const portfolios = portfolioCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return { success: true, portfolios };
});

/**
 * Get a single portfolio item by slug
 */
export const getPortfolioItemBySlug = functions.https.onCall(async (data, context) => {
  const { slug } = data;
  const portfolioQuery = await admin.firestore().collection('portfolio').where('slug', '==', slug).limit(1).get();

  if (portfolioQuery.empty) {
    throw new functions.https.HttpsError('not-found', 'Portfolio item not found');
  }

  const portfolioDoc = portfolioQuery.docs[0];
  const portfolio = { id: portfolioDoc.id, ...portfolioDoc.data() };

  return { success: true, portfolio };
});

/**
 * Create a new portfolio item
 */
export const createPortfolioItem = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);

  const { portfolioData } = data;

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const slug = generateSlug(portfolioData.title);

  const docRef = await admin.firestore().collection('portfolio').add({
    ...portfolioData,
    slug,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: 'Portfolio created successfully', id: docRef.id };
});

/**
 * Update a portfolio item
 */
export const updatePortfolioItem = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);

  const { id, portfolioData } = data;

  // Generate new slug if title is being updated
  let updateData = { ...portfolioData };
  if (portfolioData.title) {
    const generateSlug = (title: string) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    };
    updateData.slug = generateSlug(portfolioData.title);
  }

  await admin.firestore().collection('portfolio').doc(id).update({
    ...updateData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: 'Portfolio updated successfully' };
});

/**
 * Delete a portfolio item
 */
export const deletePortfolioItem = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);

  const { id } = data;

  await admin.firestore().collection('portfolio').doc(id).delete();

  return { success: true, message: 'Portfolio deleted successfully' };
});

// Services Cloud Functions

/**
 * Get all services
 */
export const getServices = functions.https.onCall(async (data, context) => {
  const servicesCollection = await admin.firestore().collection('services').orderBy('order', 'asc').get();
  const services = servicesCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return { success: true, services };
});

/**
 * Create a new service
 */
export const createService = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);

  const { serviceData } = data;

  const docRef = await admin.firestore().collection('services').add({
    ...serviceData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: 'Service created successfully', id: docRef.id };
});

/**
 * Update a service
 */
export const updateService = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);

  const { id, serviceData } = data;

  await admin.firestore().collection('services').doc(id).update({
    ...serviceData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: 'Service updated successfully' };
});

/**
 * Delete a service
 */
export const deleteService = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);

  const { id } = data;

  await admin.firestore().collection('services').doc(id).delete();

  return { success: true, message: 'Service deleted successfully' };
});

// Stripe Payment Webhooks

/**
 * Stripe Webhook Handler with proper raw body handling for Firebase Functions
 * Firebase Functions require special handling to preserve the raw request body
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  // Set CORS headers for Stripe webhooks
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const signature = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || functions.config().stripe?.webhook_secret;

  if (!signature) {
    console.error('❌ Missing Stripe signature header');
    res.status(400).send('Missing Stripe signature header');
    return;
  }

  if (!endpointSecret) {
    console.error('❌ Missing webhook endpoint secret');
    res.status(400).send('Missing webhook endpoint secret');
    return;
  }

  if (!stripe) {
    console.error('❌ Stripe not initialized');
    res.status(400).send('Stripe not initialized');
    return;
  }

  let event: Stripe.Event;
  let payload: Buffer | string = Buffer.from('');
  
  try {
    // Firebase Functions: Use req.rawBody when available, fallback to req.body
    // req.rawBody should contain the raw Buffer that Stripe sent
    
    // Debug logging to understand what we're receiving
    console.log('🔍 Request debug info:', {
      method: req.method,
      contentType: req.headers['content-type'],
      hasRawBody: !!req.rawBody,
      rawBodyType: req.rawBody ? typeof req.rawBody : 'undefined',
      rawBodyLength: req.rawBody ? req.rawBody.length : 0,
      hasBody: !!req.body,
      bodyType: req.body ? typeof req.body : 'undefined',
      isBodyBuffer: Buffer.isBuffer(req.body),
      bodyLength: req.body ? (Buffer.isBuffer(req.body) ? req.body.length : JSON.stringify(req.body).length) : 0,
      signatureLength: signature.length
    });
    
    if (req.rawBody && Buffer.isBuffer(req.rawBody)) {
      // Best case: we have rawBody as a Buffer
      payload = req.rawBody;
      console.log(`✅ Using req.rawBody as Buffer (length: ${req.rawBody.length})`);
    } else if (req.rawBody && typeof req.rawBody === 'string') {
      // rawBody as string - convert to Buffer
      payload = Buffer.from(req.rawBody, 'utf8');
      console.log(`⚠️  Using req.rawBody as string, converted to Buffer (length: ${payload.length})`);
    } else if (Buffer.isBuffer(req.body)) {
      // Fallback: req.body is a Buffer
      payload = req.body;
      console.log(`⚠️  Using req.body as Buffer (length: ${req.body.length})`);
    } else if (typeof req.body === 'string') {
      // req.body is a string
      payload = Buffer.from(req.body, 'utf8');
      console.log(`⚠️  Using req.body as string, converted to Buffer (length: ${payload.length})`);
    } else {
      // Last resort: req.body is parsed JSON - this will likely fail signature verification
      const jsonString = JSON.stringify(req.body);
      payload = Buffer.from(jsonString, 'utf8');
      console.log(`❌ Had to reconstruct from parsed JSON (length: ${payload.length}) - SIGNATURE VERIFICATION WILL LIKELY FAIL`);
      console.log('📋 Parsed body keys:', req.body ? Object.keys(req.body) : 'no body');
    }

    // Verify signature using Stripe's constructEvent method
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      endpointSecret
    );
    
    console.log(`✅ Webhook signature verified successfully!`);
    console.log(`📨 Event details: ${event.type} (ID: ${event.id})`);
    
  } catch (error) {
    console.error(`❌ Webhook signature verification failed:`, error);
    console.error('💡 Signature verification troubleshooting:', {
      errorMessage: (error as Error).message,
      errorName: (error as Error).name,
      hasSignature: !!signature,
      signatureFormat: signature?.substring(0, 20) + '...',
      hasSecret: !!endpointSecret,
      secretFormat: endpointSecret?.substring(0, 8) + '...',
      payloadLength: payload ? payload.length : 0,
      payloadType: payload ? typeof payload : 'undefined'
    });
    
    res.status(400).send(`Webhook signature verification failed: ${(error as Error).message}`);
    return;
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        console.log(`Processing ${event.type}`);
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        console.log('Processing payment_intent.succeeded');
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        console.log(`Processing subscription event: ${event.type}`);
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    console.log(`✅ Successfully processed ${event.type} event`);
  } catch (error) {
    console.error(`❌ Error handling webhook ${event.type}:`, error);
    res.status(500).send('Webhook handler failed');
    return;
  }

  // Return success response
  res.status(200).end();
});

/**
 * Handle successful checkout sessions
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('🎉 Processing checkout session completed:', session.id);
  
  if (!stripe) {
    console.error('❌ Stripe not initialized');
    return;
  }
  
  try {
    console.log('📋 Session basic info:', {
      id: session.id,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
      currency: session.currency
    });

    // Get full session details including line items
    console.log('📡 Retrieving full session with line items...');
    let fullSession;
    try {
      fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items', 'line_items.data.price.product']
      });
      console.log('✅ Retrieved full session. Line items count:', fullSession.line_items?.data?.length || 0);
    } catch (retrieveError) {
      console.error('❌ Error retrieving full session with expansions:', retrieveError);
      // Fallback: get session without expansions
      try {
        fullSession = await stripe.checkout.sessions.retrieve(session.id);
        console.log('⚠️  Retrieved session without expansions as fallback');
      } catch (fallbackError) {
        console.error('❌ Complete session retrieval failed:', fallbackError);
        throw fallbackError;
      }
    }

    // Get customer details
    let customerEmail = session.customer_details?.email;
    let customerId = session.customer as string;

    console.log('👤 Customer info:', { customerEmail, customerId: !!customerId });

    // If we have a customer ID, get the customer details
    if (customerId && typeof customerId === 'string' && stripe) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.deleted) {
          customerEmail = customer.email || customerEmail;
          console.log('✅ Retrieved customer details:', customer.email);
        }
      } catch (error) {
        console.error('⚠️  Error retrieving customer (not critical):', error);
      }
    }

    // Process each line item (purchased product/service)
    if (fullSession.line_items?.data) {
      console.log(`🛒 Processing ${fullSession.line_items.data.length} line items...`);
      
      for (let i = 0; i < fullSession.line_items.data.length; i++) {
        const lineItem = fullSession.line_items.data[i];
        console.log(`📦 Processing line item ${i + 1}:`, {
          price_id: lineItem.price?.id,
          product_name: (lineItem.price?.product as any)?.name || 'Product name not available',
          quantity: lineItem.quantity,
          amount: lineItem.amount_total
        });
        
        try {
          await processPurchasedItem(lineItem, {
            sessionId: session.id,
            customerEmail: customerEmail || 'unknown@example.com',
            customerId: customerId,
            paymentStatus: session.payment_status,
            amountTotal: session.amount_total || 0,
            currency: session.currency || 'usd',
            paymentIntentId: session.payment_intent as string,
          });
          console.log(`✅ Successfully processed line item ${i + 1}`);
        } catch (itemError) {
          console.error(`❌ Error processing line item ${i + 1}:`, itemError);
          console.error('Item error details:', {
            name: (itemError as Error).name,
            message: (itemError as Error).message
          });
          // Don't throw here - continue processing other items
        }
      }
    } else {
      console.log('⚠️  No line items found in session - attempting to get line items separately...');
      
      // Try to get line items separately if they weren't expanded
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          expand: ['data.price.product']
        });
        
        if (lineItems.data.length > 0) {
          console.log(`🛒 Found ${lineItems.data.length} line items via separate call`);
          
          for (let i = 0; i < lineItems.data.length; i++) {
            const lineItem = lineItems.data[i];
            console.log(`📦 Processing line item ${i + 1}:`, {
              price_id: lineItem.price?.id,
              product_name: (lineItem.price?.product as any)?.name || 'Product name not available',
              quantity: lineItem.quantity,
              amount: lineItem.amount_total
            });
            
            try {
              await processPurchasedItem(lineItem, {
                sessionId: session.id,
                customerEmail: customerEmail || 'unknown@example.com',
                customerId: customerId,
                paymentStatus: session.payment_status,
                amountTotal: session.amount_total || 0,
                currency: session.currency || 'usd',
                paymentIntentId: session.payment_intent as string,
              });
              console.log(`✅ Successfully processed line item ${i + 1}`);
            } catch (itemError) {
              console.error(`❌ Error processing line item ${i + 1}:`, itemError);
              // Continue processing other items
            }
          }
        } else {
          console.log('⚠️  No line items found in separate call either');
        }
      } catch (lineItemError) {
        console.error('❌ Error retrieving line items separately:', lineItemError);
      }
    }
    
    console.log('🎉 Successfully completed checkout session processing');
  } catch (error) {
    console.error('❌ Error handling checkout session:', error);
    console.error('Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    throw error;
  }
}

/**
 * Handle successful payment intents
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id);
  
  // Update any existing purchase records with payment confirmation
  try {
    const purchasesQuery = await admin.firestore()
      .collection('purchases')
      .where('paymentIntentId', '==', paymentIntent.id)
      .get();

    const batch = admin.firestore().batch();
    purchasesQuery.docs.forEach(doc => {
      batch.update(doc.ref, {
        paymentStatus: 'paid',
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    if (!purchasesQuery.empty) {
      await batch.commit();
      console.log(`Updated ${purchasesQuery.docs.length} purchase records`);
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
  }
}

/**
 * Handle subscription changes
 */
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log('Subscription changed:', subscription.id);
  
  // Handle subscription-based purchases (if applicable)
  // This is a placeholder for subscription handling logic
}

/**
 * Process a purchased item and store in Firebase
 */
async function processPurchasedItem(
  lineItem: Stripe.LineItem,
  sessionData: {
    sessionId: string;
    customerEmail: string;
    customerId?: string;
    paymentStatus: string;
    amountTotal: number;
    currency: string;
    paymentIntentId: string;
  }
) {
  try {
    console.log('🔍 Processing line item:', {
      priceId: lineItem.price?.id,
      productType: typeof lineItem.price?.product,
      hasProduct: !!lineItem.price?.product
    });

    const price = lineItem.price;
    let product = price?.product as Stripe.Product;

    // If product is just an ID string, fetch the full product
    if (!product) {
      console.error('❌ No product found for line item');
      return;
    }

    if (typeof product === 'string') {
      console.log('📡 Product is just an ID, fetching full product details...');
      try {
        if (stripe) {
          product = await stripe.products.retrieve(product);
          console.log('✅ Retrieved full product:', product.name);
        } else {
          console.error('❌ Stripe not available for product retrieval');
          return;
        }
      } catch (productError) {
        console.error('❌ Error retrieving product details:', productError);
        console.error('⚠️  Continuing without product details - using basic info only');
        // Use a minimal fallback product object
        const productId = typeof product === 'string' ? product : 'unknown';
        product = {
          id: productId,
          name: 'Unknown Product',
          description: null,
          metadata: {}
        } as any;
      }
    }

    // Find the user by email
    let userDoc = null;
    let userId = null;
    
    try {
      const userQuery = await admin.firestore()
        .collection('users')
        .where('email', '==', sessionData.customerEmail)
        .limit(1)
        .get();

      if (!userQuery.empty) {
        userDoc = userQuery.docs[0];
        userId = userDoc.id;
      }
    } catch (error) {
      console.error('Error finding user:', error);
    }

    // Determine the service type and category from product metadata or by matching with services collection
    let serviceType = product.metadata?.service_type || 'unknown';
    let category = product.metadata?.category || 'unknown';
    let serviceId = null;
    let serviceName = product.name;

    // Try to match with existing services by Stripe price ID
    if (price?.id) {
      try {
        const servicesQuery = await admin.firestore()
          .collection('services')
          .get();
        
        for (const serviceDoc of servicesQuery.docs) {
          const serviceData = serviceDoc.data();
          if (serviceData.serviceDetails) {
            // Check left and right sections for matching price IDs
            const leftServices = serviceData.serviceDetails.leftSection?.services || [];
            const rightServices = serviceData.serviceDetails.rightSection?.services || [];
            const allServices = [...leftServices, ...rightServices];
            
            const matchingService = allServices.find((s: any) => s.price === price.id);
            if (matchingService) {
              serviceId = serviceDoc.id;
              serviceName = matchingService.title || product.name;
              category = serviceData.category || category;
              serviceType = 'service';
              console.log(`✅ Matched purchase to service: ${serviceName} (${serviceData.title})`);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error matching service:', error);
      }
    }

    // Create purchase record
    const purchaseData = {
      userId: userId,
      userEmail: sessionData.customerEmail,
      userName: userDoc?.data()?.displayName || sessionData.customerEmail,
      
      // Stripe details
      stripeSessionId: sessionData.sessionId,
      stripeCustomerId: sessionData.customerId,
      stripeProductId: product.id,
      stripePriceId: price?.id,
      stripePaymentIntentId: sessionData.paymentIntentId,
      
      // Product details
      productName: serviceName,
      productDescription: product.description,
      category: category,
      serviceType: serviceType,
      serviceId: serviceId,
      
      // Purchase details
      quantity: lineItem.quantity || 1,
      unitPrice: price?.unit_amount || 0,
      totalAmount: (price?.unit_amount || 0) * (lineItem.quantity || 1),
      currency: sessionData.currency,
      
      // Status
      status: 'purchased',
      paymentStatus: sessionData.paymentStatus === 'paid' ? 'paid' : 'pending',
      
      // Timestamps
      purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      
      // Additional metadata
      metadata: product.metadata || {}
    };

    // Store in purchases collection
    const purchaseRef = await admin.firestore()
      .collection('purchases')
      .add(purchaseData);

    console.log(`Created purchase record: ${purchaseRef.id} for ${sessionData.customerEmail}`);

    // If we found a user, also create/update service consumption record
    if (userId) {
      await createOrUpdateServiceConsumption(userId, purchaseData);
    }

  } catch (error) {
    console.error('Error processing purchased item:', error);
    throw error;
  }
}

/**
 * Create or update service consumption record for the user
 */
async function createOrUpdateServiceConsumption(
  userId: string, 
  purchaseData: any
) {
  try {
    // Check if there's already a service consumption record for this service/user
    const existingQuery = await admin.firestore()
      .collection('serviceConsumption')
      .where('userId', '==', userId)
      .where('serviceCategory', '==', purchaseData.category)
      .where('stripeProductId', '==', purchaseData.stripeProductId)
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      // Update existing record
      const existingDoc = existingQuery.docs[0];
      await existingDoc.ref.update({
        status: 'purchased',
        purchaseId: purchaseData.stripeSessionId,
        purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
        totalAmount: purchaseData.totalAmount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        notes: `Updated from purchase: ${purchaseData.productName}`
      });
      
      console.log(`Updated service consumption record for user ${userId}`);
    } else {
      // Create new service consumption record
      const serviceConsumptionData = {
        userId: userId,
        userEmail: purchaseData.userEmail,
        userName: purchaseData.userName,
        
        // Service details
        serviceId: purchaseData.serviceId || purchaseData.stripeProductId,
        serviceName: purchaseData.productName,
        serviceCategory: purchaseData.category,
        serviceType: purchaseData.serviceType,
        
        // Purchase reference
        purchaseId: purchaseData.stripeSessionId,
        stripeProductId: purchaseData.stripeProductId,
        totalAmount: purchaseData.totalAmount,
        currency: purchaseData.currency,
        
        // Status
        status: 'purchased',
        
        // Timestamps
        startDate: admin.firestore.FieldValue.serverTimestamp(),
        purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        
        // Notes
        notes: `Purchased: ${purchaseData.productName}`
      };

      await admin.firestore()
        .collection('serviceConsumption')
        .add(serviceConsumptionData);
        
      console.log(`Created new service consumption record for user ${userId}`);
    }
  } catch (error) {
    console.error('Error creating/updating service consumption:', error);
    throw error;
  }
}

/**
 * Admin function to get user purchases
 */
export const getUserPurchases = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);
  
  try {
    const { userId, limit = 50 } = data;
    
    let query: any = admin.firestore().collection('purchases');
    
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    
    const purchasesSnapshot = await query
      .limit(limit)
      .get();
    
    const purchases = purchasesSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      purchasedAt: doc.data().purchasedAt?.toDate()?.toISOString(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate()?.toISOString()
    })).sort((a: any, b: any) => {
      // Sort by purchasedAt in descending order
      const aDate = a.purchasedAt ? new Date(a.purchasedAt) : new Date(0);
      const bDate = b.purchasedAt ? new Date(b.purchasedAt) : new Date(0);
      return bDate.getTime() - aDate.getTime();
    });

    return {
      success: true,
      purchases,
      count: purchases.length
    };
  } catch (error) {
    console.error('Error getting user purchases:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get user purchases');
  }
});

/**
 * Admin function to get all purchases with pagination
 */
export const getAllPurchases = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);
  
  try {
    const { limit = 50 } = data;
    
    let query = admin.firestore()
      .collection('purchases')
      .limit(limit);
    
    const purchasesSnapshot = await query.get();
    
    const purchases = purchasesSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      purchasedAt: doc.data().purchasedAt?.toDate()?.toISOString(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate()?.toISOString()
    })).sort((a: any, b: any) => {
      // Sort by purchasedAt in descending order
      const aDate = a.purchasedAt ? new Date(a.purchasedAt) : new Date(0);
      const bDate = b.purchasedAt ? new Date(b.purchasedAt) : new Date(0);
      return bDate.getTime() - aDate.getTime();
    });

    return {
      success: true,
      purchases,
      count: purchases.length,
      hasMore: purchasesSnapshot.docs.length === limit
    };
  } catch (error) {
    console.error('Error getting all purchases:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get all purchases');
  }
});

/**
 * Get user's purchased services (for user dashboard)
 */
export const getUserPurchasedServices = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  try {
    const { userId } = data;
    const requestingUserId = context.auth.uid;
    
    // Users can only access their own data unless they're admin
    if (userId !== requestingUserId) {
      // Check if user is admin
      const userRecord = await admin.auth().getUser(requestingUserId);
      const customClaims = userRecord.customClaims || {};
      if (!customClaims.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Can only access your own data');
      }
    }
    
    const targetUserId = userId || requestingUserId;
    
    // Get user's purchases
    const purchasesQuery = await admin.firestore()
      .collection('purchases')
      .where('userId', '==', targetUserId)
      .where('paymentStatus', '==', 'paid')
      .get();
    
    const purchases = purchasesQuery.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      purchasedAt: doc.data().purchasedAt?.toDate()?.toISOString(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate()?.toISOString()
    })).sort((a: any, b: any) => {
      // Sort by purchasedAt in descending order
      const aDate = a.purchasedAt ? new Date(a.purchasedAt) : new Date(0);
      const bDate = b.purchasedAt ? new Date(b.purchasedAt) : new Date(0);
      return bDate.getTime() - aDate.getTime();
    });

    // Get user's service consumption
    const serviceConsumptionQuery = await admin.firestore()
      .collection('serviceConsumption')
      .where('userId', '==', targetUserId)
      .get();
    
    const serviceConsumption = serviceConsumptionQuery.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      purchasedAt: doc.data().purchasedAt?.toDate()?.toISOString(),
      startDate: doc.data().startDate?.toDate()?.toISOString(),
      endDate: doc.data().endDate?.toDate()?.toISOString(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate()?.toISOString()
    })).sort((a: any, b: any) => {
      // Sort by purchasedAt in descending order
      const aDate = a.purchasedAt ? new Date(a.purchasedAt) : new Date(0);
      const bDate = b.purchasedAt ? new Date(b.purchasedAt) : new Date(0);
      return bDate.getTime() - aDate.getTime();
    });

    return {
      success: true,
      purchases,
      serviceConsumption,
      count: purchases.length
    };
  } catch (error) {
    console.error('Error getting user purchased services:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get user purchased services');
  }
});

