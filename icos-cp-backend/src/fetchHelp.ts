
export function checkStatus(response: Response) {
	if(response.status >= 200 && response.status < 300) {
		return response;
	} else {
		return response.text().then(txt =>
			Promise.reject(new Error(txt || response.statusText || "Ajax response status: " + response.status))
		);
	}
}

export function getUrlQuery(keyValues: string[][]){
	return !keyValues || keyValues.length == 0
		? ''
		: '?' + keyValues.map(
			([key, value]) => key + '=' + encodeURIComponent(value)
		).join('&');
}

