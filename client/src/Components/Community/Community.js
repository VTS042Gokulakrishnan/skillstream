import React, { useState } from "react";
import profilePic from "../../assets/images/resource/candidate-8.png"; // Sample profile picture
import postImage from "../../assets/coworkers-brainstorming-office.jpg"; // Sample post image
import { Helmet } from "react-helmet";

const Community = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [likedPosts, setLikedPosts] = useState([]);

  const categories = [
    "All",
    "General Discussions",
    "AI Trends",
    "Machine Learning",
    "Data Science",
    "Career Advice",
  ];

  const posts = [
    {
      id: 1,
      title: "Discuss the Latest Trends in AI",
      author: "Jane Doe",
      date: "August 8, 2024",
      content:
        "Let's talk about the latest trends and advancements in AI. What are your thoughts on the future of AI technology?",
      image: postImage,
      comments: 15,
      category: "AI Trends",
    },
    {
      id: 2,
      title: "Best Practices for Machine Learning Projects",
      author: "John Smith",
      date: "August 7, 2024",
      content:
        "Share your tips and best practices for managing and executing machine learning projects. What tools and methods do you use?",
      image: postImage,
      comments: 8,
      category: "Machine Learning",
    },
    // Add more posts as needed
  ];

  const filteredPosts = posts.filter(
    (post) =>
      (selectedCategory === "All" || post.category === selectedCategory) &&
      (searchTerm === "" ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleLike = (postId) => {
    setLikedPosts((prevLikedPosts) =>
      prevLikedPosts.includes(postId)
        ? prevLikedPosts.filter((id) => id !== postId)
        : [...prevLikedPosts, postId]
    );
  };

  return (
    <div
      style={{
        backgroundColor: "#1e1e1e",
        color: "#fff",
        minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif",
        padding: "0",
        margin: "0",
      }}
    >
      <Helmet>
        <meta
          name="Join the IT Community | Connect & Engage with IT Professionals | US Jobs"
          content="Join the IT community on SkillStream Jobs to connect and engage with IT professionals across US. Expand your network and discover new job opportunities."
        />
      </Helmet>
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1 style={{fontWeight:"bold",fontFamily:"'Inter', 'system-ui'"}}>Community</h1>
            <ul className="page-breadcrumb">
              <li>
                <a href="#">Home</a>
              </li>
              <li>Community</li>
            </ul>
          </div>
        </div>
      </section>
      {/* Header */}
      <header
        style={{
          backgroundColor: "#1e1e1e",
          textAlign: "center",
          padding: "2rem 0",
          borderBottom: "4px solid #1e90ff",
          boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "800",
            color: "#fff",
            margin: "0",
          }}
        >
          Community Hub
        </h1>
        <p style={{ fontSize: "1rem", color: "#ccc" }}>
          Connect, collaborate, and engage with fellow enthusiasts.
        </p>
      </header>

      {/* Search and Categories */}
      <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Search Bar */}
        <div
          style={{
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            animation: "fadeIn 1s",
          }}
        >
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: "0.75rem",
              borderRadius: "25px",
              border: "1px solid #ccc",
              fontSize: "1rem",
              backgroundColor: "#333",
              color: "#fff",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
              transition: "box-shadow 0.3s",
            }}
          />
        </div>

        {/* Categories */}
        <div
          style={{
            marginBottom: "2rem",
            textAlign: "center",
            animation: "slideIn 1s",
          }}
        >
          <h2
            style={{
              fontSize: "1.75rem",
              color: "#1e90ff",
              marginBottom: "1rem",
            }}
          >
            Explore Topics
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  backgroundColor:
                    selectedCategory === category ? "#1e90ff" : "#333",
                  color: "#fff",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "25px",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background-color 0.3s, transform 0.3s",
                  transform:
                    selectedCategory === category ? "scale(1.1)" : "scale(1)",
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Community Posts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              style={{
                background: "#2c2c2c",
                borderRadius: "12px",
                boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
                overflow: "hidden",
                padding: "1.5rem",
                position: "relative",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
            >
              {/* Post Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <img
                  src={profilePic}
                  alt="Profile"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    marginRight: "1rem",
                    border: "2px solid #1e90ff",
                  }}
                />
                <div>
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: "#1e90ff",
                      margin: "0",
                    }}
                  >
                    {post.title}
                  </h2>
                  <p style={{ color: "#aaa", margin: "0" }}>
                    {post.author} • {post.date}
                  </p>
                </div>
              </div>

              {/* Post Image */}
              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "12px",
                    marginBottom: "1.5rem",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    transition: "transform 0.3s",
                    transform: "scale(1.02)",
                  }}
                />
              )}

              {/* Post Content */}
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.6",
                  color: "#ddd",
                  marginBottom: "1.5rem",
                }}
              >
                {post.content}
              </p>

              {/* Post Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#1e90ff",
                  fontSize: "1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button
                    onClick={() => handleLike(post.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: likedPosts.includes(post.id)
                        ? "#ff4500"
                        : "#1e90ff",
                      fontSize: "1.5rem",
                      cursor: "pointer",
                      transition: "color 0.3s",
                    }}
                  >
                    👍
                  </button>
                  <span>{post.comments} Comments</span>
                </div>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#1e90ff",
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "color 0.3s",
                  }}
                >
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Post Form */}
        <div
          style={{
            marginTop: "4rem",
            background: "#2c2c2c",
            borderRadius: "12px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
            padding: "2rem",
            position: "relative",
            transition: "transform 0.3s, box-shadow 0.3s",
          }}
        >
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "#1e90ff",
              marginBottom: "1.5rem",
            }}
          >
            Create a New Post
          </h2>
          <form>
            <div style={{ marginBottom: "1.5rem" }}>
              <input
                type="text"
                placeholder="Post Title"
                style={{
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #555",
                  fontSize: "1rem",
                  backgroundColor: "#333",
                  color: "#fff",
                  transition: "box-shadow 0.3s, transform 0.3s",
                }}
              />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <textarea
                placeholder="Write your post here..."
                rows="5"
                style={{
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #555",
                  fontSize: "1rem",
                  backgroundColor: "#333",
                  color: "#fff",
                  transition: "box-shadow 0.3s, transform 0.3s",
                }}
              ></textarea>
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: "#1e90ff",
                color: "#fff",
                padding: "1rem 2rem",
                borderRadius: "8px",
                border: "none",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                transition: "background-color 0.3s, transform 0.3s",
              }}
            >
              Post
            </button>
          </form>
        </div>
      </main>

      <style>
        {`
          @media (max-width: 768px) {
            header {
              padding: 1rem;
            }
            h1 {
              font-size: 2rem;
            }
            .search-bar input {
              max-width: 100%;
            }
            .category-buttons {
              flex-direction: column;
              gap: 0.5rem;
            }
            .post {
              padding: 1rem;
            }
            .add-post-form {
              padding: 1rem;
            }
          }

          @media (max-width: 480px) {
            header {
              padding: 0.5rem;
            }
            h1 {
              font-size: 1.5rem;
            }
            .search-bar input {
              font-size: 0.875rem;
            }
            .category-buttons {
              gap: 0.25rem;
            }
            .post {
              padding: 0.75rem;
            }
            .add-post-form {
              padding: 0.75rem;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Community;
