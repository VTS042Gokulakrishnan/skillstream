import React from "react";

const Drager = () => {
  return (
    <div>
      {" "}
      <div class="uploading-resume">
        <div class="uploadButton">
          <input
            class="uploadButton-input"
            type="file"
            name="attachments[]"
            accept="image/*, application/pdf"
            id="upload"
            // onChange={InputChange}
            multiple
          />
          <label class="cv-uploadButton" for="upload">
            <span class="title">Drop files here to upload</span>
            <span class="text">
              To upload file size is (Max 5Mb) and allowed file types are (.doc,
              .docx, .pdf)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Drager;
