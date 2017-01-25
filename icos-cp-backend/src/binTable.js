import 'whatwg-fetch';
import {checkStatus} from './fetchHelp';
import {BinTable} from './BinTable';


export function getBinaryTable(tblRequest, url){
	return fetch(url || 'https://data.icos-cp.eu/portal/tabular', {
			method: 'post',
			headers: {
				'Accept': 'application/octet-stream',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(tblRequest)
		})
		.then(checkStatus)
		.then(response => response.arrayBuffer())
		.then(response => {
			return new BinTable(response, tblRequest.returnedTableSchema);
		});
}

