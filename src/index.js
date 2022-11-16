import GeoJSON from "ol/format/GeoJSON";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Overlay from "ol/Overlay";
import View from "ol/View";
import { Fill, Stroke, Style } from "ol/style";
import { fromLonLat } from "ol/proj";
import { transformExtent } from "ol/proj";
import { toStringHDMS } from "ol/coordinate";

import { apply } from "ol-mapbox-style";

const style = new Style({
  fill: new Fill({
    color: "#8c66be",
  }),
});

const vectorLayer = new VectorLayer({
  source: new VectorSource({
    url: "./map/buildings.json",
    format: new GeoJSON(),
  }),
  style: function (feature) {
    const color = feature.get("color") || "#8c66be";
    style.getFill().setColor(color);
    return style;
  },
});

const featureOverlay = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    stroke: new Stroke({
      color: "rgba(255, 255, 255, 0.7)",
      width: 2,
    }),
  }),
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

const key = "DNUOQKVElTwz2D4TwG0V";

const map = new Map({
  layers: [vectorLayer, featureOverlay],

  overlays: [popupOverlay],
  target: "map",
  view: new View({
    center: fromLonLat([78.0821981, 9.8825961]),
    zoom: 14,
    extent: transformExtent(
      [78.076, 9.881, 78.0843161, 9.886],
      "EPSG:4326",
      "EPSG:3857"
    ),
  }),
});

const styleJson = `https://api.maptiler.com/maps/15fbb120-02b7-4fd2-ac02-00928b0ef7d5/style.json?key=${key}`;

apply(map, styleJson);

let highlight;
function displayFeatureInfo(pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    return feature;
  });

  if (feature) {
    // popup
  } else {
    // remove popup
  }

  if (feature !== highlight) {
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
    }
    highlight = feature;
  }
}

map.on("pointermove", function (evt) {
  if (evt.dragging) {
    return;
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel);
});

map.on("click", function (evt) {
  displayFeatureInfo(evt.pixel);
});

// closer.onclick = function () {
//   overlay.setPosition(undefined);
//   closer.blur();
//   return false;
// };

map.on("singleclick", function (evt) {
  const coordinate = evt.coordinate;
  const hdms = toStringHDMS(toLonLat(coordinate));

  content.innerHTML = "<p>You clicked here:</p><code>" + hdms + "</code>";
  overlay.setPosition(coordinate);
});
