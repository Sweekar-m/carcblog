import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  useCdn: false,
});

async function inspectBody() {
  const article = await sanityClient.fetch(`*[_type == "article" && _id == "xgT1lYUWrHvmOQinlERHhJ"][0]`);
  console.log('=== ARTICLE RECORD ===');
  console.log('title:', article?.title);
  console.log('coverImage:', article?.coverImage);
  console.log('body structure:');
  console.log(JSON.stringify(article?.body, null, 2));
}

inspectBody();
