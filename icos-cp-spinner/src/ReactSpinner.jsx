import React, { Component, Fragment } from 'react';
import './styles.css';

export class ReactSpinner extends Component{
	constructor(props) {
		super(props);
	}

	render(){
		const {show, isSites} = this.props;

		return show
			? <div className="cp-spinner">
				<div className="cp-bounce1"/>
				<div className="cp-bounce2"/>
				<div />
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
