import { useEffect } from "react";

const useScript = () => {
  useEffect(() => {
    //     const scriptUrls = [
    //       "/js/anm.min.js",
    //       "/js/appear.js",
    //       "/js/bootstrap.min.js",
    //       "/js/chart.min.js",
    //       "/js/chosen.min.js",
    //       "/js/infobox.min.js",
    //       "/js/jquery-ui.min.js",
    //       "/js/jquery.fancybox.js",
    //       "/js/jquery.js",
    //       "/js/jquery.modal.min.js",
    //       "/js/knob.js",
    //       "/js/map-script.js",
    //       "/js/maps.js",
    //       "/js/markerclusterer.js",
    //       "/js/mmenu.js",
    //       "/js/mmenu.polyfills.js",
    //       "/js/owl.js",
    //       "/js/popper.min.js",
    //       "/js/rellax.min.js",
    //       // "/js/script.js",
    //       "/js/ScrollMagic.min.js",
    //       "/js/select2.min.js",
    //       "/js/wow.js",
    //       // Add more script URLs as needed
    //     ];
    //     // Dynamically create script elements and append them to the document head
    //     const scriptElements = scriptUrls.map((url) => {
    //       const script = document.createElement("script");
    //       script.src = url;
    //       script.async = true;
    //       document.head.appendChild(script);
    //       return script;
    //     });

    //     // Cleanup function to remove script elements when the component unmounts
    //     return () => {
    //       scriptElements.forEach((script) => {
    //         document.head.removeChild(script);
    //       });
    //     };

    // const script = document.createElement("script");
    // script.src = "js/script.js"; // Adjust the path based on your project structure
    // script.async = true;
    // document.body.appendChild(script);

    // return () => {
    //   // Clean up the script when the component unmounts
    //   document.body.removeChild(script);
    // };
  }, []);
  //   return {};
};

export default useScript;
