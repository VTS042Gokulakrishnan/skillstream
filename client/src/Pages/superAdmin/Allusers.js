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
    {
      title: "Email",
      dataIndex: "email",
      width: "40%",
      editable: true,
    },
    {
      title: "User Type",
      dataIndex: "userType",
      width: "25%",
      editable: true,
    },
    {
      title: "No of Jobs",
      dataIndex: "jobCount",
      width: "15%",
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
      title: "Operation",
      dataIndex: "operation",
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
                    <Typography.Title level={4}>Users</Typography.Title>
                    <div className="chosen-outer">
                      <Button
                        type="primary"
                        onClick={() => navigate("/create-user")}
                      >
                        + Create Users
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
                    <Form form={form} component={false}>
                      <Table
                        components={{ body: { cell: EditableCell } }}
                        bordered
                        dataSource={data}
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
