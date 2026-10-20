import React, { useEffect, useMemo, useState } from "react";
import {
  Steps,
  Form,
  Input,
  Button,
  Select,
  Upload,
  Modal,
  Row,
  Col,
  Space,
  message,
  Result,
  Typography,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useParams } from "react-router-dom";
import { Server } from "App";
const { Title, Paragraph } = Typography;
const { Step } = Steps;

// ===================== COMMON REDIRECT + RESULT FLOW =====================
const startRedirectCountdown = ({
  role,
  navigate,
  setCountdown,
  seconds = 7,
}) => {
  setCountdown(seconds);

  const interval = setInterval(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        clearInterval(interval);

        if (role === "Candidate") {
          navigate("/candidate-dashboard");
        } else if (role === "Employer") {
          const subscribed = localStorage.getItem("Subscribed");
          navigate(subscribed === "false" ? "/pricing" : "/employer-dashboard");
        } else if (role === "Vendor") {
          navigate("/vendor/dashboard");
        }

        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return interval;
};

const SuccessResult = ({ role, completedText, countdown, navigate }) => {
  return (
    <Result
      status="success"
      title={completedText}
      subTitle={`Thanks for registering with Skillstream. You will be redirected in ${countdown} s`}
      extra={
        <Button
          type="primary"
          onClick={() => {
            if (role === "Candidate") {
              navigate("/candidate-dashboard");
              
            } else if (role === "Employer") {
              const subscribed = localStorage.getItem("Subscribed");
              navigate(
                subscribed === "false" ? "/pricing" : "/employer-dashboard",
              );
            } else if (role === "Vendor") {
              navigate("/vendor/dashboard");
            }
          }}
        >
          Go To dashboard
        </Button>
      }
    />
  );
};
const normalizeNA = (v) => {
  if (v === null || v === undefined) return "";
  const s = String(v).trim();
  if (!s) return "";
  if (s.toLowerCase() === "n/a") return "";
  return s;
};

// ===================== SHARED MASTER DATA HOOK FOR EMPLOYER/VENDOR =====================
function useLocationMasters(Server, fixedCountry = "United States") {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [industries, setIndustries] = useState([]);

  const [form] = Form.useForm();
  const country = Form.useWatch("country", form);
  const state = Form.useWatch("state", form);

  useEffect(() => {
    axios.get(`${Server}/api/v1/data/industries`).then((res) => {
      setIndustries(res.data.industries || []);
    });

    form.setFieldsValue({ country: fixedCountry });
  }, [Server]);

  useEffect(() => {
    const c = country || fixedCountry;
    if (!c) return;

    axios.get(`${Server}/api/v1/data/states/${c}`).then((res) => {
      setStates(res.data.states || []);
    });

    form.setFieldsValue({ state: undefined, city: undefined });
    setCities([]);
  }, [country, Server]);

  useEffect(() => {
    const c = country || fixedCountry;
    if (!c || !state) return;

    axios.get(`${Server}/api/v1/data/cities/${c}/${state}`).then((res) => {
      setCities(res.data.cities || []);
    });

    form.setFieldsValue({ city: undefined });
  }, [state, country, Server]);

  const stateOptions = useMemo(
    () => states.map((s) => ({ label: s, value: s })),
    [states],
  );
  const cityOptions = useMemo(
    () => cities.map((c) => ({ label: c, value: c })),
    [cities],
  );

  const industryOptions = useMemo(() => {
    return (industries || []).map((x) => {
      if (typeof x === "string") return { label: x, value: x };
      return {
        label: x?.name || x?.label || String(x?.id || ""),
        value: x?.id || x?.name,
      };
    });
  }, [industries]);

  return { form, fixedCountry, stateOptions, cityOptions, industryOptions };
}

// ===================== CANDIDATE COMPONENT =====================
function CandidateUpdateProfile({ token, decoded }) {
  const navigate = useNavigate();
  const role = decoded?.role;
  const userId = decoded?.userId || decoded?.id;

  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [skillsMaster, setSkillsMaster] = useState([]);

  const [form] = Form.useForm();

  const [completed, setCompleted] = useState(false);
  const [completedText, setCompletedText] = useState("");
  const [countdown, setCountdown] = useState(7);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  // Watch values for gating
  const wa = Form.useWatch("workAuthorization", form);
  const fullName = Form.useWatch("fullName", form);
  const jobTitle = Form.useWatch("jobTitle", form);
  const phone = Form.useWatch("phone", form);
  const experience = Form.useWatch("experience", form);
  const country = Form.useWatch("country", form);
  const state = Form.useWatch("state", form);
  const city = Form.useWatch("city", form);
  const skills = Form.useWatch("skills", form);
  const workExperience = Form.useWatch("workExperience", form);
  const education = Form.useWatch("education", form);

  const isNonEmpty = (v) => String(v ?? "").trim().length > 0;
  // STEP 0
  const canGoStep1 = !!wa && resumeUploaded === true;

  // STEP 1 (your “step2”): all mandatory + >=3 skills
  const canGoStep2 =
    isNonEmpty(fullName) &&
    isNonEmpty(jobTitle) &&
    isNonEmpty(phone) &&
    isNonEmpty(experience) &&
    isNonEmpty(country) &&
    isNonEmpty(state) &&
    isNonEmpty(city) &&
    Array.isArray(skills) &&
    skills.length >= 3;

  // STEP 2 (your “step3”): at least one work exp with something filled
  const hasValidWorkExperience = (list) => {
    if (!Array.isArray(list) || list.length === 0) return false;
    return list.some(
      (x) =>
        isNonEmpty(x?.job_title) ||
        isNonEmpty(x?.company) ||
        isNonEmpty(x?.location) ||
        isNonEmpty(x?.duration) ||
        isNonEmpty(x?.["Start_year-End_Year"]) ||
        isNonEmpty(x?.job_summary),
    );
  };
  const canGoStep3 = hasValidWorkExperience(workExperience);

  // STEP 3 (your “step4”): any one education field filled
  const hasValidEducation = (list) => {
    if (!Array.isArray(list) || list.length === 0) return false;
    return list.some(
      (x) =>
        isNonEmpty(x?.Institution_Name) ||
        isNonEmpty(x?.Degree) ||
        isNonEmpty(x?.["Start_year-End_Year"]) ||
        isNonEmpty(x?.Percentage),
    );
  };
  const canSubmit = hasValidEducation(education);
  const clearResumeAndPrefill = () => {
    setUploadedResume(null);
    setResumeUploaded(false);
    setResumeUrl(null);
    // Clear fields that were prefilled from resume
    form.setFieldsValue({
      fullName: undefined,
      jobTitle: undefined,
      phone: undefined,
      experience: undefined,
      country: "United States",
      state: undefined,
      city: undefined,
      skills: [],
      workExperience: [],
      education: [],
    });

    // Optional: bring user back to Resume step
    setCurrent(0);
  };
  const [uploadedResume, setUploadedResume] = useState(null);
  // master data
  useEffect(() => {
    axios
      .get(`${Server}/api/v1/data/countries`)
      .then((res) => setCountries(res.data.countries || []));
    axios
      .get(`${Server}/api/v1/data/skills`)
      .then((res) => setSkillsMaster(res.data.skills || []));
  }, [Server]);

  useEffect(() => {
    if (current === 3) {
      const ed = form.getFieldValue("education");
      if (!Array.isArray(ed) || ed.length === 0) {
        form.setFieldsValue({ education: [{ Institution_Name: "" }] });
      }
    }
  }, [current]);
  const normalizeNA = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).trim();
    if (!s) return "";
    if (s.toLowerCase() === "n/a") return "";
    return s;
  };

  const isInList = (value, list) =>
    !!value && Array.isArray(list) && list.includes(value);
  useEffect(() => {
    const c = normalizeNA(country);

    // if normalized differs, update form to ""
    if (country !== c) {
      form.setFieldsValue({
        country: c || undefined,
        state: undefined,
        city: undefined,
      });
      setStates([]);
      setCities([]);
      return;
    }

    // if empty or not in master list: don't fetch
    if (!c || !isInList(c, countries)) {
      setStates([]);
      setCities([]);
      form.setFieldsValue({ state: undefined, city: undefined });
      return;
    }

    // valid country => fetch states
    axios
      .get(`${Server}/api/v1/data/states/${c}`)
      .then((res) => setStates(res.data.states || []))
      .catch(() => setStates([]));
  }, [country, countries]); // ✅ removed Server
  useEffect(() => {
    const st = normalizeNA(form.getFieldValue("state"));

    if (!st) return; // empty => nothing to validate

    // if state not in states array => wipe it and city, and do NOT fetch cities
    if (!isInList(st, states)) {
      form.setFieldsValue({ state: undefined, city: undefined });
      setCities([]);
    }
  }, [states]);

  useEffect(() => {
    const c = normalizeNA(form.getFieldValue("country"));
    const st = normalizeNA(state);

    // normalize state in form
    if (state !== st) {
      form.setFieldsValue({ state: st || undefined, city: undefined });
      setCities([]);
      return;
    }

    // country must be valid and in master list
    if (!c || !isInList(c, countries)) {
      setCities([]);
      form.setFieldsValue({ state: undefined, city: undefined });
      return;
    }

    // state must be valid and in fetched states list
    if (!st || !isInList(st, states)) {
      setCities([]);
      form.setFieldsValue({ city: undefined });
      return;
    }

    // valid => fetch cities
    axios
      .get(`${Server}/api/v1/data/cities/${c}/${st}`)
      .then((res) => setCities(res.data.cities || []))
      .catch(() => setCities([]));
  }, [state, states, countries]); // ✅ removed Server
  useEffect(() => {
    const ct = normalizeNA(form.getFieldValue("city"));
    if (!ct) return;

    if (!isInList(ct, cities)) {
      form.setFieldsValue({ city: undefined });
    }
  }, [cities]);
  useEffect(() => {
    if (!Array.isArray(skills)) return;

    if (skills.length >= 3) {
      form.setFields([{ name: "skills", errors: [] }]);
    }
  }, [skills]);

  // resume upload
  const handleResumeUpload = async ({ file }) => {
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await axios.post(
        `${Server}/api/v1/contact/email/submit/resume`,
        fd,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = res.data.data;
      // console.log(data);
      const countryVal =
        normalizeNA(data.basic_info?.Country) || "United States";
      const stateVal = normalizeNA(data.basic_info?.Province);
      const cityVal = normalizeNA(data.basic_info?.City);

      form.setFieldsValue({
        fullName: data.basic_info?.full_name || null,
        jobTitle: data.basic_info?.Job_Title || null,
        phone: data.basic_info?.phone_number || null,
        experience: data.basic_info?.Experience_in_Years || null,
        country: countryVal,
        state: stateVal,
        city: cityVal,
        skills: data.skills || [],
        workExperience: data.work_experience || [],
        education: data.Education || [],
        // resume: res.data.location,
      });
      setUploadedResume({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2), // MB
      });
      setResumeUrl(res.data.location);
      setResumeUploaded(true);
      message.success("Resume uploaded & details filled. Click Next.");
    } catch (e) {
      console.log(e);
      message.error("Resume parsing failed");
      setResumeUploaded(false);
    } finally {
      setLoading(false);
    }
  };

  const submitProfile = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.fullName || "", // ✅ schema: name
        jobTitle: values.jobTitle || "", // ✅ schema: jobTitle
        position: values.jobTitle || "", // ✅ schema: position (you store both in old code)
        phone_number: values.phone || "", // ✅ schema: phone_number
        experience: values.experience || "", // ✅ schema: experience

        country: values.country || "",
        state: values.state || "",
        city: values.city || "",

        skills: Array.isArray(values.skills) ? values.skills : [],

        work_experience: Array.isArray(values.workExperience)
          ? values.workExperience
          : [],

        Education: Array.isArray(values.education) ? values.education : [],

        workAuthorization: values.workAuthorization || "",

        // flags
        profileCompleted: true,
        isResumeUploaded: resumeUploaded === true,
      };
      if (resumeUrl) {
        payload.resume = resumeUrl;
        payload.allResumes = [
          {
            type: "Primary",
            resumeUrl: resumeUrl,
          },
        ];
      }
      await axios.post(`${Server}/api/v1/candidate/update/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem("ProfileCompleted", "True");
      setCompletedText("Your profile has been updated successfully.");
      setCompleted(true);

      startRedirectCountdown({ role, navigate, setCountdown, seconds: 7 });
    } catch (e) {
      console.log(e);

      message.error("Validation failed");
    }
  };

  if (completed) {
    return (
      <SuccessResult
        role={role}
        completedText={completedText}
        countdown={countdown}
        navigate={navigate}
      />
    );
  }
  const workAuthorizationOptions = [
    "U.S. Citizen",
    "Green Card Holder",
    "H1B",
    "L1",
    "L2",
    "TN",
    "OPT EAD",
    "CPT",
    "H4 EAD",
  ];

  return (
    <div
      className="candidate-profile-wrapper"
      style={{ maxWidth: 1000, margin: "0 auto", marginTop: 100 }}
    >
      <Title level={3} style={{ textAlign: "center" }}>
        Welcome to Skillstream AI
      </Title>

      <Paragraph style={{ textAlign: "center" }}>
        Thank you for registering with Skill Stream. Updating your profile helps
        employers learn more about your skills and the value you bring.
      </Paragraph>

      <Steps current={current} responsive>
        <Step title="Resume" />
        <Step title="Basic Info" />
        <Step title="Experience" />
        <Step title="Education" />
      </Steps>

      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        validateTrigger={["onChange", "onBlur"]}
      >
        {/*  {current === 0 && ( */}
        <div style={{ display: current === 0 ? "block" : "none" }}>
          <Form.Item
            name="workAuthorization"
            label="Work Authorization"
            rules={[
              { required: true, message: "Work authorization is required" },
            ]}
          >
            <Select
              placeholder="Select work authorization"
              options={workAuthorizationOptions.map((v) => ({
                label: v,
                value: v,
              }))}
              virtual={false}
            />
          </Form.Item>

          <Form.Item
            label="Resume"
            required
            validateStatus={!resumeUploaded && wa ? "error" : ""}
            help={!resumeUploaded && wa ? "Please upload your resume" : ""}
          >
            <Upload
              customRequest={handleResumeUpload}
              showUploadList={false}
              accept=".pdf,.doc,.docx"
            >
              <Button icon={<UploadOutlined />} loading={loading}>
                Upload Resume
              </Button>
            </Upload>

            {/* File name display */}
            {uploadedResume && (
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ color: "#555" }}>
                  <strong>Uploaded:</strong> {uploadedResume.name}{" "}
                  <span style={{ color: "#999" }}>
                    ({uploadedResume.size} MB)
                  </span>
                </div>

                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={clearResumeAndPrefill}
                  aria-label="Delete uploaded resume"
                />
              </div>
            )}
          </Form.Item>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="primary"
              disabled={!canGoStep1}
              onClick={async () => {
                try {
                  await form.validateFields(["workAuthorization"]);
                  if (!resumeUploaded) {
                    message.error("Please upload resume to continue");
                    return;
                  }
                  setCurrent(1);
                } catch {
                  // WA error shows under dropdown
                }
              }}
            >
              Next
            </Button>
          </div>
        </div>
        {/*  )} */}

        {/* {current === 1 && ( */}
        <div style={{ display: current === 1 ? "block" : "none" }}>
          {" "}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="fullName"
                label="Full Name"
                rules={[{ required: true, message: "Name is required" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="jobTitle"
                label="Designation"
                rules={[{ required: true, message: "Jobtitle is required" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[
                  { required: true, message: "Phone Number is required" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="experience"
                label="Experience (Years)"
                rules={[{ required: true, message: "Experience is required" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true, message: "Country is required" }]}
              >
                <Select
                  showSearch
                  options={countries.map((c) => ({ label: c, value: c }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: "State is required" }]}
              >
                <Select
                  showSearch
                  options={states.map((s) => ({ label: s, value: s }))}
                  disabled={!form.getFieldValue("country")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: "City is required" }]}
              >
                <Select
                  showSearch
                  options={cities.map((c) => ({ label: c, value: c }))}
                  disabled={!form.getFieldValue("state") || cities.length === 0}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="skills"
                label="Skills"
                rules={[
                  { required: true, message: "Skills are required" },
                  {
                    validator: (_, value) =>
                      Array.isArray(value) && value.length >= 3
                        ? Promise.resolve()
                        : Promise.reject(new Error("Select at least 3 skills")),
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  showSearch
                  options={skillsMaster.map((s) => ({ label: s, value: s }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/*  )} */}

        {/*  {current === 2 && ( */}
        <div style={{ display: current === 2 ? "block" : "none" }}>
          {" "}
          <Form.List name="workExperience">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <div
                    key={field.key}
                    style={{
                      border: "1px solid #eee",
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "job_title"]}
                          label="Job Title"
                          rules={[
                            {
                              required: true,
                              message: "Job title is required",
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "company"]}
                          label="Company"
                          rules={[
                            { required: true, message: "Company is required" },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "location"]}
                          label="Location"
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "duration"]}
                          label="Duration (e.g. 2023/09 – present)"
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "Start_year-End_Year"]}
                          label="Start Year - End Year"
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col xs={24}>
                        <Form.Item
                          {...field}
                          name={[field.name, "job_summary"]}
                          label="Job Summary"
                        >
                          <Input.TextArea rows={3} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(field.name)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}

                <Button
                  type="dashed"
                  onClick={() =>
                    add({
                      job_title: "",
                      company: "",
                      location: "",
                      duration: "",
                      "Start_year-End_Year": "",
                      job_summary: "",
                    })
                  }
                  icon={<PlusOutlined />}
                >
                  Add Experience
                </Button>

                <div className="d-flex justify-content-between mt-3">
                  <Button onClick={() => setCurrent(1)}>Back</Button>

                  <Button
                    type="primary"
                    disabled={!canGoStep3}
                    onClick={async () => {
                      try {
                        // validate at least one experience AND required fields inside that entry
                        const we = form.getFieldValue("workExperience") || [];
                        if (!Array.isArray(we) || we.length === 0) {
                          message.error("Add at least one work experience");
                          return;
                        }
                        // validate required fields for all entries (or just first entry, your call)
                        await form.validateFields(
                          we.flatMap((_, idx) => [
                            ["workExperience", idx, "job_title"],
                            ["workExperience", idx, "company"],
                          ]),
                        );
                        setCurrent(3);
                      } catch {
                        // field errors show under inputs
                      }
                    }}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </Form.List>
        </div>

        {/*  )} */}

        {/*   {current === 3 && ( */}
        <div style={{ display: current === 3 ? "block" : "none" }}>
          {" "}
          <Form.List name="education">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <div
                    key={field.key}
                    style={{
                      border: "1px solid #eee",
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "Institution_Name"]}
                          label="Institution"
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "Degree"]}
                          label="Degree"
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "Start_year-End_Year"]}
                          label="Duration"
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "Percentage"]}
                          label="Percentage / CGPA"
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(field.name)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}

                <Button
                  type="dashed"
                  onClick={() =>
                    add({
                      Institution_Name: "",
                      Degree: "",
                      "Start_year-End_Year": "",
                      Percentage: "",
                    })
                  }
                  icon={<PlusOutlined />}
                >
                  Add Education
                </Button>

                <div className="d-flex justify-content-between mt-3">
                  <Button onClick={() => setCurrent(2)}>Back</Button>

                  <Button
                    type="primary"
                    disabled={!canSubmit}
                    onClick={async () => {
                      const ed = form.getFieldValue("education") || [];
                      if (!Array.isArray(ed) || ed.length === 0) {
                        message.error("Add at least one education entry");
                        return;
                      }
                      // your rule: "any one education field is necessary"
                      const anyFilled = ed.some((x) =>
                        [
                          x?.Institution_Name,
                          x?.Degree,
                          x?.["Start_year-End_Year"],
                          x?.Percentage,
                        ].some((v) => String(v || "").trim().length > 0),
                      );
                      if (!anyFilled) {
                        message.error("Fill at least one field in education");
                        return;
                      }

                      // optional: validate at least institution for first entry
                      // await form.validateFields([["education", 0, "Institution_Name"]]);

                      submitProfile();
                    }}
                  >
                    Submit
                  </Button>
                </div>
              </>
            )}
          </Form.List>
        </div>

        {/*    )} */}

        {current === 1 && (
          <div className="mt-4 d-flex justify-content-between">
            <Button onClick={() => setCurrent(0)}>Back</Button>
            <Button
              type="primary"
              disabled={!canGoStep2}
              onClick={async () => {
                try {
                  await form.validateFields([
                    "fullName",
                    "jobTitle",
                    "phone",
                    "experience",
                    "country",
                    "state",
                    "city",
                    "skills",
                  ]);

                  const sk = form.getFieldValue("skills") || [];
                  if (!Array.isArray(sk) || sk.length < 3) {
                    form.setFields([
                      { name: "skills", errors: ["Select at least 3 skills"] },
                    ]);
                    return;
                  }

                  setCurrent(2);
                } catch {
                  // errors will show under inputs automatically
                }
              }}
            >
              Next
            </Button>
          </div>
        )}
      </Form>

      <Modal
        open={privacyVisible}
        onCancel={() => setPrivacyVisible(false)}
        footer={null}
      >
        <p>Data Privacy Content</p>
      </Modal>
    </div>
  );
}

function EmployerUpdateProfile({ token, decoded }) {
  const navigate = useNavigate();
  const role = decoded?.role;
  const userId = decoded?.userId || decoded?.id;

  const { form, fixedCountry, stateOptions, cityOptions, industryOptions } =
    useLocationMasters(Server, "United States");

  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completedText, setCompletedText] = useState("");
  const [countdown, setCountdown] = useState(7);

  if (completed) {
    return (
      <SuccessResult
        role={role}
        completedText={completedText}
        countdown={countdown}
        navigate={navigate}
      />
    );
  }

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const payload = {
        companyName: values.companyName,
        country: values.country,
        state: values.state,
        city: values.city,
        primaryIndustry: values.primaryIndustry,
        phone: values.phone,
        profileCompleted: true,
      };

      await axios.post(`${Server}/api/v1/employer/update/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem("ProfileCompleted", "True");
      setCompletedText("Your Details has updated successfully.");
      setCompleted(true);

      startRedirectCountdown({ role, navigate, setCountdown, seconds: 7 });
    } catch (e) {
      message.error("Failed to update employer profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" ,marginTop:"100px"}}>
      <Title level={3} style={{ textAlign: "center" }}>
        Welcome to Skillstream AI
      </Title>
      <Paragraph style={{ textAlign: "center" }}>
        Thank you for registering with Skill Stream. Updating your profile helps
        job seekers learn more about your company and the opportunities you
        offer.
      </Paragraph>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="companyName"
              label="Company Name"
              rules={[{ required: true, message: "Company name is required" }]}
            >
              <Input placeholder="Enter company name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="primaryIndustry"
              label="Industry"
              rules={[{ required: true, message: "Industry is required" }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select industry"
                options={industryOptions}
                virtual={false}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: "Phone number is required" }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="country"
              label="Country"
              initialValue={fixedCountry}
              rules={[{ required: true, message: "Country is required" }]}
            >
              <Select
                disabled
                options={[{ label: fixedCountry, value: fixedCountry }]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="state" label="State" rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select state"
                options={stateOptions}
                virtual={false}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="city" label="City" rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select city"
                options={cityOptions}
                virtual={false}
                disabled={!form.getFieldValue("state")}
              />
            </Form.Item>
          </Col>
        </Row>

        <Button type="primary" htmlType="submit" loading={loading} block>
          Submit
        </Button>
      </Form>
    </div>
  );
}

// ===================== VENDOR COMPONENT =====================
function VendorUpdateProfile({ token, decoded }) {
  const navigate = useNavigate();
  const role = decoded?.role;
  const userId = decoded?.userId || decoded?.id;

  const { form, fixedCountry, stateOptions, cityOptions } = useLocationMasters(
    Server,
    "United States",
  );

  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completedText, setCompletedText] = useState("");
  const [countdown, setCountdown] = useState(7);

  if (completed) {
    return (
      <SuccessResult
        role={role}
        completedText={completedText}
        countdown={countdown}
        navigate={navigate}
      />
    );
  }

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const fullPhone = `${values.countryCode}${values.phoneNumber}`;

      const payload = {
        name: values.companyName,
        phone: fullPhone,
        country: values.country,
        state: values.state,
        city: values.city,
        profileCompleted: true,
      };

      await axios.post(
        `${Server}/api/v1/vendor/update/${userId}`,
        payload,
        // If auth needed:
        // , { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("ProfileCompleted", "True");
      setCompletedText("Your Details has updated successfully.");
      setCompleted(true);

      startRedirectCountdown({ role, navigate, setCountdown, seconds: 7 });
    } catch (e) {
      message.error("Failed to update vendor profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" ,marginTop:"100px"}}>
      <Title level={3} style={{ textAlign: "center" }}>
        Welcome to Skillstream AI
      </Title>
      <Paragraph style={{ textAlign: "center" }}>
        Thank you for registering with Skill Stream. Updating your profile helps
        employers discover the candidates you represent and the recruitment
        services you provide.
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ countryCode: "+1", country: fixedCountry }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="companyName"
              label="Company Name"
              rules={[{ required: true, message: "Company name is required" }]}
            >
              <Input placeholder="Enter company name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Phone Number" required>
              <Input.Group compact>
                <Form.Item name="countryCode" noStyle>
                  <Select
                    style={{ width: 120 }}
                    options={[{ label: "+1 (USA)", value: "+1" }]}
                  />
                </Form.Item>

                <Form.Item
                  name="phoneNumber"
                  noStyle
                  rules={[
                    { required: true, message: "Phone number is required" },
                    {
                      pattern: /^\d{7,15}$/,
                      message: "Phone must be 7–15 digits",
                    },
                  ]}
                >
                  <Input
                    style={{ width: "calc(100% - 120px)" }}
                    placeholder="Enter phone number"
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true }]}
            >
              <Select
                disabled
                options={[{ label: fixedCountry, value: fixedCountry }]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="state" label="State" rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select state"
                options={stateOptions}
                virtual={false}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="city" label="City" rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select city"
                options={cityOptions}
                virtual={false}
              />
            </Form.Item>
          </Col>
        </Row>

        <Button type="primary" htmlType="submit" loading={loading} block>
          Submit
        </Button>
      </Form>
    </div>
  );
}

// ===================== SINGLE DEFAULT EXPORT WRAPPER =====================
export default function UpdateProfile() {
  const { token } = useParams();
  const decoded = useMemo(() => {
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }, [token]);

  const role = decoded?.role;

  if (!token || !decoded) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
      />
    );
  }

  return (
    <div style={{ padding: 16 }}>
      {role === "Candidate" && (
        <CandidateUpdateProfile token={token} decoded={decoded} />
      )}
      {role === "Employer" && (
        <EmployerUpdateProfile token={token} decoded={decoded} />
      )}
      {role === "Vendor" && (
        <VendorUpdateProfile token={token} decoded={decoded} />
      )}
    </div>
  );
}

// ===== EMPLOYER + VENDOR (AntD UI) END =====
