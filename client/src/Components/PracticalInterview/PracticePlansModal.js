import React from "react";
import { Alert, Button, Modal } from "antd";

export default function PracticePlansModal({ open, onClose, plans, onPurchase, buying, error }) {
  return (
    <Modal title="Choose your practice plan" open={open} onCancel={onClose}
      footer={null} width={780} closable={!buying} maskClosable={!buying} keyboard={!buying}>
      <p>Choose a plan to continue to secure payment.</p>
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {plans.map((plan) => (
          <div key={plan.id} style={{ border: "1px solid #d9e2ee", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column" }}>
            <h3>{plan.name}</h3>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#1967d2" }}>
              ${Number(plan.amount / 100).toFixed(2)}
            </p>
            <p style={{ flex: 1 }}>{plan.description}</p>
            <Button type="primary" block loading={buying === plan.id}
              disabled={!!buying || !plan.available} onClick={() => onPurchase(plan.id)}>
              {plan.available ? "Purchase" : "Coming soon"}
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
