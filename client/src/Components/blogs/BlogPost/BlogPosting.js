import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./BlogPosting.css";
import axios from "axios";
import { Server } from "App";
import { Toaster, toast } from "react-hot-toast";

const BlogPosting = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loader, setLoader] = useState(false);
  const formRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    try {
      const formData = new FormData();
      formData.append("topic", title);
      formData.append("content", content);
      formData.append("file", image);

      const { data } = await axios.post(`${Server}/api/v1/data/post/blog`, formData);
      toast.success("Blog Posted Successfully");

      // Reset form only after successful submission
      setTitle("");
      setContent("");
      setImage(null);
      formRef.current.reset(); // Reset file input field
    } catch (error) {
      console.error(error);
      toast.error("Error in Posting Blog");
    } finally {
      setLoader(false);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top after submit
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  return (
    <div className="blog-container">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="blog-form-container">
        <h2 className="blog-title">Create Your Blog</h2>
        <form onSubmit={onSubmit} ref={formRef} className="blog-form">
          <label>Topic </label>
          <input
            type="text"
            placeholder="Enter Blog Title"
            value={title} // Ensure value is set correctly
            onChange={(e) => setTitle(e.target.value)}
            className="blog-input"
            required
          />

          <label>Content </label>
          <ReactQuill
            value={content}
            onChange={setContent}
            className="blog-editor"
          />

          <label>Upload Blog Image </label>
          <input
            type="file"
            onChange={handleImageUpload}
            className="blog-input"
            accept="image/*"
          />
          {image && <p>Selected File: {image.name}</p>} {/* Show selected image name */}

          <div className="blog-buttons">
            <button type="submit" className="publish" disabled={loader}>
              {loader ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogPosting;
