import {sparql, SparqlResult, Query} from './sparql';
import {ColumnDataType, TableRequest} from './BinTable';

type MandatoryColInfo = "objFormat" | "colName" | "valueType" | "valFormat"
type OptionalColInfo = "unit" | "qKind" | "colTip" | "isRegex"

export interface ColumnInfo{
	name: string,
	label: string,
	unit: string,
	type: ColumnDataType,
	valueFormat: string,
	isRegex: boolean
}

export function parseTableFormat(sparqlResult: SparqlResult<MandatoryColInfo, OptionalColInfo>){
	const bindings = sparqlResult.results.bindings;
	const columnsInfo: ColumnInfo[] = bindings.map(binding => {
		return {
			name: binding.colName.value,
			label: binding.valueType.value,
			unit: binding.unit ? binding.unit.value : "?",
			type: mapDataTypes(binding.valFormat.value),
			valueFormat: binding.valFormat.value,
			isRegex: binding.isRegex ? (binding.isRegex.value.toLowerCase() == 'true') : false
		};
	});
	const formatUrl = bindings[0].objFormat.value;
	return new TableFormat(columnsInfo, formatUrl);
}

export function lastUrlPart(url: string): string{
	const last = url.split("/").pop();
	if(last === undefined) throw new Error("Not a valid URL: " + url);
	return last;
}

function mapDataTypes(valueFormatUrl: string): ColumnDataType{
	switch(lastUrlPart(valueFormatUrl)){
		case "float32":
			return "FLOAT";

		case "float64":
			return "DOUBLE";

		case "bmpChar":
			return "CHAR";

		case "etcDate":
			return "INT";

		case "iso8601date":
			return "INT";

		case "iso8601timeOfDay":
			return "INT";

		case "iso8601dateTime":
			return "DOUBLE";

		case "isoLikeLocalDateTime":
			return "DOUBLE";

		case "etcLocalDateTime":
			return "DOUBLE";

		case "int32":
			return "INT";

		case "string":
			return "STRING";

		default:
			throw new Error("Unsupported value format: " + valueFormatUrl);
	}
}

export class TableFormat{

	private readonly _columnsInfo: ColumnInfo[];
	private readonly _subFolder: string;

	constructor(columnsInfo: ColumnInfo[], formatUrl: string){
		this._columnsInfo = columnsInfo;
		this._subFolder = lastUrlPart(formatUrl);
	}

	getColumnIndex(colName: string){
		return this._columnsInfo.findIndex(colInfo => colName === colInfo.name);
	}

	get columns(): ReadonlyArray<ColumnInfo>{
		return this._columnsInfo;
	}

	getRequest(id: string, nRows: number, columnIndices?: number[]): TableRequest{
		const cols = this._columnsInfo.map(colInfo => colInfo.type);

		return new TableRequest(
			lastUrlPart(id),
			{
				columns: cols,
				size: nRows
			},
			columnIndices || Array.from(cols, (_, i) => i),
			this._subFolder
		);
	}

	withColumnNames(columnNames: string[]) {
		const columnsInfo = columnNames.slice().sort().map(cn => {
			return Object.assign({}, this._columnsInfo.find(c => {
				if (c.isRegex) {
					const re = new RegExp(c.name);
					return re.test(cn);
				} else {
					return c.name == cn;
				}
			}), { name: cn });
		});

		return new TableFormat(columnsInfo, this._subFolder);
	}
}

interface Config{
	sparqlEndpoint: string;
	cpmetaOntoUri: string;
}

export function tableFormatForSpecies(objSpeciesUri: string, config: Config){
	const query = simpleObjectSchemaQuery(objSpeciesUri, config);
	return sparql(query, config.sparqlEndpoint).then(parseTableFormat);
}

function simpleObjectSchemaQuery(speciesUri: string, config: Config): Query<MandatoryColInfo, OptionalColInfo>{

	const query = `prefix cpmeta: <${config.cpmetaOntoUri}>
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

	return {text: query};
}
