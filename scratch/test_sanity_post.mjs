import { createClient } from '@sanity/client';

console.log('Project ID:', process.env.PUBLIC_SANITY_PROJECT_ID);

console.log('Dataset:', process.env.PUBLIC_SANITY_DATASET);
console.log('SANITY_API_TOKEN present:', !!process.env.SANITY_API_TOKEN, 'length:', process.env.SANITY_API_TOKEN?.length);
console.log('Token prefix:', process.env.SANITY_API_TOKEN?.slice(0, 10));

const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  useCdn: true,
});

const sanityWriteClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2023-05-03',
  useCdn: false,
});



async function uploadAsset(url) {
  console.log('[1] uploadAsset fetching URL:', url);
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP error ${resp.status} fetching ${url}`);
    const buffer = Buffer.from(await resp.arrayBuffer());
    const contentType = resp.headers.get('content-type') || 'image/jpeg';
    let filename = 'upload.jpg';
    try {
      filename = new URL(url).pathname.split('/').pop() || 'upload.jpg';
    } catch {
      filename = 'upload.jpg';
    }
    console.log('[2] Uploading asset to Sanity...');
    const asset = await sanityWriteClient.assets.upload('image', buffer, { filename, contentType });
    console.log('[3] Asset uploaded successfully:', asset._id);
    return asset._id;
  } catch (err) {
    console.error('[E] uploadAsset failed:', err.message);
    throw err;
  }
}

async function ensureAuthorDocument(clerkUserId, name, email, imageUrl) {
  console.log('[4] ensureAuthorDocument:', { clerkUserId, name, imageUrl });
  const existing = await sanityClient.fetch(`*[_type == "author" && clerkUserId == $id][0] { _id }`, { id: clerkUserId });
  if (existing?._id) {

    console.log('[5] Author document exists:', existing._id);
    return existing._id;
  }

  const doc = { _type: 'author', clerkUserId, name };
  if (imageUrl) {
    try {
      const assetId = await uploadAsset(imageUrl);
      doc.image = { _type: 'image', asset: { _ref: assetId } };
    } catch (err) {
      console.warn('[6] Avatar upload failed, continuing without image reference:', err.message);
    }
  }

  const created = await sanityWriteClient.create(doc);
  console.log('[7] Created author doc:', created._id);
  return created._id;
}

async function testArticleCreation() {
  console.log('=== STARTING TEST SANITY ARTICLE CREATION ===');
  try {
    const clerkUserId = 'user_test_writer_456';
    const authorId = await ensureAuthorDocument(
      clerkUserId,
      'Test Writer',
      undefined,
      'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg'
    );

    const doc = {
      _type: 'article',
      title: 'Regression Test Article 500 Debug',
      slug: { current: 'regression-test-500-' + Date.now() },
      excerpt: 'Debugging POST /api/articles HTTP 500 regression',
      body: [
        {
          _type: 'block',
          style: 'normal',
          children: [{ _type: 'span', text: 'Test article body text' }],
        },
      ],
      publishedAt: new Date().toISOString(),
      status: 'published',
      author: { _type: 'reference', _ref: authorId },
      tags: ['test'],
    };

    console.log('[8] Creating article document in Sanity:', doc);
    const created = await sanityWriteClient.create(doc);
    console.log('=== SUCCESS! Created Article ID:', created._id);
  } catch (err) {
    console.error('=== FATAL EXCEPTION during testArticleCreation:', err);
  }
}

testArticleCreation();
