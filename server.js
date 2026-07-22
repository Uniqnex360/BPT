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

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
);

const indexHtmlPath = path.join(__dirname, "dist", "index.html");

app.get("/articles/:slug", async (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";
  const isBot =
    /facebookexternalhit|WhatsApp|twitterbot|linkedinbot|telegrambot|slackbot|discordbot/i.test(
      userAgent,
    );

  // If a social bot visits an article link, inject its specific meta tags
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
        const url = `https://bepositivethinking.com/articles/${slug}`;

        // Replace global fallback meta tags with article-specific ones
        html = html
          .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
          .replace(
            /content="https:\/\/bepositivethinking\.com\/image\.png"/g,
            `content="${image}"`,
          )
          .replace(
            /content="Weekly doses of positivity, mindfulness, and growth\."/g,
            `content="${description}"`,
          )
          .replace(/content="Be Positive Thinking"/g, `content="${title}"`)
          .replace(
            /content="https:\/\/bepositivethinking\.com"/g,
            `content="${url}"`,
          );

        return res.send(html);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Regular human users continue to standard React SPA
  next();
});

// Serve built static assets from dist folder
app.use(express.static(path.join(__dirname, "dist")));

// Fallback all other routes to index.html for React Router
app.get("/{*splat}", (req, res) => {
  res.sendFile(indexHtmlPath);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
