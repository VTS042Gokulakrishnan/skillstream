import React, { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  message,
} from "antd";
import axios from "axios";
import { Server } from "App";
const { Option } = Select;
const EditCandidateDrawer = ({
  open,
  setOpen,
  selectedUser,
  keywordSearch,
  setSelectedRowKeys,
  setCandidates,
  setFilteredCandidates,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("United States");
  const [state, setState] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserID] = useState("");
  const [stateData, setStateData] = useState([]);
  const [cityData, SetCityData] = useState([]);
  const [form] = Form.useForm();
  //   setOpen(true);
  // };
  const onClose = () => {
    setOpen(false);
  };
  useEffect(() => {
    setUserID(selectedUser[0]._id);
    // console.log(selectedUser[0]._id);

    const getUser = async () => {
      try {
        const { data } = await axios.get(
          `${Server}/api/v1/candidate/fetch/user/${selectedUser[0]._id}`
        );
        form.setFieldsValue({
          name: data.candidate?.name,
          email: data.candidate?.email,
          phone_number: data.candidate?.phone_number,
          city: data.candidate?.city,
          state: data.candidate?.state,
          jobTitle: data.candidate?.jobTitle,
        });
        setState(data.candidate?.state);
        setCity(data.candidate?.city);
      } catch (error) {
        // console.log(error);
      }
    };
    getUser();
  }, []);

  const onFinish = async (values) => {
    setLoading(true); // ✅ Start Button Loader
    try {
      const { data } = await axios.post(
        `${Server}/api/v1/candidate/edit/user/${selectedUser[0]._id}`,
        values
      );
      if (data.status) {
        // keywordSearch();
        setCandidates((prevCandidates) =>
          prevCandidates.map((candidate) =>
            candidate._id === selectedUser[0]._id
              ? { ...candidate, ...values }
              : candidate
          )
        );

        setFilteredCandidates((prevFiltered) =>
          prevFiltered.map((candidate) =>
            candidate._id === selectedUser[0]._id
              ? { ...candidate, ...values }
              : candidate
          )
        );

        // setSelectedRowKeys([]);
        setOpen(false); // ✅ Close Modal after success
        message.success("Updated Successfully");
      } else {
        message.error(data.message);
      }
    } catch (error) {
      // console.log(error);
      if (error?.response?.status === 404) {
        message.error("User not found");
      } else {
        message.error("Internal Server Error");
      }
    } finally {
      setLoading(false); // ✅ Stop Button Loader
    }
  };
  const onFinishFailed = (errorInfo) => {
    // console.log("Failed:", errorInfo);
    message.error("Please fill all fields");
  };
  // Fetch states based on selected country
  const fetchStates = async () => {
    try {
      const { data } = await axios.get(
        `${Server}/api/v1/data/states/${country}`
      );
      setStateData(data.states); // Set state data
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    if (country) {
      fetchStates(); // Fetch states when country changes
    }
  }, [country]);

  useEffect(() => {
    if (state) {
      fetchCities(); // Fetch states when country changes
    }
  }, [state]);
  const fetchCities = async () => {
    try {
      const { data } = await axios.get(
        `${Server}/api/v1/data/cities/${country}/${state}`
      );
      // console.log(data.country_city);
      SetCityData(data.cities);
    } catch (error) {
      // console.log(error);
    }
  };
  const handleSetState = (value) => {
    setState(value);
  };
  return (
    <>
      <Drawer
        title="Create a new account"
        width={720}
        onClose={onClose}
        open={open}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[
                  {
                    message: "Please enter user name",
                  },
                ]}
              >
                <Input placeholder="Please enter user name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    message: "Please enter url",
                  },
                ]}
              >
                <Input placeholder="Please enter email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone_number"
                label="Phone Number"
                rules={[
                  {
                    message: "Please select an owner",
                  },
                ]}
              >
                <Input placeholder="Please enter Number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="jobTitle"
                label="Job Title"
                rules={[
                  {
                    message: "Please choose the type",
                  },
                ]}
              >
                <Input placeholder="Please enter Job Title" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="state"
                label="State"
                rules={[
                  {
                    message: "Please choose state",
                  },
                ]}
              >
                <Select
                  placeholder="Please choose the state"
                  virtual={false}
                  onChange={handleSetState}
                  showSearch
                >
                  {stateData?.map((state) => (
                    <Option value={state}>{state}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="city"
                label="City"
                rules={[
                  {
                    message: "Please choose city",
                  },
                ]}
              >
                <Select
                  placeholder="Please choose the city"
                  virtual={false}
                  showSearch
                >
                  {cityData?.map((state) => (
                    <Option value={state}>{state}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button
              htmlType="submit"
              type="primary"
              loading={loading}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default EditCandidateDrawer;
