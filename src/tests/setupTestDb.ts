import { PrismaClient } from '@prisma/client';
import { MOCK_ARTICLES } from '../../frontend/app/data/mockData';

const prisma = new PrismaClient();

export async function setupTestDb() {
  // Clean up existing data
  await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;

  // Take only first 5 articles for testing
  const testArticles = MOCK_ARTICLES.slice(0, 5);

  // Create unique tags from test articles
  const uniqueTags = new Set<string>();
  testArticles.forEach(article => {
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

  // Create test articles with their tags
  const createdArticles = [];
  for (const mockArticle of testArticles) {
    const article = await prisma.article.create({
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
    createdArticles.push(article);
  }

  // Add test comments
  const testComments = [
    { author: "Test User 1", email: "test1@example.com", content: "Test comment 1" },
    { author: "Test User 2", email: "test2@example.com", content: "Test comment 2" }
  ];

  for (const article of createdArticles) {
    for (const comment of testComments) {
      await prisma.comment.create({
        data: {
          ...comment,
          articleId: article.id
        }
      });
    }
  }

  return {
    articles: createdArticles,
    tags: Array.from(tagMap.values()),
    comments: testComments
  };
}

export async function cleanupTestDb() {
  await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
  await prisma.$disconnect();
}

export { prisma };