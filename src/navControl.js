import { Control } from "ol/control";
import { toLonLat } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { Feature } from "ol";
import Polyline from "ol/format/Polyline";

import { Directions } from "openrouteservice-js";

class NavControl extends Control {
  constructor(options) {
    const { position, select, add } = options;

    const element = document.createElement("div");
    element.id = "NavControl";
    element.className = "ol-control ol-nav";

    const ctrlBtn = document.createElement("button");
    ctrlBtn.className = "ol-nav-btn";
    ctrlBtn.innerHTML = `<span class="material-symbols-outlined">
    near_me
    </span>`;

    ctrlBtn.addEventListener("click", () => {
      let start = position.geolocation.getPosition();
      let end = select.coordinate;

      if (!start || !end) {
        return;
      }

      start = toLonLat(start);
      end = toLonLat(end);

      this.showDirections({ start, end, add: this.add });
    });

    element.appendChild(ctrlBtn);

    super({
      element: element,
    });

    this.orsDirections = new Directions({
      api_key: "5b3ce3597851110001cf6248161862a96c61450382947a3bf70bb77b",
    });
    this.add = add;
  }

  showDirections({ start, end, add }) {
    this.orsDirections
      .calculate({
        coordinates: [start, end],
        profile: "foot-walking",
        format: "geojson",
      })
      .then(function (json) {
        const route = new GeoJSON().readFeatures(json);

        console.log(route);

        // const { geometry } = json.features[0];
        // const feature = json.features[0];

        // const route = new Polyline().readGeometry(geometry, {
        //   dataProjection: "EPSG:4326",
        //   featureProjection: "EPSG:3857",
        // });

        add(route);
      })
      .catch(function (err) {
        console.error(err);
      });
  }
}

export default NavControl;
