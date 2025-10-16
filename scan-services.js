import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE;

async function scanServices() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DATABASE_NAME);
    const servicesCollection = db.collection('services');

    // Get all services
    const services = await servicesCollection.find({}).toArray();

    console.log(`\n📊 Found ${services.length} services in database\n`);

    services.forEach((service, index) => {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`SERVICE ${index + 1}: ${service.title || 'Untitled'}`);
      console.log(`${'='.repeat(80)}`);
      console.log(`ID: ${service._id}`);
      console.log(`Category: ${service.category}`);
      console.log(`Icon: ${service.icon}`);
      console.log(`Description: ${service.description?.substring(0, 100)}...`);

      // Check serviceDetails structure
      if (service.serviceDetails) {
        console.log(`\n📦 Service Details Structure:`);
        console.log(`  - Title: ${service.serviceDetails.title}`);

        if (service.serviceDetails.leftSection) {
          console.log(`\n  Left Section: ${service.serviceDetails.leftSection.title}`);
          console.log(`  Services (${service.serviceDetails.leftSection.services?.length || 0}):`);
          service.serviceDetails.leftSection.services?.forEach((svc, i) => {
            console.log(`    ${i + 1}. ${svc.title}`);
            console.log(`       - Price: ${svc.price !== undefined ? svc.price : 'NOT SET'}`);
            console.log(`       - Amount: ${svc.amount || 'NOT SET'}`);
            console.log(`       - Payment Link: ${svc.paymentLink || 'NOT SET'}`);
          });
        }

        if (service.serviceDetails.rightSection) {
          console.log(`\n  Right Section: ${service.serviceDetails.rightSection.title}`);
          console.log(`  Services (${service.serviceDetails.rightSection.services?.length || 0}):`);
          service.serviceDetails.rightSection.services?.forEach((svc, i) => {
            console.log(`    ${i + 1}. ${svc.title}`);
            console.log(`       - Price: ${svc.price !== undefined ? svc.price : 'NOT SET'}`);
            console.log(`       - Amount: ${svc.amount || 'NOT SET'}`);
            console.log(`       - Payment Link: ${svc.paymentLink || 'NOT SET'}`);
          });
        }
      } else {
        console.log('⚠️  No serviceDetails found');
      }
    });

    // Summary
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('📊 SUMMARY');
    console.log(`${'='.repeat(80)}`);

    let totalServices = 0;
    let servicesWithPrice = 0;
    let servicesWithAmount = 0;
    let servicesWithPaymentLink = 0;

    services.forEach(service => {
      if (service.serviceDetails) {
        const allServices = [
          ...(service.serviceDetails.leftSection?.services || []),
          ...(service.serviceDetails.rightSection?.services || [])
        ];

        totalServices += allServices.length;

        allServices.forEach(svc => {
          if (svc.price !== undefined && svc.price !== null) servicesWithPrice++;
          if (svc.amount) servicesWithAmount++;
          if (svc.paymentLink) servicesWithPaymentLink++;
        });
      }
    });

    console.log(`Total individual services: ${totalServices}`);
    console.log(`Services with price field: ${servicesWithPrice}`);
    console.log(`Services with amount field: ${servicesWithAmount}`);
    console.log(`Services with payment link: ${servicesWithPaymentLink}`);
    console.log(`Services missing pricing: ${totalServices - servicesWithPrice}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

scanServices();
