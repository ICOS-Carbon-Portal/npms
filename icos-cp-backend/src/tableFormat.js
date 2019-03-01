import {sparql} from './sparql';
import {parseTableFormat} from './TableFormat';

export function tableFormatForSpecies(objSpeciesUri, config){
	const query = simpleObjectSchemaQuery(objSpeciesUri, config);
	return sparql(query, config.sparqlEndpoint).then(parseTableFormat);
}

function simpleObjectSchemaQuery(speciesUri, config){
	return `prefix cpmeta: <${config.cpmetaOntoUri}>
SELECT distinct ?objFormat ?colName ?valueType ?valFormat ?unit ?qKind ?colTip ?isRegex
WHERE {
	<${speciesUri}> cpmeta:containsDataset ?dset .
	<${speciesUri}> cpmeta:hasFormat ?objFormat .
	?dset cpmeta:hasColumn ?column .
	?column cpmeta:hasColumnTitle ?colName ;
		cpmeta:hasValueFormat ?valFormat ;
		cpmeta:hasValueType ?valType .
	optional{?column cpmeta:isRegexColumn ?isRegex}
	?valType rdfs:label ?valueType .
	optional{?valType rdfs:comment ?colTip }
	optional{
		?valType cpmeta:hasUnit ?unit .
		?valType cpmeta:hasQuantityKind [rdfs:label ?qKind ] .
	}
} order by ?colName`;
}
