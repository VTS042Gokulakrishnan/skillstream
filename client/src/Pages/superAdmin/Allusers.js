import { Select, Tag } from "antd";
import EmployerAvatar from "../../Components/EmployerUI/EmployerAvatar";
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Table,
  Typography,
  Button,
} from "antd";
import { useNavigate } from "react-router-dom";
import { Server } from "App";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const originData = Array.from({ length: 20 }).map((_, i) => ({
  key: i.toString(),
  name: `Edward ${i}`,
  age: 32,
  address: `London Park no. ${i}`,
}));

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  // const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  let inputNode;
  if (dataIndex === "userType") {
    inputNode = (
      <select>
        <option value="Admin">Admin</option>
        <option value="User">User</option>
      </select>
    );
  } else {
    inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  }
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `Please Input ${title}!` }]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const AllUsers = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const isEditing = (record) => record.key === editingKey;
  let token = localStorage.getItem("token");
  let { organisationId, email } = jwtDecode(token);
  // console.log(organisationId);

  // console.log(organisationId);
  useEffect(() => {
    getUsers();
  }, []);
  const getUsers = async () => {
    setLoader(true);
    try {
      const { data } = await axios.get(
        `${Server}/api/v1/superAdmin/get/users/${organisationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(data);
      let userData = [];
      data?.users
        ?.filter((users) => users.email !== email)
        .map((users, idx) =>
          userData.push({
            key: idx + 1,
            name: users.name || users.fullName || users.email?.split("@")[0],
            image: users.image,
            lastActive: users.lastLoggedIn,
            email: users.email,
            userType: users.access,
            jobCount: users.jobs,
          })
        );

      setData(userData);
      setLoader(false);
    } catch (error) {
      // console.log(error);
      setLoader(false);
    }
  };
  const edit = (record) => {
    form.setFieldsValue({ email: "", userType: "", password: "", ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        const updatedUser = { ...item, ...row };

        // Only send the fields you're editing: email and userType
        await axios.post(
          `${Server}/api/v1/superAdmin/edit/user`,
          {
            email: updatedUser.email,
            userType: updatedUser.userType,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        newData.splice(index, 1, updatedUser);
        setData(newData);
        setEditingKey("");
      } else {
        setEditingKey("");
      }
    } catch (errInfo) {
      console.error("Validation or Update Failed:", errInfo);
    }
  };

  const handleDelete = async (key) => {
    const deletedUser = data.find((item) => item.key === key);
    try {
      await axios.delete(`${Server}/api/v1/superAdmin/delete/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          email: deletedUser.email,
        },
      });
      const newData = data.filter((item) => item.key !== key);
      setData(newData);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };
  const columns = [
    {title:"Name",dataIndex:"name",width:220,render:(_,record)=><div className="em-resume-name"><EmployerAvatar src={record.image} name={record.name} size={38}/><strong>{record.name}</strong></div>},
    {
      title: "Email",
      dataIndex: "email",
      width: 240,
      editable: true,
    },
    {
      title: "Role",
      dataIndex: "userType",
      render:value=><Tag color={value === "Admin" ? "purple":"blue"}>{value}</Tag>,
      width: 120,
      editable: true,
    },
    {
      title: "Jobs",
      dataIndex: "jobCount",
      width: 100,
      editable: false,
      render: (text, record) => (
        <span
          onClick={() =>
            navigate("/manage-jobs", {
              state: { email: record.email }, // or any other data you want
            })
          }
          style={{
            color: "#1890ff",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Actions",
      dataIndex: "operation",
      width:150,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{ marginRight: 8 }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <div>
            <Button
              icon={<EditOutlined />}
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
              style={{ marginRight: 8 }}
            ></Button>
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record.key)}
            >
              <Button
                icon={<DeleteOutlined />}
                // onClick={() => showModal(record.jobId)}
              />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) =>
    col.editable
      ? {
          ...col,
          onCell: (record) => ({
            record,
            inputType: col.dataIndex === "age" ? "number" : "text",
            dataIndex: col.dataIndex,
            title: col.title,
            editing: isEditing(record),
          }),
        }
      : col
  );

  return (
    <div>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <Typography.Title level={2}>All Users</Typography.Title>
            <Typography.Text>Manage all users</Typography.Text>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <Typography.Title level={4}>Team members <Tag color="blue">{data.length}</Tag></Typography.Title>
                    <div className="chosen-outer">
                      <Button
                        type="primary"
                        onClick={() => navigate("/create-user")}
                      >
                        + Add user
                      </Button>
                      {/*<select className="chosen-select">
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                        <option>Last 16 Months</option>
                        <option>Last 24 Months</option>
                        <option>Last 5 year</option>
                      </select>*/}
                    </div>
                  </div>
                  <div className="widget-content">
                    <div className="em-search-toolbar"><Input.Search aria-label="Search team users" placeholder="Search users by name or email" value={search} onChange={e=>setSearch(e.target.value)} allowClear style={{maxWidth:480}}/><Select aria-label="Filter team role" value={roleFilter} onChange={setRoleFilter} options={[{value:"all",label:"All roles"},{value:"Admin",label:"Admin"},{value:"User",label:"User"}]} style={{width:160}}/></div>
                    <Form form={form} component={false}>
                      <Table
                        components={{ body: { cell: EditableCell } }}
                        scroll={{x:850}}
                        dataSource={data.filter(user => [user.email,user.name].join(" ").toLowerCase().includes(search.toLowerCase()) && (roleFilter === "all" || user.userType === roleFilter))}
                        columns={mergedColumns}
                        loading={loader}
                        rowClassName="editable-row"
                        pagination={{ onChange: cancel }}
                      />
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AllUsers;
