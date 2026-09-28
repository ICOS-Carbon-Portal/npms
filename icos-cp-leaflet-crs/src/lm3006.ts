import { LatLngBounds, Point } from 'leaflet';
import { createCrs } from './createCrs.js';

export const crs3006 = createCrs({
	code: 'EPSG:3006',
	proj4Def: '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
	origin: [-1200000, 8500000],
	resolutions: [4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5],
	bounds: [-1200000, 4305696, 2994304, 8500000]
});

export const lm3006MaxZoom = 13;

const [[minX, minY], [maxX, maxY]] = [[190000, 6101648], [970000, 7689478]];
const swedenCorners = [[minX, minY], [minX, maxY], [maxX, minY], [maxX, maxY]]
	.map(([x, y]) => crs3006.unproject(new Point(x, y)));

export const swedenLatLngBounds = new LatLngBounds(swedenCorners);
