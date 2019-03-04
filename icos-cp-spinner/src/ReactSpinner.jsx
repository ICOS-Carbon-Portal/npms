import React, { Component, Fragment } from 'react';
import './styles.css';

export default class ReactSpinner extends Component{
	constructor(props) {
		super(props);

		this.isSites = !!props.isSites;
	}

	render(){
		return (
			<div className="cp-spinner">
				<div className="bounce bounce1" />
				<div className="bounce2" />
				{this.isSites
					? <span>SITES</span>
					: <Fragment>
						<span>Carbon</span>
						<span>Portal</span>
					</Fragment>
			}
			</div>
		);
	}
}
