import 'whatwg-fetch';
import {checkStatus} from './fetchHelp';

export function sparql(query, sparqlEndpoint, acceptCachedResults){

	const cacheHeader = acceptCachedResults
		? {'Cache-Control': 'max-age=1000000'} //server decides how old the cache can get
		: {}; //expecting no-cache default behaviour from the server

	return fetch(sparqlEndpoint, {
			method: 'post',
			headers: Object.assign(cacheHeader, {
				'Accept': 'application/json',
				'Content-Type': 'text/plain'
			}),
			body: query
		})
		.then(checkStatus)
		.then(response => response.json());
}

