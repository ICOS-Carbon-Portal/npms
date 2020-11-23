import {checkStatus, getUrlQuery} from './fetchHelp';


type BoundingBox = {
	latMin: number,
	latMax: number,
	lonMin: number,
	lonMax: number
}

export class BinRaster{
	public id: string;
	readonly height: number;
	readonly width: number;
	readonly stats: {min: number, max: number};
	readonly boundingBox: BoundingBox;

	private _data: DataView;

	constructor(arrayBuf: ArrayBuffer, id: string){
		this._data = new DataView(arrayBuf);
		this.id = id;

		const getHeaderValue = (i: number) => this._data.getFloat64(i << 3, false);

		this.height = getHeaderValue(0);
		this.width = getHeaderValue(1);

		this.stats = {
			min: getHeaderValue(2),
			max: getHeaderValue(3)
		};

		this.boundingBox = {
			latMin: getHeaderValue(4),
			latMax: getHeaderValue(5),
			lonMin: getHeaderValue(6),
			lonMax: getHeaderValue(7)
		};
	}

	getValue(y: number, x: number){ //e.g. y for lat, x for lon
		const i = (this.height - 1 - y) * this.width + x;
		return this._data.getFloat64((i << 3) + 64, false);
	}
}

export function getBinRaster(id: string, url: string, ...keyValues: string[]){
	const fullUrl = url + getUrlQuery(keyValues);
	return fetch(fullUrl, {
			headers: {
				'Accept': 'application/octet-stream'
			}
		})
		.then(checkStatus)
		.then(response => response.arrayBuffer())
		.then(response => {
			return new BinRaster(response, id || fullUrl);
		});
}

