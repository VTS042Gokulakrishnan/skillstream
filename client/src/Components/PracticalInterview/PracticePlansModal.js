import React from "react";
import { Alert, Button, Modal } from "antd";
import { ArrowRightOutlined, CheckOutlined, CodeOutlined, SafetyCertificateOutlined, VideoCameraOutlined } from "@ant-design/icons";
import "./PracticePlansModal.css";

export default function PracticePlansModal({ open, onClose, plans, onPurchase, buying, error }) {
  return (
    <Modal title={<span className="practice-plans-eyebrow">INVEST IN YOUR NEXT OPPORTUNITY</span>} open={open} onCancel={onClose}
      className="practice-plans-modal" centered
      footer={null} width={960} closable={!buying} maskClosable={!buying} keyboard={!buying}>
      <div className="practice-plans-heading">
        <h2>Build confidence. Be interview ready.</h2>
        <p>Choose your pace. Every plan includes video and coding practice.</p>
        <div className="practice-plans-types">
          <span><VideoCameraOutlined /> Video interviews</span>
          <span><CodeOutlined /> Coding interviews</span>
        </div>
      </div>
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
      <div className="practice-plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className={`practice-plan-card${plan.id === "pack5" ? " practice-plan-card-featured" : ""}`}>
            <div className="practice-plan-label">{plan.id === "pack5" ? "MORE PRACTICE" : plan.id === "unlimited" ? "ROOM TO GROW" : "A CONFIDENT START"}</div>
            <h3>{plan.name}</h3>
            <div className="practice-plan-price"><span>$</span>{Number(plan.amount / 100).toFixed(2)}<small>USD</small></div>
            <div className="practice-plan-payment">One-time payment</div>
            <p className="practice-plan-description">{plan.description}</p>
            <div className="practice-plan-feature"><CheckOutlined /> {plan.id === "unlimited" ? "No automatic renewal" : "Use your credits at your pace"}</div>
            <Button type="primary" block size="large" className="practice-plan-purchase" loading={buying === plan.id}
              disabled={!!buying || !plan.available} onClick={() => onPurchase(plan.id)}>
              {plan.available ? <>Choose plan <ArrowRightOutlined /></> : "Coming soon"}
            </Button>
          </div>
        ))}
      </div>
      <div className="practice-plans-footer"><SafetyCertificateOutlined /> Secure payment via Stripe <span>•</span> No recurring charges</div>
    </Modal>
  );
}
