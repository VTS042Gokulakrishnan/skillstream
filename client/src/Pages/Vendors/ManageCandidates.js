import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Tooltip,
  Table,
  Space,
  Typography,
  Modal,
  Drawer,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Server } from "App";

const ManageCandidates = () => {
  const navigate = useNavigate();
  const [candidatesData, setCandidatesData] = useState([]);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  let userId = localStorage.getItem("UserId");

  useEffect(() => {
    getCandidates();
  }, []);

  const deleteCandidate = async (candidateId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this candidate?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          await axios.delete(
            `${Server}/api/v1/vendor/delete/${userId}/${candidateId}`
          );
          message.success("Candidate deleted successfully");
          getCandidates();
        } catch (error) {
          console.error(error);
          message.error("Error deleting candidate");
        }
      },
    });
  };

  const openEditDrawer = (record) => {
    setEditingCandidate(record);
    setDrawerVisible(true);
    form.setFieldsValue({
      ...record,
      skills: record.skills?.join(", "),
        Education: record.Education?.join(", "),
        work_experience: record.work_experience?.join(", "),
    });
  };
  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        skills: values.skills.split(",").map((s) => s.trim()),
        // Education: values.Education.split(",").map((e) => e.trim()),
        // work_experience: values.work_experience.split(",").map((w) => w.trim()),
      };
      await axios.put(
        `${Server}/api/v1/vendor/edit/${userId}/${editingCandidate._id}`,
        payload
      );
      message.success("Candidate updated successfully");
      setDrawerVisible(false);
      setEditingCandidate(null);
      getCandidates();
    } catch (err) {
      console.error(err);
      message.error("Failed to update candidate");
    }
  };
  const getCandidates = async () => {
    try {
      const { data } = await axios.get(
        `${Server}/api/v1/vendor/get/candidates/${userId}`
      );
      const candidate = data.candidates.map((candidate, idx) => ({
        key: idx + 1,
        _id: candidate._id,
        jobTitle: candidate.jobTitle,
        country: candidate.country,
        name: candidate.name,
        email: candidate.email,
        phone_number: candidate.phone_number,
        city: candidate.city,
        resume: candidate.resume,
        experience: candidate.experience,
        state: candidate.state,
        linkedin_url: candidate.linkedin_url,
        technical_expertise_in_skills: candidate.technical_expertise_in_skills,
        Experience_level: candidate.Experience_level,
        skills: candidate.skills,
        Education: candidate.Education,
        work_experience: candidate.work_experience,
      }));
      setCandidatesData(data.candidates);
    } catch (err) {
      console.log(err);
    }
  };
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
    },
    {
      title: "Experience",
      dataIndex: "experience",
      key: "experience",
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
    },

    {
      title: "State",
      dataIndex: "state",
      key: "state",
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit Candidate">
            <Button
              icon={<EditOutlined />}
              onClick={() => openEditDrawer(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Candidate">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => deleteCandidate(record._id)}
            />
          </Tooltip>
          <Tooltip title="View Resume">
            <a
              href={`https://docs.google.com/viewer?url=${encodeURIComponent(
                record.resume
              )}&embedded=true`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button icon={<EyeOutlined />} />
            </a>
          </Tooltip>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <Typography.Title level={2}>All Candidates</Typography.Title>
            <Typography.Text>Manage all Candidates</Typography.Text>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <Typography.Title level={4}>
                      Candidates Details
                    </Typography.Title>
                    <div className="chosen-outer">
                      <Button
                        type="primary"
                        onClick={() => navigate("/vendor/upload/candidates")}
                      >
                        + Upload Candidates
                      </Button>
                    </div>
                  </div>
                  <div className="widget-content">
                    <Table columns={columns} dataSource={candidatesData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Drawer
        title="Edit Candidate"
        width={500}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
        }}
        footer={
          <div style={{ textAlign: "right" }}>
            <Button
              onClick={() => setDrawerVisible(false)}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} type="primary">
              Save
            </Button>
          </div>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="phone_number" label="Phone Number">
            <Input />
          </Form.Item>
          <Form.Item name="country" label="Country">
            <Input />
          </Form.Item>
          <Form.Item name="state" label="State">
            <Input />
          </Form.Item>
          <Form.Item name="city" label="City">
            <Input />
          </Form.Item>
          <Form.Item name="jobTitle" label="Job Title">
            <Input />
          </Form.Item>
          <Form.Item name="experience" label="Experience">
            <Input />
          </Form.Item>
          {/*<Form.Item name="Experience_level" label="Experience Level">
            <Input />
          </Form.Item>
          <Form.Item
            name="technical_expertise_in_skills"
            label="Technical Expertise"
          >
            <Input />
          </Form.Item>
          <Form.Item name="linkedin_url" label="LinkedIn URL">
            <Input />
          </Form.Item>*/}
          <Form.Item name="skills" label="Skills (comma-separated)">
            <Input />
          </Form.Item>
          {/*<Form.Item name="Education" label="Education (comma-separated)">
            <Input />
          </Form.Item>
          <Form.Item
            name="work_experience"
            label="Work Experience (comma-separated)"
          >
            <Input />
          </Form.Item>*/}
        </Form>
      </Drawer>
    </div>
  );
};

export default ManageCandidates;
