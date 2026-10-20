import React from "react";

import "./MenuItem.css";
// import { Descriptions } from "antd";

// Лучше перезагрузить локал хост для тяги данных

const MenuItem = ({ title, description, tags }) => (
  <div className="app__menuitem">
    <div className="app__menuitem-head">
      <div className="app__menuitem-name">
        <p className="p__cormorant" style={{ color: "#DCCA87" }}>
          {title}
        </p>
      </div>
      {/* <div className="app__menuitem-dash" /> */}
      {/* <div className="app__menuitem-price">
        <p className="p__cormorant">{description}</p>
      </div> */}
    </div>
    <div className="app__menuitem-dash" />

    <div className="app__menuitem-sub">
      <p className="p__opensans" style={{ color: "#AAAAAA" }}>
        {description}
      </p>
    </div>
  </div>
);

export default MenuItem;
