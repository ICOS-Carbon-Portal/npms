import React, { CSSProperties, ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';

type DraggableProps = {
	dragElementId: string
	initialPos: (root: HTMLElement) => CSSProperties
	onStopDrag?: (draggableStyle: CSSProperties) => void
	style?: CSSProperties
	children?: ReactNode
};

export default function Draggable(props: DraggableProps) {
	const defaultStyle: CSSProperties = {
		position:'absolute',
		width: 580,
		zIndex: 9999,
		top: 150,
		left: 100,
		boxShadow: 'rgba(0, 0, 0, 0.85) 9px 8px 20px -18px'
	};

	const [style, setStyle] = useState<CSSProperties>({...defaultStyle, ...props.style});
	const [isDragging, setIsDragging] = useState(false);
	const [offset, setOffset] = useState({x: 0, y: 0});
	const dragContainer = useRef<HTMLSpanElement>(null);

	function handleStartDrag(e: MouseEvent) {
		if (e.button !== 0) return;

		setIsDragging(true);
		setOffset({
			x: e.pageX - (style.left as number),
			y: e.pageY - (style.top as number)
		});

		e.stopPropagation();
		e.preventDefault();
	}

	function handleDrag(e: MouseEvent) {
		if (!isDragging) {
			return;
		}

		const left = e.pageX - offset.x;
		const top = e.pageY - offset.y;

		setStyle((prevStyle) => ({...prevStyle, left, top}));
		e.stopPropagation();
		e.preventDefault();
	}

	function handleStopDrag(e: MouseEvent) {
		if (!isDragging) {
			return;
		}

		setIsDragging(false);
		e.stopPropagation();
		e.preventDefault();

		if (props.onStopDrag) {
			console.log(style);
			props.onStopDrag(style);
		}
	}

	useLayoutEffect(() => {
		if (dragContainer.current) {
			const initPos = props.initialPos(dragContainer.current);
			setStyle((prevStyle) => ({...prevStyle, ...initPos}));
		}
	}, [dragContainer.current]);

	useEffect(() => {
		if (dragContainer.current) {
			const dragElement = document.getElementById(props.dragElementId) ?? dragContainer.current;
			dragElement.style.cursor = "move";
			dragElement.addEventListener("mousedown", handleStartDrag);
			window.addEventListener("mousemove", handleDrag);
			window.addEventListener("mouseup", handleStopDrag);
			return () => {
				dragElement.removeEventListener("mousedown", handleStartDrag);
				window.removeEventListener("mousemove", handleDrag);
				window.removeEventListener("mouseup", handleStopDrag);
			}
		}
	}, [dragContainer.current, isDragging]);

	return <span ref={dragContainer} style={style}>{props.children}</span>;
}
