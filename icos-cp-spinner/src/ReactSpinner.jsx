import React, { Component, Fragment } from 'react';
import './styles.css';

export class ReactSpinner extends Component{
	constructor(props) {
		super(props);
	}

	render(){
		const {show, isSites} = this.props;
		const clsBounce1 = isSites ? "cp-bounce1 cp-bouncer-green" : "cp-bounce1 cp-bouncer-red";
		const clsBounce2 = isSites ? "cp-bounce2 cp-bouncer-green" : "cp-bounce2 cp-bouncer-blue";
		const clsBounce3 = isSites ? "cp-bouncer-green" : "cp-bouncer-red";

		return show
			? <div className="cp-spinner">
				<div className={clsBounce1} />
				<div className={clsBounce2} />
				<div className={clsBounce3} />
				<Text isSites={isSites}/>
			</div>
			: null;
	}
}

const Text = ({isSites}) => {
	return isSites
		? <span>SITES</span>
		: <Fragment>
			<span>Carbon</span>
			<span>Portal</span>
		</Fragment>
};
