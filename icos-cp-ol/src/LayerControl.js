import Control from 'ol/control/Control';


export class LayerControl extends Control {
	constructor(rootElement, useCountrySelector = true, options = {}) {
		super(rootElement);

		this._useCountrySelector = useCountrySelector;
		this._layerGroups = [];
		this._defaultBaseMap = undefined;
		this._countrySelector = undefined;
		this._labelingToggler = undefined;
		this._layerCount = () => this._layerGroups.reduce((length, lg) => {
			return length + lg.layers.length;
		}, 0);

		Control.call(this, {
			element: rootElement,
			target: options.target
		});

		const switchBtn = document.createElement('button');
		switchBtn.setAttribute('class', 'ol');
		this._layers = document.createElement('div');
		this._layers.setAttribute('style', 'display: none;');

		switchBtn.addEventListener('mouseenter', () => {
			switchBtn.setAttribute('style', 'display: none;');
			this._layers.setAttribute('style', 'display: inline;');
		});
		this._layers.addEventListener('mouseout', e => {
			if (e.target !== this._countrySelector && (!this._layers.contains(e.toElement || e.relatedTarget))) {
				switchBtn.setAttribute('style', 'display: inline;');
				this._layers.setAttribute('style', 'display: none;');
			}
		});

		this.element.appendChild(switchBtn);
		this.element.appendChild(this._layers);
	}

	setDefaultBaseMap(baseMap) {
		this._defaultBaseMap = baseMap;
	}

	get defaultBaseMap() {
		return this._defaultBaseMap;
	}

	setMap(map) {
		super.setMap(map);
		map.getLayers().on('add', () => {
			const mapLayers = map.getLayers().getArray().filter(ml => ml.get('name'));

			if (mapLayers.length > this._layerCount()) {
				const layerSet = new Set();
				const layerGroups = [];

				mapLayers.forEach(l => {
					if (l.get('name')) {
						if (layerSet.size === layerSet.add(l.get('name')).size) {
							layerGroups.find(lg => lg.name === l.get('name')).layers.push(l);
						} else {
							layerGroups.push({
								name: l.get('name'),
								layerType: l.get('layerType'),
								layers: [l]
							});
						}
					}
				});
				this._layerGroups = layerGroups;
				this.updateCtrl();
			}
		});
	}

	updateCtrl() {
		this._layers.innerHTML = '';
		const baseMaps = this._layerGroups.filter(lg => lg.layerType === 'baseMap');
		const toggles = this._layerGroups.filter(lg => lg.layerType === 'toggle');

		if (baseMaps.length) {
			const root = document.createElement('div');
			root.setAttribute('class', 'ol-layer-control-basemaps');
			const lbl = document.createElement('label');
			lbl.innerHTML = 'Base maps';
			root.appendChild(lbl);

			baseMaps.forEach(bm => {
				const row = document.createElement('div');
				const id = createId('radio', bm.name);
				row.setAttribute('class', 'row');

				const radio = document.createElement('input');
				radio.setAttribute('id', id);
				radio.setAttribute('name', 'basemap');
				radio.setAttribute('type', 'radio');
				if (bm.layers[0].getVisible()) {
					radio.setAttribute('checked', 'true');
				}
				radio.addEventListener('change', () => this.toggleBaseMaps(bm.name));
				row.appendChild(radio);

				const lbl = document.createElement('label');
				lbl.setAttribute('for', id);
				lbl.innerHTML = bm.name;
				row.appendChild(lbl);

				root.appendChild(row);
			});

			this._layers.appendChild(root);
		}

		if (toggles.length) {
			const root = document.createElement('div');
			root.setAttribute('class', 'ol-layer-control-toggles');
			const lbl = document.createElement('label');
			lbl.innerHTML = 'Layers';
			root.appendChild(lbl);

			if (this._useCountrySelector) {
				const row = document.createElement('div');
				this._countrySelector = document.createElement('select');
				row.appendChild(this._countrySelector);
				root.appendChild(row);
			}

			toggles.forEach(toggleGroup => {
				const layerIsEmpty = toggleGroup.layers.every(l => l.get('isEmpty'));
				const legendItem = this.getLegendItem(toggleGroup.layers[0]);
				const row = document.createElement('div');
				const id = createId('toggle', toggleGroup.name);
				row.setAttribute('class', 'row');

				const toggle = document.createElement('input');
				toggle.setAttribute('id', id);
				toggle.setAttribute('type', 'checkbox');

				if (toggleGroup.layers[0].getVisible()) {
					toggle.setAttribute('checked', 'true');
				}
				toggle.addEventListener('change', () => this.toggleLayerGroup(toggle.checked, toggleGroup.name));
				row.appendChild(toggle);

				if (legendItem) {
					legendItem.id = id.replace('toggle', 'canvas');
					row.appendChild(legendItem);
				}

				const lbl = document.createElement('label');
				lbl.setAttribute('for', id);
				lbl.innerHTML = toggleGroup.name;
				row.appendChild(lbl);

				if (layerIsEmpty) {
					toggle.disabled = true;
					toggle.checked = false;
					lbl.setAttribute('style', 'color: gray;');
				}

				root.appendChild(row);
			});

			this._labelingToggler = document.createElement('div');
			root.appendChild(this._labelingToggler);

			this._layers.appendChild(root);
		}
	}

	addToggleForLabeledStations(stationFilter, ol) {
		const labelingTogglerRoot = this._labelingToggler;
		if (labelingTogglerRoot === undefined) return;

		const id = createId('toggle', 'byLabelingStatus');
		labelingTogglerRoot.setAttribute('class', 'row');

		const toggle = document.createElement('input');
		toggle.setAttribute('id', id);
		toggle.setAttribute('type', 'checkbox');
		toggle.checked = true;

		toggle.addEventListener('change', e => stationFilter.filterFn(stationFilter, ol, undefined, e.target.checked));
		labelingTogglerRoot.appendChild(toggle);

		const lbl = document.createElement('label');
		lbl.setAttribute('for', id);
		lbl.innerHTML = 'Show non labeled stations';
		labelingTogglerRoot.appendChild(lbl);
	}

	addCountrySelectors(stationFilter, ol) {
		const countrySelector = this._countrySelector;
		if (countrySelector === undefined) return;

		countrySelector.addEventListener(
			'change', e => stationFilter.filterFn(stationFilter, ol, e.target.value, undefined)
		);

		const option = document.createElement('option');
		option.setAttribute('value', '0');
		option.innerHTML = 'All countries';
		countrySelector.appendChild(option);

		stationFilter.countryList.forEach(country => {
			const option = document.createElement('option');
			option.setAttribute('value', country.val);
			option.innerHTML = country.name;
			countrySelector.appendChild(option);
		});
	}

	getLegendItem(layer) {
		const style = layer.getStyle ? layer.getStyle() : undefined;
		const image = style && style.getImage ? style.getImage() : undefined;

		return image ? image.canvas_ : undefined;
	}

	toggleBaseMaps(baseMapNameToActivate) {
		this._layerGroups.filter(lg => lg.layerType === 'baseMap').forEach(bm => {
			bm.layers[0].setVisible(bm.name === baseMapNameToActivate);
		});

		// Signal to other components that basemap changed
		this.changed();
	}

	toggleLayerGroup(checked, name) {
		const layerGroup = this._layerGroups.find(lg => lg.name === name);
		layerGroup.layers.forEach(layer => layer.setVisible(checked));
	}

	setChecked(searchParams, id2name) {
		const toggles = this._layerGroups.filter(lg => lg.layerType === 'toggle');

		if (searchParams.hasOwnProperty('baseMap') && searchParams.baseMap.length) {
			this.toggleInput('radio', searchParams.baseMap, true);
		} else {
			this.toggleInput('radio', this._defaultBaseMap, true);
		}

		if (searchParams.hasOwnProperty('show')) {
			if (searchParams.show.length) {
				const toggleNamesToShow = searchParams.show.split(',').map(id => id2name(id));

				toggles.forEach(toggle => {
					this.toggleInput('toggle', toggle.name, toggleNamesToShow.includes(toggle.name));
				});
			} else {
				toggles.forEach(toggle => {
					this.toggleInput('toggle', toggle.name, false);
				});
			}
		} else {
			toggles.forEach(toggle => {
				this.toggleInput('toggle', toggle.name, true);
			});
		}
	}

	toggleInput(ctrlType, name, isChecked) {
		const input = document.getElementById(createId(ctrlType, name));
		if (input) input.checked = isChecked;
	};

	get isLayerControl() {
		return true;
	}
}

const createId = (ctrlType, name) => {
	return ctrlType + name.replace(/ /g, "_");
};
