# Blog Backend API

A modern blog backend API built with Bun, Elysia, and Prisma, designed to work with the Next.js frontend.

## Features

- 🚀 Built with [Bun](https://bun.sh/) and [Elysia](https://elysiajs.com/)
- 📚 SQLite database with [Prisma ORM](https://www.prisma.io/)
- 📝 Blog post management with Markdown support
- 🏷️ Tag management system
- 💬 Comment system
- 📄 API documentation with Swagger
- 🔒 CORS support
- 🧪 Comprehensive test suite
- 🐳 Docker support

## Prerequisites

- [Bun](https://bun.sh/) installed on your machine
- Node.js 16.0.0 or later
- Git

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd deno-backend
```

2. Run the setup script:
```bash
bun run setup
```

This will:
- Install dependencies
- Set up environment variables
- Generate Prisma client
- Set up the database
- Seed initial data

3. Start the development server:
```bash
bun run dev
```

The server will start at http://localhost:3000

## Available Scripts

- `bun run dev` - Start development server
- `bun run start` - Start production server
- `bun run test` - Run tests
- `bun run test:watch` - Run tests in watch mode
- `bun run build` - Build for production
- `bun run db:push` - Push database changes
- `bun run db:generate` - Generate Prisma client
- `bun run db:studio` - Open Prisma Studio
- `bun run db:seed` - Seed database
- `bun run db:reset` - Reset database
- `bun run docker:build` - Build Docker image
- `bun run docker:up` - Start Docker containers
- `bun run docker:down` - Stop Docker containers
- `bun run lint` - Run TypeScript type check
- `bun run format` - Format code with Prettier

## API Documentation

Once the server is running, you can access the Swagger documentation at:
http://localhost:3000/swagger

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
FRONTEND_URL="http://localhost:3001"
NODE_ENV="development"
```

## Docker Support

Build and run with Docker:

```bash
# Build image
bun run docker:build

# Start containers
bun run docker:up

# Stop containers
bun run docker:down
```

## Database

This project uses Prisma with SQLite by default. The schema is in `prisma/schema.prisma`.

To modify the database schema:
1. Edit `prisma/schema.prisma`
2. Run `bun run db:push`
3. Run `bun run db:generate`

To view/edit data directly:
```bash
bun run db:studio
```

## Testing

Run tests:
```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch
```

## Project Structure

```
.
├── src/
│   ├── controllers/    # Request handlers
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── utils/         # Utility functions
│   └── tests/         # Test files
├── prisma/
│   ├── schema.prisma  # Database schema
│   └── seed.ts       # Database seeder
├── scripts/          # Development scripts
├── .env.example      # Environment variables template
├── docker-compose.yml # Docker compose configuration
└── Dockerfile        # Docker configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## VSCode Setup

This project includes VSCode settings and launch configurations. Install the recommended extensions when prompted for the best development experience.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Frontend repository: [carrey1994.github.io](https://github.com/carrey1994/carrey1994.github.io)
