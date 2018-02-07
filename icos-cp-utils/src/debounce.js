
export const debounce = (fn, wait = 300, immediate) => {
	let timeout;

	return function() {
		const self = this;
		const args = arguments;

		const later = () => {
			timeout = null;
			if (!immediate) fn.apply(self, args);
		};

		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) fn.apply(self, args);
	};
};
