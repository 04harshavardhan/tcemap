import ImageLayer from "ol/layer/Image";
import Map from "ol/Map";
import Projection from "ol/proj/Projection";
import Static from "ol/source/ImageStatic";
import View from "ol/View";
import { getCenter } from "ol/extent";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";

// Map views always need a projection.  Here we just want to map image
// coordinates directly to map coordinates, so we create a projection that uses
// the image extent in pixels.
const extent = [0, 0, 636.96, 680];
const projection = new Projection({
  code: "static-image",
  units: "pixels",
  extent: extent,
});

const map = new Map({
  layers: [
    new ImageLayer({
      source: new Static({
        url: "./map/map_vector.svg",
        projection: projection,
        imageExtent: extent,
      }),
    }),
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: "map",
  view: new View({
    projection: projection,
    center: [380, 320],
    zoom: 3,
    maxZoom: 20,
  }),
});
