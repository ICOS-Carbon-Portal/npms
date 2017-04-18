import React, { Component } from 'react';
import styles from './styles.css';

export default class Spinner extends Component{
	constructor(props) {
		super(props);
		this.state = {
			display: 'inline-block'
		};
	}

	componentWillMount(){

	}

	render(){
		const state = this.state;

// 		const keyFrames =
// `@-webkit-keyframes sk-bouncedelay {
// 	0%, 80%, 100% { -webkit-transform: scale(0) }
// 	40% { -webkit-transform: scale(1.0) }
// }
// @keyframes sk-bouncedelay {
// 	0%, 80%, 100% {
// 		-webkit-transform: scale(0);
// 		transform: scale(0);
// 	} 40% {
// 		-webkit-transform: scale(1.0);
// 		transform: scale(1.0);
// 	}
// }`;
// 		const styleSheet = document.styleSheets[0];
// 		styleSheet.insertRule(keyFrames, styleSheet.cssRules.length);

		// const container = {
		// 	display: state.display,
		// 	position: 'absolute',
		// 	left: '-webkit-calc(50% - 35px)',
		// 	left: '-moz-calc(50% - 35px)',
		// 	left: 'calc(50% - 35px)',
		// 	top: '-webkit-calc(50% - 31px)',
		// 	top: '-moz-calc(50% - 31px)',
		// 	top: 'calc(50% - 31px)',
		// 	width: 70,
		// 	textAlign: 'center',
		// 	zIndex: 9999
		// };
		// const dot = {
		// 	width: 18,
		// 	height: 18,
		// 	borderRadius: '100%',
		// 	display: 'inline-block'
		// };
		// const dot1 = {
		// 	backgroundColor: '#e53274',
		// 	WebkitAnimationDelay: '-0.16s',
		// 	animationDelay: '-0.16s'
		// };
		// const dot2 = {
		// 	backgroundColor: '#0a97f3',
		// 	WebkitAnimationDelay: '-0.16s',
		// 	animationDelay: '-0.16s'
		// };

		return (
			<div id="loading" className={styles.spinner}>
				<div className={styles.bounce1}></div>
				<div className={styles.bounce2}></div>
				<div className={styles.bounce3}></div>
				<span>Carbon</span>
				<span>Portal</span>
			</div>
		);


		// return (
		// 	<div style={container}>
		// 		<div style={Object.assign({}, dot, dot1)}></div>
		// 		<div style={dot}></div>
		// 		<div style={dot}></div>
		// 		<span>Carbon</span>
		// 		<span>Portal</span>
		// 	</div>
		// );
	}
}
