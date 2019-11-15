import {checkStatus, getUrlQuery} from './fetchHelp';

export function getJson(url: string, ...keyValues: string[][]): Promise<any>{
	return fetch(url + getUrlQuery.apply(null, keyValues), {
			headers: {
				'Accept': 'application/json'
			}
		})
		.then(checkStatus)
		.then(response => response.json());
}
