import { Bounds, CRS, LatLng, Point, Transformation, Util } from 'leaflet';
import proj4 from 'proj4';

export type CrsOptions = {
	code: string
	proj4Def: string
	origin: [number, number]
	resolutions: number[] // Meters per pixel for each zoom level, from zoom 0 (coarsest) upwards
	bounds: [number, number, number, number]
}

export function createCrs({ code, proj4Def, origin, resolutions, bounds }: CrsOptions): CRS {
	const converter = proj4('EPSG:4326', proj4Def);
	const scales = resolutions.map(resolution => 1 / resolution);
	const maxZoom = resolutions.length - 1;

	// Leaflet asks for fractional and out-of-range zooms during animations and pinch zoom,
	// so interpolate geometrically between the neighboring levels and extrapolate past the ends.
	const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
	const lowerLevelForZoom = (zoom: number) => clamp(Math.floor(zoom), 0, maxZoom - 1);
	const lowerLevelForScale = (scale: number) => {
		const firstLevelAbove = scales.findIndex(levelScale => levelScale > scale);
		const lowerLevel = firstLevelAbove === -1 ? maxZoom : firstLevelAbove - 1;
		return clamp(lowerLevel, 0, maxZoom - 1);
	};
	const levelRatio = (level: number) => scales[level + 1] / scales[level];

	function scaleForZoom(zoom: number) {
		if (Number.isInteger(zoom) && zoom >= 0 && zoom <= maxZoom) {
			return scales[zoom];
		}

		const level = lowerLevelForZoom(zoom);
		return scales[level] * Math.pow(levelRatio(level), zoom - level);
	}

	function zoomForScale(scale: number) {
		const exactLevel = scales.indexOf(scale);
		if (exactLevel !== -1) {
			return exactLevel;
		}

		const level = lowerLevelForScale(scale);
		return level + Math.log(scale / scales[level]) / Math.log(levelRatio(level));
	}

	const projection = {
		project: (latLng: LatLng) => {
			const [x, y] = converter.forward([latLng.lng, latLng.lat]);
			return new Point(x, y);
		},
		unproject: (point: Point) => {
			const [lng, lat] = converter.inverse([point.x, point.y]);
			return new LatLng(lat, lng);
		},
		bounds: new Bounds(new Point(bounds[0], bounds[1]), new Point(bounds[2], bounds[3]))
	};

	return Util.extend({}, CRS.Earth, {
		code,
		projection,
		transformation: new Transformation(1, -origin[0], -1, origin[1]),
		scale: scaleForZoom,
		zoom: zoomForScale,
		infinite: false,
		wrapLng: undefined,
		wrapLat: undefined
	}) as CRS;
}
