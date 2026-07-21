import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  useCdn: false,
});

function safeImageUrl(source) {
  if (!source) return undefined;
  if (typeof source === 'string' && source.trim()) return source.trim();
  if (typeof source === 'object') {
    if (typeof source.url === 'string' && source.url.trim()) return source.url.trim();
    if (source.asset || source._ref || source._type === 'image') {
      const ref = source.asset?._ref || source._ref;
      if (ref) {
        // Parse Sanity asset reference: image-abcdef123-800x600-jpg -> https://cdn.sanity.io/images/projectId/dataset/abcdef123-800x600.jpg
        const match = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/i);
        if (match) {
          const [, id, dimensions, fmt] = match;
          return `https://cdn.sanity.io/images/${process.env.PUBLIC_SANITY_PROJECT_ID}/${process.env.PUBLIC_SANITY_DATASET}/${id}-${dimensions}.${fmt}`;
        }
      }
    }
  }
  return undefined;
}

async function testQuery() {
  const articles = await sanityClient.fetch(`*[_type == "article" && (status == "published" || defined(publishedAt)) && status != "archived"]
    | order(coalesce(publishedAt, _createdAt) desc)[0...10]
    { _id, title, slug, publishedAt, status, coverImage, "coverImageUrl": coalesce(coverImage.asset->url, coverImage), author->{ _id, name, image, "authorImageUrl": coalesce(image.asset->url, image) } }`);

  console.log('=== SANITY QUERY RESULTS ===');
  articles.forEach(art => {
    console.log(`Title: "${art.title}"`);
    console.log(`  Raw coverImage:`, art.coverImage);
    console.log(`  GROQ coverImageUrl:`, art.coverImageUrl);
    console.log(`  Resolved via safeImageUrl:`, safeImageUrl(art.coverImage));
  });
}

testQuery();
