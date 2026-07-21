import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  useCdn: true,
});

async function checkArticles() {
  const articles = await sanityClient.fetch(`*[_type == "article"][0..5] {
    _id,
    title,
    coverImage,
    "coverImageUrl": coverImage.asset->url,
    "coalescedCover": coalesce(coverImage.asset->url, coverImage),
    author-> {
      name,
      image,
      "imageUrl": image.asset->url,
      "coalescedImage": coalesce(image.asset->url, image)
    }
  }`);

  console.log('=== ARTICLES IMAGE PROJECTION AUDIT ===');
  console.log(JSON.stringify(articles, null, 2));
}

checkArticles();
