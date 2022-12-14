import { Control } from "ol/control";
import { toLonLat } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { Feature } from "ol";
import Polyline from "ol/format/Polyline";
import Style from "ol/style/Style";
import { Stroke } from "ol/style";

import LineString from "ol/geom/LineString";
import { Directions } from "openrouteservice-js";

class NavControl extends Control {
  constructor(options) {
    const { position, select, add, remove } = options;

    const element = document.createElement("div");
    element.id = "NavControl";
    element.className = "ol-control ol-nav";

    const ctrlBtn = document.createElement("button");
    ctrlBtn.className = "ol-nav-btn";
    ctrlBtn.innerHTML = `<span class="material-symbols-outlined">
    near_me
    </span>`;

    ctrlBtn.addEventListener("click", () => {
      if (this.routeOn) {
        this.remove();
        this.ctrlBtn.innerHTML = `
        <span class="material-symbols-outlined">
        near_me
        </span>`;
        this.routeOn = false;
        return;
      }
      let start = position.geolocation.getPosition();
      let end = select.coordinate;

      if (!start || !end) {
        return;
      }

      start = toLonLat(start);
      end = toLonLat(end);

      this.showRoute({ start, end, add: this.add });
      this.ctrlBtn.innerHTML = `
      <span class="material-symbols-outlined">
      close
      </span>`;
      this.routeOn = true;
    });

    element.appendChild(ctrlBtn);

    super({
      element: element,
    });

    this.orsDirections = new Directions({
      api_key: "5b3ce3597851110001cf6248161862a96c61450382947a3bf70bb77b",
    });
    this.ctrlBtn = ctrlBtn;
    this.add = add;
    this.remove = remove;
    this.routeOn = false;
  }

  createRoute(polyline) {
    // route is ol.geom.LineString
    const route = new Polyline({
      factor: 1e5,
    }).readGeometry(polyline, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    const styles = {
      route: new Style({
        stroke: new Stroke({
          width: 6,
          color: [40, 40, 40, 0.8],
        }),
      }),
    };

    const feature = new Feature({
      type: "route",
      geometry: route,
    });
    feature.setStyle(styles.route);
    return feature;
  }

  showRoute({ start, end, add }) {
    this.orsDirections
      .calculate({
        coordinates: [start, end],
        profile: "foot-walking",
        format: "geojson",
      })
      .then(function (json) {
        const route = new Feature({
          geometry: new LineString(
            json.features[0].geometry.coordinates
          ).transform("EPSG:4326", "EPSG:3857"),
        });

        add(route);
      })
      .catch(function (err) {
        console.error(err);
      });
  }
}

export default NavControl;
