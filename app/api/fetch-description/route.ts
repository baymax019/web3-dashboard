import { NextResponse } from "next/server";

function getMetaContent(html: string, property: string) {
  const regex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["'][^>]*>`,
    "i"
  );

  const match = html.match(regex);

  return match?.[1] || match?.[2] || "";
}

function cleanText(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function splitIntoSentences(text: string) {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function scoreSentence(sentence: string) {
  const lower = sentence.toLowerCase();

  let score = 0;

  const positiveKeywords = [
    "is a",
    "built on",
    "platform",
    "protocol",
    "market",
    "network",
    "ai",
    "web3",
    "solana",
    "ethereum",
    "base",
    "prediction",
    "points",
    "rewards",
    "quest",
    "campaign",
    "airdrop",
    "users",
    "earn",
    "trade",
    "staking",
    "defi",
    "nft",
    "gaming",
    "social",
  ];

  const badKeywords = [
    "cookie",
    "privacy policy",
    "terms",
    "accept all",
    "reject",
    "sign in",
    "login",
    "connect wallet",
    "menu",
    "copyright",
    "all rights reserved",
    "learn more",
    "follow us",
  ];

  positiveKeywords.forEach((keyword) => {
    if (lower.includes(keyword)) score += 3;
  });

  badKeywords.forEach((keyword) => {
    if (lower.includes(keyword)) score -= 8;
  });

  if (sentence.length >= 80 && sentence.length <= 280) score += 8;
  if (sentence.length > 280 && sentence.length <= 500) score += 4;
  if (sentence.length < 50) score -= 5;
  if (sentence.length > 600) score -= 8;

  return score;
}

function getUsefulVisibleDescription(html: string) {
  const text = stripHtml(html);
  const sentences = splitIntoSentences(text);

  const candidates = sentences
    .filter((sentence) => sentence.length >= 60)
    .map((sentence) => ({
      sentence,
      score: scoreSentence(sentence),
    }))
    .sort((a, b) => b.score - a.score);

  const best = candidates[0];

  if (!best || best.score <= 0) return "";

  let description = best.sentence;

  const second = candidates.find(
    (candidate) =>
      candidate.sentence !== best.sentence &&
      candidate.score > 0 &&
      description.length + candidate.sentence.length < 420
  );

  if (second) {
    description = `${description} ${second.sentence}`;
  }

  return cleanText(description);
}

function isDescriptionGood(description: string) {
  const clean = cleanText(description);

  if (!clean) return false;
  if (clean.length < 80) return false;

  const badPatterns = [
    "cookie",
    "accept all",
    "reject non-essential",
    "privacy policy",
    "sign in",
    "connect wallet",
  ];

  return !badPatterns.some((pattern) =>
    clean.toLowerCase().includes(pattern)
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body.url;

    if (!url) {
      return NextResponse.json(
        { error: "Project URL is required." },
        { status: 400 }
      );
    }

    let targetUrl = url;

    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch website. Status ${response.status}`,
        },
        { status: 400 }
      );
    }

    const html = await response.text();

    const metadataDescription = cleanText(
      getMetaContent(html, "og:description") ||
        getMetaContent(html, "twitter:description") ||
        getMetaContent(html, "description")
    );

    if (isDescriptionGood(metadataDescription)) {
      return NextResponse.json({
        description: metadataDescription,
        source: "metadata",
      });
    }

    const visibleDescription = getUsefulVisibleDescription(html);

    if (visibleDescription) {
      return NextResponse.json({
        description: visibleDescription,
        source: "visible_content",
      });
    }

    if (metadataDescription) {
      return NextResponse.json({
        description: metadataDescription,
        source: "metadata_short",
      });
    }

    return NextResponse.json(
      {
        description: "",
        error:
          "No useful description found from website metadata or visible page content.",
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("FETCH DESCRIPTION ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch project description.",
      },
      { status: 500 }
    );
  }
}