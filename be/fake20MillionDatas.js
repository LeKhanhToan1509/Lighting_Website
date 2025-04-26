import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const BATCH_SIZE = 20000;
const TOTAL = 10_000_000;

const LIGHTING_CATEGORIES = [
  'Ceiling Lights',
  'Wall Lights',
  'Table Lamps',
  'Floor Lamps',
  'Outdoor Lighting'
];

const PRICE = [
  { min: 10000 , max: 500000 },
]

const productSchema = new mongoose.Schema({
  name: String,
  type: String,
  price: Number,
  colors: [String],
  category: String,
  images: [String],
  stock: Number,
  quantity: Number,
  rating: Number,
  description: String,
  deletedAt: Date,
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

const generateFakeProduct = () => {
  const imageCount = faker.number.int({ min: 1, max: 4 });
  
  return {
    name: faker.company.name() + ' ' + faker.helpers.arrayElement([
      'Pendant Light', 'Chandelier', 'Wall Sconce', 'Reading Lamp', 
      'Table Lamp', 'Floor Lamp', 'Ceiling Fan Light', 'Track Light',
      'Recessed Light', 'LED Strip', 'Outdoor Wall Light', 'Path Light'
    ]),
    type: faker.helpers.arrayElement(['product-selling', 'product-rental']),
    price: faker.helpers.arrayElement([10000, 20000, 50000, 100000, 200000]),
    colors: faker.helpers.arrayElements(['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'silver', 'bronze', 'gold', 'chrome'], 
      faker.number.int({ min: 1, max: 4 })),
    category: faker.helpers.arrayElement(LIGHTING_CATEGORIES),
    images: Array.from({ length: imageCount }, () => faker.image.url()),
    stock: faker.number.int({ min: 0, max: 1000 }),
    quantity: 1,
    rating: parseFloat((Math.random() * 5).toFixed(1)),
    description: faker.lorem.sentences(2),
    deletedAt: null,
  };
};

const main = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/dev?replicaSet=rs0");

    console.log('✅ Connected to MongoDB');

    let totalInserted = 0;
    for (let i = 0; i < TOTAL / BATCH_SIZE; i++) {
      const batch = Array.from({ length: BATCH_SIZE }, () => generateFakeProduct());
      await Product.insertMany(batch);
      totalInserted += BATCH_SIZE;
      console.log(`🚀 Inserted batch ${i + 1}/${TOTAL / BATCH_SIZE} (${totalInserted.toLocaleString()} / ${TOTAL.toLocaleString()} records)`);
      
      const stats = await mongoose.connection.db.command({ collStats: 'products' });
      console.log(`Collection size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
      console.log(`Storage size: ${(stats.storageSize / (1024 * 1024)).toFixed(2)} MB`);
    }

    console.log('🎉 Finished inserting 20 million products');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('📊 Database connection closed');
  }
};

main();