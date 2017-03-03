import React, { Component } from 'react';
import {FadeIn, FadeOut} from 'icos-cp-fade';

const toasterDefaultMaxWidth = 400;

export class Toaster extends Component{
	constructor(props) {
		super(props);
	}

	handleCloseToaster(){
		if(this.props.closeToast){
			this.props.closeToast();
		}
	}

	render(){
		const props = this.props;
		const {header, message, className} = props.toasterData ? props.toasterData : {null, null, null};
		const maxWidth = props.maxWidth || toasterDefaultMaxWidth;
		const divStyle = header && message && className && !props.animated
			? {position:'fixed', top: 15, right: 15, maxWidth, zIndex:9999}
			: {};

		return(
			<div style={divStyle} className={className}>
				<span style={{position:'relative', top:-10, right:-10, float:'right', fontSize:'150%', cursor: 'pointer'}}
					  className="glyphicon glyphicon-remove-sign"
					  onClick={this.handleCloseToaster.bind(this)}
				/>
				<label>{header}</label>
				<div>{message}</div>
			</div>
		);
	}
}

export class AnimatedToasters extends Component{
	constructor(props){
		super(props);
		this.state = {
			toasterData: props.toasterData
				? [Object.assign(props.toasterData, {restartTimer: false})]
				: []
		};
		this.idRecorder = [];
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.toasterData && !this.idRecorder.includes(nextProps.toasterData.id)){
			//Do not add new toasters that have the same type and message. Instead extend the time the existing toaster is shown
			const newToastIsDup = this.state.toasterData.some(td =>
				td.type === nextProps.toasterData.type && td.message == nextProps.toasterData.message
			);
			const newToasterData = newToastIsDup
				? this.state.toasterData.map(td => {
					return (td.type === nextProps.toasterData.type && td.message == nextProps.toasterData.message)
						? Object.assign(td, {restartTimer: true})
						: td;
				})
				: this.state.toasterData.concat(nextProps.toasterData);

			this.setState({toasterData: newToasterData});
			this.idRecorder.push(nextProps.toasterData.id);
		}
	}

	handleCloseToast(id){
		const newToasterData = this.state.toasterData.filter(td => td.id !== id);
		this.setState({toasterData: newToasterData});
	}

	render(){
		const props = this.props;
		const state = this.state;
		const maxWidth = props.maxWidth || toasterDefaultMaxWidth;

		return (state.toasterData.length > 0
				? <div style={{position:'fixed', top: 15, right: 15, maxWidth, zIndex:9999}}>{
					state.toasterData.map(toasterData => {
						return <Animate
							key={toasterData.id}
							autoCloseDelay={props.autoCloseDelay}
							fadeInTime={props.fadeInTime}
							fadeOutTime={props.fadeOutTime}
							toasterData={toasterData}
							closeToast={this.handleCloseToast.bind(this)}
						/>;
					})
				}</div>
				: null
		);
	}
}

class Animate extends Component{
	constructor(props){
		super(props);
		this.state = {closing: false};
		this.autoCloseTimer = null;
	}

	componentDidMount(){
		const self = this;
		this.startTimer();
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.toasterData && nextProps.toasterData.restartTimer){
			clearTimeout(this.autoCloseTimer);
			this.startTimer();
		}
	}

	startTimer(){
		if(this.props.autoCloseDelay > 0){
			this.autoCloseTimer = setTimeout(() => {
				this.close();
			}, this.props.autoCloseDelay);
		}
	}

	handleInnerToasterClose(){
		clearTimeout(this.autoCloseTimer);
		this.close();
	}

	close(){
		this.setState({closing: true});
	}

	handleFadeOutDone(id){
		if(this.props.closeToast){
			this.props.closeToast(id);
		}
	}

	render(){
		const props = this.props;
		const closeToast = this.handleInnerToasterClose.bind(this);
		const fadeOutDone = this.handleFadeOutDone.bind(this, props.toasterData.id);

		return (this.state.closing
				? <FadeOut fadeTime={props.fadeOutTime} onDone={fadeOutDone}>
					<Toaster toasterData={props.toasterData} animated={true}/>
				</FadeOut>
				: <FadeIn fadeTime={props.fadeInTime}>
					<Toaster toasterData={props.toasterData} closeToast={closeToast} animated={true}/>
				</FadeIn>
		);
	}
}
