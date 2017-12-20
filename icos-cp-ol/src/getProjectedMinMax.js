import proj from "ol/proj";
import {PointsOnGreatCircle} from "./PointsOnGreatCircle";

// Get the min and max values for a reference systems giving the bounding box defined in lat, lng (SRID=4326)
// The min and max values are calculated on the great circle

/*
	Arguments

	bBox4326: Array with coordinate arrays defining the box in SRID=4326
	Example for Lambert projection (SRID=3035):
		[[-16.1, 32.88], [-16.1, 84.17], [39.65, 84.17], [39.65, 32.88], [-16.1, 32.88]]

	projection: ol.proj.Projection

	maxSegLength: Max degrees between each vertex on the great circle
 */

export const getProjectedMinMax = (bBox4326, projection, maxSegLength = 1) => {
	const pointsOnGreatCircle4326 = PointsOnGreatCircle.fromCoords(bBox4326, maxSegLength);
	const pointsOnGreatCircleProj = pointsOnGreatCircle4326.map(c => proj.transform(c, 'EPSG:4326', projection));
	return pointsOnGreatCircleProj.reduce((acc, curr) => {
		if (curr[0] < acc.minX) acc.minX = curr[0];
		if (curr[1] < acc.minY) acc.minY = curr[1];
		if (curr[0] > acc.maxX) acc.maxX = curr[0];
		if (curr[1] > acc.maxY) acc.maxY = curr[1];

		return acc;
	}, {minX: Number.MAX_VALUE, minY: Number.MAX_VALUE, maxX: 0, maxY: 0});
};