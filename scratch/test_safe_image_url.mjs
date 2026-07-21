import { safeImageUrl } from '../src/lib/sanity.ts';

// Test 1: Direct CDN string URL
const url1 = 'https://cdn.sanity.io/images/jvm4i678/production/abcdef-800x600.jpg';
console.log('Test 1 (direct string):', safeImageUrl(url1) === url1 ? 'PASSED ✅' : 'FAILED ❌');

// Test 2: External Pexels URL
const url2 = 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg';
console.log('Test 2 (external URL):', safeImageUrl(url2) === url2 ? 'PASSED ✅' : 'FAILED ❌');

// Test 3: Null or undefined
console.log('Test 3 (null):', safeImageUrl(null) === undefined ? 'PASSED ✅' : 'FAILED ❌');
