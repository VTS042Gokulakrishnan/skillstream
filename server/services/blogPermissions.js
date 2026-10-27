function editorAllowed(user, configuredEmails = process.env.BLOG_EDITOR_EMAILS || "") {
  const editors = configuredEmails.split(",").map(email => email.trim().toLowerCase()).filter(Boolean);
  return typeof user?.email === "string" && editors.includes(user.email.toLowerCase());
}
module.exports = { editorAllowed };
