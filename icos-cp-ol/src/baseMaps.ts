import TileLayer from "ol/layer/Tile";
import { Options } from "ol/layer/BaseTile";
import OSM, { ATTRIBUTION } from "ol/source/OSM";
import XYZ from 'ol/source/XYZ';
import TileSource from "ol/source/Tile";
import TileGrid from "ol/tilegrid/TileGrid";
import { Extent } from "ol/extent";
import { Coordinate } from "ol/coordinate";
import { EpsgCode, getProjection } from "./projections";

export const lmTilesBaseUrl = 'https://tiles.fieldsites.se';

export const lm3006Grid: { origin: Coordinate, extent: Extent, resolutions: number[] } = {
	origin: [-1200000, 8500000],
	extent: [-1200000, 4305696, 2994304, 8500000],
	resolutions: [4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5]
};

const createLm3006Source = (layer: 'topowebb' | 'topowebb_nedtonad') => () => new XYZ({
	url: `${lmTilesBaseUrl}/wmts/${layer}/lm_3006/{z}/{x}/{y}.png`,
	projection: getProjection('EPSG:3006')!,
	tileGrid: new TileGrid({ ...lm3006Grid, tileSize: 256 }),
	crossOrigin: 'anonymous',
	attributions: '© Lantmäteriet',
	wrapX: false
});

export type BaseMapId = 'openStreetMap' | 'watercolor' | 'imagery' | 'topography' | 'ocean' | 'physical' | 'shadedRelief' | 'lmTopo' | 'lmTopoGray'
export type BaseMapName = 'OpenStreetMap' | 'Watercolor' | 'Imagery' | 'Topography' | 'Ocean' | 'Physical' | 'Shaded relief' | 'LM Topo' | 'LM Topo gray'
export interface BasemapOptions extends Options<TileSource> {
	id: BaseMapId
	label: BaseMapName
	isEsri: boolean
	isWorldWide: boolean
	visibility?: boolean
	esriServiceName?: string
	layerType?: 'baseMap' | 'toggle'
	nativeEpsg?: EpsgCode
	createSource?: () => TileSource
}

export class TileLayerExtended extends TileLayer<TileSource> {
	constructor(props: BasemapOptions) {
		super(props);
	}
}

export const defaultBaseMaps: BasemapOptions[] = [
	{
		id: 'openStreetMap',
		label: 'OpenStreetMap',
		isEsri: false,
		isWorldWide: true,
		source: new OSM({
			attributions: ATTRIBUTION,
			crossOrigin: 'anonymous'
		})
	},
	{
		id: 'imagery',
		label: 'Imagery',
		isEsri: true,
		isWorldWide: true,
		esriServiceName: 'World_Imagery',
		source: new XYZ({
			url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			crossOrigin: 'anonymous'
		})
	},
	{
		id: 'topography',
		label: 'Topography',
		isEsri: true,
		isWorldWide: true,
		esriServiceName: 'World_Topo_Map',
		source: new XYZ({
			url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
			attributions: 'Fetching from server...',
			crossOrigin: 'anonymous'
		})
	},
	{
		id: 'ocean',
		label: 'Ocean',
		isEsri: true,
		isWorldWide: true,
		esriServiceName: 'Ocean_Basemap',
		source: new XYZ({
			url: 'https://server.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
			crossOrigin: 'anonymous'
		})
	},
	{
		id: 'physical',
		label: 'Physical',
		isEsri: true,
		isWorldWide: true,
		source: new XYZ({
			url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
			attributions: "Source: US National Park Service",
			crossOrigin: 'anonymous'
		})
	},
	{
		id: 'shadedRelief',
		label: 'Shaded relief',
		isEsri: true,
		isWorldWide: true,
		source: new XYZ({
			url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
			attributions: "Copyright:(c) 2014 Esri",
			crossOrigin: 'anonymous'
		})
	},
	{
		id: 'lmTopo',
		label: 'LM Topo',
		isEsri: false,
		isWorldWide: false,
		nativeEpsg: 'EPSG:3006',
		createSource: createLm3006Source('topowebb')
	},
	{
		id: 'lmTopoGray',
		label: 'LM Topo gray',
		isEsri: false,
		isWorldWide: false,
		nativeEpsg: 'EPSG:3006',
		createSource: createLm3006Source('topowebb_nedtonad')
	}
];

export const esriBaseMapNames = defaultBaseMaps.filter(bm => bm.esriServiceName).map(bm => bm.esriServiceName);
