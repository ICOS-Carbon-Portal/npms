import {checkStatus} from './fetchHelp';

export type ColumnDataType = "FLOAT" | "DOUBLE" | "CHAR" | "INT" | "BYTE" | "SHORT" | "STRING"

export interface TableSchema{
	columns: ColumnDataType[];
	size: number
}

function dataTypeSize(dtype: ColumnDataType){
	switch (dtype){
		case 'DOUBLE': return 8;
		case 'BYTE': return 1;
		case 'CHAR': return 2;
		case 'SHORT': return 2;
		default: return 4;
	}
}

function getColumnSizes(schema: TableSchema){
	return schema.columns.map(dtype => dataTypeSize(dtype) * schema.size);
}

function getColumnOffsets(schema: TableSchema){
	return getColumnSizes(schema).reduce((acc, colSize) => {
		let lastSize = acc[acc.length - 1];
		let newSize = lastSize + colSize;
		return acc.concat(newSize);
	}, [0]);
}

type ValueAccessor = (i: number) => number | string

function dtypeToAccessor(dtype: ColumnDataType, view: DataView): ValueAccessor {
	switch (dtype){
		case 'DOUBLE': return i => view.getFloat64(i * 8, false);
		case 'FLOAT': return i => view.getFloat32(i * 4, false);
		case 'INT': return i => view.getInt32(i * 4, false);
		case 'BYTE': return i => view.getInt8(i);
		case 'CHAR': return i => String.fromCharCode(view.getUint16(i * 2, false));
		case 'SHORT': return i => view.getInt16(i * 2, false);
		case 'STRING': throw new Error('String columns in BinTables are not supported at the moment.');
		default: throw new Error('Unsupported data type: ' + dtype);
	}
}

class Column{
	readonly length: number
	readonly value: ValueAccessor

	constructor(arrBuff: ArrayBuffer, offset: number | undefined, length: number, dtype: ColumnDataType){
		const valLength = dataTypeSize(dtype);
		const view = new DataView(arrBuff, offset, length * valLength);
		this.length = length
		this.value = dtypeToAccessor(dtype, view)
	}

}

export class BinTable{

	private readonly _length: number;
	private readonly _columns: Column[];

	constructor(arrBuff: ArrayBuffer, schema: TableSchema){
		this._length = schema.size;

		let columnOffsets = getColumnOffsets(schema);

		this._columns = schema.columns.map(
			(dtype, i) => new Column(arrBuff, columnOffsets[i], schema.size, dtype)
		);
	}

	get nCols(){
		return this._columns.length;
	}

	get length(){
		return this._length;
	}

	column(i: number){
		return this._columns[i];
	}

	row(i: number){
		return this._columns.map(col => col.value(i));
	}

	subrow(i: number, columnIndices: number[]){
		return columnIndices.map(colIdx => this._columns[colIdx].value(i));
	}

	value(row: number, column: number){
		return this._columns[column].value(row);
	}

	chartValues(xCol: number, yCol: number){
		return Array.from({length: this._length}, (_, i) => {
			return {x: this.value(i, xCol), y: this.value(i, yCol)};
		});
	}

	values<T>(columnIndices: number[], converter: (subrow: Array<string | number>) => T): T[]{
		return Array.from({length: this._length}, (_, i) => {
			return converter(this.subrow(i, columnIndices));
		});
	}

	static get empty(){
		return new BinTable(new ArrayBuffer(0), {columns: [], size: 0});
	}
};

export class TableRequest{
	readonly tableId: string;
	readonly schema: TableSchema;
	readonly columnNumbers: number[];
	readonly subFolder: string;

	constructor(tableId: string, schema: TableSchema, columnNumbers: number[], subFolder: string){
		this.tableId = tableId;
		this.schema = schema;
		this.columnNumbers = columnNumbers;
		this.subFolder = subFolder;
	}

	get returnedTableSchema(): TableSchema{
		return {
			columns: this.columnNumbers.map(i => this.schema.columns[i]),
			size: this.schema.size
		};
	}
}

export function getBinaryTable(tblRequest: TableRequest, url: string){
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

