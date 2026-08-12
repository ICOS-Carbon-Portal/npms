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

	const rootRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const inputId = useId();
	const listboxId = `${inputId}-listbox`;

	const availableItems = useMemo(
		() => data.filter(item => !value.some(v => isSame(v, item, dataKey))),
		[data, value, dataKey]
	);

	const trimmedSearch = searchTerm.trim();

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
		if (!open) setHighlightedIndex(-1);
	}, [open]);

	useEffect(() => {
		if (!open) return;

		const handleOutsideClick = (e: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				onToggle(false);
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

	const selectItem = (item: T) => {
		onChange([...value, item]);
		setSearchTerm('');
		onSearch?.('');
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

	const handleRootClick = () => {
		inputRef.current?.focus();
		if (!open) onToggle(true);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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

	return (
		<div
			ref={rootRef}
			className="cp-multiselect"
			onClick={handleRootClick}
			onKeyDown={handleKeyDown}
		>
			<div className="cp-multiselect-taglist">
				{value.map(item => (
					<span className="cp-multiselect-tag" key={itemKey(item, dataKey, textField)}>
						<span className="cp-multiselect-tag-label">
							{renderTagValue ? renderTagValue({item}) : textOf(item)}
						</span>
						<button
							type="button"
							className="cp-multiselect-tag-btn"
							aria-label={`Remove ${textOf(item)}`}
							onClick={(e: ReactMouseEvent) => {e.stopPropagation(); removeTag(item);}}
						>
							&times;
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
					value={searchTerm}
					placeholder={value.length ? '' : (placeholder || '')}
					onChange={handleSearchChange}
					onClick={(e: ReactMouseEvent) => e.stopPropagation()}
				/>
			</div>

			{open && (
				<ul className="cp-multiselect-list" role="listbox" id={listboxId} ref={listRef}>
					{filteredItems.length === 0
						? <li className="cp-multiselect-empty">No items</li>
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
			)}
		</div>
	);
}
