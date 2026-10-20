import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NewLogo from "../../assets/logo-twos.png";
import { jwtDecode } from "jwt-decode";

const HeaderDemo = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1025);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    let { role } = jwtDecode(token);
    if (role) {
      localStorage.clear();
      role === "Employer" ? navigate("/employers") : navigate("/");
    }
  };

  // Handle window resize to check screen width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1025);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header>
      {/* Desktop Header */}
      {!isMobile && (
        <div className="main-header header-style-two">
          <div className="auto-container">
            <div className="main-box">
              <div
                className="nav-outer"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px",
                }}
              >
                {/* Logo */}
                <div className="logo">
                  <a href="/">
                    <img
                      src={NewLogo}
                      style={{ height: "60px" }}
                      className="logo-images"
                      alt="Logo"
                      title="Logo"
                    />
                  </a>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: "#ff4d4d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <>
          <div
            className="mobiles-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                // padding: "10px",
              }}
            >
              <a href="/">
                <img
                  src={NewLogo}
                  style={{ height: "50px" }}
                  alt="Logo"
                  title="Logo"
                />
              </a>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#333",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {menuOpen ? "❌ Close" : "☰"}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div
              className="mobile-menu"
              style={{
                background: "#f8f8f8",
                padding: "10px",
                textAlign: "center",
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#ff4d4d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Logout
              </button>
            </div>
          )}
        </>
      )}
    </header>
  );
};

export default HeaderDemo;