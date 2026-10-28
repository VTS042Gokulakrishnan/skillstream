import { Input } from "antd";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Skeleton,
  Select,
  Dropdown,
  Menu,
  Button,
  Table,
  Space,
  Typography,
  Tag,
  Empty,
  Tooltip,
  Spin,
  Upload,
  Modal,
  message,
} from "antd";
import { Server } from "../../../App";
import { Link, useNavigate, useLocation } from "react-router-dom";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
  SearchOutlined,
  DownOutlined,
  InboxOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Tabs } from "antd";

const { Dragger } = Upload;
const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobSearch, setJobSearch] = useState("");
  const [activeJobs, setActiveJobs] = useState([]);
  const [inactiveJobs, setInactiveJobs] = useState([]);
  const [holdJobs, setHoldJobs] = useState([]);
  const [closedJobs, setClosedJobs] = useState([]);
  const [otherActiveJobs, setOtherActiveJobs] = useState([]);
  const [otherInactiveJobs, setOtherInactiveJobs] = useState([]);
  const [otherHoldJobs, setOtherHoldJobs] = useState([]);
  const [otherClosedJobs, setOtherClosedJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loader, setLoader] = useState(false);
  const [adminLoader, setAdminLoader] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState({});
  const [loadingJobs, setLoadingJobs] = useState({});
  let userId = localStorage.getItem("UserId");
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState({});
  const [resume, setResume] = useState("");
  const [resumeData, setResumeData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isShowButton, setIsShowButton] = useState(false);
  const [userToDelete, setuserToDelete] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [resumeList, setResumeList] = useState([]);
  const [otherUserJobs, setOtherUserJobs] = useState([]);
  const [roleAccess, setRoleAccess] = useState("");
  const [selectedTab, setSelectedTab] = useState(false);
  const [otherUserEmails, setOtherUserEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const location = useLocation();
  const hasInitialized = useRef(false);
  let token = localStorage.getItem("token");
  let { organisationId } = jwtDecode(token);
  const [activeTabKey, setActiveTabKey] = useState("my-jobs");
  const emailFromState = location?.state?.email || null; // ✅ safe access
  // console.log("email:", emailFromState);
  // console.log("state", location?.state);

  useEffect(() => {
    if (!hasInitialized.current && emailFromState) {
      // console.log(emailFromState);
      setSelectedEmail(emailFromState);
      setSelectedTab(true);
      setActiveTabKey("other-jobs"); // ✅ switch tab
      navigate(location.pathname, { replace: true });
      hasInitialized.current = true;
    }
  }, [emailFromState]);
  const showUploadModal = (jobId) => {
    setSelectedJob(jobId);
    setIsUploadModalVisible(true);
  };
  const props = {
    name: "file",
    multiple: true,
    action: `${Server}/api/v1/contact/email/submit/resume`,

    // Restrict file types before upload
    beforeUpload(file) {
      const isAllowed =
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (!isAllowed) {
        message.error("You can only upload PDF or DOCX files!");
      }
      return isAllowed || Upload.LIST_IGNORE; // prevent upload if invalid
    },
    onChange(info) {
      const { status, name } = info.file;
      const currentFiles = info.fileList;

      if (currentFiles.length === 0) {
        setIsShowButton(false);
        setResumeList([]);
        return;
      }

      if (status === "done") {
        // Create a list from current uploaded file names
        const uploadedFileNames = currentFiles.map((f) => f.name);

        // Map current fileList to resumeList with parsed data
        const updatedResumeList = currentFiles.map((file) => {
          const existing = resumeList.find(
            (r) => r.resume === file?.response?.location
          );
          return {
            resume: file?.response?.location,
            resumeData: file?.response?.data,
            workAuthorization: existing?.workAuthorization || null,
          };
        });

        setResumeList(updatedResumeList);
        setIsShowButton(true);
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "removed") {
        // Remove from resumeList based on file name or location
        const filteredList = resumeList.filter((item) =>
          currentFiles.find((f) => f.response?.location === item.resume)
        );
        setResumeList(filteredList);
        setIsShowButton(filteredList.length > 0);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
        setIsShowButton(false);
      }
    },
    // onChange(info) {
    //   const { status } = info.file;
    //   if (info.fileList.length === 0) {
    //     setIsShowButton(false);
    //   }
    //   if (status !== "uploading") {
    //     // console.log(info.file, info.fileList);
    //   }
    //   if (status === "done") {
    //     // console.log(info?.fileList[0]?.response?.data);
    //     const uploadedResumes = info.fileList.map((file) => ({
    //       resume: file?.response?.location,
    //       resumeData: file?.response?.data,
    //       workAuthorization: null,
    //     }));
    //     setResumeList(uploadedResumes);
    //     setResume(info?.fileList[0]?.response?.location);
    //     setResumeData(info?.fileList[0]?.response?.data);
    //     setIsShowButton(true);
    //     message.success(`${info.file.name} file uploaded successfully.`);
    //   } else if (status === "error") {
    //     message.error(`${info.file.name} file upload failed.`);
    //     setIsShowButton(false);
    //   }
    // },
    onDrop(e) {
      // console.log("Dropped files", e.dataTransfer.files);
      setIsShowButton(false);
    },
  };
  const handleUpload = async () => {
    setLoading(true);
    try {
      // let basicDetails = {
      //   name: resumeData?.basic_info?.full_name,
      //   email: resumeData?.basic_info?.email,
      //   phoneNumber: resumeData?.basic_info?.phone_number,
      //   country: resumeData?.basic_info?.Country,
      //   city: resumeData?.basic_info?.City,
      //   state: resumeData?.basic_info?.Province,
      //   jobTitle: resumeData?.basic_info?.Job_Title,
      //   experience: resumeData?.basic_info?.Experience_in_Years,
      //   resume,
      //   skills: resumeData?.skills,
      //   Education: resumeData?.Education,
      //   work_experience: resumeData?.work_experience,
      //   Experience_level: resumeData?.basic_info?.Experience_level,
      //   linkedin_url: resumeData?.basic_info?.linkedin_url,
      //   technical_expertise_in_skills:
      //     resumeData?.basic_info?.technical_expertise_in_skills,
      //   employerId: selectedJob.userId,
      //   jobId: selectedJob.jobId,
      // };
      // // console.log(basicDetails);

      // const { data } = await axios.post(
      //   `${Server}/api/v1/employer/jobs/add/user/${selectedJob.userId}/${selectedJob.jobId}`,
      //   basicDetails
      // );
      for (const file of resumeList) {
        const basicDetails = {
          name: file.resumeData?.basic_info?.full_name,
          email: file.resumeData?.basic_info?.email,
          phoneNumber: file.resumeData?.basic_info?.phone_number,
          country: file.resumeData?.basic_info?.Country,
          city: file.resumeData?.basic_info?.City,
          state: file.resumeData?.basic_info?.Province,
          jobTitle: file.resumeData?.basic_info?.Job_Title,
          experience: file.resumeData?.basic_info?.Experience_in_Years,
          resume: file.resume,
          skills: file.resumeData?.skills,
          Education: file.resumeData?.Education,
          work_experience: file.resumeData?.work_experience,
          Experience_level: file.resumeData?.basic_info?.Experience_level,
          linkedin_url: file.resumeData?.basic_info?.linkedin_url,
          technical_expertise_in_skills:
            file.resumeData?.basic_info?.technical_expertise_in_skills,
          employerId: selectedJob.userId,
          jobId: selectedJob.jobId,
          workAuthorization: file.workAuthorization,
        };
        console.log(file);

        await axios.post(
          `${Server}/api/v1/employer/jobs/add/user/${selectedJob.userId}/${selectedJob.jobId}`,
          basicDetails,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      setLoading(false);
      toast.success("Resume uploladed Successfully");
      setIsUploadModalVisible(false);
      setIsShowButton(false);
    } catch (error) {
      // console.log(error);
      if (error?.response) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error("Something Went Wrong");
      }
      setLoading(false);
    }
  };
  const onChange = (key) => {
    // console.log(key);
  };
  const handleDropdownVisibleChange = (visible, jobId) => {
    setDropdownVisible((prev) => ({ ...prev, [jobId]: visible }));
  };
  const keyItems = [
    {
      key: "1",
      label: "Active",
      children: "Content of Tab Pane 1",
    },
    {
      key: "2",
      label: "Inactive",
      children: "Content of Tab Pane 2",
    },
    {
      key: "3",
      label: "Hold",
      children: "Content of Tab Pane 3",
    },
    {
      key: "4",
      label: "Closed",
      children: "Content of Tab Pane 4",
    },
  ];
  const getJobs = async () => {
    try {
      setLoader(true);
      const { access, organisationId } = jwtDecode(token);
      const { data } = await axios.get(
        `${Server}/api/v1/employer/jobs/get/${userId}/${access}`
      );
      const sortJobs = data.jobs?.sort(
        (a, b) => new Date(b.time) - new Date(a.time)
      );
      const region = "United States";
      const filterRegion = sortJobs.filter((job) => region === job.Country);
      // console.log(filterRegion);
      // console.log(sortJobs);

      setJobs(sortJobs);
      setLoader(false);

      // console.log(data);
      if (access === "Admin") {
        setAdminLoader(true);
        const responseData = await axios.get(
          `${Server}/api/v1/employer/jobs/get/${userId}/${access}/${organisationId}`
        );
        const sortOtherUserJobs = responseData.data.otherUsersJobs?.sort(
          (a, b) => new Date(b.time) - new Date(a.time)
        );
        setOtherUserJobs(sortOtherUserJobs);
        // const uniqueEmails = [
        //   ...new Set(
        //     sortOtherUserJobs.map((job) => job.EmailAddress.toLowerCase())
        //   ),
        // ];
        const response = await axios.get(
          `${Server}/api/v1/superAdmin/get/users/${organisationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { email } = jwtDecode(token);
        setAdminLoader(false);

        setOtherUserEmails(
          response.data.users.filter((user) => user.email !== email)
        ); // useState variable
      }
      // console.log(data.jobs);
    } catch (error) {
      console.error(error);
      setLoader(false);
      setAdminLoader(false);
    }
  };
  // console.log(otherUserEmails);

  useEffect(() => {
    const decoded = jwtDecode(token);
    setRoleAccess(decoded?.access);
    getJobs();
    // console.log("otherusers", otherUserJobs);
  }, []);
  useEffect(() => {
    const filterJobs = () => {
      const active = jobs.filter((job) => job.status === "Active");
      const inactive = jobs.filter((job) => job.status === "Inactive");
      const hold = jobs.filter((job) => job.status === "Hold");
      const closed = jobs.filter((job) => job.status === "Closed");

      setActiveJobs(active);
      setInactiveJobs(inactive);
      setHoldJobs(hold);
      setClosedJobs(closed);
    };

    filterJobs();
  }, [jobs]);
  useEffect(() => {
    const filterJobs = () => {
      const active = otherUserJobs.filter((job) => job.status === "Active");
      const inactive = otherUserJobs.filter((job) => job.status === "Inactive");
      const hold = otherUserJobs.filter((job) => job.status === "Hold");
      const closed = otherUserJobs.filter((job) => job.status === "Closed");

      setOtherActiveJobs(active);
      setOtherInactiveJobs(inactive);
      setOtherHoldJobs(hold);
      setOtherClosedJobs(closed);
    };

    filterJobs();
  }, [otherUserJobs]);
  let profileCompleted = localStorage.getItem("ProfileCompleted");
  let role = localStorage.getItem("Role");

  useEffect(() => {
    if (profileCompleted === "false") {
      if (role === "Candidate") {
        navigate("/my-profile");
      } else {
        navigate("/company-profile");
      }
    }
  }, [profileCompleted, role, navigate]);

  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);

  const deleteShortlisted = async (Id) => {
    try {
      await axios.delete(
        `${Server}/api/v1/employer/jobs/delete/${userId}/${Id}`
      );
      toast.success("Deleted Successfully");
      setJobs((prevData) => prevData.filter((item) => item.jobId !== Id));
    } catch (error) {
      console.error(error);
    }
  };

  const statusChange = async (
    status,
    jobId,
    jobTitle,
    email,
    selectedUserId
  ) => {
    setLoadingJobs((prev) => ({ ...prev, [jobId]: true }));
    setLoader(true);

    try {
      const statusValues = { status, jobTitle, email, region: "United States" };
      await axios.post(
        `${Server}/api/v1/employer/jobs/status/${selectedUserId}/${jobId}`,
        statusValues,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Job Status Changed Successfully!");
      setDropdownVisible((prev) => ({ ...prev, [jobId]: false }));
      setLoader(false);
      getJobs();
      setLoadingJobs((prev) => ({ ...prev, [jobId]: false }));
    } catch (error) {
      console.error(error);
      setLoader(false);
    }
  };

  const items = [
    { label: "Active", key: "0" },
    { label: "Inactive", key: "1" },
    { label: "Closed", key: "2" },
    { label: "Hold", key: "3" },
  ];
  const showModal = (jobId, userId) => {
    setJobToDelete(jobId);
    setIsModalVisible(true);
    setuserToDelete(userId);
  };

  const handleOk = async () => {
    try {
      const { data } = await axios.delete(
        `${Server}/api/v1/employer/jobs/delete/${userToDelete}/${jobToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(data);
      toast.success("Deleted Successfully");
      setJobs((prevData) =>
        prevData.filter((item) => item.jobId !== jobToDelete)
      );
      setIsModalVisible(false);
      setJobToDelete(null);
      setuserToDelete(null);
    } catch (error) {
      // console.log(error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const renderMenuItems = (record) => {
    return items.map((item) => {
      const disabled = item.label === "Active" && record.status === "Active"; // Disable if status is Active
      return (
        <Menu.Item
          key={item.key}
          onClick={() => statusChange(item.label, record.jobId)}
          disabled={loadingJobs[record.jobId] || disabled} // Disable if loading or status is Active
        >
          {loadingJobs[record.jobId] && (
            <LoadingOutlined style={{ marginRight: 8 }} />
          )}{" "}
          {/* Loader */}
          {item.label}
        </Menu.Item>
      );
    });
  };
  const userColumn = {
    title: "User",
    key: "user",
    dataIndex: "EmailAddress",
    render: (email) => {
      if (!email) return null;
      return (
        <Tooltip title={email}>
          <div
            style={{
              backgroundColor: "#1890ff",
              color: "#fff",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {email.charAt(0)}
          </div>
        </Tooltip>
      );
    },
  };
  const columns = [
    {
      title: "Title",
      dataIndex: "JobTitle",
      key: "title",
      render: (text, record) => (
        <Space direction="vertical">
          <Typography.Title level={5}>
            {text} {console.log(record)}
            <Tag color="geekblue" style={{ marginLeft: 8 }}>
              {record?.newId ? record?.newJobId : record?.jobId}
            </Tag>
          </Typography.Title>
          <Typography.Text type="secondary">
            <i className="icon flaticon-map-locator"></i> {record.City},{" "}
            {record.State}, - {record.Country}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Applications",
      dataIndex: "applicants",
      key: "applications",
      render: (text, record) => {
        const userId = localStorage.getItem("UserId");
        const pendingCount =
          record.applicants?.filter(
            (app) =>
              app.applicationStatus === "pending" && !app?.isVendorApplicant
          ).length || 0;
        const vendorpendingCount =
          record.applicants?.filter(
            (app) =>
              app.applicationStatus === "pending" &&
              app?.isVendorApplicant === true
          ).length || 0;
        return record.userId === userId ? (
          <Space direction="vertical">
            {" "}
            <Link
              to="/applicants"
              state={{
                jobTitle: record.JobTitle,
                jobId: record.jobId,
                tab: "myJobs",
                empId: record.userId,
                isVendor: false,
              }}
            >
              <Tooltip title="Applicants">
                <Tag color="blue">{pendingCount} Applied</Tag>
              </Tooltip>
            </Link>
            {record.isVendor && (
              <Link
                to="/applicants"
                state={{
                  jobTitle: record.JobTitle,
                  jobId: record.jobId,
                  tab: "myJobs",
                  empId: record.userId,
                  isVendor: true,
                }}
              >
                {" "}
                <Tooltip title="Vendor Applicants">
                  <Tag color="yellow">{vendorpendingCount} Applied</Tag>
                </Tooltip>
              </Link>
            )}
          </Space>
        ) : (
          <Space direction="vertical">
            {" "}
            <Link
              to="/applicants"
              state={{
                jobTitle: record.JobTitle,
                jobId: record.jobId,
                tab: "otherJobs",
                empId: record.userId,
                isVendor: false,
              }}
            >
              {" "}
              <Tooltip title="Applicants">
                {" "}
                <Tag color="blue">{pendingCount} Applied</Tag>
              </Tooltip>
            </Link>
            {record.isVendor && (
              <Link
                to="/applicants"
                state={{
                  jobTitle: record.JobTitle,
                  jobId: record.jobId,
                  tab: "otherJobs",
                  empId: record.userId,
                  isVendor: true,
                }}
              >
                {" "}
                <Tooltip title="Vendor Applicants">
                  {" "}
                  <Tag color="yellow">{vendorpendingCount} Applied</Tag>
                </Tooltip>
              </Link>
            )}
          </Space>
        );
      },
    },
    {
      title: "Created & Expired",
      dataIndex: "postedTime",
      key: "createdExpired",
      render: (text, record) => (
        <Space direction="vertical">
          {/*console.log(record?.ApplicationDeadlineDate)*/}
          <Typography.Text>{record?.postedTime}</Typography.Text>
          <Typography.Text>
            {moment(record?.ApplicationDeadlineDate, "YYYY-MM-DD").format(
              "MMMM Do YYYY"
            )}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <Tag
          color={
            text === "Active"
              ? "green"
              : text === "Inactive"
              ? "volcano"
              : text === "Closed"
              ? "red"
              : "gold"
          }
        >
          {text}
        </Tag>
      ),
    },
    // {
    //   title: "User",
    //   key: "user",
    //   dataIndex: "EmailAddress",
    //   render: (email) => {
    //     if (!email) return null;
    //     return (
    //       <Tooltip title={email}>
    //         <div
    //           style={{
    //             backgroundColor: "#1890ff",
    //             color: "#fff",
    //             borderRadius: "50%",
    //             width: 32,
    //             height: 32,
    //             display: "flex",
    //             alignItems: "center",
    //             justifyContent: "center",
    //             fontWeight: "bold",
    //             textTransform: "uppercase",
    //           }}
    //         >
    //           {email.charAt(0)}
    //         </div>
    //       </Tooltip>
    //     );
    //   },
    // },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space direction="vertical">
          <Space size="middle">
            {/* Tooltip for the Eye Icon */}
            <Tooltip title="View" placement="top">
              <Button
                icon={<EyeOutlined />}
                onClick={() =>
                  navigate(`/job-detail/${record.userId}/${record.jobId}`)
                }
              />
            </Tooltip>

            {/* Dropdown with Tooltip */}
            <Tooltip title="Options">
              <Dropdown
                overlay={
                  <Menu>
                    {items.map((item) => (
                      <Menu.Item
                        key={item.key}
                        onClick={() =>
                          statusChange(
                            item.label,
                            record.jobId,
                            record.JobTitle,
                            record.EmailAddress,
                            record.userId
                          )
                        }
                      >
                        {item.label}
                      </Menu.Item>
                    ))}
                  </Menu>
                }
                trigger={["click"]}
                visible={dropdownVisible[record.jobId]} // Control visibility based on state
                onVisibleChange={(visible) =>
                  handleDropdownVisibleChange(visible, record.jobId)
                } // Update visibility state
              >
                <Button icon={<DownOutlined />} />
              </Dropdown>
            </Tooltip>

            {/* Tooltip for the Delete Icon */}
            <Tooltip title="Delete">
              <Button
                icon={<DeleteOutlined />}
                onClick={() => showModal(record.jobId, record.userId)}
              />
            </Tooltip>

            {/* Tooltip for the Edit Icon */}
            <Tooltip title="Edit">
              <Button
                icon={<EditOutlined />}
                onClick={() =>
                  navigate(`/edit-post/${record.userId}/${record.jobId}`)
                }
              />
            </Tooltip>
            <Tooltip title="Upload Resume">
              <Button
                icon={<UploadOutlined />}
                onClick={() => showUploadModal(record)}
              />
            </Tooltip>
          </Space>
        </Space>
      ),
    },
    {
      title: "",
      key: "resumeAI",
      render: (text, record) =>
        record.status === "Active" ? ( // Condition to check if status is "Active"
          <Tooltip title="Resume Search with AI" placement="top">
            <div
              className="loader"
              onClick={() =>
                navigate("/aiSearch", { state: { jobdetails: record } })
              }
            >
              <span className="loader__inner"></span>
              <span className="loader__inner"></span>
              <span className="loader__text">
                <SearchOutlined />
              </span>
            </div>
          </Tooltip>
        ) : null,
    },
  ];
  const otherUserJobColumns = [
    ...columns.slice(0, 4),
    userColumn,
    ...columns.slice(4),
  ];
  const renderJobsTable = (jobList, columnstouse, loading) => {
    // if (jobList.length === 0) {
    //   return <Empty description="No Jobs Available" />;
    // }

    return (
      <div className="table-outer">
        <Table
          columns={columnstouse}
          className="manage-tables"
          dataSource={jobList.filter(job => [job.JobTitle, job.City, job.Industry, job.EmailAddress].filter(Boolean).join(" ").toLowerCase().includes(jobSearch.toLowerCase()))}
          rowSelection={rowSelection}
          rowKey={(record) => record.jobId}
          pagination={true}
          loading={loading}
          locale={{
            emptyText: <Empty description="No Jobs Available" />,
          }}
        />
      </div>
    );
  };
  const onSelectChange = (newSelectedRowKeys) => {
    // console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const handleBulkStatusChange = async (newStatus) => {
    try {
      setLoader(true);
      const allJobs = [...jobs, ...otherUserJobs];
      await Promise.all(
        selectedRowKeys.map(async (jobId) => {
          const job = allJobs.find((j) => j.jobId === jobId);
          if (!job) return;
          await axios.post(
            `${Server}/api/v1/employer/jobs/status/${job.userId}/${job.jobId}`,
            {
              status: newStatus,
              email: job.EmailAddress,
              jobTitle: job.JobTitle,
              region: "United States", // or use actual job.region if available
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        })
      );
      setLoader(false);

      toast.success(`Status changed to ${newStatus} for selected jobs.`);
      getJobs(); // refresh job list
      setSelectedRowKeys([]);
    } catch (error) {
      toast.error("Error changing status for selected jobs.");
      console.error(error);
      setLoader(false);
    }
  };
  const handleBulkDelete = async () => {
    try {
      setLoader(true);
      const allJobs = [...jobs, ...otherUserJobs];
      await Promise.all(
        selectedRowKeys.map(async (jobId) => {
          const job = allJobs.find((j) => j.jobId === jobId);
          if (!job) return;
          await axios.delete(
            `${Server}/api/v1/employer/jobs/delete/${job.userId}/${job.jobId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        })
      );
      setLoader(false);

      toast.success("Selected jobs deleted successfully.");
      setJobs((prev) =>
        prev.filter((job) => !selectedRowKeys.includes(job.jobId))
      );
      setOtherUserJobs((prev) =>
        prev.filter((j) => !selectedRowKeys.includes(j.jobId))
      );
      setSelectedRowKeys([]);
    } catch (err) {
      toast.error("Error deleting selected jobs.");
      console.error(err);
      setLoader(false);
    }
  };
  // console.log(selectedTab);

  return (
    <div>
      <section className="user-dashboard">
        <Toaster position="top-center" reverseOrder={false} />
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <Typography.Title level={2}>Manage Jobs</Typography.Title>
            <Typography.Text>Ready to jump back in?</Typography.Text>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <Typography.Title level={4}>
                      My Job Listings
                    </Typography.Title>
                    <div className="chosen-outer">
                      {selectedTab && otherUserEmails.length > 0 && (
                        <select
                          className="chosen-select"
                          value={selectedEmail}
                          onChange={(e) => {
                            setSelectedEmail(e.target.value);
                          }}
                        >
                          <option value="">All</option>
                          {otherUserEmails.map((email) => (
                            <option key={email.email} value={email.email}>
                              {email.email}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="widget-content">
                    <Input.Search aria-label="Search jobs" placeholder="Search job title, location, industry or owner" value={jobSearch} onChange={e => setJobSearch(e.target.value)} allowClear style={{maxWidth:600,marginBottom:24}} />
                    {selectedRowKeys.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <Dropdown
                          overlay={
                            <Menu>
                              <Menu.Item
                                key="delete"
                                onClick={handleBulkDelete}
                                danger
                                style={{ color: "red" }}
                              >
                                Delete Selected
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.SubMenu key="status" title="Change Status">
                                {["Active", "Inactive", "Hold", "Closed"].map(
                                  (statusOption) => {
                                    const selectedJobs = [
                                      ...jobs,
                                      ...otherUserJobs,
                                    ].filter((job) =>
                                      selectedRowKeys.includes(job.jobId)
                                    );

                                    const isStatusSelected = selectedJobs.every(
                                      (job) => job.status === statusOption
                                    );

                                    return (
                                      <Menu.Item
                                        key={statusOption}
                                        onClick={() =>
                                          handleBulkStatusChange(statusOption)
                                        }
                                        disabled={isStatusSelected}
                                      >
                                        Mark as {statusOption}
                                      </Menu.Item>
                                    );
                                  }
                                )}
                              </Menu.SubMenu>
                            </Menu>
                          }
                        >
                          <Button type="primary">
                            Actions <DownOutlined />
                          </Button>
                        </Dropdown>
                      </div>
                    )}
                    {/* <Tabs
                      defaultActiveKey="1"
                      items={keyItems}
                      onChange={onChange}
                    />*/}
                    {roleAccess === "Admin" ? (
                      <Tabs
                        activeKey={activeTabKey}
                        onChange={(key) => {
                          setActiveTabKey(key);
                          setSelectedTab(key === "other-jobs");
                        }}
                      >
                        {" "}
                        <Tabs.TabPane tab="My Jobs" key="my-jobs">
                          <Tabs defaultActiveKey="1">
                            <Tabs.TabPane tab="Active" key="1">
                              {renderJobsTable(activeJobs, columns, loader)}
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Inactive" key="2">
                              {renderJobsTable(inactiveJobs, columns, loader)}
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Hold" key="3">
                              {renderJobsTable(holdJobs, columns, loader)}
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Closed" key="4">
                              {renderJobsTable(closedJobs, columns, loader)}
                            </Tabs.TabPane>
                          </Tabs>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Other Users Jobs" key="other-jobs">
                          <Tabs defaultActiveKey="1">
                            <Tabs.TabPane tab="Active" key="1">
                              {renderJobsTable(
                                otherActiveJobs.filter(
                                  (job) =>
                                    !selectedEmail ||
                                    job.EmailAddress === selectedEmail
                                ),
                                otherUserJobColumns,
                                adminLoader
                              )}
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Inactive" key="2">
                              {renderJobsTable(
                                otherInactiveJobs.filter(
                                  (job) =>
                                    !selectedEmail ||
                                    job.EmailAddress === selectedEmail
                                ),
                                otherUserJobColumns,
                                adminLoader
                              )}
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Hold" key="3">
                              {renderJobsTable(
                                otherHoldJobs.filter(
                                  (job) =>
                                    !selectedEmail ||
                                    job.EmailAddress === selectedEmail
                                ),
                                otherUserJobColumns,
                                adminLoader
                              )}
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Closed" key="4">
                              {renderJobsTable(
                                otherClosedJobs.filter(
                                  (job) =>
                                    !selectedEmail ||
                                    job.EmailAddress === selectedEmail
                                ),
                                otherUserJobColumns,
                                adminLoader
                              )}
                            </Tabs.TabPane>
                          </Tabs>
                        </Tabs.TabPane>
                      </Tabs>
                    ) : (
                      <Tabs defaultActiveKey="1">
                        <Tabs.TabPane tab="Active" key="1">
                          {renderJobsTable(activeJobs, columns, loader)}
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Inactive" key="2">
                          {renderJobsTable(inactiveJobs, columns, loader)}
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Hold" key="3">
                          {renderJobsTable(holdJobs, columns, loader)}
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Closed" key="4">
                          {renderJobsTable(closedJobs, columns, loader)}
                        </Tabs.TabPane>
                      </Tabs>
                    )}

                    {/*<div className="table-outer">
                      <Table
                        columns={columns}
                        dataSource={jobs}
                        rowKey={(record) => record.jobId}
                        pagination={false}
                        loading={loader}
                        locale={{
                          emptyText: <Empty description="No Jobs Available" />,
                        }}
                      />
                    </div>*/}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isUploadModalVisible && (
            <Modal
              title="Upload Resume"
              open={isUploadModalVisible}
              onCancel={() => {
                setIsUploadModalVisible(false);
                setIsShowButton(false);
              }}
              footer={null}
            >
              <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for a single or bulk upload. Strictly prohibited from
                  uploading company data or other banned files.
                </p>
              </Dragger>
              {resumeList.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h4>Select Work Authorization for Each Resume:</h4>
                  {resumeList.map((item, index) => (
                    <div key={index} style={{ marginBottom: 12 }}>
                      <strong>
                        {item.resumeData?.basic_info?.full_name ||
                          `Resume ${index + 1}`}
                      </strong>
                      <Select
                        style={{ width: 300, marginLeft: 10 }}
                        placeholder="Select Work Authorization"
                        onChange={(value) => {
                          const updated = [...resumeList];
                          updated[index].workAuthorization = value;
                          setResumeList(updated);
                        }}
                        value={item.workAuthorization}
                      >
                        <Select.Option value="U.S. Citizen">
                          U.S. Citizen
                        </Select.Option>
                        <Select.Option value="Green Card Holder">
                          Green Card Holder
                        </Select.Option>
                        <Select.Option value="H1B">H1B</Select.Option>
                        <Select.Option value="L1">L1</Select.Option>
                        <Select.Option value="L2">L2</Select.Option>
                        <Select.Option value="TN">TN</Select.Option>
                        <Select.Option value="OPT EAD">OPT EAD</Select.Option>
                        <Select.Option value="CPT">CPT</Select.Option>
                        <Select.Option value="H4 EAD">H4 EAD</Select.Option>
                      </Select>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ paddingTop: "30px", textAlign: "center" }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => handleUpload()}
                  disabled={
                    loading ||
                    resumeList.length === 0 ||
                    resumeList.some((r) => !r.workAuthorization)
                  }
                >
                  {loading ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </Modal>
          )}
        </div>
      </section>
      <div className="copyright-text">
        <Typography.Text>
          © 2024 Skill Stream. All Right Reserved.
        </Typography.Text>
        <Modal
          title="Delete Job"
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <p>Do you want to delete this job?</p>
        </Modal>
      </div>
    </div>
  );
};

export default ManageJobs;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Skeleton, Dropdown, Menu, Button, Card, Typography, Tag, Space } from "antd";
// import { Server } from "../../../App";
// import { useNavigate } from "react-router-dom";
// import moment from "moment";
// import toast from "react-hot-toast";
// import { EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, DownOutlined } from '@ant-design/icons';

// const ManageJobs = () => {
//   const navigate = useNavigate();
//   const [jobs, setJobs] = useState([]);
//   let userId = localStorage.getItem("UserId");

//   const getJobs = async () => {
//     try {
//       const { data } = await axios.get(`${Server}/api/v1/employer/jobs/get/${userId}`);
//       setJobs(data.jobs);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     getJobs();
//   }, []);

//   let profileCompleted = localStorage.getItem("ProfileCompleted");
//   let role = localStorage.getItem("Role");

//   useEffect(() => {
//     if (profileCompleted === "false") {
//       if (role === "Candidate") {
//         navigate("/my-profile");
//       } else {
//         navigate("/company-profile");
//       }
//     }
//   }, [profileCompleted, role, navigate]);

//   useEffect(() => {
//     // Scroll to the top when navigation occurs
//     window.scrollTo(0, 0);
//   }, []);

//   const deleteShortlisted = async (Id) => {
//     try {
//       await axios.delete(`${Server}/api/v1/employer/jobs/delete/${userId}/${Id}`);
//       toast.success("Deleted Successfully");
//       setJobs((prevData) => prevData.filter((item) => item.jobId !== Id));
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const statusChange = async (status, jobId) => {
//     try {
//       const statusValues = { status };
//       await axios.post(`${Server}/api/v1/employer/jobs/status/${userId}/${jobId}`, statusValues);
//       toast.success("Job Status Changed Successfully!");
//       getJobs();
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const items = [
//     { label: "Active", key: "0" },
//     { label: "Inactive", key: "1" },
//     { label: "Closed", key: "2" },
//     { label: "Hold", key: "3" },
//   ];

//   const containerStyle = {
//     padding: '20px',
//   };

//   const dashboardOuterStyle = {
//     backgroundColor: '#f5f5f5',
//     borderRadius: '8px',
//     padding: '20px',
//   };

//   const upperTitleBoxStyle = {
//     textAlign: 'center',
//     marginBottom: '20px',
//   };

//   const cardsContainerStyle = {
//     display: 'flex',
//     flexWrap: 'wrap',
//     gap: '20px',
//     justifyContent: 'center',
//   };

//   const jobCardStyle = {
//     width: '300px',
//     borderRadius: '8px',
//     transition: 'transform 0.3s ease',
//     boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
//   };

//   const jobCardHoverStyle = {
//     transform: 'scale(1.05)',
//   };

//   const cardActionsStyle = {
//     marginTop: '20px',
//   };

//   const chosenOuterStyle = {
//     display: 'flex',
//     justifyContent: 'flex-end',
//     marginBottom: '20px',
//   };

//   const chosenSelectStyle = {
//     padding: '8px',
//     borderRadius: '4px',
//     border: '1px solid #ccc',
//   };

//   const copyrightTextStyle = {
//     textAlign: 'center',
//     marginTop: '20px',
//   };

//   return (
//     <div style={containerStyle}>
//       <section className="user-dashboard" style={dashboardOuterStyle}>
//         <div className="dashboard-outer">
//           <div className="upper-title-box" style={upperTitleBoxStyle}>
//             <Typography.Title level={2}>Manage Jobs</Typography.Title>
//             <Typography.Text>Ready to jump back in?</Typography.Text>
//           </div>
//           <div className="row">
//             <div className="col-lg-12">
//               <div className="ls-widget">
//                 <div className="tabs-box">
//                   <div className="widget-title">
//                     <Typography.Title level={4}>My Job Listings</Typography.Title>
//                     <div className="chosen-outer" style={chosenOuterStyle}>
//                       <select className="chosen-select" style={chosenSelectStyle}>
//                         <option>Last 6 Months</option>
//                         <option>Last 12 Months</option>
//                         <option>Last 16 Months</option>
//                         <option>Last 24 Months</option>
//                         <option>Last 5 years</option>
//                       </select>
//                     </div>
//                   </div>
//                   <div className="widget-content">
//                     <div className="cards-container" style={cardsContainerStyle}>
//                       {jobs.length === 0 ? (
//                         <Skeleton active />
//                       ) : (
//                         jobs.map((job) => (
//                           <Card
//                             className="job-card"
//                             key={job.jobId}
//                             hoverable
//                             style={jobCardStyle}
//                             bodyStyle={jobCardStyle}
//                             headStyle={jobCardHoverStyle}
//                           >
//                             <Typography.Title level={4}>{job.JobTitle}</Typography.Title>
//                             <Typography.Text>
//                               <i className="icon flaticon-map-locator"></i> {job.City}, {job.Country}
//                             </Typography.Text>
//                             <Space direction="vertical" style={{ marginTop: 10 }}>
//                               <Tag color="blue">{job.applicants?.length || 0} Applied</Tag>
//                               <Typography.Text>Posted: {moment(job.postedTime).format('MMMM Do YYYY')}</Typography.Text>
//                               <Typography.Text>Deadline: {moment(job.ApplicationDeadlineDate).format('MMMM Do YYYY')}</Typography.Text>
//                               <Tag color={job.status === "Active" ? "green" : job.status === "Inactive" ? "volcano" : job.status === "Closed" ? "red" : "gold"}>
//                                 {job.status}
//                               </Tag>
//                             </Space>
//                             <Space direction="vertical" style={cardActionsStyle}>
//                               <Button
//                                 icon={<EyeOutlined />}
//                                 onClick={() => navigate(`/job-detail/${userId}/${job.jobId}`)}
//                               >
//                                 View
//                               </Button>
//                               <Dropdown
//                                 overlay={
//                                   <Menu>
//                                     {items.map((item) => (
//                                       <Menu.Item
//                                         key={item.key}
//                                         onClick={() => statusChange(item.label, job.jobId)}
//                                       >
//                                         {item.label}
//                                       </Menu.Item>
//                                     ))}
//                                   </Menu>
//                                 }
//                                 trigger={['click']}
//                               >
//                                 <Button icon={<DownOutlined />}>Change Status</Button>
//                               </Dropdown>
//                               <Button
//                                 icon={<DeleteOutlined />}
//                                 onClick={() => deleteShortlisted(job.jobId)}
//                               >
//                                 Delete
//                               </Button>
//                               <Button
//                                 icon={<EditOutlined />}
//                                 onClick={() => navigate(`/edit-post/${job.jobId}`)}
//                               >
//                                 Edit
//                               </Button>
//                               <Button
//                                 type="primary"
//                                 icon={<SearchOutlined />}
//                                 onClick={() => navigate("/search-resume")}
//                                 style={{ marginTop: 10 }}
//                               >
//                                 Search Resume with AI
//                               </Button>
//                             </Space>
//                           </Card>
//                         ))
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//       <div className="copyright-text" style={copyrightTextStyle}>
//         <Typography.Text>© 2024 Skill Stream. All Right Reserved.</Typography.Text>
//       </div>
//     </div>
//   );
// };

// export default ManageJobs;
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Skeleton, Modal } from "antd";
// import { Server } from "../../../App";
// import { useNavigate, useParams } from "react-router-dom";
// import moment from "moment";
// import toast, { Toaster } from "react-hot-toast";
// import { textDecoration } from "@chakra-ui/react";
// import { Dropdown, Space, Menu, Typography } from "antd";

// const ManageJobs = () => {
//   const navigate = useNavigate();
//   const [jobs, setJobs] = useState([]);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [jobToDelete, setJobToDelete] = useState(null);
//   let userId = localStorage.getItem("UserId");

//   const getJobs = async () => {
//     try {
//       let userId = localStorage.getItem("UserId");
//       const { data } = await axios.get(
//         `${Server}/api/v1/employer/jobs/get/${userId}`
//       );

//       setJobs(data.jobs);
//       console.log(data.jobs);
//     } catch (error) {}
//   };

//   useEffect(() => {
//     getJobs();
//   }, []);

//   let profileCompleted = localStorage.getItem("ProfileCompleted");
//   let role = localStorage.getItem("Role");
//   useEffect(() => {
//     if (profileCompleted === "false") {
//       console.log(typeof profileCompleted);
//       if (role === "Candidate") {
//         navigate("/my-profile");
//       } else {
//         navigate("/company-profile");
//       }
//     }
//   }, []);

//   useEffect(() => {
//     // Scroll to the top when navigation occurs
//     window.scrollTo(0, 0);
//   }, []);

//   const showModal = (jobId) => {
//     setJobToDelete(jobId);
//     setIsModalVisible(true);
//   };

//   const handleOk = async () => {
//     try {
//       const { data } = await axios.delete(
//         `${Server}/api/v1/employer/jobs/delete/${userId}/${jobToDelete}`
//       );
//       console.log(data);
//       toast.success("Deleted Successfully");
//       setJobs((prevData) => prevData.filter((item) => item.jobId !== jobToDelete));
//       setIsModalVisible(false);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleCancel = () => {
//     setIsModalVisible(false);
//   };

//   const statusChange = async (status, jobId) => {
//     try {
//       console.log(status, jobId);

//       let statusValues = {
//         status,
//       };
//       const { data } = await axios.post(
//         `${Server}/api/v1/employer/jobs/status/${userId}/${jobId}`,
//         statusValues
//       );
//       console.log(data);
//       toast.success("Job Status Changed Successfully!");
//       getJobs();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const items = [
//     {
//       label: <a>Active</a>,
//       key: "0",
//     },
//     {
//       label: <a>Inactive</a>,
//       key: "1",
//     },
//     {
//       label: <a>Closed</a>,
//       key: "2",
//     },
//     {
//       label: <a>Hold</a>,
//       key: "3",
//     },
//   ];

//   return (
//     <div>
//       <section className="user-dashboard">
//         <div className="dashboard-outer">
//           <div className="upper-title-box">
//             <h3>Manage Jobs</h3>
//             <div className="text">Ready to jump back in?</div>
//           </div>

//           <div className="row">
//             <div className="col-lg-12">
//               <div className="ls-widget">
//                 <div className="tabs-box">
//                   <div className="widget-title">
//                     <h4>My Job Listings</h4>

//                     <div className="chosen-outer">
//                       <select className="chosen-select">
//                         <option>Last 6 Months</option>
//                         <option>Last 12 Months</option>
//                         <option>Last 16 Months</option>
//                         <option>Last 24 Months</option>
//                         <option>Last 5 year</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="widget-content">
//                     <div className="table-outer">
//                       {jobs?.length === 0 ? (
//                         <p className="text-center">No Jobs Posted</p>
//                       ) : (
//                         <table className="default-table manage-job-table">
//                           <thead>
//                             <tr>
//                               <th>Title</th>
//                               <th>Applications</th>
//                               <th>Created & Expired</th>
//                               <th>Status</th>
//                               <th>Action</th>
//                             </tr>
//                           </thead>
//                           {jobs?.map((e, idx) => (
//                             <tbody key={idx}>
//                               <tr>
//                                 <td>
//                                   <h6>{e.JobTitle}</h6>
//                                   <span className="info">
//                                     <i className="icon flaticon-map-locator"></i>{" "}
//                                     {e.City}, {e.Country}
//                                   </span>
//                                 </td>
//                                 {e.applicants ? (
//                                   <td className="applied">
//                                     <a onClick={() => navigate("/applicants")}>
//                                       {e.applicants?.length} Applied
//                                     </a>
//                                   </td>
//                                 ) : (
//                                   <td
//                                     className="applied"
//                                     style={{
//                                       textDecoration: "none !important ",
//                                     }}
//                                   >
//                                     <p>0 Applied</p>
//                                   </td>
//                                 )}

//                                 <td>
//                                   {e.postedTime} <br />
//                                   {e.ApplicationDeadlineDate}
//                                 </td>
//                                 <td className="status">{e.status}</td>
//                                 <td>
//                                   <div className="option-box">
//                                     <ul className="option-list">
//                                       <li>
//                                         <button
//                                           onClick={() =>
//                                             navigate(
//                                               `/job-detail/${userId}/${e.jobId}`
//                                             )
//                                           }
//                                           data-text="View Job"
//                                         >
//                                           <span className="la la-eye"></span>
//                                         </button>
//                                       </li>
//                                       <li>
//                                         <button data-text="Change Status">
//                                           <Dropdown
//                                             overlay={
//                                               <Menu>
//                                                 {items?.map((item) => (
//                                                   <Menu.Item
//                                                     key={item.key}
//                                                     onClick={() =>
//                                                       statusChange(
//                                                         item.label.props
//                                                           .children,
//                                                         e.jobId
//                                                       )
//                                                     }
//                                                   >
//                                                     {item.label}
//                                                   </Menu.Item>
//                                                 ))}
//                                               </Menu>
//                                             }
//                                             trigger={["click"]}
//                                           >
//                                             <a
//                                               onClick={(e) =>
//                                                 e.preventDefault()
//                                               }
//                                             >
//                                               <span className="la la-pencil"></span>
//                                             </a>
//                                           </Dropdown>
//                                         </button>
//                                       </li>
//                                       <li>
//                                         <button
//                                           data-text="Delete Job"
//                                           onClick={() => showModal(e.jobId)}
//                                         >
//                                           <span className="la la-trash"></span>
//                                         </button>
//                                       </li>
//                                       <li>
//                                         <button
//                                           data-text="Edit Job"
//                                           onClick={() =>
//                                             navigate(`/edit-post/${e.jobId}`)
//                                           }
//                                         >
//                                           <span className="la la-edit"></span>
//                                         </button>
//                                       </li>
//                                     </ul>
//                                   </div>
//                                 </td>
//                               </tr>
//                             </tbody>
//                           ))}
//                         </table>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       <div className="copyright-text">
//         <p>© 2024 Skill Stream. All Right Reserved.</p>
//       </div>

//       <Modal
//         title="Delete Job"
//         visible={isModalVisible}
//         onOk={handleOk}
//         onCancel={handleCancel}
//       >
//         <p>Do you want to delete this job?</p>
//       </Modal>
//     </div>
//   );
// };

// export default ManageJobs;
