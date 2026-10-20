import React, { useState, useRef, useEffect } from "react";
import image1 from "../../assets/woman-wearing-headphones-sits-desk-dark-room-working-intently-computer-displaying-video-audio-editing-software.jpg";
import image2 from "../../assets/businessman-showing-virtual-graphic-human-icon-hr-human-resources-recruitment-team-staff-management-business-concept.jpg";
import image3 from "../../assets/businessman-1765641_640.png";
import image4 from "../../assets/businesswoman-discussing-with-colleagues-digital-tablet.jpg";
import image5 from "../../assets/coworkers-brainstorming-office.jpg";
import image6 from "../../assets/executives-working-hard-with-tablet.jpg";
import { Helmet } from "react-helmet";
import { Server } from "App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const Blog = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const highlightRef = useRef(null);

  // State to keep track of the number of blogs to display
  const [visibleBlogs, setVisibleBlogs] = useState(8);
  const [blogs, setBlogs] = useState([]);
  // Sample blog data focused on AI job board features
  // let blogData = [
  //   {
  //     id: 1,
  //     title: "AI Fitment Analysis: Revolutionizing Talent Acquisition",
  //     date: "August 1, 2024",
  //     comments: 18,
  //     image: image1,
  //     description:
  //       "Discover how AI Fitment Analysis can transform your hiring process, ensuring you find the perfect fit for every role. Explore the benefits and challenges of integrating this cutting-edge technology...",
  //   },
  //   {
  //     id: 2,
  //     title: "AI Video Assessments: Enhancing Candidate Evaluation",
  //     date: "August 2, 2024",
  //     comments: 12,
  //     image: image2,
  //     description:
  //       "AI Video Assessments are reshaping the way we evaluate candidates. Learn how this innovative approach can improve the accuracy and efficiency of your recruitment process, providing deeper insights into candidate capabilities...",
  //   },
  //   {
  //     id: 3,
  //     title: "AI Resume Search: Finding the Best Talent Efficiently",
  //     date: "August 3, 2024",
  //     comments: 25,
  //     image: image3,
  //     description:
  //       "AI Resume Search is changing the game in recruitment. Dive into the technology that helps you sift through thousands of resumes to find the perfect match quickly and efficiently, saving you time and resources...",
  //   },
  //   {
  //     id: 4,
  //     title: "Integrating AI in Your Job Board: Best Practices",
  //     date: "August 4, 2024",
  //     comments: 9,
  //     image: image4,
  //     description:
  //       "Learn the best practices for integrating AI into your job board. Discover how to leverage AI technologies to enhance the user experience, improve matching accuracy, and streamline administrative tasks...",
  //   },
  //   {
  //     id: 5,
  //     title: "AI and Diversity Hiring: A New Era",
  //     date: "August 5, 2024",
  //     comments: 14,
  //     image: image5,
  //     description:
  //       "Explore how AI is revolutionizing diversity hiring. Understand the tools and techniques that promote inclusivity and help eliminate bias in recruitment processes, leading to more diverse workplaces...",
  //   },
  //   {
  //     id: 6,
  //     title: "Future Trends in AI Recruitment",
  //     date: "August 6, 2024",
  //     comments: 19,
  //     image: image6,
  //     description:
  //       "Stay ahead of the curve with future trends in AI recruitment. From predictive analytics to machine learning, discover the innovations that are set to redefine the way we hire in the coming years...",
  //   },
  //   {
  //     id: 7,
  //     title: "AI Fitment Analysis: Revolutionizing Talent Acquisition",
  //     date: "August 1, 2024",
  //     comments: 18,
  //     image: image1,
  //     description:
  //       "Discover how AI Fitment Analysis can transform your hiring process, ensuring you find the perfect fit for every role. Explore the benefits and challenges of integrating this cutting-edge technology...",
  //   },
  //   {
  //     id: 8,
  //     title: "AI Video Assessments: Enhancing Candidate Evaluation",
  //     date: "August 2, 2024",
  //     comments: 12,
  //     image: image2,
  //     description:
  //       "AI Video Assessments are reshaping the way we evaluate candidates. Learn how this innovative approach can improve the accuracy and efficiency of your recruitment process, providing deeper insights into candidate capabilities...",
  //   },
  //   {
  //     id: 9,
  //     title: "AI Resume Search: Finding the Best Talent Efficiently",
  //     date: "August 3, 2024",
  //     comments: 25,
  //     image: image3,
  //     description:
  //       "AI Resume Search is changing the game in recruitment. Dive into the technology that helps you sift through thousands of resumes to find the perfect match quickly and efficiently, saving you time and resources...",
  //   },
  //   {
  //     id: 10,
  //     title: "Integrating AI in Your Job Board: Best Practices",
  //     date: "August 4, 2024",
  //     comments: 9,
  //     image: image4,
  //     description:
  //       "Learn the best practices for integrating AI into your job board. Discover how to leverage AI technologies to enhance the user experience, improve matching accuracy, and streamline administrative tasks...",
  //   },
  //   {
  //     id: 11,
  //     title: "AI and Diversity Hiring: A New Era",
  //     date: "August 5, 2024",
  //     comments: 14,
  //     image: image5,
  //     description:
  //       "Explore how AI is revolutionizing diversity hiring. Understand the tools and techniques that promote inclusivity and help eliminate bias in recruitment processes, leading to more diverse workplaces...",
  //   },
  //   {
  //     id: 12,
  //     title: "Future Trends in AI Recruitment",
  //     date: "August 6, 2024",
  //     comments: 19,
  //     image: image6,
  //     description:
  //       "Stay ahead of the curve with future trends in AI recruitment. From predictive analytics to machine learning, discover the innovations that are set to redefine the way we hire in the coming years...",
  //   },
  //   // Add more blog entries as needed
  // ];
  useEffect(() => {
    getAllblogs();
  }, []);
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };
  const getAllblogs = async () => {
    try {
      const { data } = await axios.get(`${Server}/api/v1/data/blogs/all`);
      // console.log(data);

      const allBlogs = data?.blogs?.map((e, idx) => ({
        id: idx + 1, // Corrected the id calculation
        title: e?.topic,
        keywords: e?.keywords,
        date: e?.date,
        comments: 0,
        image: e?.image,
        description: e?.content,
        blogId: e?._id,
      }));
      // console.log(allBlogs);
      setBlogs(allBlogs);
      // blogData.push(allBlogs);
    } catch (error) {
      // console.log(error);
    }
  };
  // console.log("data", blogs);
  const handleMouseEnter = (index) => {
    setHovered(index);
  };

  const handleMouseLeave = () => {
    setHovered(null);
  };

  // Function to load more blogs
  const loadMoreBlogs = () => {
    setVisibleBlogs((prevVisible) => prevVisible + 3); // Show 3 more blogs
  };
  const hasHtmlTags = (str) => /<\/?[a-z][\s\S]*>/i.test(str);
  const removeHtml = (htmlString) => {
    if (hasHtmlTags(htmlString)) {
      const tempElement = document.createElement("div");
      tempElement.innerHTML = htmlString;
      return tempElement.textContent || tempElement.innerText || "";
    } else {
      return htmlString;
    }
  };
  return (
    <div style={blogStyles.container}>
      <Helmet>
        <meta
          name="Tech Career Insights & Hiring Tips | Skillstream Jobs Blog | US"
          content="Explore SkillStream Jobs Blog for tech career insights and hiring tips in US. Stay updated with the latest trends and expert advice to advance your career."
        />
      </Helmet>
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1 style={{fontWeight:"bold",fontFamily:"'Inter', 'system-ui'"}}>Blog</h1>
            <ul className="page-breadcrumb">
              <li>
                <a href="#">Home</a>
              </li>
              <li >Blog</li>
            </ul>
          </div>
        </div>
      </section>
      <div style={blogStyles.blogGrid}>
        {blogs.slice(0, visibleBlogs).map((blog, index) => (
          <div
            key={blog?.id}
            style={{
              ...blogStyles.newsBlock,
              ...(hovered === index ? blogStyles.newsBlockHover : {}),
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <figure>
              <img
                src={blog?.image}
                alt={`News ${blog?.id}`}
                style={blogStyles.img}
              />
            </figure>
            <div style={blogStyles.lowerContent}>
              <ul style={blogStyles.postMeta}>
                <li>
                  <a href="#" style={blogStyles.metaLink}>
                    {blog?.date}
                  </a>
                </li>
                <li>
                  <a href="#" style={blogStyles.metaLink}>
                    {blog?.comments} Comments
                  </a>
                </li>
              </ul>
              <h3>
                <a
                  onClick={() =>
                    navigate(
                      `/blog-details/${blog?.title?.split(" ").join("-")}/${
                        blog?.blogId
                      }`
                    )
                  }
                  style={blogStyles.headingLink}
                >
                  {blog.title}
                </a>
              </h3>
              <p style={blogStyles.text}>
                {truncateText(removeHtml(blog.description), 200)}{" "}
                {/* Adjust the length as needed */}
              </p>
              <a
                onClick={() =>
                  navigate(
                    `/blog-details/${blog?.title?.split(" ").join("-")}/${
                      blog?.blogId
                    }`
                  )
                }
                style={blogStyles.readMore}
              >
                Read More{" "}
                <i
                  className="fa fa-angle-right"
                  style={{ marginLeft: "0.5rem" }}
                ></i>
              </a>
            </div>
            <div
              style={{
                ...blogStyles.highlightEffect,
                opacity: hovered === index ? 0.3 : 0,
              }}
              ref={highlightRef}
            ></div>
          </div>
        ))}
      </div>
      {visibleBlogs < blogs.length && (
        <div style={blogStyles.loadMoreContainer}>
          <button style={blogStyles.loadMoreButton} onClick={loadMoreBlogs}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

const blogStyles = {
  container: {
    background: "linear-gradient(45deg, #0A0A23, #000000 40%, #1E90FF 80%)",
    color: "#fff",
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    paddingBottom: "2rem", // Add padding for spacing
  },
  section: {
    background: "linear-gradient(to right, #0044cc, #0066ff)",
    padding: "3rem 0",
    textAlign: "center",
  },
  heading: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  breadcrumb: {
    listStyle: "none",
    padding: 0,
    marginBottom: "1.5rem",
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
  },
  breadcrumbItem: {
    color: "#fff",
  },
  breadcrumbLink: {
    color: "#66ccff",
    textDecoration: "none",
    transition: "color 0.3s",
  },
  blogGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "2rem",
    padding: "2rem",
  },
  newsBlock: {
    background: "linear-gradient(to right, #333, #666)",
    border: "2px solid #0044cc",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  newsBlockHover: {
    transform: "scale(1.05)",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.7)", // Enhanced shadow on hover
  },
  img: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },
  lowerContent: {
    padding: "1.5rem",
    position: "relative",
    zIndex: 10,
  },
  postMeta: {
    display: "flex",
    gap: "1rem",
    color: "#ccc",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },
  metaLink: {
    color: "#66ccff",
    textDecoration: "none",
    transition: "color 0.3s",
  },
  headingLink: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold",
  },
  text: {
    color: "#ddd",
    marginBottom: "1.5rem",
  },
  readMore: {
    color: "#66ccff",
    fontWeight: "bold",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    transition: "color 0.3s",
  },
  highlightEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 102, 255, 0.3)",
    transition: "opacity 0.3s",
    zIndex: 0,
  },
  loadMoreContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "2rem",
  },
  loadMoreButton: {
    background: "linear-gradient(45deg, #0044cc, #66ccff)",
    color: "#fff",
    border: "none",
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background 0.3s, transform 0.3s",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", // Added shadow for button
  },
  loadMoreButtonHover: {
    background: "linear-gradient(45deg, #003399, #55aaff)", // Darker gradient on hover
    transform: "scale(1.05)", // Slightly larger on hover
  },
};

export default Blog;
