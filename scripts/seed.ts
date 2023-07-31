// seed script - node.js
// seed the categories

const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function main() {
    console.log('Seeding default categories...');
  try {
    await db.category.createMany({
      data: [
        { name: 'Famous People' },
        { name: 'Movies & TV' },
        { name: 'Musicians' },
        { name: 'Games' },
        { name: 'Animals' },
        { name: 'Philosophy' },
        { name: 'Scientists' },
      ],
    });
  } catch (error) {
    console.error('Error seeding default categories:', error);
  } finally {
    console.log('Done seeding default categories.');
    await db.$disconnect();
  }
}

main();
