import { prisma } from '../src/utils/db';

async function seedStore() {
  const items = [
    // Headwear
    { name: 'Gold Crown', category: 'HEADWEAR', price: 5000, duration: 30, image: 'https://cdn-icons-png.flaticon.com/512/2913/2913601.png' },
    { name: 'Silver Tiara', category: 'HEADWEAR', price: 2000, duration: 7, image: 'https://cdn-icons-png.flaticon.com/512/2913/2913508.png' },
    { name: 'Devil Horns', category: 'HEADWEAR', price: 1500, duration: 30, image: 'https://cdn-icons-png.flaticon.com/512/1150/1150616.png' },
    
    // Mounts
    { name: 'Majestic Dragon', category: 'MOUNT', price: 50000, duration: 30, image: 'https://cdn-icons-png.flaticon.com/512/2361/2361665.png' },
    { name: 'Supercar Silver', category: 'MOUNT', price: 25000, duration: 30, image: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png' },
    { name: 'Royal Horse', category: 'MOUNT', price: 10000, duration: 30, image: 'https://cdn-icons-png.flaticon.com/512/1031/1031481.png' },

    // Chat Bubbles
    { name: 'Neon Purple', category: 'BUBBLE', price: 1000, duration: 30, image: 'https://cdn-icons-png.flaticon.com/512/2462/2462719.png' },
    { name: 'Ocean Blue', category: 'BUBBLE', price: 1000, duration: 30, image: 'https://cdn-icons-png.flaticon.com/512/2462/2462723.png' },

    // Floats
    { name: 'Diamond Aura', category: 'FLOAT', price: 5000, duration: 30, image: 'https://cdn-icons-png.flaticon.com/512/2533/2533031.png' },
    { name: 'Heart Sparkle', category: 'FLOAT', price: 3000, duration: 30, image: 'https://cdn-icons-png.flaticon.com/512/1077/1077035.png' },
  ];

  for (const item of items) {
    await prisma.storeItem.upsert({
      where: { id: item.name.toLowerCase().replace(/ /g, '-') },
      update: {},
      create: {
        id: item.name.toLowerCase().replace(/ /g, '-'),
        ...item
      }
    });
  }
  console.log('Store items seeded successfully!');
}

seedStore()
  .catch(e => console.error(e))
  .finally(() => process.exit());
