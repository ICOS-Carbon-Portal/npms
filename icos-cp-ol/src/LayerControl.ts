import Control, { Options } from 'ol/control/Control';
import Map from 'ol/Map';
import BaseLayer from 'ol/layer/Base';
import {BaseMapId} from './baseMaps';
import {findLayers} from './utils';
import StationFilter from './StationFilter';
import { PersistedMapProps } from './OLWrapper';

export interface LayerControlOptions extends Options {
	selectedBaseMap: BaseMapId
	useCountrySelector?: boolean
	updateLayerGroups?: (map: Map) => () => void
	updateCtrl: (self: LayerControl) => () => void
}

export type ControlToggleLayer = {
	id: string
	visible: boolean
}

export default class LayerControl extends Control {
	public map?: Map;
	public countrySelector: HTMLSelectElement | undefined
	public layersDiv: HTMLElement
	public updateCtrl: () => void
	public selectedBaseMap?: BaseMapId
	public useCountrySelector: boolean;

	constructor(options: LayerControlOptions){

		const rootElement = options.element;
		if (rootElement === undefined)
			throw new Error("Root element for LayerControl is undefined. Check parameter 'element' in options.");

		super({
			element: options.element,
			target: options.target
		});

		this.selectedBaseMap = options.selectedBaseMap;
		this.updateCtrl = options.updateCtrl(this);
		this.useCountrySelector = options.useCountrySelector ?? false;
		this.countrySelector = undefined;

		const switchBtn = document.createElement('button');
		switchBtn.setAttribute('class', 'ol');
		this.layersDiv = document.createElement('div');
		this.layersDiv.setAttribute('style', 'display: none;');

		switchBtn.addEventListener('mouseenter', _ => {
			switchBtn.setAttribute('style', 'display: none;');
			this.layersDiv.setAttribute('style', 'display: inline;');
		});
		rootElement.addEventListener('mouseout', e => {
			if (e.target !== this.countrySelector && (!rootElement.contains(e.relatedTarget as Element))) {
				switchBtn.setAttribute('style', 'display: inline;');
				this.layersDiv.setAttribute('style', 'display: none;');
			}
		});

		this.element.appendChild(switchBtn);
		this.element.appendChild(this.layersDiv);
	}

	get baseMaps(): BaseLayer[] {
		return this.map === undefined
			? []
			: findLayers(this.map, (l) => l.get('layerType') === 'baseMap');
	}

	get toggles(): BaseLayer[] {
		return this.map === undefined
			? []
			: findLayers(this.map, (l) => l.get('layerType') === 'toggle');
	}

	get visibleToggleLayerIds(): string[] {
		return this.map === undefined
			? []
			: findLayers(this.map, (l) => l.get('layerType') === 'toggle' && l.getVisible())
				.map(layer => layer.get('id'));
	}

	toggleBaseMaps(baseMapToActivate: string) {
		this.selectedBaseMap = baseMapToActivate as BaseMapId;
		this.baseMaps.forEach(bm => {
			bm.setVisible(bm.get('id') === baseMapToActivate);
		});

		this.changed();
	}

	toggleLayers(layerId: string, checked: boolean) {
		this.map?.getLayers()
			.getArray()
			.filter(layer => layer.get('layerType') === 'toggle' && layer.get('id') === layerId)
			.forEach(layer => layer.setVisible(checked));

		this.changed();
	}

	setMap(map: Map){
		super.setMap(map);
		this.map = map;

		this.updateCtrl();
		map.getLayers().on('add', this.updateCtrl);
	}

	addCountrySelectors(stationFilter: StationFilter, countryFilter?: string, updatePersistedProps?: (mapProps: PersistedMapProps) => void){
		const countrySelector = this.countrySelector;

		if (countrySelector === undefined) return;

		const option = document.createElement('option');
		option.setAttribute('value', '0');
		option.innerHTML = 'All countries';
		countrySelector.appendChild(option);

		stationFilter.countryList.forEach((country: { val: string, name: string }) => {
			const option = document.createElement('option');
			option.setAttribute('value', country.val);
			option.innerHTML = country.name;
			countrySelector.appendChild(option);
		});

		countrySelector.addEventListener('change', e => {
			stationFilter.filterFn(stationFilter, (e.target as HTMLSelectElement).value);
			if (updatePersistedProps)
				updatePersistedProps({countryFilter: countrySelector.value});
		});

		if (countryFilter) {
			countrySelector.value = countryFilter;
			countrySelector.dispatchEvent(new Event('change'));
		}
	}

	toggleInput(ctrlType: 'radio' | 'toggle', id: string, isChecked: boolean) {
		const input = document.getElementById(this.createId(ctrlType, id)) as HTMLInputElement;
		if (input) input.checked = isChecked;
	};

	createId(ctrlType: 'radio' | 'toggle', id: string) {
		return ctrlType + id;
	}
}
