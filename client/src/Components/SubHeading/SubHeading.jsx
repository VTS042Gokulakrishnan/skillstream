import React from "react";

import { images } from "../../constants";

const SubHeading = ({ title }) => (
  <div style={{ marginBottom: "1rem" }}>
    <p className="p__cormorant">{title}</p>
    {/* <br/> */}
    {/* <img src={images.spoon} alt="spoon_image" className="spoon__img" /> */}
    <div className="app__menuitem-dash" />

  </div>
);

export default SubHeading;