import React from "react";

import { SubHeading, MenuItem } from "../../Components";
import { data, images } from "../../constants";
import features from "../../assets/facial-recognition-collage-concept (2).jpg"
import "./SpecialMenu.css";

// Лучше перезагрузить локал хост для тяги данных

const SpecialMenu = () => (
  <div className="app__specialMenu flex__center section__padding" id="menu">
    <div className="app__specialMenu-title">
      <SubHeading title="Discover the Benefits of Our Job Board" />
      <h1 className="headtext__cormorant">Feature&apos;s</h1>
    </div>

    <div className="app__specialMenu-menu">
      <div className="app__specialMenu-menu_wine  flex__center">
        {/* <p className="app__specialMenu-menu_heading">Key Features</p> */}
        <div className="app__specialMenu_menu_items">
          {data.features.map((wine, index) => (
            <MenuItem
              key={wine.title + index}
              title={wine.title}
              // description={wine.description}
              description={wine.description}
            />
          ))}
        </div>
      </div>

      <div className="app__specialMenu-menu_img">
        <img src={features} alt="menu__img" />
      </div>

      <div className="app__specialMenu-menu_cocktails  flex__center">
        {/* <p className="app__specialMenu-menu_heading">Cocktails</p> */}
        <div className="app__specialMenu_menu_items">
          {data.benefits.map((cocktail, index) => (
            <MenuItem
              key={cocktail.title + index}
              title={cocktail.title}
              // description={cocktail.description}
              description={cocktail.description}
            />
          ))}
        </div>
      </div>
    </div>

    {/* <div style={{ marginTop: 15 }}>
      <button type="button" className="custom__button">
        View More
      </button>
    </div> */}
  </div>
);

export default SpecialMenu;
