import {TileMappingHelper} from '../lib/TileMappingHelper';
import {Bbox} from '../lib/Bbox';
import {BboxMapping} from '../lib/BboxMapping';

describe("TileMappingHelper", () => {

	it("Works for the case of date-line-meridian-centered raster shown on Greenwich-centered map", () => {
		let dsPixels = new Bbox(0, 0, 720, 360);
		let dsCoords = new Bbox(0, -90, 360, 90);
		let dsMapping = new BboxMapping(dsCoords, dsPixels);
		let worldBox = new Bbox(-180, -90, 180, 90);

		let tileHelper = new TileMappingHelper(dsMapping, worldBox);

		let tileCoords = new Bbox(-10, -10, 10, 10);
		let tilePixels = new Bbox(0, 0, 256, 256);
		let tileMapping = new BboxMapping(tileCoords, tilePixels);
		let pixelMaps = tileHelper.getCoordinateMappings(tileMapping);

		expect(pixelMaps).toContain(new BboxMapping(new Bbox(0, 160, 20, 200), new Bbox(128, 0, 256, 256)));
		expect(pixelMaps).toContain(new BboxMapping(new Bbox(700, 160, 720, 200), new Bbox(0, 0, 128, 256)));
	});

});
