const cheerio = require("cheerio");
const allowed = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "pre",
  "code",
  "a",
]);
function cleanArticle(value) {
  const $ = cheerio.load(String(value), {}, false);
  $("script,style,iframe,object,embed,form,svg,math").remove();
  $("*").each((_i, el) => {
    if (!allowed.has(el.tagName)) {
      $(el).replaceWith($(el).contents());
      return;
    }
    const href = el.tagName === "a" ? $(el).attr("href") : null;
    Object.keys(el.attribs || {}).forEach((name) => $(el).removeAttr(name));
    if (href && /^(https?:\/\/|mailto:)/i.test(href)) $(el).attr("href", href);
  });
  return $.html().trim();
}
module.exports = { cleanArticle };
