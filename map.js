import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { transformExtent } from "ol/proj";

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
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: "map",
});
