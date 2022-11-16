import Map from "ol/Map";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import { transformExtent } from "ol/proj";

import { apply } from "ol-mapbox-style";

const map = new Map({
  view: new View({
    center: fromLonLat([78.0821981, 9.8825961]),
    zoom: 14,
    extent: transformExtent(
      [78.076, 9.881, 78.0843161, 9.886],
      "EPSG:4326",
      "EPSG:3857"
    ),
  }),
  target: "map",
});

const key = "DNUOQKVElTwz2D4TwG0V";
const styleJson = `https://api.maptiler.com/maps/15fbb120-02b7-4fd2-ac02-00928b0ef7d5/style.json?key=${key}`;

apply(map, styleJson);
