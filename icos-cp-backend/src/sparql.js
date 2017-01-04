import 'whatwg-fetch';
import {checkStatus} from './fetchHelp';

export function sparql(query, sparqlEndpoint){
	return fetch(sparqlEndpoint, {
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'text/plain'
			},
			body: query
		})
		.then(checkStatus)
		.then(response => response.json());
}

