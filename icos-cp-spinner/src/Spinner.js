import './styles.css';

export default class Spinner {
	constructor(parent, isSites){
		this.spinner = getHTML(!!isSites);
		this.root = this.spinner.firstChild;

		if (parent){
			parent.appendChild(this.spinner);
		} else {
			document.body.appendChild(this.spinner);
		}
	}

	show(){
		this.root.style.display = 'inline';
	}

	hide(){
		this.root.style.display = 'none';
	}
}

const getHTML = isSites => {
	const root = document.createElement('div');
	root.setAttribute('style', 'display:none;');
	root.setAttribute('class', 'cp-spinner');

	const bounce1 = document.createElement('div');
	bounce1.setAttribute('class', 'bounce1');
	root.appendChild(bounce1);

	const bounce2 = document.createElement('div');
	bounce2.setAttribute('class', 'bounce2');
	root.appendChild(bounce2);

	if (isSites){
		const sites = document.createElement('span');
		sites.innerHTML = 'SITES';
		root.appendChild(sites);
	} else {
		const carbon = document.createElement('span');
		carbon.innerHTML = 'Carbon';
		root.appendChild(carbon);

		const portal = document.createElement('span');
		portal.innerHTML = 'Portal';
		root.appendChild(portal);
	}

	return root;
};
