import GeoJSON from "ol/format/GeoJSON";
import Map from "ol/Map";
import Select from "ol/interaction/Select";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Overlay from "ol/Overlay";
import { getCenter } from "ol/extent";
import View from "ol/View";
import { Fill, Stroke, Style, Text } from "ol/style";
import { click } from "ol/events/condition";
import { fromLonLat, transformExtent, toLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import CircleStyle from "ol/style/Circle";
import Geolocation from "ol/Geolocation";

import SearchControl from "./searchControl";
import NavControl from "./navControl";
import PositionTracker from "./positionFeature";

import { apply } from "ol-mapbox-style";
import { Feature } from "ol";

const style = new Style({
  fill: new Fill({
    color: "#C3C3D2",
  }),
  text: new Text({}),
});

const vectorSource = new VectorSource({
  url: "buildings.json",
  format: new GeoJSON(),
});

const view = new View({
  center: fromLonLat([78.0821981, 9.8825961]),
  zoom: 17,
  extent: transformExtent(
    [78.076, 9.877, 78.086, 9.886],
    "EPSG:4326",
    "EPSG:3857"
  ),
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

const navSource = new VectorSource();

const navigationLayer = new VectorLayer({
  source: navSource,
  // style: function (feature) {
  //   const color = feature.get("fill-color") || "#C3C3D2";
  //   const label = feature.get("name");
  //   style.getText().setText(label);
  //   style.getFill().setColor(color);
  //   return style;
  // },
});

const positionCircle = new PositionTracker({ view });

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

const map = new Map({
  layers: [vectorLayer, positionCircle],
  overlays: [popupOverlay],
  target: "map",
  view,
});

const key = "DNUOQKVElTwz2D4TwG0V";

const styleJson = `https://api.maptiler.com/maps/15fbb120-02b7-4fd2-ac02-00928b0ef7d5/style.json?key=${key}`;

// apply maptiler style
apply(map, styleJson);

map.addLayer(navigationLayer);

const selected = new Style({
  fill: new Fill({
    color: "#C3C3D2",
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
selectClick.on("select", function (e = {}) {
  const feature = e.target.getFeatures().item(0);

  if (!feature) {
    popupOverlay.setPosition(undefined);
    closer.blur();
    return;
  }

  const event = e.mapBrowserEvent;
  let coordinate;

  if (!event) {
    const extent = feature.getGeometry().getExtent();
    coordinate = getCenter(extent);
  } else {
    coordinate = event.coordinate;
  }

  const location = feature.get("name");

  if (!location) {
    popupOverlay.setPosition(undefined);
    closer.blur();
    return;
  }

  content.innerHTML = `<p>${location}</p>`;
  popupOverlay.setPosition(coordinate);
  selectClick.coordinate = coordinate;
});

const searchBar = new SearchControl({
  source: [vectorSource],
  select: selectClick,
});

map.addControl(searchBar);

// const navigation = new NavControl({
//   position: positionCircle,
//   select: selectClick,
//   add: (route) => {
//     // const feature = new Feature(route);
//     // console.log(feature);
//     vectorSource.addFeatures(route);
//     // navSource.addFeature(new Feature(new Circle([5e6, 7e6], 1e6)));

//     // console.log(navSource.getFeatures());
//   },
// });

// map.addControl(navigation);
