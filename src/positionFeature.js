import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Point from "ol/geom/Point";

import Geolocation from "ol/Geolocation";

class PositionTracker extends VectorLayer {
  constructor(options) {
    const view = options.view;

    const geolocation = new Geolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: view.getProjection(),
    });

    const positionMark = new Feature();
    positionMark.set("fill-color", "#3399CC");
    positionMark.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: "#3399CC",
          }),
          stroke: new Stroke({
            color: "#fff",
            width: 2,
          }),
        }),
      })
    );

    geolocation.on("change:position", function () {
      const coordinates = geolocation.getPosition();
      positionMark.setGeometry(coordinates ? new Point(coordinates) : null);
    });

    const accuracyMark = new Feature();
    accuracyMark.set("fill-color", "#3399CC");

    geolocation.on("change:accuracyGeometry", function () {
      const accuracy = geolocation.getAccuracy();

      if (accuracy > 90) {
        alert("Errot: Cannot get your accurate location");
        accuracyMark.setGeometry(null);
        return;
      }

      accuracyMark.setGeometry(geolocation.getAccuracyGeometry());
    });

    geolocation.setTracking(true);
    console.log(geolocation.getPosition());

    positionMark.setGeometry(
      geolocation.getPosition() ? new Point(geolocation.getPosition()) : null
    );

    super({
      source: new VectorSource({
        features: [accuracyMark, positionMark],
      }),
    });

    this.geolocation = geolocation;
  }
}

export default PositionTracker;
