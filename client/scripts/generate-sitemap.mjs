#!/usr/bin/env node
import { writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE_URL = process.env.SITE_URL || 'https://hotel-familyhouse.uz'
const API_URL = process.env.SITEMAP_API_URL || 'https://hotel-familyhouse.uz/api'
const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = resolve(__dirname, '../dist/sitemap.xml')

const STATIC_URLS = [
  { loc: '/', changefreq: 'weekly', priority: '1.0', alternates: true },
]

async function fetchJson(url, timeoutMs = 10000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlEntry({ loc, lastmod, changefreq, priority, alternates }) {
  const lines = [`  <url>`, `    <loc>${escapeXml(SITE_URL + loc)}</loc>`]
  if (lastmod) lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`)
  if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`)
  if (priority) lines.push(`    <priority>${priority}</priority>`)
  if (alternates) {
    for (const lang of ['uz', 'ru', 'en']) {
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(SITE_URL + loc)}" />`,
      )
    }
  }
  lines.push(`  </url>`)
  return lines.join('\n')
}

async function main() {
  const entries = [...STATIC_URLS]

  try {
    const rooms = await fetchJson(`${API_URL}/rooms`)
    if (Array.isArray(rooms)) {
      for (const room of rooms) {
        if (!room?.id) continue
        if (room.isActive === false) continue
        entries.push({
          loc: `/rooms/${room.id}`,
          lastmod: room.updatedAt
            ? new Date(room.updatedAt).toISOString()
            : undefined,
          changefreq: 'monthly',
          priority: '0.8',
          alternates: true,
        })
      }
      console.log(`[sitemap] rooms: ${rooms.length}`)
    }
  } catch (err) {
    console.warn(`[sitemap] rooms fetch failed: ${err.message}`)
  }

  try {
    const newsResponse = await fetchJson(`${API_URL}/news?page=1&limit=500`)
    const items = Array.isArray(newsResponse?.items) ? newsResponse.items : []
    for (const article of items) {
      if (!article?.id) continue
      if (article.isPublished === false) continue
      entries.push({
        loc: `/news/${article.id}`,
        lastmod: article.updatedAt
          ? new Date(article.updatedAt).toISOString()
          : article.createdAt
            ? new Date(article.createdAt).toISOString()
            : undefined,
        changefreq: 'monthly',
        priority: '0.6',
        alternates: true,
      })
    }
    console.log(`[sitemap] news: ${items.length}`)
  } catch (err) {
    console.warn(`[sitemap] news fetch failed: ${err.message}`)
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    entries.map(urlEntry).join('\n') +
    `\n</urlset>\n`

  await writeFile(OUTPUT_PATH, xml, 'utf8')
  console.log(`[sitemap] wrote ${entries.length} URLs → ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error('[sitemap] generation failed:', err)
  process.exit(0)
})
