import fs from "fs";
import { marked } from "marked";
import http from "http";
import path from "path";
import url from "url";

const imgWidth = 320;
const imgHeight = 180;

class CustomRenderer extends marked.Renderer {
  paragraph(text) {
    if (typeof text !== "string") return `<p>${text}</p>`;
    if (text.includes("<img")) return `<p>${text}</p>`;
    return `<p class="first-p">${text}</p>`;
  }

  link(href, title, text) {
    return `<a href="${href}" target="_blank">${text}</a>`;
  }

  image(href, title, text) {
    return `<img src="${href}" alt="${text}" width="${imgWidth}" height="${imgHeight}" />`;
  }

  heading(text, level) {
    return `<h${level}>${text}</h${level}>`;
  }

  list(body, ordered) {
    const tag = ordered ? "ol" : "ul";
    return `<${tag}>${body}</${tag}>`;
  }

  listitem(text) {
    return `<li>${text}</li>`;
  }
}

marked.use({ renderer: new CustomRenderer() });

// Template wrapper
function wrapHtml(body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Cascadia+Mono:ital@0;1&display=swap" rel="stylesheet">
	<link rel="icon" type="image/x-icon" href="favicon.ico"/>
	
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta content="Twinkie" property="og:title" />
	<meta content="Twinkie is a free and open source QOL modification for Trackmania Forever." property="og:description" />
	<meta content="https://github.com/TwinkieTweaks/Twinkie/blob/master/Media/t528.png?raw=true" property="og:image" />
	<meta content="#ff00ff" data-react-helmet="true" name="theme-color" />
	
	<title>Twinkie - Trackmania Forever</title>
	<link rel="stylesheet" href="styles.css">
</head>
<body>
	<center>
		<div id="main-container" class="cascadia-mono">
			<div id="secondary-container">
${body.trim()}
			</div>
		</div>
	</center>
</body>
</html>`;
}

// Convert markdown → HTML
function renderMarkdown() {
  let markdown = fs.readFileSync("twinkie.md", "utf-8");
  let htmlBody = marked.parse(markdown);

  // Gallery wrapping
  htmlBody = htmlBody.replace(
    /<h2>Screenshots<\/h2>\s*<p>(.*?)<\/p>/s,
    (_, imgs) => `<h2>Screenshots</h2>\n<div class="gallery">${imgs}</div>`
  );

  return wrapHtml(htmlBody);
}

// Detect mode
const isDebug = process.argv.includes("--debug");

if (isDebug) {
  const PORT = process.env.PORT || 3000;

  // Serve live markdown
  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === "/" || parsedUrl.pathname === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(renderMarkdown());
    } else {
      // Serve static files (CSS, favicon, etc.)
      const filePath = path.join(process.cwd(), parsedUrl.pathname);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const mime =
          ext === ".css"
            ? "text/css"
            : ext === ".ico"
            ? "image/x-icon"
            : "text/plain";
        res.writeHead(200, { "Content-Type": mime });
        res.end(fs.readFileSync(filePath));
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    }
  });

  server.listen(PORT, () =>
    console.log(`🚀 Debug server running at http://localhost:${PORT}`)
  );

  // Watch for changes
  fs.watchFile("twinkie.md", () =>
    console.log("♻️ Reload: twinkie.md updated")
  );
} else {
  // Normal mode → write index.html once
  fs.writeFileSync("index.html", renderMarkdown());
  console.log("✅ index.html generated successfully.");
}
