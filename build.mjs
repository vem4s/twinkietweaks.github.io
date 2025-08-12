import fs from "fs";
import { marked } from "marked";
const imgWidth = 320
const imgHeight = 180

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
    return `<img src="${href}" alt="${text}" width="320" height="180" />`;
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

// Load the markdown file
const markdown = fs.readFileSync("twinkie.md", "utf-8");

// Setup marked with custom renderer
marked.use({ renderer: new CustomRenderer() });

// Parse it
let htmlBody = marked.parse(markdown);

// Post-process gallery wrapping
htmlBody = htmlBody.replace(
  /<h2>Screenshots<\/h2>\s*<p>(.*?)<\/p>/s,
  (_, imgs) => `<h2>Screenshots</h2>\n<div class=\"gallery\">${imgs}<\/div>`
);

// Wrap in your index.html structure
const html = `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n\t<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n\t<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n\t<link href=\"https://fonts.googleapis.com/css2?family=Cascadia+Mono:ital@0;1&display=swap\" rel=\"stylesheet\"> \n\t<link rel=\"icon\" type=\"image/x-icon\" href=\"favicon.ico\"/>\n\t\n\t<meta charset=\"UTF-8\">\n\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n\t<meta content=\"Twinkie\" property=\"og:title\" />\n\t<meta content=\"Twinkie is a free and open source QOL modification for Trackmania Forever.\" property=\"og:description\" />\n\t<meta content=\"https://github.com/TwinkieTweaks/Twinkie/blob/master/Media/t528.png?raw=true\" property=\"og:image\" />\n\t<meta content=\"#ff00ff\" data-react-helmet=\"true\" name=\"theme-color\" />\n\t\n\t<title>Twinkie - Trackmania Forever</title>\n\t<link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n<body>\n\t<center>\n\t	<div id=\"main-container\" class=\"cascadia-mono\">\n\t		<div id=\"secondary-container\">\n${htmlBody.trim()}\n\t		</div>\n\t	</div>\n\t</center>\n</body>\n</html>`;

fs.writeFileSync("index.html", html);
console.log("✅ index.html generated successfully.");