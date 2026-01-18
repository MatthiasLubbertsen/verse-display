import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const url = "https://www.bible.com/nl/verse-of-the-day";

  try {
    // Fetch HTML
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: "Error retrieving the webpage" });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // IMAGE
    let imageSrc = "";
    const img = $('div.cursor-pointer img').first();
    if (img.length) {
      imageSrc = img.attr("src") || "";
      if (!imageSrc.startsWith("http")) {
        imageSrc = "https://www.bible.com" + imageSrc;
      }
    }

    // VERSE LINK + TEXT
    let verseText = "";
    let verseUrl = "";

    const verse = $('a.w-full.no-underline.dark\\:text-text-dark.text-text-light').first();
    if (verse.length) {
      verseText = verse.text().trim();
      verseUrl = verse.attr("href") || "";

      if (!verseUrl.startsWith("http")) {
        verseUrl = "https://www.bible.com" + verseUrl;
      }

      verseUrl = verseUrl.replace("compare", "75");
    }

    // CHAPTER
    let chapter = "";
    const chapterNode = $('p.dark\\:text-text-dark.text-15.font-aktiv-grotesk.uppercase.font-bold.mbs-2.text-gray-25').first();
    if (chapterNode.length) {
      chapter = chapterNode.text().trim().replace(" (HTB)", "");
    }

    // JSON RESPONSE
    res.status(200).json({
      image: imageSrc,
      verse: verseText,
      verseUrl: verseUrl,
      chapter: chapter
    });

  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
