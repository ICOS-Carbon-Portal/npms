import React, { Component } from 'react';

export class Toaster extends Component {

	handleCloseToaster() {
		if (this.props.closeToast) {
			this.props.closeToast();
		}
	}

	render() {
		const props = this.props;
		const { header, message, className } = props.toasterData
			? props.toasterData
			: { header: null, message: null, className: null };
		const divStyle = header && message && className
			? { position: 'fixed', top: 15, right: 15, width: '400px', zIndex: 9999, transition: 'opacity 1s', opacity: props.opacity }
			: {};

		return (
			<div style={divStyle} className={className}>
				<h4 className="alert-heading">{header}</h4>
				<div>{message}</div>
				<button type="button" className="btn-close" aria-label="Close" onClick={this.handleCloseToaster.bind(this)}></button>
			</div>
		);
	}
}

export class AnimatedToasters extends Component {

	constructor(props) {
		super(props);
		this.autoClose = props.autoClose ?? true;
		this.autoCloseDelay = props.autoCloseDelay ?? this.autoClose ? 5000 : 0;

		this.state = {
			toasterData: props.toasterData
		};
	}

	componentDidUpdate() {
		this.state.toasterData = this.props.toasterData;
	}

	handleCloseToast(id) {
		const newToasterData = this.state.toasterData.filter(td => td.id !== id);
		this.setState({ toasterData: newToasterData });
	}

	render() {
		const state = this.state;

		return (state.toasterData &&
			<Animate
				key={state.toasterData.id}
				autoCloseDelay={this.autoCloseDelay}
				toasterData={state.toasterData}
				closeToast={this.handleCloseToast.bind(this)}
			/>
		);
	}
}

class Animate extends Component {
	state = { closed: false, opacity: 0 };
	autoCloseTimer = null;

	componentDidMount() {
		this.startTimer();
	}

	componentDidUpdate() {
		if (this.props.toasterData && this.props.toasterData.closed !== undefined && !this.props.toasterData.closed) {
			clearTimeout(this.autoCloseTimer);
			this.startTimer();
		}
	}

	startTimer() {
		this.setState({ opacity: 1 });
		if (this.props.autoCloseDelay > 0) {
			this.autoCloseTimer = setTimeout(() => {
				this.close();
			}, this.props.autoCloseDelay);
		}
	}

	handleInnerToasterClose() {
		clearTimeout(this.autoCloseTimer);
		this.close();
	}

	close() {
		this.setState({ closed: true, opacity: 0 });
	}

	handleFadeOutDone(id) {
		if (this.props.closeToast) {
			this.props.closeToast(id);
		}
	}

	render() {
		return <Toaster
			opacity={this.state.opacity}
			toasterData={this.props.toasterData}
			closeToast={this.handleInnerToasterClose.bind(this)}
		/>;
	}
}
