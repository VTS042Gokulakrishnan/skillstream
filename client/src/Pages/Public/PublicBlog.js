import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Server } from "../../App";
import PublicShell from "../../Components/PublicSite/PublicShell";
import { ArticleContent, plainText, safeImage } from "./blogContent";
const link = (b) =>
  "/blog-details/" +
  encodeURIComponent((b.topic || "article").replace(/\s+/g, "-")) +
  "/" +
  b._id;
function Card({ blog }) {
  return (
    <article className="ss-card ss-blog-card">
      {safeImage(blog.image) && (
        <img
          loading="lazy"
          src={safeImage(blog.image)}
          alt={blog.imageAlt || ""}
        />
      )}
      <div className="ss-card-body">
        <p className="ss-eyebrow">{blog.category || "Resources"}</p>
        <h2>
          <Link to={link(blog)}>{blog.topic}</Link>
        </h2>
        <p>{plainText(blog.summary || blog.content).slice(0, 180)}…</p>
        {blog.date && <p className="ss-muted">{blog.date}</p>}
        <Link to={link(blog)}>Read article →</Link>
      </div>
    </article>
  );
}
export function BlogPage() {
  const [blogs, setBlogs] = useState([]),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("All"),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    setError("");
    axios
      .get(Server + "/api/v1/data/blogs/all")
      .then(({ data }) => setBlogs(data.blogs || []))
      .catch(() => setError("We could not load articles."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const filtered = blogs.filter(
    (b) =>
      (category === "All" || b.category === category) &&
      ((b.topic || "") + " " + plainText(b.summary || b.content))
        .toLowerCase()
        .includes(query.toLowerCase())
  );
  return (
    <PublicShell title="Career resources and hiring insights">
      <p className="ss-eyebrow">RESOURCES</p>
      <h1>Ideas for your next step.</h1>
      <p className="ss-lead">
        Practical guidance for careers, interviews and hiring.
      </p>
      <label className="ss-form" style={{ marginTop: 30 }}>
        Search articles
        <input
          className="ss-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by topic or keyword"
        />
      </label>
      <div className="ss-tabs">
        {["All", "Career advice", "Interview practice", "Hiring insights"].map(
          (c) => (
            <button
              aria-pressed={c === category}
              className={c === category ? "active" : ""}
              key={c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          )
        )}
      </div>
      {loading ? (
        <p role="status" className="ss-loading">
          Loading articles…
        </p>
      ) : error ? (
        <p role="alert" className="ss-notice ss-error">
          {error}{" "}
          <button className="ss-text-btn" onClick={load}>
            Retry
          </button>
        </p>
      ) : filtered.length ? (
        <div className="ss-grid">
          {filtered.map((b) => (
            <Card key={b._id} blog={b} />
          ))}
        </div>
      ) : (
        <p role="status" className="ss-notice">
          {blogs.length
            ? "No articles match your search. Try another topic."
            : "New career resources are on their way. Explore interview practice while we prepare them."}
        </p>
      )}
      <div className="ss-actions">
        <Link to="/practiceInterviewLanding">Explore interview practice →</Link>
      </div>
    </PublicShell>
  );
}
export function BlogArticle() {
  const { id } = useParams(),
    [blog, setBlog] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    axios
      .get(Server + "/api/v1/data/blog/" + encodeURIComponent(id))
      .then(({ data }) => {
        if (active) {
          setBlog(data.blogs);
          if (!data.blogs) setError("This article could not be found.");
        }
      })
      .catch(() => {
        if (active) setError("This article could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);
  return (
    <PublicShell title={blog?.topic || "Article"} description={blog?.summary}>
      <Link to="/blog">← All resources</Link>
      {loading ? (
        <p role="status" className="ss-loading">
          Loading article…
        </p>
      ) : error ? (
        <p role="alert" className="ss-notice ss-error">
          {error}
        </p>
      ) : (
        <article className="ss-blog-article">
          <p className="ss-eyebrow" style={{ marginTop: 30 }}>
            {blog.category || "Resources"}
          </p>
          <h1>{blog.topic}</h1>
          <p className="ss-muted">
            {[blog.author, blog.date].filter(Boolean).join(" · ")}
          </p>
          {safeImage(blog.image) && (
            <img src={safeImage(blog.image)} alt={blog.imageAlt || ""} />
          )}
          <ArticleContent content={blog.content} />
          <div className="ss-section ss-banner">
            <div>
              <h3>Put preparation into practice.</h3>
              <Link to="/practiceInterviewLanding">
                Explore interview practice →
              </Link>
            </div>
          </div>
        </article>
      )}
    </PublicShell>
  );
}
const empty = {
  topic: "",
  summary: "",
  content: "",
  audience: "Candidates",
  category: "Career advice",
  imageAlt: "",
  seoTitle: "",
};
export function BlogEditor() {
  const [form, setForm] = useState(empty),
    [drafts, setDrafts] = useState([]),
    [id, setId] = useState(""),
    [file, setFile] = useState(null),
    [preview, setPreview] = useState(false),
    [allowed, setAllowed] = useState(null),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const options = {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
  };
  useEffect(() => {
    axios
      .get(Server + "/api/v1/data/blog/editor", options)
      .then(({ data }) => {
        setAllowed(true);
        setDrafts(data.drafts || []);
      })
      .catch(() => setAllowed(false));
  }, []);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const save = async (state) => {
    if (!form.topic.trim() || !form.content.trim()) {
      setStatus("Add an article title and content first.");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append("status", state);
      if (id) data.append("id", id);
      if (file) data.append("file", file);
      const result = await axios.post(
        Server + "/api/v1/data/post/blog",
        data,
        options
      );
      setId(result.data.blog._id);
      setStatus(state === "published" ? "Article published." : "Draft saved.");
      const list = await axios.get(
        Server + "/api/v1/data/blog/editor",
        options
      );
      setDrafts(list.data.drafts || []);
    } catch (e) {
      setStatus(
        e.response?.data?.message ||
          "The article could not be saved. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <PublicShell title="Create an article">
      <p className="ss-eyebrow">CONTENT WORKSPACE</p>
      <h1>Create an article</h1>
      {allowed === null ? (
        <p role="status">Checking editor access…</p>
      ) : !allowed ? (
        <div className="ss-notice">
          Publishing is limited to authorized editors. Sign in with your editor
          account or <Link to="/contact">contact support</Link>.
        </div>
      ) : (
        <>
          <div className="ss-actions">
            <button
              className="ss-btn ss-btn-outline"
              onClick={() => setPreview(!preview)}
            >
              {preview ? "Back to editor" : "Preview"}
            </button>
            <button
              className="ss-btn ss-btn-outline"
              disabled={busy}
              onClick={() => save("draft")}
            >
              Save draft
            </button>
            <button
              className="ss-btn"
              disabled={busy}
              onClick={() => save("published")}
            >
              {busy ? "Saving…" : "Publish article"}
            </button>
          </div>
          {status && (
            <p role="status" className="ss-notice">
              {status}
            </p>
          )}
          {preview ? (
            <article className="ss-card ss-blog-article ss-section">
              <span className="ss-badge">Preview</span>
              <h1>{form.topic || "Article title"}</h1>
              <p>{form.summary}</p>
              <ArticleContent content={form.content} />
            </article>
          ) : (
            <div className="ss-editor ss-section">
              <div className="ss-card ss-form">
                <label>
                  Title
                  <input
                    name="topic"
                    maxLength={180}
                    value={form.topic}
                    onChange={update}
                  />
                </label>
                <label>
                  Summary
                  <textarea
                    name="summary"
                    style={{ minHeight: 100 }}
                    maxLength={400}
                    value={form.summary}
                    onChange={update}
                  />
                </label>
                <div>
                  <p id="article-content-label">Article content</p>
                  <ReactQuill
                    value={form.content}
                    onChange={(content) =>
                      setForm((current) => ({ ...current, content }))
                    }
                    modules={{
                      toolbar: [
                        [{ header: [2, 3, false] }],
                        ["bold", "italic"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link", "blockquote", "clean"],
                      ],
                    }}
                    aria-labelledby="article-content-label"
                  />
                </div>
                <p className="ss-muted">
                  Use headings, paragraphs and lists to make your article easy
                  to read. Preview before publishing.
                </p>
              </div>
              <aside className="ss-card ss-form">
                <h3>Publishing details</h3>
                <label>
                  Audience
                  <select
                    name="audience"
                    value={form.audience}
                    onChange={update}
                  >
                    {["Candidates", "Employers", "Everyone"].map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Category
                  <select
                    name="category"
                    value={form.category}
                    onChange={update}
                  >
                    {[
                      "Career advice",
                      "Interview practice",
                      "Hiring insights",
                    ].map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Cover image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setFile(e.target.files[0] || null)}
                  />
                </label>
                <p className="ss-muted">JPG, PNG or WebP. Maximum 5 MB.</p>
                <label>
                  Image description
                  <input
                    name="imageAlt"
                    value={form.imageAlt}
                    onChange={update}
                    maxLength={250}
                  />
                </label>
                <label>
                  SEO title
                  <input
                    name="seoTitle"
                    value={form.seoTitle}
                    onChange={update}
                    maxLength={180}
                  />
                </label>
              </aside>
            </div>
          )}
          <section>
            <h2>Saved drafts</h2>
            {drafts.length ? (
              drafts.map((d) => (
                <button
                  className="ss-text-btn"
                  key={d._id}
                  style={{ display: "block" }}
                  onClick={() => {
                    setId(d._id);
                    setForm({ ...empty, ...d });
                    setFile(null);
                    setPreview(false);
                  }}
                >
                  {d.topic}
                </button>
              ))
            ) : (
              <p>No saved drafts.</p>
            )}
          </section>
        </>
      )}
    </PublicShell>
  );
}
