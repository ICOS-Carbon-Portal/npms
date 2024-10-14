import {sparql, SparqlResult, Query} from './sparql';
import {ColumnDataType, TableRequest, FlagColumnPosLookup, BinTableSlice} from './BinTable';

type MandatoryColInfo = "objFormat" | "colName" | "valueType" | "valFormat"
type OptionalColInfo = "goodFlags" | "unit" | "qKind" | "colTip" | "isRegex" | "flagColName"
export type FlagGoodness = undefined | ((f: string) => boolean)

export interface ColumnInfo{
	name: string,
	label: string,
	unit: string,
	type: ColumnDataType,
	valueFormat: string,
	isRegex: boolean,
	flagCol: string | undefined
}

export function parseTableFormat(sparqlResult: SparqlResult<MandatoryColInfo, OptionalColInfo>): Promise<TableFormat>{
	const bindings = sparqlResult.results.bindings;
	const columnsInfo: ColumnInfo[] = bindings.map(binding => {
		return {
			name: binding.colName.value,
			label: binding.valueType.value,
			unit: binding.unit?.value ?? "?",
			type: mapDataTypes(binding.valFormat.value),
			valueFormat: binding.valFormat.value,
			isRegex: binding.isRegex?.value.toLowerCase() === 'true',
			flagCol: binding.flagColName?.value
		};
	});
	if(bindings.length > 0){
		const formatUrl = bindings[0].objFormat.value
		const goodFlags = bindings[0].goodFlags

		const flagGoodness: FlagGoodness = goodFlags === undefined
			? undefined
			: goodFlags.value.length == 0 ? undefined : f => goodFlags.value.includes(f)

		return Promise.resolve(new TableFormat(columnsInfo, formatUrl, flagGoodness));
	} else
		return Promise.reject(new Error("SPARQL query about column metadata returned no results"))
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

		case "iso8601month":
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

	private readonly _subFolder: string;
	readonly qflagLookup: FlagColumnPosLookup;

	constructor(private readonly _columnsInfo: ColumnInfo[], formatUrl: string, readonly flagGoodness: FlagGoodness){
		this._subFolder = lastUrlPart(formatUrl);

		this.qflagLookup = this._columnsInfo.reduce<FlagColumnPosLookup>(
			(acc, colInfo, idx, _) => {
				if(colInfo.flagCol != undefined){
					const flagPos = this._columnsInfo.findIndex(cInfo => cInfo.name === colInfo.flagCol);
					if (flagPos >= 0) acc[idx] = flagPos
				}
				return acc;
			},
			{}
		)
	}

	getColumnIndex(colName: string){
		return this._columnsInfo.findIndex(colInfo => colName === colInfo.name);
	}

	get columns(): ReadonlyArray<ColumnInfo>{
		return this._columnsInfo;
	}

	getRequest(id: string, nRows: number, columnIndices?: number[], slice?: BinTableSlice): TableRequest{
		const cols = this._columnsInfo.map(colInfo => colInfo.type);
		const requestedCols = columnIndices || Array.from(cols, (_, i) => i)

		const missingFlagCols: number[] = requestedCols.reduce<number[]>((acc, curr) => {
			const flagColNum = this.qflagLookup[curr]
			if(flagColNum != undefined && !requestedCols.includes(flagColNum)) acc.push(flagColNum)
			return acc
		}, [])

		return new TableRequest(
			lastUrlPart(id),
			{
				columns: cols,
				qflagLookup: this.qflagLookup,
				size: nRows
			},
			requestedCols.concat(missingFlagCols),
			this._subFolder,
			slice
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

		return new TableFormat(columnsInfo, this._subFolder, this.flagGoodness);
	}
}

interface Config{
	sparqlEndpoint: string;
	cpmetaOntoUri: string;
}

export function tableFormatForSpecies(objSpeciesUri: string, config: Config, acceptCache?: boolean): Promise<TableFormat>{
	const query = objectSchemaQuery(objSpeciesUri, config);
	return sparql(query, config.sparqlEndpoint, acceptCache).then(parseTableFormat);
}

function objectSchemaQuery(speciesUri: string, config: Config): Query<MandatoryColInfo, OptionalColInfo>{

	const query = `prefix cpmeta: <${config.cpmetaOntoUri}>
SELECT distinct ?objFormat ?goodFlags ?colName ?valueType ?valFormat ?unit ?qKind ?colTip ?isRegex ?flagColName
WHERE {
	{
		select ?objFormat (group_concat(?goodFlag; separator=";") as ?goodFlags) where{
			<${speciesUri}> cpmeta:hasFormat ?objFormat .
			optional {?objFormat cpmeta:hasGoodFlagValue ?goodFlag}
		}
		group by ?objFormat
	}
	<${speciesUri}> cpmeta:containsDataset ?dset .
	?dset cpmeta:hasColumn ?column .
	?column cpmeta:hasColumnTitle ?colName ;
		cpmeta:hasValueFormat ?valFormat ;
		cpmeta:hasValueType ?valType .
	optional{?column cpmeta:isRegexColumn ?isRegex}
	optional{
		?flagCol cpmeta:isQualityFlagFor ?column ; cpmeta:hasColumnTitle ?flagColName .
		?dset cpmeta:hasColumn ?flagCol .
	}
	?valType rdfs:label ?valueType .
	optional{?valType rdfs:comment ?colTip }
	optional{
		?valType cpmeta:hasUnit ?unit .
		?valType cpmeta:hasQuantityKind/rdfs:label ?qKind .
	}
} order by ?colName`;

	return {text: query};
}
