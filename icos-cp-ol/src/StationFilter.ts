import {LayerWrapper} from "./OLWrapper";
import {Dict, VectorLayerExtended} from "./utils";
import {Vars} from "icos-cp-backend";

export type LayerFilterFn = (
	layer: VectorLayerExtended,
	selectedCountry: string,
	showNonLabelledStations: boolean
) => void
export type FilterFn = (stationFilter: StationFilter, selectedCountry: string, showNonLabelledStations?: boolean) => void

export default class StationFilter {
	public stationsToFilter: LayerWrapper[]
	public stationNames: string[]
	public filterFn: FilterFn
	public countryList: {name: string, val: string}[]
	public selectedCountry: string
	public showNonLabelledStations: boolean

	constructor(toggleLayers: LayerWrapper[], filterFn: FilterFn, countryLookup: Dict | null){
		this.stationsToFilter = toggleLayers.filter(tl => tl.geoType === 'point' || tl.id === 'ship');
		this.stationNames = this.stationsToFilter.map(themeStations => themeStations.label);
		this.filterFn = filterFn;

		this.countryList = countryLookup
			? this.getCountryList(countryLookup)
			: [];

		this.selectedCountry = "0";
		this.showNonLabelledStations = true;
	}

	private getCountryList(countryLookup: Dict){
		const iso2Filtered = this.stationsToFilter.reduce<Set<string>>((acc, theme) => {
			const stations = theme.data;

			if (Array.isArray(stations)) {
				stations.forEach(station => acc.add(station.attributes[Vars.country] as string));

			} else {
				stations.features.forEach(feature => {
					if (feature.properties)
						acc.add(feature.properties[Vars.country]);
				});
			}
			return acc;
		}, new Set());

		return Array.from(iso2Filtered).map((code: string) => {
			const name = countryLookup[code].length > 20
				? countryLookup[code].slice(0, 19) + '...'
				: countryLookup[code];
			return {
				val: code,
				name
			};
		}).sort((a, b) => a.name < b.name ? -1 : 1);
	}
}
