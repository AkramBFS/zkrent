const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/zkrent';

async function seed() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to PostgreSQL for seeding...');

  // Hash passwords
  const passwordHash = await bcrypt.hash('Password123!', 12);

  // 1. Create Landlord
  const landlordRes = await client.query(
    `INSERT INTO "users" ("email", "displayName", "passwordHash", "role")
     VALUES ($1, $2, $3, $4)
     ON CONFLICT ("email") DO UPDATE SET "passwordHash" = $3
     RETURNING "id"`,
    ['landlord@example.com', 'Highline Property Management', passwordHash, 'LANDLORD']
  );
  const landlordId = landlordRes.rows[0].id;

  // 2. Create Tenant
  const tenantRes = await client.query(
    `INSERT INTO "users" ("email", "displayName", "passwordHash", "role")
     VALUES ($1, $2, $3, $4)
     ON CONFLICT ("email") DO UPDATE SET "passwordHash" = $3
     RETURNING "id"`,
    ['tenant@example.com', 'Elena Rostova', passwordHash, 'TENANT']
  );
  const tenantId = tenantRes.rows[0].id;

  // 3. Clear existing properties
  await client.query(`DELETE FROM "properties" WHERE "landlordId" = $1`, [landlordId]);

  // 4. Seed 6 properties
  const properties = [
    {
      title: 'The Ashton Highrise #14B',
      address: '101 Colorado St, Unit 14B',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      price: 2400,
      beds: 2,
      baths: 2.0,
      sqft: 1150,
      type: 'Apartment',
      description: 'Stunning 14th floor corner residence featuring floor-to-ceiling glass, Italian kitchen cabinetry with quartz waterfall island, engineered hardwood flooring, and panoramic skyline views over Lady Bird Lake.',
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: [
        'Concierge & 24/7 Security',
        'Infinity Edge Sky Pool',
        'Midnight ZK Application Ready',
        'Reserved EV Parking',
        'Fitness & Wellness Center',
        'Pet Spa & Run'
      ],
      minIncome: 75000,
      requireBackground: true,
      requireEmployment: true,
      verificationFee: 5.0
    },
    {
      title: 'Rainey St Modern Loft',
      address: '70 Rainey St, Suite 804',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      price: 3100,
      beds: 2,
      baths: 2.5,
      sqft: 1320,
      type: 'Condo',
      description: 'Boutique architectural loft in the heart of the Rainey Historic District. Custom architectural steel accents, Miele appliances, private balcony, and smart home lighting controls.',
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: [
        'Private Terrace',
        'Smart Thermostat & Keyless Entry',
        'Rooftop Clubhouse',
        'Bicycle Storage & Workshop',
        'Fiber Internet Ready'
      ],
      minIncome: 95000,
      requireBackground: true,
      requireEmployment: true,
      verificationFee: 5.0
    },
    {
      title: 'South Congress Brownstone Flat',
      address: '1600 S Congress Ave, #3',
      city: 'Austin',
      state: 'TX',
      zip: '78704',
      price: 1850,
      beds: 1,
      baths: 1.0,
      sqft: 780,
      type: 'Apartment',
      description: 'Charming sunlit flat on iconic South Congress. Exposed brick walls, reclaimed heart pine floors, subway tile bath, and walking distance to cafes, galleries, and live music venues.',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502005229762-ee152da915ba?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: [
        'In-unit Washer & Dryer',
        'Courtyard Garden',
        'High Ceilings',
        'Google Fiber',
        'Off-street Parking'
      ],
      minIncome: 58000,
      requireBackground: true,
      requireEmployment: false,
      verificationFee: 5.0
    },
    {
      title: 'Lavaca Executive Studio',
      address: '1100 Lavaca St, Unit 402',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      price: 1550,
      beds: 0,
      baths: 1.0,
      sqft: 550,
      type: 'Studio',
      description: 'Efficient luxury studio near the Capitol complex. Built-in Murphy bed system, chef kitchen with induction cooktop, oversized walk-in closet, and quiet courtyard facing view.',
      images: [
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: [
        'Built-in Storage Systems',
        'Rooftop Lounge',
        'Coworking Space',
        'Secure Package Locker'
      ],
      minIncome: 50000,
      requireBackground: true,
      requireEmployment: true,
      verificationFee: 5.0
    },
    {
      title: 'Zilker Park Contemporary Flat',
      address: '2200 Barton Springs Rd, Apt 210',
      city: 'Austin',
      state: 'TX',
      zip: '78704',
      price: 2800,
      beds: 2,
      baths: 2.0,
      sqft: 1200,
      type: 'Apartment',
      description: 'Live seconds from Barton Springs pool and Zilker Park. Modern open-concept floor plan, private patio overlooking greenbelt, gas cooking, and spa-grade soaking tub.',
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: [
        'Direct Trail Access',
        'Kayaking Storage',
        'Resort Pool',
        'Outdoor Kitchen & Firepit'
      ],
      minIncome: 84000,
      requireBackground: true,
      requireEmployment: true,
      verificationFee: 5.0
    },
    {
      title: 'Clarksville Historic Craftsman',
      address: '1405 W 10th St',
      city: 'Austin',
      state: 'TX',
      zip: '78703',
      price: 4200,
      beds: 3,
      baths: 2.5,
      sqft: 2100,
      type: 'House',
      description: 'Impeccably restored 1920s craftsman home with wraparound porch, mature pecan trees, detached studio/office space, and modern commercial-grade Viking kitchen.',
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: [
        'Fenced Private Yard',
        'Detached Studio/Office',
        'Wine Cellar',
        'Gas Fireplace',
        '2-Car Garage'
      ],
      minIncome: 130000,
      requireBackground: true,
      requireEmployment: true,
      verificationFee: 5.0
    }
  ];

  for (const p of properties) {
    await client.query(
      `INSERT INTO "properties" (
        "title", "address", "city", "state", "zip", "price", "beds", "baths", "sqft",
        "type", "description", "images", "amenities", "status", "minIncome",
        "requireBackground", "requireEmployment", "verificationFee", "landlordId"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        p.title, p.address, p.city, p.state, p.zip, p.price, p.beds, p.baths, p.sqft,
        p.type, p.description, p.images, p.amenities, 'active', p.minIncome,
        p.requireBackground, p.requireEmployment, p.verificationFee, landlordId
      ]
    );
  }

  console.log('Seeded users and properties successfully!');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
