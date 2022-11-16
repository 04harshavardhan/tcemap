import GeoJSON from "ol/format/GeoJSON";
import Map from "ol/Map";
import Select from "ol/interaction/Select";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Overlay from "ol/Overlay";
import View from "ol/View";
import { Fill, Stroke, Style, Text } from "ol/style";
import { click } from "ol/events/condition";
import { fromLonLat, transformExtent, toLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";

import SearchControl from "./searchControl";

import { apply } from "ol-mapbox-style";

const style = new Style({
  fill: new Fill({
    color: "#eeeeee",
  }),
  text: new Text({}),
});

const vectorSource = new VectorSource({
  url: "./map/buildings.json",
  format: new GeoJSON(),
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
  background: "#eeeeee",
  style: function (feature) {
    const color = feature.get("fill-color") || "#C3C3D2";
    const label = feature.get("name");
    style.getText().setText(label);
    style.getFill().setColor(color);
    return style;
  },
});

const container = document.getElementById("popup");
const content = document.getElementById("popup-content");
const closer = document.getElementById("popup-closer");

const popupOverlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

closer.onclick = function () {
  popupOverlay.setPosition(undefined);
  closer.blur();
  return false;
};

const searchBar = new SearchControl({
  source: [vectorSource],
});

const map = new Map({
  controls: defaultControls().extend([searchBar]),
  layers: [vectorLayer],
  overlays: [popupOverlay],
  target: "map",
  view: new View({
    center: fromLonLat([78.0821981, 9.8825961]),
    zoom: 17,
    extent: transformExtent(
      [78.076, 9.877, 78.086, 9.886],
      "EPSG:4326",
      "EPSG:3857"
    ),
  }),
});

const key = "DNUOQKVElTwz2D4TwG0V";

const styleJson = `https://api.maptiler.com/maps/15fbb120-02b7-4fd2-ac02-00928b0ef7d5/style.json?key=${key}`;

// apply maptiler style
apply(map, styleJson);

const selected = new Style({
  fill: new Fill({
    color: "#202020",
  }),
  stroke: new Stroke({
    color: "rgba(255, 255, 255, 0.7)",
    width: 2,
  }),
});

function selectStyle(feature) {
  const color = feature.get("fill-color") || "#C3C3D2";
  selected.getFill().setColor(color);
  return selected;
}

// select interaction working on "click"
const selectClick = new Select({
  condition: click,
  style: selectStyle,
});

map.addInteraction(selectClick);
selectClick.on("select", function (e) {
  const feature = e.target.getFeatures().item(0);

  if (!feature) {
    popupOverlay.setPosition(undefined);
    closer.blur();
    return;
  }

  const location = feature.get("name");

  if (!location) {
    popupOverlay.setPosition(undefined);
    closer.blur();
    return;
  }
  const coordinate = e.mapBrowserEvent.coordinate;

  content.innerHTML = `<p>${location}</p>`;
  popupOverlay.setPosition(coordinate);
});
