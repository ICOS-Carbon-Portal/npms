import React, { useState, useEffect, useRef } from 'react';

export function Toaster({ toasterData, closeToast }) {
	if (!toasterData || !toasterData.header || !toasterData.message) {
		return null;
	}

	return (
		<div
			className={toasterData.className}
			style={{ position: 'fixed', top: 15, right: 15, width: 400, zIndex: 9999 }}
			role="alert"
		>
			<h4 className="alert-heading">{toasterData.header}</h4>
			<div>{toasterData.message}</div>
			<button type="button" className="btn-close" aria-label="Close" onClick={closeToast} />
		</div>
	);
}

function AnimatedToast({ toasterData, autoCloseDelay, onClose }) {
	const [show, setShow] = useState(false);

	useEffect(() => {
		// Defer adding 'show' by one frame so the initial opacity:0 render is
		// committed first, giving Bootstrap's CSS transition something to animate from.
		const id = requestAnimationFrame(() => setShow(true));
		return () => cancelAnimationFrame(id);
	}, []);

	useEffect(() => {
		if (autoCloseDelay > 0) {
			const t = setTimeout(() => setShow(false), autoCloseDelay);
			return () => clearTimeout(t);
		}
	}, [autoCloseDelay]);

	function handleClose() {
		setShow(false);
	}

	function handleTransitionEnd() {
		if (!show) {
			onClose(toasterData.id);
		}
	}

	return (
		<div
			className={`${toasterData.className} fade${show ? ' show' : ''}`}
			style={{ width: 400, marginBottom: 8 }}
			role="alert"
			onTransitionEnd={handleTransitionEnd}
		>
			<h4 className="alert-heading">{toasterData.header}</h4>
			<div>{toasterData.message}</div>
			<button type="button" className="btn-close" aria-label="Close" onClick={handleClose} />
		</div>
	);
}

export function AnimatedToasters({ toasterData, autoClose = true, autoCloseDelay }) {
	const delay = autoCloseDelay ?? (autoClose ? 5000 : 0);
	const [toasts, setToasts] = useState([]);
	const seenIds = useRef(new Set());

	useEffect(() => {
		if (!toasterData) {
			return;
		}
		const items = Array.isArray(toasterData) ? toasterData : [toasterData];
		const newItems = items.filter(td => !seenIds.current.has(td.id));
		if (newItems.length > 0) {
			newItems.forEach(td => seenIds.current.add(td.id));
			setToasts(prev => [...prev, ...newItems]);
		}
	}, [toasterData]);

	function removeToast(id) {
		setToasts(prev => prev.filter(t => t.id !== id));
	}

	if (!toasts.length) {
		return null;
	}

	return (
		<div style={{ position: 'fixed', top: 15, right: 15, zIndex: 9999 }}>
			{toasts.map(td => (
				<AnimatedToast
					key={td.id}
					toasterData={td}
					autoCloseDelay={delay}
					onClose={removeToast}
				/>
			))}
		</div>
	);
}
