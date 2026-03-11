export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Homepage -->
  <url>
    <loc>https://frozenyogurtcafe.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://frozenyogurtcafe.com/assets/images/logo.webp</image:loc>
      <image:caption>Get Yo Frozen Yogurt Cafe Logo - Best Froyo Near Me</image:caption>
    </image:image>
  </url>

  <!-- Menu Section -->
  <url>
    <loc>https://frozenyogurtcafe.com/#menu</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Locations Section -->
  <url>
    <loc>https://frozenyogurtcafe.com/#locations</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Marlboro Location Page -->
  <url>
    <loc>https://frozenyogurtcafe.com/marlboro</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Contact Section -->
  <url>
    <loc>https://frozenyogurtcafe.com/#contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Careers Section -->
  <url>
    <loc>https://frozenyogurtcafe.com/#careers</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Privacy Policy -->
  <url>
    <loc>https://frozenyogurtcafe.com/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- Terms of Service -->
  <url>
    <loc>https://frozenyogurtcafe.com/terms-of-service</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- Account Deletion -->
  <url>
    <loc>https://frozenyogurtcafe.com/account-deletion</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>

  <!-- LLMs.txt -->
  <url>
    <loc>https://frozenyogurtcafe.com/llms.txt</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.2</priority>
  </url>

</urlset>`;

  return new Response(content, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
