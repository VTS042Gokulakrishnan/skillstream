import React from "react";
import { Alert } from "antd";

const DocPreview = ({ fileUrl }) => {
//   console.log(fileUrl);
  if (!fileUrl) return null;

  // Google Docs Viewer URL
  const googleDocUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
    fileUrl
  )}&embedded=true`;

  return (
    <div>
      {/* Info message */}
      <Alert
        message="Note: Keyword highlighting is not supported for .doc files in Resume Viewer."
        type="info"
        showIcon
        style={{margin:15 }}
      />

      {/* Google Docs Viewer */}
      <iframe
        src={googleDocUrl}
        title="DOC Resume"
        style={{
          width: "100%",
          height: "85vh",
          border: "none",
          borderRadius: 8,
        }}
      ></iframe>
    </div>
  );
};

export default DocPreview;
