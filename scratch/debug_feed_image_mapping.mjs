import { getSanityArticles, safeImageUrl } from '../src/lib/sanity.ts';

async function testFeedMapping() {
  const sanityArticles = await getSanityArticles({ limit: 5 });
  console.log('=== RAW SANITY ARTICLES FROM getSanityArticles ===');
  console.log(JSON.stringify(sanityArticles, null, 2));

  const recentArticles = sanityArticles.map(article => {
    const rawCover = article.coverImage;
    const resolvedCover = safeImageUrl(rawCover);
    console.log(`Article "${article.title}":`, { rawCover, resolvedCover });
    return {
      title: article.title,
      coverImage: resolvedCover ?? null,
    };
  });

  console.log('Mapped articles:', recentArticles);
}

testFeedMapping();
