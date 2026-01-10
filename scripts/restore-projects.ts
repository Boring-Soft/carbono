/**
 * Script to restore soft-deleted projects
 * Usage: npx tsx scripts/restore-projects.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Find all inactive projects
    const inactiveProjects = await prisma.project.findMany({
      where: { active: false },
      select: {
        id: true,
        name: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    console.log(`\n📊 Found ${inactiveProjects.length} inactive projects:\n`);

    if (inactiveProjects.length === 0) {
      console.log('✓ No inactive projects found. All projects are active.');
      return;
    }

    inactiveProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name} (ID: ${project.id})`);
      console.log(`   Deleted at: ${project.updatedAt.toISOString()}\n`);
    });

    // Restore all inactive projects
    const result = await prisma.project.updateMany({
      where: { active: false },
      data: { active: true },
    });

    console.log(`\n✅ Restored ${result.count} projects successfully!\n`);
  } catch (error) {
    console.error('❌ Error restoring projects:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
