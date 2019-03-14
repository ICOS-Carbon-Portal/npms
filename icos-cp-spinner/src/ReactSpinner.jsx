import React, { Component, Fragment } from 'react';
import './styles.css';

export class ReactSpinner extends Component{
	constructor(props) {
		super(props);

		this.isSites = !!props.isSites;
	}

	render(){
		const {show} = this.props;

		return show
			? <div className="cp-spinner">
				<div className="cp-bounce1"/>
				<div className="cp-bounce2"/>
				<Text isSites={this.isSites}/>
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
