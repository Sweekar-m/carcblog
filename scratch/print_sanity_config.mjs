

const projectId = process.env.SANITY_PROJECT_ID ?? process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? process.env.PUBLIC_SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION ?? '2023-05-03';
const token = process.env.SANITY_API_TOKEN;

console.log('--- SANITY WRITE CLIENT CONFIGURATION ---');
console.log('projectId:', projectId);
console.log('dataset:', dataset);
console.log('apiVersion:', apiVersion);
console.log('useCdn:', false);
console.log('hasToken:', !!token);
console.log('tokenLength:', token?.length ?? 0);
