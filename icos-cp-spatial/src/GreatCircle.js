// Code derived from https://github.com/springmeyer/arc.js/blob/gh-pages/arc.js
// Copyright (c) Dane Springmeyer
// License: https://github.com/springmeyer/arc.js/blob/gh-pages/LICENSE.md

export class GreatCircle{
	constructor(start, end){
		if (!start || start.lon === undefined || start.lat === undefined) {
			throw new Error("GreatCircle constructor expects two args: start and end objects with lon and lat properties");
		}
		if (!end || end.lon === undefined || end.lat === undefined) {
			throw new Error("GreatCircle constructor expects two args: start and end objects with lon and lat properties");
		}

		this._R2D = 180 / Math.PI;
		this._start = new Coord(start.lon,start.lat);
		this._end = new Coord(end.lon,end.lat);

		const w = this._start.x - this._end.x;
		const h = this._start.y - this._end.y;
		const z = Math.pow(Math.sin(h / 2.0), 2) +
			Math.cos(this._start.y) *
			Math.cos(this._end.y) *
			Math.pow(Math.sin(w / 2.0), 2);

		this._g = 2.0 * Math.asin(Math.sqrt(z));

		if (this._g === Math.PI) {
			throw new Error('It appears ' + start.view + ' and ' + end.view + " are 'antipodal', e.g diametrically opposite, thus there is no single route but rather infinite");
		} else if (isNaN(this._g)) {
			throw new Error('Could not calculate great circle between ' + start + ' and ' + end);
		}
	}

	get degrDist(){
		return this._g * this._R2D;
	}

	get mDist(){
		return this._g * 6378137;
	}

	interpolate(f){
		const A = Math.sin((1 - f) * this._g) / Math.sin(this._g);
		const B = Math.sin(f * this._g) / Math.sin(this._g);
		const x = A * Math.cos(this._start.y) * Math.cos(this._start.x) + B * Math.cos(this._end.y) * Math.cos(this._end.x);
		const y = A * Math.cos(this._start.y) * Math.sin(this._start.x) + B * Math.cos(this._end.y) * Math.sin(this._end.x);
		const z = A * Math.sin(this._start.y) + B * Math.sin(this._end.y);
		const lat = this._R2D * Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
		const lon = this._R2D * Math.atan2(y, x);

		return [lon, lat];
	}
}

export class Coord{
	constructor(lon, lat){
		const D2R = Math.PI / 180;

		this._lon = lon;
		this._lat = lat;
		this._x = D2R * lon;
		this._y = D2R * lat;
	}

	get view(){
		return String(this._lon).slice(0, 4) + ',' + String(this._lat).slice(0, 4);
	}

	get lon(){
		return this._lon;
	}

	get lat(){
		return this._lat;
	}

	get x(){
		return this._x;
	}

	get y(){
		return this._y;
	}
}
