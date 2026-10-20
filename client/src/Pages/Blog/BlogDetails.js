import React, { useState, useEffect } from "react";
import image1 from "../../assets/businesswoman-discussing-with-colleagues-digital-tablet.jpg";
import thumbs from "../../assets/award01.png";
import { Helmet } from "react-helmet";
import { Server } from "App";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // for supporting GitHub Flavored Markdown (tables, strikethrough, etc.)
import rehypeRaw from "rehype-raw";
import { Parser } from "htmlparser2";
import { render } from "dom-serializer";
import { convert } from "html-to-text";
const BlogDetails = () => {
  // Sample blog data
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get(`${Server}/api/v1/data/blogs/all`);
        setBlogs(data.blogs);
        const currentIndex = data.blogs.findIndex((blog) => blog._id === id);
        setCurrentIndex(currentIndex);
        setBlog(data.blogs[currentIndex]);
      } catch (error) {
        // console.log(error);
      }
    };

    fetchBlogs();
  }, [id]);

  const getNextBlog = () => {
    return currentIndex + 1 < blogs.length ? blogs[currentIndex + 1] : null;
  };

  const getPreviousBlog = () => {
    return currentIndex - 1 >= 0 ? blogs[currentIndex - 1] : null;
  };

  const nextBlog = getNextBlog();
  const prevBlog = getPreviousBlog();
  // Use the first blog entry for demonstration
  // const blog = blogData[0];
  const handleNavigation = (blogId, blogTopic) => {
    navigate(`/blog-details/${blogTopic.split(" ").join("-")}/${blogId}`);
    window.scrollTo(0, 0); // Scroll to top of the page
  };

  const addClassnameToParagraphs = (htmlString) => {
    let modifiedHtmlString = "";

    // Create a new parser instance
    const parser = new Parser({
      onopentag(name, attribs) {
        if (["p", "h1", "h2", "h3"].includes(name)) {
          // Add a class attribute to specified tags
          modifiedHtmlString += `<${name} class="${name}-format">`;
        } else {
          // For other tags, append them as is
          const attrs = Object.keys(attribs)
            .map((attr) => `${attr}="${attribs[attr]}"`)
            .join(" ");
          modifiedHtmlString += `<${name}${attrs ? ` ${attrs}` : ""}>`;
        }
      },
      ontext(text) {
        // Append text content
        modifiedHtmlString += text;
      },
      onclosetag(name) {
        // Close the tag
        modifiedHtmlString += `</${name}>`;
      },
    });

    parser.end(htmlString);

    return modifiedHtmlString;
  };
  const hasHtmlTags = (str) => /<\/?[a-z][\s\S]*>/i.test(str);

  const removeHtmlTags = (htmlString) => {
    if (hasHtmlTags(htmlString)) {
      const modifiedHtml = addClassnameToParagraphs(htmlString);
      return <div dangerouslySetInnerHTML={{ __html: modifiedHtml }} />;
    } else {
      return htmlString;
    }
  };
  return (
    <div
      style={{
        background: "#000000",
        color: "#ffffff",
        minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif",
        padding: "0",
        margin: "0",
      }}
    >
      <Helmet>
        <meta
          name="Insights on Tech Jobs| Latest US JobsTrends| Skillstream Jobs Blog"
          content="Explore expert insights on tech jobs and the latest job trends in US with SkillStream Jobs Blog. Stay informed and enhance your job search with career tips."
        />
      </Helmet>
      <section
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2rem",
          position: "relative",
        }}
      >
        <header style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "3rem",
              fontWeight: "700",
              color: "#00bfff",
              marginBottom: "1rem",
            }}
          >
            {blog?.topic}
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#999",
              fontSize: "1rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginRight: "2rem",
              }}
            >
              <img
                src="https://skill-stream-jobs.s3.amazonaws.com/candidates/5303f7d40027bf760cef74c00.png"
                alt="Thumbnail"
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  marginRight: "0.5rem",
                }}
              />
              <span>Ananth Kumaraswamy</span>
            </div>
            <div>{blog.date}</div>
            <div style={{ marginLeft: "2rem" }}>0 Comments</div>
          </div>
        </header>
        <figure
          style={{
            width: "80%",
            maxWidth: "1200px",
            borderRadius: "15px",
            overflow: "hidden",
            boxShadow: "0 15px 30px rgba(0,0,0,0.5)",
            marginBottom: "2rem",
          }}
        >
          <img
            src={blog.image}
            alt="Main"
            style={{
              width: "100%",
              height: "auto",
              transition: "transform 0.3s",
              borderRadius: "15px",
            }}
          />
        </figure>
        <div style={{ width: "80%", maxWidth: "1200px" }}>
          <h3
            style={{
              fontSize: "2.5rem",
              fontWeight: "600",
              color: "#00bfff",
              marginBottom: "1rem",
            }}
          >
            {blog.topic}
          </h3>
          <p
            style={{
              fontSize: "1.2rem",
              lineHeight: "1.2",
              color: "#e1e1e1",
              marginBottom: "2rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {removeHtmlTags(blog.content)}
          </p>

          {/*        <blockquote
            style={{
              borderLeft: "5px solid #00bfff",
              paddingLeft: "1rem",
              fontStyle: "italic",
              margin: "2rem 0",
              color: "#e1e1e1",
              backgroundColor: "#333333",
              borderRadius: "10px",
            }}
          >
            <p>{blog.blockquote}</p>
            <cite
              style={{ display: "block", marginTop: "0.5rem", color: "#999" }}
            >
              {blog.blockquoteAuthor}
            </cite>
          </blockquote>
       {  /*    <h3
            style={{
              fontSize: "2.5rem",
              fontWeight: "600",
              color: "#00bfff",
              marginBottom: "1rem",
            }}
          >
            What you'll learn
          </h3>
          <ul
            style={{
              listStyleType: "disc",
              paddingLeft: "1.5rem",
              color: "#e1e1e1",
              marginBottom: "2rem",
            }}
          >
            {blog?.learnings?.map((item, index) => (
              <li key={index} style={{ fontSize: "1.2rem", lineHeight: "1.8" }}>
                {item}
              </li>
            ))}
          </ul>
          <h3
            style={{
              fontSize: "2.5rem",
              fontWeight: "600",
              color: "#00bfff",
              marginBottom: "1rem",
            }}
          >
            Requirements
          </h3>
          <ul
            style={{
              listStyleType: "disc",
              paddingLeft: "1.5rem",
              color: "#e1e1e1",
            }}
          >
            {blog?.requirements?.map((req, index) => (
              <li key={index} style={{ fontSize: "1.2rem", lineHeight: "1.8" }}>
                {req}
              </li>
            ))}
          </ul>*/}

          {/* Comment Form */}
          <div
            style={{
              margin: "3rem 0",
              padding: "2rem",
              borderRadius: "10px",
              backgroundColor: "#222222",
              boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
            }}
          >
            <h3
              style={{
                fontSize: "1.75rem",
                fontWeight: "600",
                color: "#00bfff",
                marginBottom: "1rem",
              }}
            >
              Leave a Comment
            </h3>
            <form>
              <div style={{ marginBottom: "1rem" }}>
                <input
                  type="text"
                  placeholder="Name"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    fontSize: "1rem",
                    backgroundColor: "#333333",
                    color: "#ffffff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                    transition: "box-shadow 0.3s",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <input
                  type="email"
                  placeholder="Email"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    fontSize: "1rem",
                    backgroundColor: "#333333",
                    color: "#ffffff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                    transition: "box-shadow 0.3s",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <textarea
                  placeholder="Comment"
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    fontSize: "1rem",
                    backgroundColor: "#333333",
                    color: "#ffffff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                    transition: "box-shadow 0.3s",
                  }}
                ></textarea>
              </div>
              <button
                type="submit"
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#00bfff",
                  color: "#000000",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background-color 0.3s, transform 0.3s",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
                }}
              >
                Post Comment
              </button>
            </form>
          </div>

          {/* Comments Section */}
          <section
            style={{
              margin: "3rem 0",
              padding: "2rem",
              borderRadius: "10px",
              backgroundColor: "#222222",
              boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
            }}
          >
            <h3
              style={{
                fontSize: "1.75rem",
                fontWeight: "600",
                color: "#00bfff",
                marginBottom: "1rem",
              }}
            >
              Comments
            </h3>
            {/*    <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <img
                  src="https://via.placeholder.com/40"
                  alt="User"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    marginRight: "0.5rem",
                  }}
                />
                <strong>John Doe</strong>
              </div>
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.6",
                  color: "#e1e1e1",
                }}
              >
                This is a sample comment. I found the blog post very informative
                and engaging.
              </p>
            </div>
            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <img
                  src="https://via.placeholder.com/40"
                  alt="User"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    marginRight: "0.5rem",
                  }}
                />
                <strong>Jane Smith</strong>
              </div>
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.6",
                  color: "#e1e1e1",
                }}
              >
                Great insights! Looking forward to more posts like this. Thanks
                for sharing!
              </p>
            </div>*/}
          </section>
        </div>

        {/* Navigation Buttons */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            justifyContent: "space-between",
            width: "80%",
            maxWidth: "1200px",
          }}
        >
          {prevBlog && (
            <a
              onClick={() => handleNavigation(prevBlog._id, prevBlog.topic)}
              title="Go to Previous Blog Post"
              style={{
                backgroundColor: "#00bfff",
                color: "#000000",
                padding: "1rem 2rem",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "1.25rem",
                fontWeight: "600",
                boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
                transition: "background-color 0.3s, transform 0.3s",
              }}
            >
              &larr; Previous
            </a>
          )}
          {nextBlog && (
            <a
              onClick={() => handleNavigation(nextBlog._id, nextBlog.topic)}
              title="Go to Next Blog Post"
              style={{
                backgroundColor: "#00bfff",
                color: "#000000",
                padding: "1rem 2rem",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "1.25rem",
                fontWeight: "600",
                boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
                transition: "background-color 0.3s, transform 0.3s",
              }}
            >
              Next &rarr;
            </a>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogDetails;
