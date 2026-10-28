import ResumePreviewDrawer from "../../Components/ReaderDrawer/ResumePreviewDrawer";
import EmployerAvatar from "../../Components/EmployerUI/EmployerAvatar";
import { Input, Button, Select, Popconfirm } from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton, Empty, Badge, Dropdown, Space, Table, Tooltip } from "antd";
import { DownOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { Server } from "App";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";
const items = [
  {
    key: "1",
    label: "Action 1",
  },
  {
    key: "2",
    label: "Action 2",
  },
];
const SavedResumes = () => {
  const [data, setData] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("all");
  const params = useParams();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  let profileCompleted = localStorage.getItem("ProfileCompleted");
  let role = localStorage.getItem("Role");
  let token = localStorage.getItem("token");
  useEffect(() => {
    if (profileCompleted === "false") {
      // console.log(typeof profileCompleted);
      if (role === "Candidate") {
        navigate("/my-profile");
      } else {
        navigate("/company-profile");
      }
    }
  }, []);
  let userId = localStorage.getItem("UserId");
  const getshortlistedResumes = async () => {
    try {
      setLoader(true);
      const { data } = await axios.get(
        `${Server}/api/v1/employer/shortlistResume/view/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(data);
      setData(data);
      setLoader(false);
    } catch (error) {
      // console.log("Error: ", error);
      setLoader(false);
    }
  };

  useEffect(() => {
    getshortlistedResumes();
  }, []);
  // console.log(data);

  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);
  const deleteShortlisrted = async (Id, jobId) => {
    try {
      // console.log(Id, jobId);
      const { data } = await axios.delete(
        `${Server}/api/v1/employer/shortlistResume/delete/${jobId}/${userId}/${Id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(data);
      toast.success("Deleted Successfully");
      getshortlistedResumes();
      // setData((prevData) =>
      //   prevData?.jobs.map((job) =>
      //     job.jobId === jobId
      //       ? {
      //           ...job,
      //           savedResumes: job.savedResumes.filter(
      //             (resume) => resume.id !== Id
      //           ),
      //         }
      //       : job
      //   )
      // );
    } catch (error) {
      // console.log(error);
    }
  };
  const expandedRowRender = (job) => {
    const columns = [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Job Title",
        dataIndex: "jobTitle",
        key: "jobTitle",
      },
      {
        title: "Country",
        dataIndex: "country",
        key: "country",
      },
      // {
      //   title: "Status",
      //   key: "state",
      //   render: () => <Badge status="success" text="Finished" />,
      // },
      {
        title: "Time",
        dataIndex: "savedTime",
        key: "savedTime",
      },
      {
        title: "Action",
        key: "operation",
        render: (record) => (
          <Space size="middle">
            <Tooltip title="View Resume">
              <a
                style={{
                  color:
                    "rgba(var(--bs-link-color-rgb),var(--bs-link-opacity,1))",
                }}
                onClick={() => setPreviewUrl(record.resume)}
              >
                <EyeOutlined />
              </a>
            </Tooltip>
            <Tooltip title="Delete">
              <a
                style={{
                  color:
                    "rgba(var(--bs-link-color-rgb),var(--bs-link-opacity,1))",
                }}
                onClick={() => deleteShortlisrted(record.id, record.jobId)}
              >
                <DeleteOutlined />
              </a>
            </Tooltip>
            {/* <Dropdown
              menu={{
                items,
              }}
            >
              <a
                style={{
                  color:
                    "rgba(var(--bs-link-color-rgb),var(--bs-link-opacity,1))",
                }}
              >
                More <DownOutlined />
              </a>
            </Dropdown>*/}
          </Space>
        ),
      },
    ];
    const jobData = [];
    data?.jobs?.map((e, idx) =>
      e?.savedResumes?.map((i, subIdx) =>
        jobData.push({
          key: subIdx,
          name: i?.name ? i?.name : "User",
          resume: i?.resume,
          country: i?.country ? i?.country : "Not Provided",
          jobTitle: i?.jobTitle ? i?.jobTitle : "Not Provided",
          savedTime: i?.shortlistedTime,
          jobId: e?.jobId,
          id: i?.id,
        })
      )
    );

    const resumeData = job.savedResumes?.map((resume, idx) => ({
      key: idx,
      name: resume?.name || "User",
      resume: resume?.resume,
      country: resume?.country || "Not Provided",
      savedTime: resume?.shortlistedTime,
      jobId: resume?.jobId,
      id: resume?.id,
    }));
    // for (let i = 0; i < 3; ++i) {
    //   jobData.push({
    //     key: i.toString(),
    //     date: "2014-12-24 23:12:00",
    //     name: "This is production name",
    //     upgradeNum: "Upgraded: 56",
    //   });
    // }
    return (
      <Table columns={columns} dataSource={resumeData} pagination={false} />
    );
  };
  const columns = [
    // {
    //   title: "Name",
    //   dataIndex: "name",
    //   key: "name",
    // },
    // {
    //   title: "Platform",
    //   dataIndex: "platform",
    //   key: "platform",
    // },
    // {
    //   title: "Version",
    //   dataIndex: "version",
    //   key: "version",
    // },
    // {
    //   title: "Upgraded",
    //   dataIndex: "upgradeNum",
    //   key: "upgradeNum",
    // },
    // {
    //   title: "Creator",
    //   dataIndex: "creator",
    //   key: "creator",
    // },
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
    },
    {
      title: "No.Saved Resume",
      dataIndex: "savedResumesCount",
      key: "savedResumesCount",
    },
    // {
    //   title: "Action",
    //   key: "operation",
    //   render: () => (
    //     <a
    //       style={{
    //         color: "rgba(var(--bs-link-color-rgb),var(--bs-link-opacity,1))",
    //       }}
    //     >
    //       Publish
    //     </a>
    //   ),
    // },
  ];
  // const formData = [];
  const filteredJobs = data?.jobs?.filter(
    (job) => job.savedResumes?.length > 0
  );
  // console.log(filteredJobs);

  // for (let i = 0; i < data?.jobs?.length; ++i) {
  //   formData.push({
  //     key: i.toString(),
  //     jobTitle:data?.jobs?.[i]. data?.jobs?.[i].JobTitle,
  //     Count: data?.jobs?.[i].savedResumes?.length,
  //     // name: "Screen",
  //     // platform: "iOS",
  //     // version: "10.3.4.5654",
  //     // upgradeNum: 500,
  //     // creator: "Jack",
  //     // createdAt: "2014-12-24 23:12:00",
  //   });
  // }
  const jobData = data?.jobs
    ?.filter((job) => job.savedResumes?.length > 0)
    ?.map((job, idx) => ({
      key: idx,
      jobTitle: job?.JobTitle || "Not Provided",
      savedResumesCount: job.savedResumes?.length,
      ...job,
    }));
  // console.log(jobData);

  const saved = (data.jobs || []).flatMap(job => (job.savedResumes || []).map(resume => ({...resume, collectionJobId:job.jobId, collectionTitle:job.JobTitle})));
  const visible = saved.filter(resume => (selectedJobId === "all" || resume.collectionJobId === selectedJobId) && [resume.name,resume.jobTitle,resume.country,resume.collectionTitle].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase()));
  return <><ResumePreviewDrawer open={!!previewUrl} fileUrl={previewUrl} onClose={() => setPreviewUrl(null)} /><Toaster position="top-center"/><div className="em-saved-layout"><aside className="em-card em-saved-collections"><h2>Saved by job</h2><button className={selectedJobId === "all" ? "active":""} onClick={()=>setSelectedJobId("all")}>All saved <span>{saved.length}</span></button>{(data.jobs||[]).map(job=><button key={job.jobId} className={selectedJobId === job.jobId ? "active":""} onClick={()=>setSelectedJobId(job.jobId)}>{job.JobTitle}<span>{job.savedResumes?.length||0}</span></button>)}</aside><section><div className="em-search-toolbar"><Input.Search aria-label="Search saved resumes" placeholder="Search by name, title or location" value={search} onChange={e=>setSearch(e.target.value)} allowClear style={{maxWidth:600}}/><span>{visible.length} saved candidates</span></div>{loader ? <div className="em-card"><Skeleton active/></div> : <div className="em-resume-cards">{visible.map((resume,i)=><article className="em-resume-card" key={`${resume.collectionJobId}-${resume.id || i}`}><EmployerAvatar src={resume.image} name={resume.name} size={56}/><div className="em-resume-details"><h2>{resume.name || "Candidate"}</h2><p>{resume.jobTitle || resume.collectionTitle}</p><p>{[resume.city,resume.state,resume.country].filter(Boolean).join(", ")}</p><div className="em-resume-skills"><span>{resume.collectionTitle}</span></div><p>Saved {resume.shortlistedTime || "recently"}</p></div><div className="em-resume-actions"><Button onClick={() => setPreviewUrl(resume.resume)} disabled={!resume.resume} icon={<EyeOutlined/>}>View resume</Button><Popconfirm title="Remove this saved resume?" onConfirm={()=>deleteShortlisrted(resume.id,resume.collectionJobId)} okText="Remove"><Button icon={<DeleteOutlined/>}>Remove</Button></Popconfirm></div></article>)}</div>}{!loader && !visible.length && <div className="em-card em-empty">No saved resumes match this view.</div>}</section></div></>;

};

export default SavedResumes;

// import React, { useState, useRef } from "react";
// import { Table, Tag, Tooltip,Space, Input, Button } from "antd";
// import { SearchOutlined } from "@ant-design/icons";
// import Highlighter from "react-highlight-words";

// const SavedResumes = () => {
//   const [resumes, setResumes] = useState([
//     {
//       key: "1",
//       name: "John Doe",
//       position: "Software Engineer",
//       experience: "5 years",
//       skills: ["JavaScript", "React", "Node.js"],
//       lastUpdated: "2024-07-25",
//     },
//     {
//       key: "2",
//       name: "Jane Smith",
//       position: "Data Scientist",
//       experience: "3 years",
//       skills: ["Python", "Machine Learning", "Data Analysis"],
//       lastUpdated: "2024-07-27",
//     },
//     {
//       key: "3",
//       name: "Alice Brown",
//       position: "Product Manager",
//       experience: "8 years",
//       skills: ["Leadership", "Communication", "Project Management"],
//       lastUpdated: "2024-07-28",
//     },
//     // Add more resumes as needed
//   ]);

//   const [searchText, setSearchText] = useState("");
//   const [searchedColumn, setSearchedColumn] = useState("");
//   const searchInput = useRef(null);

//   const handleSearch = (selectedKeys, confirm, dataIndex) => {
//     confirm();
//     setSearchText(selectedKeys[0]);
//     setSearchedColumn(dataIndex);
//   };

//   const handleReset = (clearFilters) => {
//     clearFilters();
//     setSearchText("");
//   };

//   const getColumnSearchProps = (dataIndex) => ({
//     filterDropdown: ({
//       setSelectedKeys,
//       selectedKeys,
//       confirm,
//       clearFilters,
//     }) => (
//       <div style={{ padding: 8 }}>
//         <Input
//           ref={searchInput}
//           placeholder={`Search ${dataIndex}`}
//           value={selectedKeys[0]}
//           onChange={(e) =>
//             setSelectedKeys(e.target.value ? [e.target.value] : [])
//           }
//           onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
//           style={{ marginBottom: 8, display: "block" }}
//         />
//         <Space>
//           <Button
//             type="primary"
//             onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
//             icon={<SearchOutlined />}
//             size="small"
//             style={{ width: 90 }}
//           >
//             Search
//           </Button>
//           <Button
//             onClick={() => handleReset(clearFilters)}
//             size="small"
//             style={{ width: 90 }}
//           >
//             Reset
//           </Button>
//         </Space>
//       </div>
//     ),
//     filterIcon: (filtered) => (
//       <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
//     ),
//     onFilter: (value, record) =>
//       record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
//     onFilterDropdownVisibleChange: (visible) => {
//       if (visible) {
//         setTimeout(() => searchInput.current.select(), 100);
//       }
//     },
//     render: (text) =>
//       searchedColumn === dataIndex ? (
//         <Highlighter
//           highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
//           searchWords={[searchText]}
//           autoEscape
//           textToHighlight={text ? text.toString() : ""}
//         />
//       ) : (
//         text
//       ),
//   });

//   const handleAnalyzeAI = () => {
//     // Your button click handler logic
//     console.log("Analyze AI clicked");
//   };

//   const columns = [
//     {
//       title: "Name",
//       dataIndex: "name",
//       key: "name",
//       sorter: (a, b) => a.name.localeCompare(b.name),
//       ...getColumnSearchProps("name"),
//       width: "20%",
//     },
//     {
//       title: "Position",
//       dataIndex: "position",
//       key: "position",
//       sorter: (a, b) => a.position.localeCompare(b.position),
//       ...getColumnSearchProps("position"),
//       width: "20%",
//     },
//     {
//       title: "Experience",
//       dataIndex: "experience",
//       key: "experience",
//       sorter: (a, b) => {
//         const yearsA = parseInt(a.experience.split(" ")[0], 10);
//         const yearsB = parseInt(b.experience.split(" ")[0], 10);
//         return yearsA - yearsB;
//       },
//       ...getColumnSearchProps("experience"),
//       width: "20%",
//     },
//     {
//       title: "Skills",
//       key: "skills",
//       dataIndex: "skills",
//       render: (skills) => (
//         <>
//           {skills.map((skill) => {
//             let color = skill.length > 6 ? "geekblue" : "green";
//             if (skill === "JavaScript") {
//               color = "volcano";
//             }
//             return (
//               <Tag color={color} key={skill}>
//                 {skill.toUpperCase()}
//               </Tag>
//             );
//           })}
//         </>
//       ),
//       width: "25%",
//     },
//     {
//       title: "Last Updated",
//       dataIndex: "lastUpdated",
//       key: "lastUpdated",
//       sorter: (a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated),
//       ...getColumnSearchProps("lastUpdated"),
//       width: "25%",
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: () => (
//         <Tooltip title="3 done / 3 in progress / 4 to do">

//         <div
//           className="loader-one"
//           onClick={handleAnalyzeAI}
//         >
//           <span className="loader__inner1"></span>
//           <span className="loader__inner1"></span>
//           <span className="loader__text1">
//             {/* <SearchOutlined /> */}
//             AI
//           </span>
//         </div>
//         </Tooltip>
//       ),
//       width: "15%",
//     },
//     {
//         title: "Actions",
//         key: "actions",
//         render: () => (
//         <Button
//         type="primary"
//         icon={<SearchOutlined />}
//         onClick={() => {
//           // Implement AI Resume Search functionality
//           console.log("AI Resume Search clicked");
//         }}
//       >
//             View Result
//       </Button>
//         )
//     }
//   ];

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         padding: "20px",
//         backgroundColor: "#f9f9f9",
//       }}
//     >
//       <h2
//         style={{
//           fontSize: "24px",
//           fontWeight: "bold",
//           width: "100%",
//           height: "150px",
//           marginBottom: "20px",
//           padding: "10px",
//           backgroundImage:
//             "linear-gradient(45deg, #0A0A23, #000000 40%, #1E90FF 80%)",
//           color: "white",
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           borderRadius: "5px",
//         }}
//       >
//         Saved Resumes
//       </h2>

//       <Table
//         columns={columns}
//         dataSource={resumes}
//         pagination={{ pageSize: 5 }}
//         style={{
//           width: "100%",
//           maxWidth: "1200px", // Max width for the table
//           backgroundColor: "white",
//           borderRadius: "8px",
//           overflow: "hidden",
//         }}
//       />
//     </div>
//   );
// };

// export default SavedResumes;
