#!/usr/bin/env bun
import { PrismaClient } from '@prisma/client';
import { MOCK_ARTICLES } from '../frontend/app/data/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('🗃️ Initializing database...');

  try {
    // Reset database
    console.log('Cleaning existing data...');
    await prisma.$transaction([
      prisma.comment.deleteMany(),
      prisma.article.deleteMany(),
      prisma.tag.deleteMany(),
    ]);

    // Create unique tags from all articles
    console.log('Creating tags...');
    const uniqueTags = new Set<string>();
    MOCK_ARTICLES.forEach(article => {
      article.tags.forEach(tag => {
        uniqueTags.add(tag.name);
      });
    });

    const tagMap = new Map();
    for (const tagName of uniqueTags) {
      const tag = await prisma.tag.create({
        data: { name: tagName }
      });
      tagMap.set(tagName, tag);
      console.log(`Created tag: ${tagName}`);
    }

    // Create articles with their tags
    console.log('Creating articles...');
    for (const mockArticle of MOCK_ARTICLES) {
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
      console.log(`Created article: ${article.title}`);
    }

    // Add sample comments
    console.log('Creating comments...');
    const articles = await prisma.article.findMany({ select: { id: true } });
    const sampleComments = [
      { author: "John Doe", email: "john@example.com", content: "Great article! Very informative." },
      { author: "Jane Smith", email: "jane@example.com", content: "Thanks for sharing this knowledge." },
      { author: "Bob Wilson", email: "bob@example.com", content: "This helped me understand the concept better." },
      { author: "Alice Brown", email: "alice@example.com", content: "Looking forward to more articles like this!" },
      { author: "Charlie Davis", email: "charlie@example.com", content: "Very well explained with good examples." }
    ];

    for (const article of articles) {
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

    console.log(`
✅ Database initialization complete!
📊 Summary:
- Created ${uniqueTags.size} tags
- Created ${MOCK_ARTICLES.length} articles
- Added sample comments to articles
    `);

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if this script is run directly
if (import.meta.main) {
  main();
}

export { main as initDb };