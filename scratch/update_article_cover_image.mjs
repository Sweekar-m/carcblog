import { createClient } from '@sanity/client';

const sanityWriteClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2023-05-03',
  useCdn: false,
});

async function updateCoverImage() {
  console.log('=== SETTING SAMPLE COVER IMAGE ON TEST ARTICLE ===');
  const sampleUrl = 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg';

  const res = await sanityWriteClient
    .patch('xgT1lYUWrHvmOQinlERHhJ')
    .set({
      coverImage: sampleUrl,
    })
    .commit();

  console.log('Successfully updated article coverImage in Sanity:', res._id);
}

updateCoverImage();
