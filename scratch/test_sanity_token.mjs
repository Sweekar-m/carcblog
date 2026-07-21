import { createClient } from '@sanity/client';

// Load env variables
process.loadEnvFile('.env');

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION || '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function test() {
  try {
    console.log('Testing fetch with write client token...');
    const result = await client.fetch('*[_type == "category"][0...1]');
    console.log('Query result:', result);

    console.log('Testing write (creating a draft article)...');
    const doc = {
      _type: 'article',
      title: 'Token Test Article ' + Date.now(),
      slug: { current: 'token-test-' + Date.now() },
    };
    const created = await client.create(doc);
    console.log('Created document:', created);
  } catch (err) {
    console.error('Operation failed:', err);
  }
}
test();
