import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  useCdn: false,
});

async function inspectAllArticles() {
  console.log('=== INSPECTING ALL SANITY ARTICLES ===');
  const articles = await sanityClient.fetch(`*[_type == "article"] | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    slug,
    status,
    publishedAt,
    coverImage,
    "coverImageUrl": coverImage.asset->url,
    author-> {
      _id,
      name,
      clerkUserId,
      image,
      "authorImageUrl": image.asset->url
    }
  }`);

  console.log(`Found ${articles.length} total articles in Sanity:`);
  articles.forEach((art, i) => {
    console.log(`\n[${i + 1}] ID: ${art._id}`);
    console.log(`    Title: "${art.title}"`);
    console.log(`    Slug: ${JSON.stringify(art.slug)}`);
    console.log(`    Status: ${art.status}`);
    console.log(`    PublishedAt: ${art.publishedAt}`);
    console.log(`    CoverImage raw: ${JSON.stringify(art.coverImage)}`);
    console.log(`    CoverImage dereferenced URL: ${art.coverImageUrl}`);
    console.log(`    Author Name: ${art.author?.name}`);
    console.log(`    Author Image raw: ${JSON.stringify(art.author?.image)}`);
    console.log(`    Author Image dereferenced URL: ${art.author?.authorImageUrl}`);
  });
}

inspectAllArticles();
