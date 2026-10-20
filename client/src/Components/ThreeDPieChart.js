import React from "react";
import Plot from "react-plotly.js";

const ThreeDPieChart = () => {
  return (
    <div className="flex justify-center items-center h-[400px]">
      <Plot
        data={[
          {
            type: "pie",
            values: [30, 40, 30],
            labels: ["Marketing", "Development", "Sales"],
            hole: 0.4,
            textinfo: "label+percent",
            textposition: "outside",
            pull: [0.05, 0.05, 0.05], // slight separation
            marker: {
              colors: ["#636EFA", "#EF553B", "#00CC96"],
              line: {
                color: "#fff",
                width: 2,
              },
            },
          },
        ]}
        layout={{
          title: "3D-Style Donut Chart",
          height: 400,
          width: 500,
          showlegend: false,
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: {
            color: "#fff",
            size: 14,
          },
        }}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default ThreeDPieChart;
