import React, { useId, useMemo, useRef, useState, ChangeEvent, FocusEvent, KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useMountTransition } from './useMountTransition';
import { useOutsideInteraction } from './useOutsideInteraction';
import './Multiselect.css';

// Design informed by react-widgets' Multiselect (MIT License, (c) 2014 Jason Quense),
// which this component replaces. Independent implementation, no code copied.
//
// Requires Font Awesome to be loaded by the host application for the caret and
// tag-remove glyphs.

export type FilterPreset = 'contains' | 'startsWith';
export type FilterProp<T> = false | FilterPreset | ((item: T, searchTerm: string) => boolean);

// Attributes forwarded to the search input, excludes what the widget owns
export type MultiselectInputProps = Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	'id' | 'value' | 'size' | 'onChange' | 'placeholder' | 'role'
	| 'aria-expanded' | 'aria-haspopup' | 'aria-controls' | 'aria-autocomplete' | 'aria-activedescendant'
>;

export interface MultiselectProps<T> {
	data: T[]
	value: T[]
	textField?: keyof T
	dataKey?: keyof T
	open: boolean
	onToggle: (open: boolean) => void
	onChange: (value: T[]) => void
	onSearch?: (searchTerm: string) => void
	filter?: FilterProp<T>
	renderListItem?: (props: { item: T, searchTerm: string }) => React.ReactNode
	renderTagValue?: (props: { item: T }) => React.ReactNode
	placeholder?: string
	className?: string
	inputProps?: MultiselectInputProps
}

function dataValue<T>(item: T, field?: keyof T): unknown {
	if (field === undefined || item === null || typeof item !== 'object') return item;
	return item[field];
}

function dataText<T>(item: T, field?: keyof T): string {
	const value = dataValue(item, field);
	return value == null ? '' : String(value);
}

function matches<T>(a: T, b: T, dataKey?: keyof T): boolean {
	return dataValue(a, dataKey) === dataValue(b, dataKey);
}

function passesFilter<T>(item: T, searchTerm: string, filter: FilterProp<T>, textField?: keyof T): boolean {
	if (typeof filter === 'function') return filter(item, searchTerm);

	const text = dataText(item, textField).toLowerCase();
	const needle = searchTerm.toLowerCase();
	return filter === 'startsWith' ? text.startsWith(needle) : text.includes(needle);
}

function scrollOptionIntoView(list: HTMLElement | null, index: number): void {
	const option = list?.children[index] as HTMLElement | undefined;
	if (!list || !option) return;

	const optionBox = option.getBoundingClientRect();
	const listBox = list.getBoundingClientRect();

	if (optionBox.top < listBox.top) list.scrollTop += optionBox.top - listBox.top;
	else if (optionBox.bottom > listBox.bottom) list.scrollTop += optionBox.bottom - listBox.bottom;
}

export function Multiselect<T>(props: MultiselectProps<T>) {
	const {
		data, value, textField, dataKey, open, onToggle, onChange, onSearch,
		filter = 'contains', renderListItem, renderTagValue, placeholder, className, inputProps,
	} = props;

	const [searchTerm, setSearchTerm] = useState('');
	const [highlighted, setHighlighted] = useState<T | null>(null);

	const rootRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const idBase = useId().replace(/:/g, '');
	const inputId = `${idBase}-input`;
	const listboxId = `${idBase}-listbox`;
	const optionId = (index: number) => `${idBase}-option-${index}`;

	const keyField = dataKey ?? textField;

	const availableItems = useMemo(
		() => data.filter(item => !value.some(v => matches(v, item, dataKey))),
		[data, value, dataKey]
	);

	const trimmedSearch = searchTerm.trim();

	const filteredItems = useMemo(() => {
		if (filter === false || !trimmedSearch) return availableItems;
		return availableItems.filter(item => passesFilter(item, trimmedSearch, filter, textField));
	}, [availableItems, trimmedSearch, filter, textField]);

	const highlightedIndex = highlighted === null
		? -1
		: filteredItems.findIndex(item => matches(item, highlighted, dataKey));

	const [popupMounted, unmountPopup] = useMountTransition(open);

	const setSearch = (next: string) => {
		if (next === searchTerm) return;
		setSearchTerm(next);
		onSearch?.(next);
	};

	const closeWidget = () => {
		onToggle(false);
		setHighlighted(null);
		setSearch('');
	};

	useOutsideInteraction(rootRef, open, closeWidget);

	const selectItem = (item: T) => {
		const index = filteredItems.findIndex(i => matches(i, item, dataKey));
		const nextHighlight = highlighted === null
			? null
			: filteredItems[index + 1] ?? filteredItems[index - 1] ?? null;

		onChange([...value, item]);
		setHighlighted(nextHighlight);
		setSearch('');
		inputRef.current?.focus();
	};

	const removeTag = (item: T) => {
		onChange(value.filter(v => !matches(v, item, dataKey)));
		inputRef.current?.focus();
	};

	const moveHighlight = (index: number) => {
		setHighlighted(filteredItems[index] ?? null);
		scrollOptionIntoView(listRef.current, index);
	};

	const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
		if (!open) onToggle(true);
	};

	const keepFocusOnInput = (e: ReactMouseEvent) => {
		if (e.target !== inputRef.current) e.preventDefault();
	};

	const handlePickerClick = () => {
		inputRef.current?.focus();
		if (!open) onToggle(true);
	};

	const handleCaretClick = (e: ReactMouseEvent) => {
		e.stopPropagation();
		inputRef.current?.focus();
		if (open) closeWidget();
		else onToggle(true);
	};

	const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
		if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
		if (open) closeWidget();
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (e.target !== inputRef.current) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				if (open) moveHighlight(Math.min(highlightedIndex + 1, filteredItems.length - 1));
				else {
					onToggle(true);
					setHighlighted(filteredItems[0] ?? null);
				}
				break;

			case 'ArrowUp':
				if (!open) break;
				e.preventDefault();
				moveHighlight(highlightedIndex === -1
					? filteredItems.length - 1
					: Math.max(highlightedIndex - 1, 0));
				break;

			case 'Home':
				if (!open) break;
				e.preventDefault();
				moveHighlight(0);
				break;

			case 'End':
				if (!open) break;
				e.preventDefault();
				moveHighlight(filteredItems.length - 1);
				break;

			case 'Enter':
				if (open && highlightedIndex >= 0) {
					e.preventDefault();
					selectItem(filteredItems[highlightedIndex]);
				}
				break;

			case 'Escape':
				if (open) {
					e.preventDefault();
					closeWidget();
				}
				break;

			case 'Backspace':
				if (!searchTerm && value.length) removeTag(value[value.length - 1]);
				break;
		}
	};

	const textOf = (item: T) => dataText(item, textField);

	const inputSize = Math.max(String(searchTerm || (value.length ? '' : placeholder) || '').length, 1) + 1;

	const rootClassName = ['cp-multiselect', open ? 'cp-multiselect-open' : null, className]
		.filter(Boolean)
		.join(' ');

	return (
		<div
			ref={rootRef}
			className={rootClassName}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
		>
			<div
				className="cp-multiselect-picker"
				onMouseDown={keepFocusOnInput}
				onClick={handlePickerClick}
			>
				<div className="cp-multiselect-taglist">
					{value.map(item => (
						<span className="cp-multiselect-tag" key={dataText(item, keyField)}>
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
								<i className="fas fa-times" aria-hidden="true" />
							</button>
						</span>
					))}
					<input
						{...inputProps}
						ref={inputRef}
						id={inputId}
						className="cp-multiselect-input"
						role="combobox"
						aria-expanded={open}
						aria-haspopup="listbox"
						aria-controls={listboxId}
						aria-autocomplete="list"
						aria-activedescendant={highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined}
						autoComplete="off"
						spellCheck={false}
						size={inputSize}
						value={searchTerm}
						placeholder={value.length ? '' : (placeholder || '')}
						onChange={handleSearchChange}
					/>
				</div>

				<button
					type="button"
					tabIndex={-1}
					className="cp-multiselect-caret"
					aria-label="Show options"
					onClick={handleCaretClick}
				>
					<i className="fas fa-caret-down" aria-hidden="true" />
				</button>
			</div>

			{popupMounted && (
				<div
					className={open
						? 'cp-multiselect-popup-container'
						: 'cp-multiselect-popup-container cp-multiselect-popup-container-closing'}
					onMouseDown={keepFocusOnInput}
					onAnimationEnd={e => {if (!open && e.target === e.currentTarget) unmountPopup();}}
				>
					<div className="cp-multiselect-popup">
						<ul className="cp-multiselect-list" role="listbox" id={listboxId} ref={listRef}>
							{filteredItems.map((item, idx) => (
								<li
									key={dataText(item, keyField)}
									id={optionId(idx)}
									role="option"
									aria-selected={idx === highlightedIndex}
									className={idx === highlightedIndex ? 'cp-multiselect-item cp-multiselect-item-highlighted' : 'cp-multiselect-item'}
									onMouseEnter={() => setHighlighted(item)}
									onClick={(e: ReactMouseEvent) => {e.stopPropagation(); selectItem(item);}}
								>
									{renderListItem ? renderListItem({item, searchTerm: trimmedSearch}) : textOf(item)}
								</li>
							))}
						</ul>

						{filteredItems.length === 0 && (
							<div className="cp-multiselect-empty" role="status">
								{availableItems.length
									? 'The filter returned no results'
									: 'There are no items in this list'}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
