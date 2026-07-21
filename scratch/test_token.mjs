import { createClient } from '@sanity/client';


const rawToken = process.env.SANITY_API_TOKEN || '';
const cleanToken = rawToken.trim();

console.log('Raw token length:', rawToken.length);
console.log('Clean token length:', cleanToken.length);

const noTokenClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  useCdn: false,
});

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  token: cleanToken,
  apiVersion: '2023-05-03',
  useCdn: false,
});


async function testToken() {
  try {
    const resNoToken = await noTokenClient.fetch('*[_type == "article"][0..1]');
    console.log('[SUCCESS] Public client without token fetched articles count:', resNoToken.length);
  } catch (err) {
    console.error('[FAIL] Public client without token failed:', err.message);
  }

  try {
    const resWithToken = await client.fetch('*[_type == "article"][0..1]');
    console.log('[SUCCESS] Write client with token fetched articles count:', resWithToken.length);
  } catch (err) {
    console.error('[FAIL] Write client with token failed:', err.statusCode, err.message);
  }
}


testToken();
