import React from "react";
import { Link } from "react-router-dom";
import { Modal } from "antd";
import { policies } from "./policies";
import "./PublicSite.css";
export function PolicyContent({ kind }) {
  const policy = policies[kind];
  return (
    <div className="ss-policy-content">
      {policy.sections.map(([title, text], i) => (
        <section id={kind + "-" + i} key={title}>
          <h2>{title}</h2>
          <p>{text}</p>
        </section>
      ))}
    </div>
  );
}
export function PolicyDialog({ kind, onClose }) {
  const policy = policies[kind];
  return (
    <Modal
      open={!!policy}
      onCancel={onClose}
      footer={null}
      width={760}
      className="ss-policy-modal"
      title={policy?.title}
      destroyOnClose
    >
      {policy && (
        <div className="ss-public">
          <p className="ss-lead">{policy.intro}</p>
          <div className="ss-dialog-scroll">
            <PolicyContent kind={kind} />
          </div>
          <div className="ss-dialog-actions">
            <Link to={policy.path} target="_blank" rel="noopener noreferrer">
              Read full {policy.title} ↗
            </Link>
            <button type="button" className="ss-btn" onClick={onClose}>
              Return to signup
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
