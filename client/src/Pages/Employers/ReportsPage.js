import React, { useEffect, useState } from "react";
import {
  Tabs,
  Table,
  Button,
  Modal,
  Radio,
  DatePicker,
  Space,
  Select,
  Spin,
  message,
  Tag,
  Dropdown,
  Menu,
  Result,
  Tooltip,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import {
  MoreOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleOutlined,
  GlobalOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Server } from "App";

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const API_BASE = "/api/report"; // change if needed
// const token = localStorage.getItem(token);

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("employer");
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [employers, setEmployers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterType, setFilterType] = useState("this_month");
  const [customRange, setCustomRange] = useState(null);
  const [groupBy, setGroupBy] = useState("month");
  const [showAuthorised, setShowAuthorised] = useState(false);
  const navigate = useNavigate();
  const [extendModal, setExtendModal] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [endTrialModal, setEndTrialModal] = useState(false);
  const [endTrialOptions, setEndTrialOptions] = useState([]);
  const [extendLoading, setExtendLoading] = useState(false);
  const [endTrialLoading, setEndTrialLoading] = useState(false);
  const openExtendTrialModal = (record) => {
    setSelectedEmployer(record);
    setExtendModal(true);
  };
  const extendTrial = async (days) => {
    try {
      setExtendLoading(true);
      await axios.post(
        `${Server}/api/report/extend-trial`,
        {
          userId: selectedEmployer.userId,
          days,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      message.success(`Trial extended by ${days} days`);
      setExtendModal(false);
      setExtendLoading(false);

      loadTableData(); // reload table
    } catch (err) {
      message.error("Failed to extend trial");
      setExtendLoading(false);
    } finally {
      setExtendLoading(false);
    }
  };
  useEffect(() => {
    loadTableData();
    // eslint-disable-next-line
  }, [activeTab]);
  const getRemainingTrialDays = (record) => {
    if (!record.trialEnds) return 0;
    return Math.max(dayjs(record.trialEnds).diff(dayjs(), "day"), 0);
  };
  const getEndTrialOptions = (trialEnds) => {
    const remainingDays = dayjs(trialEnds).diff(dayjs(), "day");

    if (remainingDays <= 1) return [0, 1];
    if (remainingDays <= 2) return [0, 1];
    if (remainingDays <= 7) return [0, 1, 2];
    return [0, 1, 7, 14];
  };
  const openEndTrialModal = (record) => {
    setSelectedEmployer(record);
    setEndTrialOptions(getEndTrialOptions(record.trialEnds));
    setEndTrialModal(true);
  };
  const endTrial = async (days) => {
    try {
      setEndTrialLoading(true);
      await axios.post(
        `${Server}/api/report/end-trial`,
        {
          userId: selectedEmployer.userId,
          days,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      message.success(
        days === 0
          ? "Trial ended immediately"
          : `Trial will end in ${days} day(s)`
      );
      setEndTrialLoading(false);
      setEndTrialModal(false);
      loadTableData();
    } catch (err) {
      message.error("Failed to end trial");
      setEndTrialLoading(false);
    } finally {
      setEndTrialLoading(false);
    }
  };
  const confirmAllowCrossOrigin = (record) => {
    Modal.confirm({
      title: "Enable Cross-Region Access?",
      content: (
        <>
          <p>
            This will allow the employer to login using the same email across
            multiple SkillStream regions.
          </p>
          <ul>
            <li>🇨🇦 Canada – skillstreamjobs.ca</li>
            <li>🇺🇸 United States – skillstreamjobs.us</li>
            <li>🇮🇳 India – skillstreamlabs.com</li>
          </ul>
          <p>An email notification will be sent.</p>
        </>
      ),
      okText: "Enable",
      okType: "primary",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await axios.post(
            `${Server}/api/report/allow-cross-origin`,
            { userId: record.userId },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          message.success("Cross-region access enabled");
          loadTableData();
        } catch (err) {
          console.error(err);
          message.error("Failed to enable cross-region access");
        }
      },
    });
  };

  const confirmRevokeCrossOrigin = (record) => {
    Modal.confirm({
      title: "Disable Cross-Region Access?",
      content: (
        <>
          <p>
            This will <b>revoke access</b> to other SkillStream regions.
          </p>
          <p>
            The employer will only be able to login in their registered region:
            <b> {record.region}</b>
          </p>
          <p>An email notification will be sent.</p>
        </>
      ),
      okText: "Disable",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await axios.post(
            `${Server}/api/report/revoke-cross-origin`,
            { userId: record.userId },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          message.success("Cross-region access revoked");
          loadTableData();
        } catch (err) {
          console.error(err);
          message.error("Failed to revoke cross-region access");
        }
      },
    });
  };

  const disabledDate = (current) => {
    const minDate = dayjs("2023-09-01");
    const maxDate = dayjs().endOf("day");

    return (
      current < minDate || // disable before SEP 1, 2023
      current > maxDate // disable after today
    );
  };

  async function loadTableData() {
    setTableLoading(true);
    try {
      if (activeTab === "employer") {
        // fetch some sample rows: reuse the same query but with small page size for table
        const params = { filterType: "this_month" };
        const res = await axios.get(
          `${Server}${API_BASE}/employer-activity-counts`,
          {
            params,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        // Here we fetch full list for the table (a dedicated endpoint could be better)
        const list = await axios
          .get(`${Server}${API_BASE}/get/employers-list`, {
            params: { limit: 200 },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((r) => r.data) // placeholder
          .catch(() => ({ data: [] }));
        console.log(list.data);
        setEmployers(list.data || []);
      } else {
        const list = await axios
          .get(`${Server}${API_BASE}/get/candidates-list`, {
            params: { limit: 200 },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((r) => r.data)
          .catch(() => ({ data: [] }));
        setCandidates(list.data || []);
      }
    } catch (err) {
      console.error(err);
      if (
        err.response.data.message ===
        "UnAuthorised, You dont have a Admin Access"
      ) {
        message.error("UnAuthorised");
        setShowAuthorised(true);
      } else {
        message.error("Failed to load data for table");
      }
    } finally {
      setTableLoading(false);
    }
  }

  function openFilterModal() {
    setFilterModalVisible(true);
  }

  async function generateReport() {
    // prepare query params
    setLoading(true);

    try {
      const params = { filterType: filterType, groupBy };
      if (filterType === "custom" && customRange && customRange.length === 2) {
        params.startDate = customRange[0].format("YYYY-MM-DD");
        params.endDate = customRange[1].format("YYYY-MM-DD");
      }

      const url =
        activeTab === "employer"
          ? `${Server}${API_BASE}/employer-activity`
          : `${Server}${API_BASE}/candidate-activity`;

      // We expect file stream - use axios with responseType blob
      const response = await axios.get(url, {
        params,
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // or just token if your API uses a different format
        },
      });

      // Download
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      // get filename from header if present
      const disposition = response.headers["content-disposition"];
      let filename = `${activeTab}_activity.xlsx`;
      if (disposition) {
        const match = /filename="(.+)"/.exec(disposition);
        if (match && match[1]) filename = match[1];
      }
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      message.success("Report generated and downloaded");
      setFilterModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  const columnsEmployer = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>{record.email || "—"}</span>

          {record.isEmailVerified ? (
            <Tooltip title="Email Verified">
              <CheckCircleFilled style={{ color: "#52c41a", fontSize: 14 }} />
            </Tooltip>
          ) : (
            <Tooltip title="Email Not Verified">
              <CloseCircleFilled style={{ color: "#ff4d4f", fontSize: 14 }} />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (r) => (r ? r : "—"),
    },
    {
      title: "Company",
      dataIndex: "companyName",
      key: "companyName",
      render: (r) => (r ? r : "—"),
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      render: (r) => (r ? r : "—"),
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      render: (r) => (r ? r : "—"),
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      render: (r) => (r ? r : "—"),
    },
    {
      title: "Jobs Posted",
      dataIndex: "jobsPostedCount",
      key: "jobsPostedCount",
      render: (r) => (r ? r : "—"),
    },

    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
      render: (_, record) =>
        !record.subscribed
          ? "Not Subscribed"
          : record.trialStart
          ? "Free-Trail"
          : record.stripeSubscriptionId
          ? record.plan
          : !record.stripeSubscriptionId && record.subscribed
          ? "Internal Team"
          : "Not subscribed",
    },
    {
      title: "Plan expiry",
      dataIndex: "planExpiry",
      key: "planExpiry",
      render: (_, record) =>
        !record.subscribed
          ? "Not Subscribed"
          : record.trialEnds
          ? dayjs(record?.trialEnds).format("DD MMM YYYY")
          : record.SubscriptionEnds
          ? dayjs(record?.SubscriptionEnds).format("DD MMM YYYY")
          : !record.stripeSubscriptionId && record.subscribed
          ? "Internal Team"
          : "Not subscribed",
    },
    {
      title: "User Access",
      dataIndex: "access",
      key: "access",
      render: (r) => (r ? r : "—"),
    },
    {
      title: "Last Active",
      dataIndex: "lastActive",
      key: "lastActive",
      render: (value) =>
        value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const menuItems = [
          {
            key: "extend",
            icon: <ClockCircleOutlined />,
            label: "Extend Free Trial",
            onClick: () => openExtendTrialModal(record),
          },
          {
            key: "end",
            icon: <StopOutlined />,
            label: "End Trial",
            onClick: () => openEndTrialModal(record),
          },
          {
            key: "cors",
            icon: <GlobalOutlined />,
            label: record.allowedCrossOrigins
              ? "Disable Cross-Region Access"
              : "Enable Cross-Region Access",
            danger: record.allowedCrossOrigins,
            onClick: () =>
              record.allowedCrossOrigins
                ? confirmRevokeCrossOrigin(record)
                : confirmAllowCrossOrigin(record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const columnsCandidate = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Phone",
      dataIndex: "phone_number",
      key: "phone_number",
      render: (r) => (r ? r : "—"),
    },

    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      render: (r) => (r ? r : "—"),
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      render: (r) => (r ? r : "—"),
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      render: (r) => (r ? r : "—"),
    },
    {
      title: "Last Logged In",
      dataIndex: "lastLoggedIn",
      key: "lastLoggedIn",
      render: (value) =>
        value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : "—",
    },
    {
      title: "Resume",
      dataIndex: "resume",
      key: "resume",
      render: (r) =>
        r ? (
          <a href={r} target="_blank" rel="noreferrer">
            View
          </a>
        ) : (
          "—"
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleUpdateAccess(record)}>
            Update Access
          </Button>
        </Space>
      ),
    },
  ];

  function handleUpdateAccess(record) {
    // TODO: show modal or call API to update access - placeholder
    message.info(`Update access clicked for ${record.email || record.name}`);
  }

  return (
    <div style={{ padding: 20 }}>
      {showAuthorised ? (
        <Result
          status="error"
          title="Unauthorized Access"
          subTitle="You are not allowed to view this page. Please login again."
          extra={[
            <Button
              type="primary"
              key="console"
              onClick={() =>
                localStorage.getItem("token")
                  ? navigate("/employer-dahsboard")
                  : navigate("/")
              }
            >
              Go to Home
            </Button>,
          ]}
        />
      ) : (
        <div>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Employers" key="employer" />
            <TabPane tab="Candidates" key="candidate" />
          </Tabs>

          <div
            style={{
              marginBottom: 16,
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
            }}
          >
            <Button type="primary" onClick={openFilterModal}>
              Generate Report
            </Button>
            <Button type="primary" onClick={() => navigate("/")}>
              Back
            </Button>
          </div>

          <Spin spinning={tableLoading}>
            <Table
              rowKey={(record) => record._id || record.email || record.email}
              dataSource={activeTab === "employer" ? employers : candidates}
              columns={
                activeTab === "employer" ? columnsEmployer : columnsCandidate
              }
              pagination={{ pageSize: 20 }}
            />
          </Spin>

          <Modal
            title={`Generate ${
              activeTab === "employer" ? "Employer" : "Candidate"
            } Report`}
            visible={filterModalVisible}
            onCancel={() => setFilterModalVisible(false)}
            onOk={generateReport}
            okButtonProps={{ loading }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Radio.Group
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <Radio value="today">Today</Radio>
                <Radio value="this_month">This Month</Radio>
                <Radio value="last_6_months">Last 6 Months</Radio>
                <Radio value="custom">Custom Range</Radio>
              </Radio.Group>

              {filterType === "custom" && (
                <RangePicker
                  value={customRange}
                  onChange={(vals) => setCustomRange(vals)}
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  disabledDate={disabledDate}
                />
              )}

              <div>
                <span style={{ marginRight: 8 }}>Group counts by:</span>
                <Select
                  value={groupBy}
                  onChange={(v) => setGroupBy(v)}
                  style={{ width: 160 }}
                >
                  <Select.Option value="month">Month</Select.Option>
                  <Select.Option value="day">Day</Select.Option>
                </Select>
              </div>
            </Space>
          </Modal>
          <Modal
            open={extendModal}
            title="Extend Free Trial"
            onCancel={() => setExtendModal(false)}
            footer={null}
          >
            <p>Select extension duration:</p>

            <Space>
              {[7, 14, 30, 60].map((d) => (
                <Button
                  key={d}
                  type="primary"
                  loading={extendLoading}
                  disabled={extendLoading}
                  onClick={() => extendTrial(d)}
                >
                  {d} Days
                </Button>
              ))}
            </Space>
          </Modal>
          <Modal
            open={endTrialModal}
            title="End Free Trial"
            onCancel={() => setEndTrialModal(false)}
            footer={null}
          >
            <p>Select when to end the trial:</p>

            <Space>
              {endTrialOptions.map((d) => (
                <Button
                  key={d}
                  danger={d === 0}
                  loading={endTrialLoading}
                  disabled={endTrialLoading}
                  onClick={() => endTrial(d)}
                >
                  {d === 0 ? "End Immediately" : `${d} Day(s)`}
                </Button>
              ))}
            </Space>
          </Modal>
        </div>
      )}
    </div>
  );
}
// const actionMenu = (record) => {
//   const remainingDays = getRemainingTrialDays(record);

//   const extendOptions = [
//     { label: "7 Days", value: 7 },
//     { label: "14 Days", value: 14 },
//     { label: "30 Days", value: 30 },
//     { label: "2 Months", value: 60 },
//   ];

//   const endTrialOptions = [
//     { label: "End Immediately", value: 0 },
//     ...(remainingDays >= 1 ? [{ label: "1 Day", value: 1 }] : []),
//     ...(remainingDays >= 7 ? [{ label: "7 Days", value: 7 }] : []),
//     ...(remainingDays >= 14 ? [{ label: "14 Days", value: 14 }] : []),
//   ];

//   return (
//     <Menu>
//       {/* EXTEND TRIAL */}
//       <Menu.SubMenu title="Extend Trial">
//         {extendOptions.map((opt) => (
//           <Menu.Item
//             key={`extend-${opt.value}`}
//             onClick={() => handleExtendTrial(record, opt.value)}
//           >
//             {opt.label}
//           </Menu.Item>
//         ))}
//       </Menu.SubMenu>

//       {/* END TRIAL */}
//       <Menu.SubMenu title="End Trial">
//         {endTrialOptions.map((opt) => (
//           <Menu.Item
//             key={`end-${opt.value}`}
//             onClick={() => handleEndTrial(record, opt.value)}
//           >
//             {opt.label}
//           </Menu.Item>
//         ))}
//       </Menu.SubMenu>

//       <Menu.Divider />

//       {/* ALLOW CROSS ORIGIN */}
//       <Menu.Item key="cors" onClick={() => handleAllowCrossOrigin(record)}>
//         Allow Cross Origin
//       </Menu.Item>
//     </Menu>
//   );
// };
