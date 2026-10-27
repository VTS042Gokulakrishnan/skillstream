import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Skeleton } from "antd";
import { Server } from "../../../App";
import {
  Avatar,
  PageHeading,
  PortalFooter,
  EmptyState,
} from "../../../Components/CandidateUI/PortalUI";
const years = (item) =>
  item["Start_year-End_Year"] ||
  [item.startYear, item.endYear || (item.startYear ? "Present" : "")]
    .filter(Boolean)
    .join(" – ");
export default function ProfileView() {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null),
    [error, setError] = useState(false);
  const load = async () => {
    setError(false);
    try {
      const { data } = await axios.get(
        Server + "/api/v1/candidate/" + localStorage.getItem("UserId")
      );
      setCandidate(data.Candidate?.[0] || {});
    } catch {
      setError(true);
    }
  };
  useEffect(() => {
    if (localStorage.getItem("ProfileCompleted") === "false")
      navigate("/my-profile");
    load();
    window.scrollTo(0, 0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const location = [candidate?.city, candidate?.country]
    .filter(Boolean)
    .join(", ");
  const facts = [
    ["Expected salary", candidate?.expectedSalary],
    ["Experience", candidate?.experience],
    [
      "Languages",
      Array.isArray(candidate?.language)
        ? candidate.language.join(", ")
        : candidate?.language,
    ],
    ["Email", candidate?.email],
    ["Phone", candidate?.phone_number],
    ["Location", location],
  ];
  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <PageHeading
          title="My profile"
          description="Your professional story, all in one place."
        />
        {error ? (
          <div className="ss-error">
            We couldn’t load your profile.{" "}
            <button onClick={load}>Try again</button>
          </div>
        ) : !candidate ? (
          <Skeleton active />
        ) : (
          <>
            <div className="ss-profile-hero">
              <Avatar name={candidate.name} image={candidate.image} />
              <div>
                <h2>{candidate.name || "Your profile"}</h2>
                <p>{candidate.position}</p>
                <p>
                  {location}
                  {candidate.experience
                    ? " · " + candidate.experience + " experience"
                    : ""}
                </p>
              </div>
              <Link className="ss-button" to="/my-profile">
                Edit profile
              </Link>
            </div>
            <div className="ss-grid">
              <div>
                <section className="ss-card ss-card-padding">
                  <h2>About me</h2>
                  <p style={{ whiteSpace: "pre-line", color: "#5d6f89" }}>
                    {candidate.description ||
                      "Add a professional summary to tell employers about yourself."}
                  </p>
                </section>
                <section className="ss-card ss-card-padding">
                  <h2>Work & experience</h2>
                  {candidate.work_experience?.length ? (
                    <div className="ss-timeline">
                      {candidate.work_experience.map((item, i) => (
                        <article key={item._id || i}>
                          <h3>{item.role || item.job_title}</h3>
                          <p>{item.companyName || item.company}</p>
                          <small>{years(item)}</small>
                          {typeof item.description === "string" && (
                            <p>{item.description}</p>
                          )}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="Add your experience"
                      description="Your work history will appear here."
                    />
                  )}
                </section>
                <section className="ss-card ss-card-padding">
                  <h2>Education</h2>
                  {candidate.Education?.length ? (
                    <div className="ss-timeline">
                      {candidate.Education.map((item, i) => (
                        <article key={item._id || i}>
                          <h3>{item.degree || item.Degree}</h3>
                          <p>{item.college || item.Institution_Name}</p>
                          <small>{years(item)}</small>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p>No education added yet.</p>
                  )}
                </section>
              </div>
              <aside>
                <section className="ss-card ss-card-padding">
                  <h2>More information</h2>
                  <dl className="ss-facts">
                    {facts.map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value || "Not provided"}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
                <Link className="ss-button ss-button-outline" to="/cv-manager">
                  View saved resume
                </Link>
              </aside>
            </div>
          </>
        )}
        <PortalFooter />
      </div>
    </section>
  );
}
