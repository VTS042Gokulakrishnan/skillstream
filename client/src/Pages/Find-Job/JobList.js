import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Checkbox, Drawer, Empty, Input, Modal, Pagination, Select, Skeleton, Tag, message } from "antd";
import { SearchOutlined, EnvironmentOutlined, FilterOutlined, BookOutlined, BankOutlined, ClockCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import { Server } from "../../App";
import "./JobList.css";

const PAGE_SIZE = 5;
const jobTypes = ["Full Time", "Part Time", "Contract", "Freelance", "Internship", "Temporary"];
const emptySearch = { jobTitle: "", companyName: "", city: "", state: "", industry: "", skills: [] };
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } });
const jobDate = (value) => {
  const parsed = moment(value, [moment.ISO_8601, "MMMM D YYYY, h:mm:ss a", "MMM Do YYYY"], true);
  return parsed.isValid() ? parsed.valueOf() : 0;
};

export default function JobList() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("UserId");
  const role = localStorage.getItem("Role");
  const isCandidate = role === "Candidate" && !!userId;
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState({ ...emptySearch, jobTitle: location.state?.job || "", city: location.state?.City || "", state: location.state?.State || "", industry: location.state?.Industry || "" });
  const [activeSearch, setActiveSearch] = useState(null);
  const [types, setTypes] = useState([]);
  const [workModes, setWorkModes] = useState([]);
  const [experience, setExperience] = useState("");
  const [days, setDays] = useState(0);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [savedLocations, setSavedLocations] = useState([]);
  const [preferencesError, setPreferencesError] = useState("");
  const [editing, setEditing] = useState(false);
  const [draftLocations, setDraftLocations] = useState([]);
  const [prefState, setPrefState] = useState();
  const [prefCities, setPrefCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [states, setStates] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [skills, setSkills] = useState([]);
  const [drawer, setDrawer] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [bookmarks, setBookmarks] = useState({});
  const requestVersion = useRef(0);

  const loadJobs = async (query = null) => {
    const version = ++requestVersion.current;
    setLoading(true); setError("");
    try {
      const response = query
        ? await axios.post(`${Server}/api/v1/search/keyword/employer/jobs`, { country: "United States", ...query })
        : await axios.get(`${Server}/api/v1/employer/jobs/all-jobs/United-States`, { params: isCandidate ? { id: userId } : {} });
      if (version !== requestVersion.current) return;
      const rows = query ? response.data.results : response.data.getAllJobs;
      setJobs((rows || []).filter((job) => role !== "Vendor" || job.isVendor === true));
      setPage(1);
    } catch (err) {
      if (version !== requestVersion.current) return;
      setJobs([]);
      setError(err.response?.data?.message || "Unable to load jobs. Please try again.");
    } finally { if (version === requestVersion.current) setLoading(false); }
  };

  useEffect(() => {
    const initial = Object.fromEntries(Object.entries(search).filter(([, value]) => Array.isArray(value) ? value.length : String(value).trim()));
    const query = Object.keys(initial).length ? initial : null;
    setActiveSearch(query); loadJobs(query);
    if (isCandidate) axios.get(`${Server}/api/v1/candidate/preferences/locations`, auth())
      .then(({ data }) => setSavedLocations(data.preferred_locations || []))
      .catch(() => setPreferencesError("Unable to load saved locations. Please sign in again or retry."));
    const lookups = [["states/United States", "states", setStates], ["industries", "industries", setIndustries], ["skills", "skills", setSkills]];
    lookups.forEach(([path, field, setter]) => axios.get(`${Server}/api/v1/data/${path}`)
      .then(({ data }) => setter(data[field] || [])).catch(() => {}));
    return () => { requestVersion.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!prefState) { setPrefCities([]); return; }
    let cancelled = false;
    setCitiesLoading(true); setPrefCities([]);
    axios.get(`${Server}/api/v1/data/cities/United States/${encodeURIComponent(prefState)}`)
      .then(({ data }) => { if (!cancelled) setPrefCities(data.cities || []); })
      .catch(() => { if (!cancelled) message.error("Unable to load cities for this state."); })
      .finally(() => { if (!cancelled) setCitiesLoading(false); });
    return () => { cancelled = true; };
  }, [prefState]);

  const openPreferences = async () => {
    if (preferencesError) {
      try {
        const { data } = await axios.get(`${Server}/api/v1/candidate/preferences/locations`, auth());
        setSavedLocations(data.preferred_locations || []); setDraftLocations(data.preferred_locations || []); setPreferencesError("");
      } catch (_) { message.error("Please sign in again to edit your saved locations."); return; }
    } else setDraftLocations(savedLocations);
    setEditing(true);
  };
  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(`${Server}/api/v1/candidate/preferences/locations`, { preferred_locations: draftLocations }, auth());
      setSavedLocations(data.preferred_locations); setEditing(false);
      setSearch({ ...emptySearch }); setActiveSearch(null); clearLocalFilters();
      await loadJobs(null);
      message.success("Preferred locations saved. Recommendations refreshed.");
    } catch (err) { message.error(err.response?.data?.message || "Unable to save your locations."); }
    finally { setSaving(false); }
  };
  const clearLocalFilters = () => { setTypes([]); setWorkModes([]); setExperience(""); setDays(0); setPage(1); };
  const clearAll = () => { clearLocalFilters(); setSearch({ ...emptySearch }); setActiveSearch(null); loadJobs(null); };
  const submitSearch = (event) => {
    event.preventDefault();
    const query = Object.fromEntries(Object.entries(search).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
      .filter(([, value]) => Array.isArray(value) ? value.length : !!value));
    const next = Object.keys(query).length ? query : null;
    setActiveSearch(next); loadJobs(next);
  };
  const filtered = useMemo(() => {
    const result = jobs.filter((job) => {
      const years = parseFloat(job.Experience);
      const matchesYears = !experience || (Number.isFinite(years) && (experience === "5+" ? years >= 5 : experience === "0-2" ? years >= 0 && years < 3 : years >= 3 && years < 5));
      const age = Date.now() - jobDate(job.time);
      const mode = String(job.employmentType || "").toLowerCase().replace(/[- ]/g, "");
      return (!types.length || types.includes(job.JobType)) && matchesYears && (!days || (jobDate(job.time) && age >= 0 && age <= days * 86400000)) &&
        (!workModes.length || workModes.some((value) => mode === value.toLowerCase().replace(/[- ]/g, "")));
    });
    return result.sort((a, b) => sort === "title" ? String(a.JobTitle).localeCompare(String(b.JobTitle)) : sort === "oldest" ? jobDate(a.time) - jobDate(b.time) : jobDate(b.time) - jobDate(a.time));
  }, [jobs, types, workModes, experience, days, sort]);
  useEffect(() => { setPage(1); }, [types, workModes, experience, days, sort]);

  const bookmark = async (job) => {
    if (!userId) { message.info("Sign in to save jobs."); navigate("/login"); return; }
    const key = `${job.userId}/${job.jobId}`;
    setBookmarks((old) => ({ ...old, [key]: true }));
    try {
      await axios.post(`${Server}/api/v1/candidate/shortlistJob/add/${userId}`, {
        jobId: job.jobId, jobTitle: job.JobTitle, companyName: job.companyName, categories: job.Industry,
        city: job.City, country: job.Country, logo: job.image, empId: job.userId, status: job.status,
        email: job.EmailAddress, region: "United States", role,
      }, auth());
      message.success("Job saved successfully.");
    } catch (err) { message.error(err.response?.data?.message || "Unable to save this job."); }
    finally { setBookmarks((old) => ({ ...old, [key]: false })); }
  };
  const filterPanel = <div className="fj-filter-content">
    <div className="fj-filter-heading"><h2>Filters</h2><Button type="link" onClick={clearAll}>Clear all</Button></div>
    <fieldset><legend>Job type</legend><Checkbox.Group options={jobTypes} value={types} onChange={setTypes} /></fieldset>
    <fieldset><legend>Work mode</legend><Checkbox.Group options={["Remote", "Hybrid", "On-site"]} value={workModes} onChange={setWorkModes} /></fieldset>
    <fieldset><legend>Experience level</legend><Select aria-label="Experience level" value={experience} onChange={setExperience} options={[
      { value: "", label: "Any experience" }, { value: "0-2", label: "0–2 years" }, { value: "3-4", label: "3–4 years" }, { value: "5+", label: "5+ years" },
    ]} /></fieldset>
    <fieldset><legend>Date posted</legend><Select aria-label="Date posted" value={days} onChange={setDays} options={[
      { value: 0, label: "Any time" }, { value: 1, label: "Last 24 hours" }, { value: 7, label: "Last 7 days" }, { value: 30, label: "Last 30 days" },
    ]} /></fieldset>
  </div>;

  return <main className="find-jobs-page">
    <div className="fj-container">
      <div className="fj-intro"><h1>Find your next opportunity</h1><p>Explore roles that match your skills and preferred locations.</p></div>
      <form className="fj-search" onSubmit={submitSearch}>
        <div className="fj-search-main">
          <Input aria-label="Job title or keywords" prefix={<SearchOutlined />} placeholder="Job title or keywords" value={search.jobTitle} onChange={(e) => setSearch({ ...search, jobTitle: e.target.value })} />
          <Input aria-label="Search city" prefix={<EnvironmentOutlined />} placeholder="City" value={search.city} onChange={(e) => setSearch({ ...search, city: e.target.value })} />
          <Button type="primary" htmlType="submit" size="large" loading={loading}>Search jobs</Button>
        </div>
        <Button type="link" onClick={() => setAdvanced(!advanced)} aria-expanded={advanced}>{advanced ? "Hide advanced search" : "Advanced search"}</Button>
        {advanced && <div className="fj-search-advanced">
          <Input aria-label="Company name" placeholder="Company name" value={search.companyName} onChange={(e) => setSearch({ ...search, companyName: e.target.value })} />
          <Select aria-label="Search state" showSearch allowClear placeholder="State" value={search.state || undefined} onChange={(value) => setSearch({ ...search, state: value || "" })} options={states.map((value) => ({ value, label: value }))} />
          <Select aria-label="Industry" showSearch allowClear placeholder="Industry" value={search.industry || undefined} onChange={(value) => setSearch({ ...search, industry: value || "" })} options={industries.map((value) => ({ value, label: value }))} />
          <Select aria-label="Skills" mode="multiple" showSearch allowClear placeholder="Skills" value={search.skills} onChange={(value) => setSearch({ ...search, skills: value })} options={skills.map((value) => ({ value, label: value }))} maxTagCount="responsive" />
        </div>}
      </form>
      {isCandidate && <section className="fj-preferences" aria-label="Preferred locations">
        <EnvironmentOutlined className="fj-pin" />
        <div className="fj-preferences-body"><div className="fj-preferences-row"><strong>Your preferred locations</strong>
          <div className="fj-location-chips">{savedLocations.length ? savedLocations.map((city) => <Tag key={city}>{city}</Tag>) : <span>No locations selected</span>}</div></div>
          <p>{activeSearch ? "Search filters are temporary. Your saved preferences remain unchanged." : "Saved preferences personalize your recommendations."}</p>
          {preferencesError && <p role="alert">{preferencesError}</p>}
        </div>
        <Button onClick={openPreferences}>Change locations</Button>
      </section>}
      <div className="fj-layout">
        <aside className="fj-sidebar">{filterPanel}</aside>
        <section className="fj-results" aria-label="Job results" aria-busy={loading}>
          <div className="fj-results-toolbar"><strong aria-live="polite">{loading ? "Finding jobs…" : `${filtered.length} jobs found`}</strong>
            <div className="fj-toolbar-controls"><Button className="fj-mobile-filters" icon={<FilterOutlined />} onClick={() => setDrawer(true)}>Filters</Button>
              <label>Sort by: <Select aria-label="Sort jobs" value={sort} onChange={setSort} options={[{ value: "newest", label: "Newest" }, { value: "oldest", label: "Oldest" }, { value: "title", label: "Job title" }]} /></label>
            </div>
          </div>
          {error && <Alert type="error" showIcon message={error} action={<Button onClick={() => loadJobs(activeSearch)}>Retry</Button>} />}
          {loading ? <div className="fj-card"><Skeleton active paragraph={{ rows: 5 }} /></div> : !error && !filtered.length ? <div className="fj-empty"><Empty description="No jobs match your current preferences or filters." />
            <div><Button onClick={clearAll}>Clear filters</Button>{isCandidate && <Button type="primary" onClick={openPreferences}>Change locations</Button>}</div></div> :
            filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((job) => <article className="fj-card" key={`${job.userId}/${job.jobId}`}>
              <div className="fj-company-icon">{job.image ? <img src={job.image} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <BankOutlined />}</div>
              <div className="fj-job-body"><h2><button onClick={() => navigate(`/job-detail/${job.userId}/${job.jobId}`)}>{job.JobTitle}</button></h2>
                <p className="fj-company-name">{job.companyName}</p>
                <p className="fj-job-location"><EnvironmentOutlined /> {[job.City, job.State, job.Country].filter(Boolean).join(", ")}{job.employmentType ? ` · ${job.employmentType}` : ""}</p>
                <div className="fj-job-tags">{job.JobType && <Tag color="blue">{job.JobType}</Tag>}{job.Experience && <Tag>{job.Experience} years</Tag>}{job.Industry && <Tag>{job.Industry}</Tag>}</div>
              </div>
              <div className="fj-job-actions"><Button type="text" icon={<BookOutlined />} aria-label={`Save ${job.JobTitle}`} loading={bookmarks[`${job.userId}/${job.jobId}`]} onClick={() => bookmark(job)} />
                {job.offeredSalary && <strong>{job.offeredSalary}</strong>}
                <span className="fj-posted"><ClockCircleOutlined /> {jobDate(job.time) ? moment(jobDate(job.time)).fromNow() : "Recently posted"}</span>
                <Button onClick={() => navigate(`/job-detail/${job.userId}/${job.jobId}`)}>View details</Button>
              </div>
            </article>)}
          {!loading && !error && filtered.length > PAGE_SIZE && <Pagination current={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} showSizeChanger={false} />}
        </section>
      </div>
    </div>
    <Drawer title="Filter jobs" open={drawer} onClose={() => setDrawer(false)} placement="left">{drawer && filterPanel}</Drawer>
    <Modal title="Your preferred locations" open={editing} onCancel={() => !saving && setEditing(false)} onOk={savePreferences} okText="Save preferences" confirmLoading={saving} cancelButtonProps={{ disabled: saving }} closable={!saving} maskClosable={!saving}>
      <p>Choose up to 20 cities across states. These preferences are saved to your profile. Clear all cities to remove the location restriction.</p>
      <label className="fj-field-label">State<Select showSearch allowClear placeholder="Choose a state to find cities" value={prefState} onChange={setPrefState} options={states.map((value) => ({ value, label: value }))} /></label>
      <label className="fj-field-label">Preferred cities<Select mode="multiple" showSearch allowClear placeholder="Select cities" value={draftLocations} onChange={setDraftLocations} loading={citiesLoading} options={[...new Set([...draftLocations, ...prefCities])].map((value) => ({ value, label: value }))} /></label>
      <p className="fj-preference-note">Saving will refresh recommendations and clear temporary search filters.</p>
    </Modal>
  </main>;
}
