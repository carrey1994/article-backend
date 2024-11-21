import { PrismaClient } from '@prisma/client';
import { MOCK_ARTICLES } from '../frontend/app/data/mockData';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;

  // Create unique tags from all articles
  const uniqueTags = new Set<string>();
  MOCK_ARTICLES.forEach(article => {
    article.tags.forEach(tag => {
      uniqueTags.add(tag.name);
    });
  });

  // Create tags in database
  const tagMap = new Map();
  for (const tagName of uniqueTags) {
    const tag = await prisma.tag.create({
      data: { name: tagName }
    });
    tagMap.set(tagName, tag);
  }

  // Create articles with their tags
  for (const mockArticle of MOCK_ARTICLES) {
    await prisma.article.create({
      data: {
        title: mockArticle.title,
        slug: mockArticle.slug,
        content: mockArticle.content,
        excerpt: mockArticle.excerpt,
        published: true,
        createdAt: mockArticle.createdAt,
        updatedAt: mockArticle.createdAt,
        tags: {
          connect: mockArticle.tags.map(tag => ({
            name: tag.name
          }))
        }
      }
    });
  }

  // Add some sample comments to random articles
  const articles = await prisma.article.findMany({ select: { id: true } });
  const sampleComments = [
    { author: "John Doe", email: "john@example.com", content: "Great article! Very informative." },
    { author: "Jane Smith", email: "jane@example.com", content: "Thanks for sharing this knowledge." },
    { author: "Bob Wilson", email: "bob@example.com", content: "This helped me understand the concept better." },
    { author: "Alice Brown", email: "alice@example.com", content: "Looking forward to more articles like this!" },
    { author: "Charlie Davis", email: "charlie@example.com", content: "Very well explained with good examples." }
  ];

  for (const article of articles) {
    // Add 1-3 random comments to each article
    const numComments = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numComments; i++) {
      const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
      await prisma.comment.create({
        data: {
          ...comment,
          articleId: article.id
        }
      });
    }
  }

  console.log(`Database has been seeded! 🌱
    * ${MOCK_ARTICLES.length} articles created
    * ${uniqueTags.size} tags created
    * Comments added to articles
  `);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });