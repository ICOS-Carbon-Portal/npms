import Control, { Options } from 'ol/control/Control';
import {Dict} from "./utils";
import { SupportedSRIDs } from './projections';

export interface ProjectionControlOptions extends Options {
	supportedSRIDs: Dict<string>
	selectedSRID: string
	switchProjAction: (newSRID: SupportedSRIDs) => void
}

export default class ProjectionControl extends Control {
	constructor(options: ProjectionControlOptions) {
		super({
			element: options.element,
			target: options.target
		});

		const { supportedSRIDs, selectedSRID, switchProjAction } = options;
		const select = document.createElement('select');

		Object.keys(supportedSRIDs).forEach(srid => {
			const option = document.createElement('option');
			option.value = srid;
			option.text = supportedSRIDs[srid];
			option.selected = srid === selectedSRID;
			select.appendChild(option);
		});

		select.onchange = (ev => {
			switchProjAction((ev.target as HTMLSelectElement).value as SupportedSRIDs);
		});

		this.element.appendChild(select);
	}
}