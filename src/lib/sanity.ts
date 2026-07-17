import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Initialize Sanity client
export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03', // use current date in format YYYY-MM-DD
  useCdn: true, // set to false if you require the latest fresh data
});

// Set up image URL builder
const builder = imageUrlBuilder(sanityClient);
export function urlFor(source: any) {
  return builder.image(source);
}

// Mock Data for Local Development / Fallbacks
const mockArticles: Article[] = [
  {
    _id: 'article_1',
    title: 'Getting Started with Astro and Tailwind CSS',
    slug: { current: 'getting-started-with-astro-and-tailwind-css' },
    publishedAt: new Date().toISOString(),
    excerpt: 'Learn how to build modern, performant websites using Astro and Tailwind CSS.',
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'John Doe',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      bio: 'Software engineer and technical writer'
    },
    body: 'Astro is a modern web framework that enables you to build faster websites with less client-side JavaScript. By shipping zero client-side JavaScript by default, Astro pages load instantly. This is the body of the mock article.'
  },
  {
    _id: 'article_2',
    title: 'Understanding TypeScript Generics',
    slug: { current: 'understanding-typescript-generics' },
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    excerpt: 'A comprehensive guide to understanding and using generics in TypeScript.',
    coverImage: 'https://images.unsplash.com/photo-1516116211223-5c359a36298a?auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'Jane Smith',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      bio: 'Senior frontend developer and tech enthusiast'
    },
    body: 'Generics are a powerful feature in TypeScript that allow you to write reusable, type-safe components and functions. They act as type variables that let you capture the types passed to a function or class.'
  }
];

async function safeFetch<T>(query: string, params: any, fallback: T): Promise<T> {
  const projId = sanityClient.config().projectId;
  if (!projId || projId === 'placeholder') {
    return fallback;
  }
  try {
    return await sanityClient.fetch(query, params);
  } catch (error) {
    console.warn('Sanity fetch failed, using fallback mock data:', error);
    return fallback;
  }
}

// Helper functions for fetching content
export async function getFeaturedArticles(limit = 6) {
  return safeFetch(
    `*[_type == "article" && defined(publishedAt) && featured == true] | order(publishedAt desc)[0...${limit}] {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      "coverImage": coverImage.asset->url,
      "author": {
        "name": author->name,
        "image": author->image.asset->url
      }
    }`,
    {},
    mockArticles.slice(0, limit)
  );
}

export async function getArticleBySlug(slug: string) {
  const matched = mockArticles.find(a => a.slug.current === slug) || null;
  return safeFetch(
    `*[_type == "article" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      publishedAt,
      body,
      excerpt,
      "coverImage": coverImage.asset->url,
      "author": {
        "name": author->name,
        "image": author->image.asset->url,
        "bio": author->bio
      }
    }`,
    { slug },
    matched
  );
}

export async function getArticlesByAuthor(authorId: string, limit = 10) {
  return safeFetch(
    `*[_type == "article" && author._ref == $authorId && defined(publishedAt)] | order(publishedAt desc)[0...${limit}] {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      "coverImage": coverImage.asset->url
    }`,
    { authorId },
    mockArticles.slice(0, limit)
  );
}

export async function getRecentArticles(limit = 10) {
  return safeFetch(
    `*[_type == "article" && defined(publishedAt)] | order(publishedAt desc)[0...${limit}] {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      "coverImage": coverImage.asset->url,
      "author": {
        "name": author->name,
        "image": author->image.asset->url
      }
    }`,
    {},
    mockArticles.slice(0, limit)
  );
}

// Types
export interface Article {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt: string;
  coverImage?: string;
  author: {
    name: string;
    image?: string;
    bio?: string;
  };
  body?: any; // Portable text
}

export interface Author {
  _id: string;
  name: string;
  image?: string;
  bio?: string;
}