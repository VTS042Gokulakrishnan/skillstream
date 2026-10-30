import React, { useEffect, useRef, useState } from "react";
import { Modal, Form, Select, Input, Radio, Alert, Button } from "antd";
import axios from "axios";
import { Server } from "App";
import toast from "react-hot-toast";

export default function DemoModal({ isModalOpen, setIsModalOpen, selectedCandidate, onSent }) {
  const [form] = Form.useForm();
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const lock = useRef(false);
  const type = Form.useWatch("type",form);
  const useInstructions = Form.useWatch("useInstructions",form);
  const completed = (type === "coding" ? selectedCandidate.CodingInterviewStatus : selectedCandidate.interviewStatus) === "Completed";
  useEffect(()=>{if(isModalOpen){form.setFieldsValue({type:selectedCandidate.preferredType || "video",level:"medium",isCodingRound:false,useInstructions:false,instructions:"",expiryHours:24});setError("");}},[isModalOpen,selectedCandidate,form]);
  const submit = async values => {
    if(lock.current) return;
    lock.current=true;setBusy(true);setError("");
    try {
      const endpoint=values.type === "coding" ? "coding/sendEmail" : "sendEmail";
      const {data}=await axios.post(`${Server}/api/v1/videoInterview/${endpoint}/${selectedCandidate.userId}/${selectedCandidate.jobId}/${selectedCandidate.candidateId}`,{...selectedCandidate,level:values.level,isCodingRound:values.isCodingRound,instructions:values.useInstructions ? String(values.instructions || "").split("\n").map(v=>v.trim()).filter(Boolean) : [],expiryHours:values.expiryHours,retake:completed,region:"United States"});
      if(!data.status) throw new Error("Invitation was not confirmed");
      toast.success("Interview invitation sent");onSent?.();setIsModalOpen(false);
    } catch(err){setError(err.response?.data?.message || "Unable to send invitation. Please retry.");}
    finally{lock.current=false;setBusy(false);}
  };
  return <Modal title="Send interview invitation" open={isModalOpen} onCancel={()=>!busy && setIsModalOpen(false)} centered styles={{body:{maxHeight:"calc(100dvh - 190px)",overflowY:"auto",paddingRight:4}}} footer={<Button block type="primary" loading={busy} onClick={()=>form.submit()}>{completed ? "Send retake invitation" : "Send invitation"}</Button>} width={600} destroyOnClose maskClosable={!busy}>
    <p><strong>{selectedCandidate.candidateName}</strong><br/>{selectedCandidate.to}<br/>{selectedCandidate.JobTitle}</p>
    <Form form={form} layout="vertical" onFinish={submit}>
      <Form.Item name="type" label="Interview type" rules={[{required:true}]}><Radio.Group optionType="button" buttonStyle="solid" options={[{label:"Video interview",value:"video"},{label:"Coding round",value:"coding"}]}/></Form.Item>
      {completed && <Alert style={{marginBottom:16}} type="info" showIcon message="Invite to retake" description="The completed attempt will be archived with its results before the new attempt begins."/>}
      {type === "coding" ? <Form.Item name="level" label="Difficulty" rules={[{required:true}]}><Select options={["easy","medium","hard"].map(value=>({value,label:value}))}/></Form.Item> : <Form.Item name="isCodingRound" label="Include coding questions within the video interview"><Radio.Group options={[{label:"No",value:false},{label:"Yes",value:true}]}/></Form.Item>}
      <Form.Item name="useInstructions" label="Add custom instructions?"><Radio.Group options={[{label:"No",value:false},{label:"Yes",value:true}]}/></Form.Item>
      {useInstructions && <Form.Item name="instructions" label="Custom instructions" rules={[{required:true,whitespace:true,message:"Enter instructions or select No."}]}><Input.TextArea rows={3} placeholder="One instruction per line"/></Form.Item>}
      <Form.Item name="expiryHours" label="Invitation validity" rules={[{required:true}]}><Select options={[{value:24,label:"24 hours"},{value:48,label:"48 hours"},{value:72,label:"72 hours"},{value:168,label:"7 days"}]}/></Form.Item>
      <p>Review the recipient and settings before sending. Existing valid invitations retain their instructions, coding settings and expiry. New or expired invitations use the settings selected above.</p>
      {error && <Alert type="error" message={error} style={{marginBottom:16}}/>}

    </Form>
  </Modal>;
}
