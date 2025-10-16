"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPurchasedServices = exports.getAllPurchases = exports.getUserPurchases = exports.stripeWebhook = exports.deleteService = exports.updateService = exports.createService = exports.getServices = exports.deletePortfolioItem = exports.updatePortfolioItem = exports.createPortfolioItem = exports.getPortfolioItemBySlug = exports.getPortfolioItems = exports.onUserSignIn = exports.syncUsersToFirestore = exports.deleteUser = exports.updateUserStatus = exports.updateUserRole = exports.createUser = exports.listUsers = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe_1 = require("stripe");
const dotenv = require("dotenv");
// Load environment variables
dotenv.config();
// Initialize Firebase Admin SDK
admin.initializeApp();
// Initialize Stripe (only if we have a key)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-08-27.basil',
    });
}
// Middleware to verify admin access
const verifyAdmin = async (context) => {
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
exports.listUsers = functions.https.onCall(async (data, context) => {
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
    }
    catch (error) {
        console.error('Error listing users:', error);
        throw new functions.https.HttpsError('internal', 'Failed to list users');
    }
});
/**
 * Cloud Function: Create new Firebase Auth user
 */
exports.createUser = functions.https.onCall(async (data, context) => {
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
    }
    catch (error) {
        console.error('Error creating user:', error);
        throw new functions.https.HttpsError('internal', `Failed to create user: ${error}`);
    }
});
/**
 * Cloud Function: Update user role and custom claims
 */
exports.updateUserRole = functions.https.onCall(async (data, context) => {
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
    }
    catch (error) {
        console.error('Error updating user role:', error);
        throw new functions.https.HttpsError('internal', 'Failed to update user role');
    }
});
/**
 * Cloud Function: Enable/Disable Firebase Auth user
 */
exports.updateUserStatus = functions.https.onCall(async (data, context) => {
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
    }
    catch (error) {
        console.error('Error updating user status:', error);
        throw new functions.https.HttpsError('internal', 'Failed to update user status');
    }
});
/**
 * Cloud Function: Delete Firebase Auth user
 */
exports.deleteUser = functions.https.onCall(async (data, context) => {
    var _a;
    await verifyAdmin(context);
    try {
        const { uid } = data;
        if (!uid) {
            throw new functions.https.HttpsError('invalid-argument', 'UID is required');
        }
        // Prevent admin from deleting themselves
        if (uid === ((_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid)) {
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
    }
    catch (error) {
        console.error('Error deleting user:', error);
        throw new functions.https.HttpsError('internal', 'Failed to delete user');
    }
});
/**
 * Cloud Function: Sync Firebase Auth users to Firestore
 * Creates missing Firestore documents for existing Firebase Auth users
 */
exports.syncUsersToFirestore = functions.https.onCall(async (data, context) => {
    var _a;
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
                        displayName: userRecord.displayName || ((_a = userRecord.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) || 'User',
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
                }
                else {
                    existingCount++;
                    console.log(`✅ User already exists: ${userRecord.email}`);
                }
            }
            catch (userError) {
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
    }
    catch (error) {
        console.error('Error syncing users:', error);
        throw new functions.https.HttpsError('internal', 'Failed to sync users');
    }
});
/**
 * Cloud Function: Auto-sync user on sign-in (Firestore trigger)
 */
exports.onUserSignIn = functions.auth.user().onCreate(async (user) => {
    var _a, _b;
    try {
        console.log(`New user signed up: ${user.email} (${user.uid})`);
        // Create Firestore document for new user
        await admin.firestore().collection('users').doc(user.uid).set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || ((_a = user.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) || 'User',
            role: 'user',
            isActive: true,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
            provider: ((_b = user.providerData[0]) === null || _b === void 0 ? void 0 : _b.providerId) || 'email',
        });
        console.log(`✅ Created Firestore document for new user: ${user.email}`);
    }
    catch (error) {
        console.error(`❌ Error creating Firestore document for user ${user.email}:`, error);
    }
});
// Portfolio Cloud Functions
/**
 * Get all portfolio items
 */
exports.getPortfolioItems = functions.https.onCall(async (data, context) => {
    const portfolioCollection = await admin.firestore().collection('portfolio').orderBy('createdAt', 'desc').get();
    const portfolios = portfolioCollection.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    return { success: true, portfolios };
});
/**
 * Get a single portfolio item by slug
 */
exports.getPortfolioItemBySlug = functions.https.onCall(async (data, context) => {
    const { slug } = data;
    const portfolioQuery = await admin.firestore().collection('portfolio').where('slug', '==', slug).limit(1).get();
    if (portfolioQuery.empty) {
        throw new functions.https.HttpsError('not-found', 'Portfolio item not found');
    }
    const portfolioDoc = portfolioQuery.docs[0];
    const portfolio = Object.assign({ id: portfolioDoc.id }, portfolioDoc.data());
    return { success: true, portfolio };
});
/**
 * Create a new portfolio item
 */
exports.createPortfolioItem = functions.https.onCall(async (data, context) => {
    await verifyAdmin(context);
    const { portfolioData } = data;
    // Generate slug from title
    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };
    const slug = generateSlug(portfolioData.title);
    const docRef = await admin.firestore().collection('portfolio').add(Object.assign(Object.assign({}, portfolioData), { slug, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
    return { success: true, message: 'Portfolio created successfully', id: docRef.id };
});
/**
 * Update a portfolio item
 */
exports.updatePortfolioItem = functions.https.onCall(async (data, context) => {
    await verifyAdmin(context);
    const { id, portfolioData } = data;
    // Generate new slug if title is being updated
    let updateData = Object.assign({}, portfolioData);
    if (portfolioData.title) {
        const generateSlug = (title) => {
            return title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        };
        updateData.slug = generateSlug(portfolioData.title);
    }
    await admin.firestore().collection('portfolio').doc(id).update(Object.assign(Object.assign({}, updateData), { updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
    return { success: true, message: 'Portfolio updated successfully' };
});
/**
 * Delete a portfolio item
 */
exports.deletePortfolioItem = functions.https.onCall(async (data, context) => {
    await verifyAdmin(context);
    const { id } = data;
    await admin.firestore().collection('portfolio').doc(id).delete();
    return { success: true, message: 'Portfolio deleted successfully' };
});
// Services Cloud Functions
/**
 * Get all services
 */
exports.getServices = functions.https.onCall(async (data, context) => {
    const servicesCollection = await admin.firestore().collection('services').orderBy('order', 'asc').get();
    const services = servicesCollection.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    return { success: true, services };
});
/**
 * Create a new service
 */
exports.createService = functions.https.onCall(async (data, context) => {
    await verifyAdmin(context);
    const { serviceData } = data;
    const docRef = await admin.firestore().collection('services').add(Object.assign(Object.assign({}, serviceData), { createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
    return { success: true, message: 'Service created successfully', id: docRef.id };
});
/**
 * Update a service
 */
exports.updateService = functions.https.onCall(async (data, context) => {
    await verifyAdmin(context);
    const { id, serviceData } = data;
    await admin.firestore().collection('services').doc(id).update(Object.assign(Object.assign({}, serviceData), { updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
    return { success: true, message: 'Service updated successfully' };
});
/**
 * Delete a service
 */
exports.deleteService = functions.https.onCall(async (data, context) => {
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
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    var _a;
    // Set CORS headers for Stripe webhooks
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    const signature = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ((_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.webhook_secret);
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
    let event;
    let payload = Buffer.from('');
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
        }
        else if (req.rawBody && typeof req.rawBody === 'string') {
            // rawBody as string - convert to Buffer
            payload = Buffer.from(req.rawBody, 'utf8');
            console.log(`⚠️  Using req.rawBody as string, converted to Buffer (length: ${payload.length})`);
        }
        else if (Buffer.isBuffer(req.body)) {
            // Fallback: req.body is a Buffer
            payload = req.body;
            console.log(`⚠️  Using req.body as Buffer (length: ${req.body.length})`);
        }
        else if (typeof req.body === 'string') {
            // req.body is a string
            payload = Buffer.from(req.body, 'utf8');
            console.log(`⚠️  Using req.body as string, converted to Buffer (length: ${payload.length})`);
        }
        else {
            // Last resort: req.body is parsed JSON - this will likely fail signature verification
            const jsonString = JSON.stringify(req.body);
            payload = Buffer.from(jsonString, 'utf8');
            console.log(`❌ Had to reconstruct from parsed JSON (length: ${payload.length}) - SIGNATURE VERIFICATION WILL LIKELY FAIL`);
            console.log('📋 Parsed body keys:', req.body ? Object.keys(req.body) : 'no body');
        }
        // Verify signature using Stripe's constructEvent method
        event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
        console.log(`✅ Webhook signature verified successfully!`);
        console.log(`📨 Event details: ${event.type} (ID: ${event.id})`);
    }
    catch (error) {
        console.error(`❌ Webhook signature verification failed:`, error);
        console.error('💡 Signature verification troubleshooting:', {
            errorMessage: error.message,
            errorName: error.name,
            hasSignature: !!signature,
            signatureFormat: (signature === null || signature === void 0 ? void 0 : signature.substring(0, 20)) + '...',
            hasSecret: !!endpointSecret,
            secretFormat: (endpointSecret === null || endpointSecret === void 0 ? void 0 : endpointSecret.substring(0, 8)) + '...',
            payloadLength: payload ? payload.length : 0,
            payloadType: payload ? typeof payload : 'undefined'
        });
        res.status(400).send(`Webhook signature verification failed: ${error.message}`);
        return;
    }
    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
            case 'checkout.session.async_payment_succeeded':
                console.log(`Processing ${event.type}`);
                await handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'payment_intent.succeeded':
                console.log('Processing payment_intent.succeeded');
                await handlePaymentIntentSucceeded(event.data.object);
                break;
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                console.log(`Processing subscription event: ${event.type}`);
                await handleSubscriptionChange(event.data.object);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        console.log(`✅ Successfully processed ${event.type} event`);
    }
    catch (error) {
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
async function handleCheckoutSessionCompleted(session) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    console.log('🎉 Processing checkout session completed:', session.id);
    if (!stripe) {
        console.error('❌ Stripe not initialized');
        return;
    }
    try {
        console.log('📋 Session basic info:', {
            id: session.id,
            payment_status: session.payment_status,
            customer_email: (_a = session.customer_details) === null || _a === void 0 ? void 0 : _a.email,
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
            console.log('✅ Retrieved full session. Line items count:', ((_c = (_b = fullSession.line_items) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.length) || 0);
        }
        catch (retrieveError) {
            console.error('❌ Error retrieving full session with expansions:', retrieveError);
            // Fallback: get session without expansions
            try {
                fullSession = await stripe.checkout.sessions.retrieve(session.id);
                console.log('⚠️  Retrieved session without expansions as fallback');
            }
            catch (fallbackError) {
                console.error('❌ Complete session retrieval failed:', fallbackError);
                throw fallbackError;
            }
        }
        // Get customer details
        let customerEmail = (_d = session.customer_details) === null || _d === void 0 ? void 0 : _d.email;
        let customerId = session.customer;
        console.log('👤 Customer info:', { customerEmail, customerId: !!customerId });
        // If we have a customer ID, get the customer details
        if (customerId && typeof customerId === 'string' && stripe) {
            try {
                const customer = await stripe.customers.retrieve(customerId);
                if (!customer.deleted) {
                    customerEmail = customer.email || customerEmail;
                    console.log('✅ Retrieved customer details:', customer.email);
                }
            }
            catch (error) {
                console.error('⚠️  Error retrieving customer (not critical):', error);
            }
        }
        // Process each line item (purchased product/service)
        if ((_e = fullSession.line_items) === null || _e === void 0 ? void 0 : _e.data) {
            console.log(`🛒 Processing ${fullSession.line_items.data.length} line items...`);
            for (let i = 0; i < fullSession.line_items.data.length; i++) {
                const lineItem = fullSession.line_items.data[i];
                console.log(`📦 Processing line item ${i + 1}:`, {
                    price_id: (_f = lineItem.price) === null || _f === void 0 ? void 0 : _f.id,
                    product_name: ((_h = (_g = lineItem.price) === null || _g === void 0 ? void 0 : _g.product) === null || _h === void 0 ? void 0 : _h.name) || 'Product name not available',
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
                        paymentIntentId: session.payment_intent,
                    });
                    console.log(`✅ Successfully processed line item ${i + 1}`);
                }
                catch (itemError) {
                    console.error(`❌ Error processing line item ${i + 1}:`, itemError);
                    console.error('Item error details:', {
                        name: itemError.name,
                        message: itemError.message
                    });
                    // Don't throw here - continue processing other items
                }
            }
        }
        else {
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
                            price_id: (_j = lineItem.price) === null || _j === void 0 ? void 0 : _j.id,
                            product_name: ((_l = (_k = lineItem.price) === null || _k === void 0 ? void 0 : _k.product) === null || _l === void 0 ? void 0 : _l.name) || 'Product name not available',
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
                                paymentIntentId: session.payment_intent,
                            });
                            console.log(`✅ Successfully processed line item ${i + 1}`);
                        }
                        catch (itemError) {
                            console.error(`❌ Error processing line item ${i + 1}:`, itemError);
                            // Continue processing other items
                        }
                    }
                }
                else {
                    console.log('⚠️  No line items found in separate call either');
                }
            }
            catch (lineItemError) {
                console.error('❌ Error retrieving line items separately:', lineItemError);
            }
        }
        console.log('🎉 Successfully completed checkout session processing');
    }
    catch (error) {
        console.error('❌ Error handling checkout session:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}
/**
 * Handle successful payment intents
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
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
    }
    catch (error) {
        console.error('Error updating payment status:', error);
    }
}
/**
 * Handle subscription changes
 */
async function handleSubscriptionChange(subscription) {
    console.log('Subscription changed:', subscription.id);
    // Handle subscription-based purchases (if applicable)
    // This is a placeholder for subscription handling logic
}
/**
 * Process a purchased item and store in Firebase
 */
async function processPurchasedItem(lineItem, sessionData) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        console.log('🔍 Processing line item:', {
            priceId: (_a = lineItem.price) === null || _a === void 0 ? void 0 : _a.id,
            productType: typeof ((_b = lineItem.price) === null || _b === void 0 ? void 0 : _b.product),
            hasProduct: !!((_c = lineItem.price) === null || _c === void 0 ? void 0 : _c.product)
        });
        const price = lineItem.price;
        let product = price === null || price === void 0 ? void 0 : price.product;
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
                }
                else {
                    console.error('❌ Stripe not available for product retrieval');
                    return;
                }
            }
            catch (productError) {
                console.error('❌ Error retrieving product details:', productError);
                console.error('⚠️  Continuing without product details - using basic info only');
                // Use a minimal fallback product object
                const productId = typeof product === 'string' ? product : 'unknown';
                product = {
                    id: productId,
                    name: 'Unknown Product',
                    description: null,
                    metadata: {}
                };
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
        }
        catch (error) {
            console.error('Error finding user:', error);
        }
        // Determine the service type and category from product metadata or by matching with services collection
        let serviceType = ((_d = product.metadata) === null || _d === void 0 ? void 0 : _d.service_type) || 'unknown';
        let category = ((_e = product.metadata) === null || _e === void 0 ? void 0 : _e.category) || 'unknown';
        let serviceId = null;
        let serviceName = product.name;
        // Try to match with existing services by Stripe price ID
        if (price === null || price === void 0 ? void 0 : price.id) {
            try {
                const servicesQuery = await admin.firestore()
                    .collection('services')
                    .get();
                for (const serviceDoc of servicesQuery.docs) {
                    const serviceData = serviceDoc.data();
                    if (serviceData.serviceDetails) {
                        // Check left and right sections for matching price IDs
                        const leftServices = ((_f = serviceData.serviceDetails.leftSection) === null || _f === void 0 ? void 0 : _f.services) || [];
                        const rightServices = ((_g = serviceData.serviceDetails.rightSection) === null || _g === void 0 ? void 0 : _g.services) || [];
                        const allServices = [...leftServices, ...rightServices];
                        const matchingService = allServices.find((s) => s.price === price.id);
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
            }
            catch (error) {
                console.error('Error matching service:', error);
            }
        }
        // Create purchase record
        const purchaseData = {
            userId: userId,
            userEmail: sessionData.customerEmail,
            userName: ((_h = userDoc === null || userDoc === void 0 ? void 0 : userDoc.data()) === null || _h === void 0 ? void 0 : _h.displayName) || sessionData.customerEmail,
            // Stripe details
            stripeSessionId: sessionData.sessionId,
            stripeCustomerId: sessionData.customerId,
            stripeProductId: product.id,
            stripePriceId: price === null || price === void 0 ? void 0 : price.id,
            stripePaymentIntentId: sessionData.paymentIntentId,
            // Product details
            productName: serviceName,
            productDescription: product.description,
            category: category,
            serviceType: serviceType,
            serviceId: serviceId,
            // Purchase details
            quantity: lineItem.quantity || 1,
            unitPrice: (price === null || price === void 0 ? void 0 : price.unit_amount) || 0,
            totalAmount: ((price === null || price === void 0 ? void 0 : price.unit_amount) || 0) * (lineItem.quantity || 1),
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
    }
    catch (error) {
        console.error('Error processing purchased item:', error);
        throw error;
    }
}
/**
 * Create or update service consumption record for the user
 */
async function createOrUpdateServiceConsumption(userId, purchaseData) {
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
        }
        else {
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
    }
    catch (error) {
        console.error('Error creating/updating service consumption:', error);
        throw error;
    }
}
/**
 * Admin function to get user purchases
 */
exports.getUserPurchases = functions.https.onCall(async (data, context) => {
    await verifyAdmin(context);
    try {
        const { userId, limit = 50 } = data;
        let query = admin.firestore().collection('purchases');
        if (userId) {
            query = query.where('userId', '==', userId);
        }
        const purchasesSnapshot = await query
            .limit(limit)
            .get();
        const purchases = purchasesSnapshot.docs.map((doc) => {
            var _a, _b, _c, _d, _e, _f;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { purchasedAt: (_b = (_a = doc.data().purchasedAt) === null || _a === void 0 ? void 0 : _a.toDate()) === null || _b === void 0 ? void 0 : _b.toISOString(), createdAt: (_d = (_c = doc.data().createdAt) === null || _c === void 0 ? void 0 : _c.toDate()) === null || _d === void 0 ? void 0 : _d.toISOString(), updatedAt: (_f = (_e = doc.data().updatedAt) === null || _e === void 0 ? void 0 : _e.toDate()) === null || _f === void 0 ? void 0 : _f.toISOString() }));
        }).sort((a, b) => {
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
    }
    catch (error) {
        console.error('Error getting user purchases:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get user purchases');
    }
});
/**
 * Admin function to get all purchases with pagination
 */
exports.getAllPurchases = functions.https.onCall(async (data, context) => {
    await verifyAdmin(context);
    try {
        const { limit = 50 } = data;
        let query = admin.firestore()
            .collection('purchases')
            .limit(limit);
        const purchasesSnapshot = await query.get();
        const purchases = purchasesSnapshot.docs.map((doc) => {
            var _a, _b, _c, _d, _e, _f;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { purchasedAt: (_b = (_a = doc.data().purchasedAt) === null || _a === void 0 ? void 0 : _a.toDate()) === null || _b === void 0 ? void 0 : _b.toISOString(), createdAt: (_d = (_c = doc.data().createdAt) === null || _c === void 0 ? void 0 : _c.toDate()) === null || _d === void 0 ? void 0 : _d.toISOString(), updatedAt: (_f = (_e = doc.data().updatedAt) === null || _e === void 0 ? void 0 : _e.toDate()) === null || _f === void 0 ? void 0 : _f.toISOString() }));
        }).sort((a, b) => {
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
    }
    catch (error) {
        console.error('Error getting all purchases:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get all purchases');
    }
});
/**
 * Get user's purchased services (for user dashboard)
 */
exports.getUserPurchasedServices = functions.https.onCall(async (data, context) => {
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
        const purchases = purchasesQuery.docs.map((doc) => {
            var _a, _b, _c, _d, _e, _f;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { purchasedAt: (_b = (_a = doc.data().purchasedAt) === null || _a === void 0 ? void 0 : _a.toDate()) === null || _b === void 0 ? void 0 : _b.toISOString(), createdAt: (_d = (_c = doc.data().createdAt) === null || _c === void 0 ? void 0 : _c.toDate()) === null || _d === void 0 ? void 0 : _d.toISOString(), updatedAt: (_f = (_e = doc.data().updatedAt) === null || _e === void 0 ? void 0 : _e.toDate()) === null || _f === void 0 ? void 0 : _f.toISOString() }));
        }).sort((a, b) => {
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
        const serviceConsumption = serviceConsumptionQuery.docs.map((doc) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { purchasedAt: (_b = (_a = doc.data().purchasedAt) === null || _a === void 0 ? void 0 : _a.toDate()) === null || _b === void 0 ? void 0 : _b.toISOString(), startDate: (_d = (_c = doc.data().startDate) === null || _c === void 0 ? void 0 : _c.toDate()) === null || _d === void 0 ? void 0 : _d.toISOString(), endDate: (_f = (_e = doc.data().endDate) === null || _e === void 0 ? void 0 : _e.toDate()) === null || _f === void 0 ? void 0 : _f.toISOString(), createdAt: (_h = (_g = doc.data().createdAt) === null || _g === void 0 ? void 0 : _g.toDate()) === null || _h === void 0 ? void 0 : _h.toISOString(), updatedAt: (_k = (_j = doc.data().updatedAt) === null || _j === void 0 ? void 0 : _j.toDate()) === null || _k === void 0 ? void 0 : _k.toISOString() }));
        }).sort((a, b) => {
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
    }
    catch (error) {
        console.error('Error getting user purchased services:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get user purchased services');
    }
});
//# sourceMappingURL=index.js.map