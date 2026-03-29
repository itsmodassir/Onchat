import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'md@modassir.info';
  const password = 'Am5361$44';
  const hashedPassword = await bcrypt.hash(password, 10);
  const shortId = Math.random().toString(36).substring(2, 10).toUpperCase();

  const user = await (prisma.user as any).upsert({
    where: { email },
    update: {
      password: hashedPassword,
      isAdmin: true,
    },
    create: {
      email,
      name: 'Super Admin',
      password: hashedPassword,
      isAdmin: true,
      shortId,
    },
  });

  console.log('Super Admin created/updated:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
