import React, { useEffect, useId, useMemo, useRef, useState, KeyboardEvent, ChangeEvent, MouseEvent as ReactMouseEvent } from 'react';
import './Multiselect.css';

// Design informed by react-widgets' Multiselect (MIT License, (c) 2014 Jason Quense),
// which this component replaces. Independent implementation, no code copied.

export interface MultiselectProps<T> {
	data: T[]
	value: T[]
	textField: keyof T
	dataKey?: keyof T
	open: boolean
	onToggle: (open: boolean) => void
	onChange: (value: T[]) => void
	onSearch?: (searchTerm: string) => void
	renderListItem?: (props: { item: T, searchTerm: string }) => React.ReactNode
	renderTagValue?: (props: { item: T }) => React.ReactNode
	placeholder?: string
}

type PopupPhase = 'closed' | 'pre-enter' | 'entering' | 'open' | 'exiting';
const POPUP_TRANSITION_MS = 130;

function isSame<T>(a: T, b: T, dataKey?: keyof T): boolean {
	return dataKey ? a[dataKey] === b[dataKey] : a === b;
}

function itemKey<T>(item: T, dataKey: keyof T | undefined, textField: keyof T): string {
	return dataKey ? String(item[dataKey]) : String(item[textField]);
}

export function Multiselect<T>(props: MultiselectProps<T>) {
	const {data, value, textField, dataKey, open, onToggle, onChange, onSearch, renderListItem, renderTagValue, placeholder} = props;

	const [searchTerm, setSearchTerm] = useState('');
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const [popupPhase, setPopupPhase] = useState<PopupPhase>(open ? 'open' : 'closed');

	const rootRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const popupRef = useRef<HTMLDivElement>(null);

	const inputId = useId();
	const listboxId = `${inputId}-listbox`;

	const availableItems = useMemo(
		() => data.filter(item => !value.some(v => isSame(v, item, dataKey))),
		[data, value, dataKey]
	);

	const trimmedSearch = searchTerm.trim();

	const clearSearch = () => {
		setSearchTerm('');
		onSearch?.('');
	};

	const filteredItems = useMemo(() => {
		if (!trimmedSearch) return availableItems;
		const needle = trimmedSearch.toLowerCase();
		return availableItems.filter(item => String(item[textField]).toLowerCase().includes(needle));
	}, [availableItems, trimmedSearch, textField]);

	useEffect(() => {
		if (highlightedIndex >= filteredItems.length) {
			setHighlightedIndex(filteredItems.length ? filteredItems.length - 1 : -1);
		}
	}, [filteredItems, highlightedIndex]);

	useEffect(() => {
		if (popupPhase === 'closed') setHighlightedIndex(-1);
	}, [popupPhase]);

	useEffect(() => {
		if (!open) return;

		const handleOutsideClick = (e: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				onToggle(false);
				clearSearch();
			}
		};

		document.addEventListener('click', handleOutsideClick);
		return () => document.removeEventListener('click', handleOutsideClick);
	}, [open, onToggle]);

	useEffect(() => {
		if (open && highlightedIndex >= 0 && listRef.current) {
			const el = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
			el?.scrollIntoView({block: 'nearest'});
		}
	}, [open, highlightedIndex]);

	useEffect(() => {
		setPopupPhase(phase => {
			if (open) return phase === 'open' || phase === 'entering' ? phase : 'pre-enter';
			return phase === 'closed' || phase === 'exiting' ? phase : 'exiting';
		});
	}, [open]);

	useEffect(() => {
		if (popupPhase !== 'pre-enter') return;
		const frame = requestAnimationFrame(() => setPopupPhase('entering'));
		return () => cancelAnimationFrame(frame);
	}, [popupPhase]);

	useEffect(() => {
		const container = popupRef.current;
		const panel = container?.firstElementChild as HTMLElement | null;
		if (!container || !panel) return;

		switch (popupPhase) {
			case 'pre-enter':
				container.style.height = '0px';
				break;
			case 'entering':
				container.style.height = `${panel.offsetHeight}px`;
				break;
			case 'open':
				container.style.height = '';
				break;
			case 'exiting':
				container.style.height = `${panel.offsetHeight}px`;
				void container.offsetHeight;
				container.style.height = '0px';
				break;
		}
	}, [popupPhase]);

	useEffect(() => {
		if (popupPhase !== 'entering' && popupPhase !== 'exiting') return;
		const settled = popupPhase === 'entering' ? 'open' : 'closed';
		const timer = setTimeout(() => setPopupPhase(settled), POPUP_TRANSITION_MS + 20);
		return () => clearTimeout(timer);
	}, [popupPhase]);

	const selectItem = (item: T) => {
		onChange([...value, item]);
		clearSearch();
		inputRef.current?.focus();
	};

	const removeTag = (item: T) => {
		onChange(value.filter(v => !isSame(v, item, dataKey)));
		inputRef.current?.focus();
	};

	const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
		const next = e.target.value;
		setSearchTerm(next);
		onSearch?.(next);
		if (!open) onToggle(true);
	};

	const handlePickerClick = () => {
		inputRef.current?.focus();
		if (!open) onToggle(true);
	};

	const handleCaretClick = (e: ReactMouseEvent) => {
		e.stopPropagation();
		inputRef.current?.focus();
		onToggle(!open);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (e.target !== inputRef.current) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				if (!open) {
					onToggle(true);
					setHighlightedIndex(0);
				} else {
					setHighlightedIndex(i => Math.min(i + 1, filteredItems.length - 1));
				}
				break;

			case 'ArrowUp':
				e.preventDefault();
				if (open) setHighlightedIndex(i => Math.max(i - 1, 0));
				break;

			case 'Enter':
				if (open && highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
					e.preventDefault();
					selectItem(filteredItems[highlightedIndex]);
				}
				break;

			case 'Escape':
				if (open) {
					e.preventDefault();
					onToggle(false);
				}
				break;

			case 'Backspace':
				if (!searchTerm && value.length) {
					removeTag(value[value.length - 1]);
				}
				break;
		}
	};

	const textOf = (item: T) => String(item[textField]);
	const inputSize = Math.max(String(searchTerm || (value.length ? '' : placeholder) || '').length, 1) + 1;

	return (
		<div
			ref={rootRef}
			className={open ? 'cp-multiselect cp-multiselect-open' : 'cp-multiselect'}
			onKeyDown={handleKeyDown}
		>
			<div className="cp-multiselect-picker" onClick={handlePickerClick}>
				<div className="cp-multiselect-taglist">
					{value.map(item => (
						<span className="cp-multiselect-tag" key={itemKey(item, dataKey, textField)}>
							<span className="cp-multiselect-tag-label">
								{renderTagValue ? renderTagValue({item}) : textOf(item)}
							</span>
							<button
								type="button"
								className="cp-multiselect-tag-remove"
								title={`Remove ${textOf(item)}`}
								aria-label={`Remove ${textOf(item)}`}
								onClick={(e: ReactMouseEvent) => {e.stopPropagation(); removeTag(item);}}
							>
								<i className="fas fa-times" />
							</button>
						</span>
					))}
					<input
						ref={inputRef}
						id={inputId}
						className="cp-multiselect-input"
						role="combobox"
						aria-expanded={open}
						aria-haspopup="listbox"
						aria-controls={listboxId}
						aria-autocomplete="list"
						autoComplete="off"
						spellCheck={false}
						size={inputSize}
						value={searchTerm}
						placeholder={value.length ? '' : (placeholder || '')}
						onChange={handleSearchChange}
					/>
				</div>

				<span className="cp-multiselect-caret" aria-hidden="true" onClick={handleCaretClick}>
					<i className="fas fa-caret-down" />
				</span>
			</div>

			{popupPhase !== 'closed' && (
				<div ref={popupRef} className={`cp-multiselect-popup-container cp-multiselect-popup-container-${popupPhase}`}>
					<div className="cp-multiselect-popup">
						<ul className="cp-multiselect-list" role="listbox" id={listboxId} ref={listRef}>
							{filteredItems.length === 0
								? <li className="cp-multiselect-empty">
									{availableItems.length
										? 'The filter returned no results'
										: 'There are no items in this list'}
								</li>
								: filteredItems.map((item, idx) => (
									<li
										key={itemKey(item, dataKey, textField)}
										role="option"
										aria-selected={idx === highlightedIndex}
										className={idx === highlightedIndex ? 'cp-multiselect-item cp-multiselect-item-highlighted' : 'cp-multiselect-item'}
										onMouseEnter={() => setHighlightedIndex(idx)}
										onClick={(e: ReactMouseEvent) => {e.stopPropagation(); selectItem(item);}}
									>
										{renderListItem ? renderListItem({item, searchTerm: trimmedSearch}) : textOf(item)}
									</li>
								))
							}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
}
