import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
);

const indexHtmlPath = path.join(__dirname, "dist", "index.html");

app.get("/articles/:slug", async (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";

  // Bot detection regex (includes MS Teams, WhatsApp, Twitter, FB, LinkedIn, etc.)
  const isBot =
    /facebookexternalhit|WhatsApp|twitterbot|linkedinbot|telegrambot|slackbot|discordbot|SkypeUriPreview|MicrosoftPreview|BingPreview|Applebot/i.test(
      userAgent,
    );

  if (isBot) {
    const { slug } = req.params;
    try {
      const { data } = await supabase
        .from("articles")
        .select("title, excerpt, cover_image")
        .eq("slug", slug)
        .single();

      if (data) {
        let html = fs.readFileSync(indexHtmlPath, "utf8");

        const title = `${data.title} – Be Positive Thinking`;
        const description =
          data.excerpt ||
          "Weekly doses of positivity, mindfulness, and growth.";
        const image =
          data.cover_image || "https://bepositivethinking.com/image.png";
        const url = `https://bpt-e5wg.onrender.com/articles/${slug}`;

        // Construct complete meta tags directly
        const dynamicMetaTags = `
          <title>${title}</title>
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="${image}" />
          <meta property="og:url" content="${url}" />
          <meta property="og:type" content="article" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${title}" />
          <meta name="twitter:description" content="${description}" />
          <meta name="twitter:image" content="${image}" />
        </head>`;

        // Remove standard static title/og tags & replace closing </head>
        html = html.replace(/<title>.*?<\/title>/gi, "");
        html = html.replace(/<meta property="og:.*?".*?>/gi, "");
        html = html.replace(/<meta name="twitter:.*?".*?>/gi, "");
        html = html.replace("</head>", dynamicMetaTags);

        return res.send(html);
      }
    } catch (e) {
      console.error("Error fetching article metadata:", e);
    }
  }

  next();
});

// Serve static assets from dist
app.use(express.static(path.join(__dirname, "dist")));

// Fallback all other routes to index.html for React Router
app.get("/{*splat}", (req, res) => {
  res.sendFile(indexHtmlPath);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
