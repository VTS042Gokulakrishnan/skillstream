const Blog = require("../models/blogsModel");
const formidable = require("formidable");
const sharp = require("sharp");
const AWS = require("aws-sdk");
const crypto = require("crypto");
const fs = require("fs/promises");
const mongoose = require("mongoose");
const { cleanArticle } = require("../services/blogContent");
const publishedFilter = {
  $or: [{ status: "published" }, { status: { $exists: false } }],
};
const { editorAllowed } = require("../services/blogPermissions");
exports.editorAllowed = editorAllowed;
exports.editorOnly = (req, res, next) =>
  editorAllowed(req.user)
    ? next()
    : res
        .status(403)
        .json({ message: "Publishing is limited to authorized editors." });
exports.editor = async (req, res, next) => {
  try {
    res.json({
      drafts: await Blog.find({
        status: "draft",
        authorId: String(req.user._id),
      }).sort({ _id: -1 }),
    });
  } catch (e) {
    next(e);
  }
};
exports.list = async (req, res, next) => {
  try {
    res.json({ blogs: await Blog.find(publishedFilter).sort({ _id: -1 }) });
  } catch (e) {
    next(e);
  }
};
exports.single = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.sendStatus(404);
    const blog = await Blog.findOne({ _id: req.params.id, ...publishedFilter });
    if (!blog) return res.sendStatus(404);
    res.json({ blogs: blog });
  } catch (e) {
    next(e);
  }
};
exports.save = async (req, res, next) => {
  let uploads = [];
  try {
    const form = formidable({
      multiples: false,
      maxFiles: 1,
      maxFileSize: 5 * 1024 * 1024,
      maxFieldsSize: 150 * 1024,
      keepExtensions: true,
    });
    form.on("file", (_name, file) => uploads.push(file.filepath));
    const [fields, files] = await new Promise((resolve, reject) =>
      form.parse(req, (err, fields, files) =>
        err ? reject(err) : resolve([fields, files])
      )
    );
    const field = (k) =>
      String(Array.isArray(fields[k]) ? fields[k][0] : fields[k] || "").trim();
    const topic = field("topic"),
      content = cleanArticle(field("content")),
      status = field("status");
    if (
      !topic ||
      topic.length > 180 ||
      !content ||
      content.length > 100000 ||
      !["draft", "published"].includes(status)
    )
      return res
        .status(400)
        .json({
          message: "Add a valid title, article content and publication status.",
        });
    const audience = field("audience"),
      category = field("category");
    if (
      !["Candidates", "Employers", "Everyone"].includes(audience) ||
      !["Career advice", "Interview practice", "Hiring insights"].includes(
        category
      )
    )
      return res
        .status(400)
        .json({ message: "Choose an audience and category." });
    let existing = null;
    if (field("id")) {
      if (!mongoose.isValidObjectId(field("id"))) return res.sendStatus(400);
      existing = await Blog.findOne({
        _id: field("id"),
        authorId: String(req.user._id),
      });
      if (!existing) return res.sendStatus(404);
    }
    const values = {
      topic,
      content,
      status,
      audience,
      category,
      summary: field("summary").slice(0, 400),
      imageAlt: field("imageAlt").slice(0, 250),
      seoTitle: field("seoTitle").slice(0, 180),
      author: req.user.name || "SkillStream editorial",
      authorId: String(req.user._id),
    };
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype))
        return res
          .status(400)
          .json({ message: "Use a JPG, PNG or WebP cover image." });
      if (!values.imageAlt)
        return res.status(400).json({ message: "Add an image description." });
      const buffer = await sharp(file.filepath, { limitInputPixels: 40000000 })
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      const uploaded = await new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
      })
        .upload({
          Bucket: process.env.AWS_BUCKET_NAME_IMAGE,
          Key: "blogs-image/" + crypto.randomUUID() + ".webp",
          Body: buffer,
          ContentType: "image/webp",
          ACL: "public-read",
        })
        .promise();
      values.image = uploaded.Location;
    }
    if (status === "published")
      values.date = existing?.date || new Date().toISOString().slice(0, 10);
    const blog = existing
      ? await Blog.findByIdAndUpdate(
          existing._id,
          { $set: values },
          { new: true }
        )
      : await Blog.create(values);
    res.status(201).json({ blog });
  } catch (error) {
    res
      .status(400)
      .json({
        message:
          "The article could not be saved. Check the content and image, then try again.",
      });
  } finally {
    await Promise.allSettled(uploads.map((path) => fs.unlink(path)));
  }
};
