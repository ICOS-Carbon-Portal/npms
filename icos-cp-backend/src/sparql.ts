import {checkStatus} from './fetchHelp';

export interface SparqlResult<Mandatories extends string, Optionals extends string>{
	head: {
		vars: Array<Mandatories | Optionals>
	}
	results: {
		bindings: [SparqlResultBinding<Mandatories, Optionals>]
	}
}

export type SparqlResultBinding<Mandatories extends string, Optionals extends string> = {
	[v in Mandatories]: SparqlResultValue
} & {
	[v in Optionals]?: SparqlResultValue
}

export interface SparqlResultValue{
	type: "uri" | "literal"
	value: string
}

export interface SparqlResultUriValue extends SparqlResultValue{
	type: "uri"
}

export interface SparqlResultLiteralValue extends SparqlResultValue{
	type: "literal"
	datatype: 'http://www.w3.org/2001/XMLSchema#integer'
		| 'http://www.w3.org/2001/XMLSchema#long'
		| 'http://www.w3.org/2001/XMLSchema#float'
		| 'http://www.w3.org/2001/XMLSchema#double'
		| 'http://www.w3.org/2001/XMLSchema#dateTime'
		| 'http://www.w3.org/2001/XMLSchema#boolean'
}

export interface Query<Mandatories extends string, Optionals extends string>{
	text: string;
}

export function sparql<Mandatories extends string, Optionals extends string>(
	query: Query<Mandatories, Optionals>,
	sparqlEndpoint: string,
	acceptCachedResults?: boolean
): Promise<SparqlResult<Mandatories, Optionals>>{

	const cacheHeader: HeadersInit = acceptCachedResults
		? {} //server decides how old the cache can get
		: {'Cache-Control': 'no-cache'};

	return fetch(sparqlEndpoint, {
			method: 'post',
			headers: new Headers({
				...cacheHeader,
				'Accept': 'application/json',
				'Content-Type': 'text/plain'
			}),
			body: query.text
		})
		.then(checkStatus)
		.then(response => response.json());
}

