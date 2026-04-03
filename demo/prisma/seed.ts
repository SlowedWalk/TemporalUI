import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@temporalui.com' },
    update: {},
    create: {
      email: 'demo@temporalui.com',
      name: 'Demo User',
      password: hashedPassword,
      tier: 'T0',
      signal: 0,
    },
  });

  console.log({ user });

  // Create sample tasks
  const tasks = [
    { title: 'Complete project proposal', description: 'Write detailed proposal for Q1 project', priority: 'high', completed: true },
    { title: 'Review pull requests', description: 'Review 5 pending PRs', priority: 'medium', completed: false },
    { title: 'Update documentation', description: 'Add API docs for new endpoints', priority: 'low', completed: false },
    { title: 'Team standup meeting', description: 'Attend weekly standup', priority: 'medium', completed: true },
    { title: 'Fix critical bug', description: 'Login timeout issue', priority: 'high', completed: false },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: `task-${task.title.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        ...task,
        userId: user.id,
      },
    });
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
