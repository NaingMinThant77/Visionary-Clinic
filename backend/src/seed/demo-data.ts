/**
 * Pure demo-data generation shared by the Nest bootstrap seed (SeedService,
 * so `npm run start:dev` alone has working data) and the standalone
 * `prisma/seed.ts` script (so `prisma migrate dev` seeding also works).
 */

export const DEMO_EMAIL = 'demo@example.com';
export const DEMO_PASSWORD = 'password123';

export const CARD_COUNT = 20;

const CATEGORIES = ['electronics', 'books', 'clothing', 'home', 'sports', 'toys'] as const;
const TAG_POOL = ['new-arrival', 'sale', 'limited', 'bestseller', 'clearance', 'trending'];

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export interface DemoCardInput {
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  tags: string[];
  condition: 'new' | 'used';
  isFeatured: boolean;
  releaseDate: Date;
  imageUrl: string;
  ownerId: number;
}

export function buildDemoCards(ownerId: number): DemoCardInput[] {
  return Array.from({ length: CARD_COUNT }, (_, i) => {
    const n = i + 1;
    const category = CATEGORIES[i % CATEGORIES.length];
    const condition: 'new' | 'used' = i % 2 === 0 ? 'new' : 'used';
    const tags = [TAG_POOL[i % TAG_POOL.length], TAG_POOL[(i + 3) % TAG_POOL.length]];

    return {
      title: `${capitalize(category)} Item ${n}`,
      description: `A great ${condition} ${category} product from our demo catalog, item #${n}.`,
      price: Math.round((9.99 + i * 7.5) * 100) / 100,
      category,
      stock: 5 + (i % 10) * 3,
      tags,
      condition,
      isFeatured: i % 4 === 0,
      releaseDate: new Date(2023, i % 12, (i % 28) + 1),
      imageUrl: `https://picsum.photos/seed/${n}/600/400`,
      ownerId,
    };
  });
}
