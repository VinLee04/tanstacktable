// import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"

import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {format, isEqual, startOfDay} from 'date-fns';
import {Calendar as CalendarIcon} from 'lucide-react';
import type {DateRange} from 'react-day-picker';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/table/base-select';
import React, {type CSSProperties, Fragment, type ReactNode, useState} from "react"
import {Button} from "@/components/table/button.tsx";
import {Checkbox} from '@/components/table/checkbox.tsx';
import {useDataGrid} from '@/components/table/data-grid.tsx';
import {type Cell, type Column, flexRender, type Header, type HeaderGroup, type Row,} from '@tanstack/react-table';
import {cva} from 'class-variance-authority';
import {cn} from '@/lib/utils.ts';
import {Input} from "@/components/ui/input.tsx";
import {
    Combobox,
    ComboboxChips,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxItemIndicator,
    ComboboxList,
    ComboboxValue
} from "@/components/table/base-combobox";

const headerCellSpacingVariants = cva('', {
    variants: {
        size: {
            dense: 'h-10',
            default: 'px-4',
        },
    },
    defaultVariants: {
        size: 'default',
    },
});

const bodyCellSpacingVariants = cva('', {
    variants: {
        size: {
            dense: 'px-2.5 py-1',
            default: 'px-4 py-3',
        },
    },
    defaultVariants: {
        size: 'default',
    },
});

function getPinningStyles<TData>(column: Column<TData>): CSSProperties {
    const isPinned = column.getIsPinned();

    return {
        left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
        right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
        position: isPinned ? 'sticky' : 'relative',
        width: column.getSize(),
        zIndex: isPinned ? 1 : 0,
    };
}

function DataGridTableBase({children}: { children: ReactNode }) {
    const {props} = useDataGrid();

    return (
        <table
            data-slot="data-grid-table"
            className={cn(
                'w-full align-middle caption-bottom text-left rtl:text-right text-foreground font-normal text-sm',
                !props.tableLayout?.columnsDraggable && 'border-separate border-spacing-0',
                props.tableLayout?.width === 'fixed' ? 'table-fixed' : 'table-auto',
                props.tableClassNames?.base,
            )}
        >
            {children}
        </table>
    );
}

function DataGridTableHead({children}: { children: ReactNode }) {
    const {props} = useDataGrid();

    return (
        <thead
            className={cn(
                props.tableClassNames?.header,
                props.tableLayout?.headerSticky && props.tableClassNames?.headerSticky,
            )}
        >
        {children}
        </thead>
    );
}

function DataGridTableHeadRow<TData>({
                                         children,
                                         headerGroup,
                                     }: {
    children: ReactNode;
    headerGroup: HeaderGroup<TData>;
}) {
    const {props} = useDataGrid();

    return (
        <tr
            key={headerGroup.id}
            className={cn(
                'bg-muted/40',
                props.tableLayout?.headerBorder && '[&>th]:border-b',
                props.tableLayout?.cellBorder && '[&_>:last-child]:border-e-0',
                props.tableLayout?.stripped && 'bg-transparent',
                props.tableLayout?.headerBackground === false && 'bg-transparent',
                props.tableClassNames?.headerRow,
            )}
        >
            {children}
        </tr>
    );
}

function DataGridTableHeadRowCell<TData>({
                                             children,
                                             header,
                                             dndRef,
                                             dndStyle,
                                         }: {
    children: ReactNode;
    header: Header<TData, unknown>;
    dndRef?: React.Ref<HTMLTableCellElement>;
    dndStyle?: CSSProperties;
}) {
    const {props} = useDataGrid();

    const {column} = header;
    const isPinned = column.getIsPinned();
    const isLastLeftPinned = isPinned === 'left' && column.getIsLastColumn('left');
    const isFirstRightPinned = isPinned === 'right' && column.getIsFirstColumn('right');
    const headerCellSpacing = headerCellSpacingVariants({
        size: props.tableLayout?.dense ? 'dense' : 'default',
    });

    const align = column.columnDef.meta?.headerAlign;

    return (
        <th
            key={header.id}
            ref={dndRef}
            style={{
                ...(props.tableLayout?.width === 'fixed' && {
                    width: `${header.getSize()}px`,
                }),
                ...(props.tableLayout?.columnsPinnable && column.getCanPin() && getPinningStyles(column)),
                ...(dndStyle ? dndStyle : null),
            }}
            data-pinned={isPinned || undefined}
            data-last-col={isLastLeftPinned ? 'left' : isFirstRightPinned ? 'right' : undefined}
            className={cn(
                'relative text-left uppercase text-nowrap font-bold rtl:text-right align-middle text-secondary-foreground/80 [&:has([role=checkbox])]:pe-0',
                headerCellSpacing,
                props.tableLayout?.cellBorder && 'border-e',
                props.tableLayout?.columnsResizable && column.getCanResize() && 'truncate',
                props.tableLayout?.columnsPinnable &&
                column.getCanPin() &&
                '[&:not([data-pinned]):has(+[data-pinned])_div.cursor-col-resize:last-child]:opacity-0 [&[data-last-col=left]_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=left][data-last-col=left]]:border-e! [&[data-pinned=right]:last-child_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=right][data-last-col=right]]:border-s! [&[data-pinned][data-last-col]]:border-border data-pinned:bg-muted/90 data-pinned:backdrop-blur-xs',
                header.column.columnDef.meta?.headerClassName,
                column.getIndex() === 0 || column.getIndex() === header.headerGroup.headers.length - 1
                    ? props.tableClassNames?.edgeCell
                    : '',
            )}
        >
            {/*<div className={cn(header.column.getCanFilter() ? 'mb-1 ml-2 mt-1' : column.id == 'checkbox' ? 'ml-2' : 'ml-4')}> {children} </div>*/}
            <div
                className={cn({
                    'ml-2': column.id == 'checkbox' || !column,
                    'mx-2': !column.getCanSort(),
                    'ml-0 text-right': align == 'right',
                    'ml-0 text-center': align == 'center',
                })}>
                <div className='leading-10'> {children} </div>
            </div>
            {header.column.getCanFilter() ? (
                <Filter column={header.column}/>
            ) : null}
        </th>
    );
}

function Filter({
                    column,
                    // table,
                }: {
    column: Column<any, any>
    // table: Table<any>
}) {
    // const firstValue = table
    //     .getPreFilteredRowModel()
    //     .flatRows[0]?.getValue(column.id);

    // console.log(table.)

    const {filterVariant} = column.columnDef.meta ?? {}
    const columnFilterValue = column.getFilterValue();
    const dateFilterValue = column.getFilterValue() as DateRange | undefined;

    const sortedUniqueValues = React.useMemo(
        () =>
            filterVariant === 'range'
                ? []
                : Array.from(column.getFacetedUniqueValues().keys())
                    .sort()
                    .slice(0, 5000),
        [column.getFacetedUniqueValues(), filterVariant],
    );

    const renderValue = (value: string[]) => {
        const MAX_COUNT = 2;

        if (value.length === 0) return 'Multiple';
        let labels = [];
        if (column.columnDef.meta !== undefined && column.columnDef.meta.options !== undefined) {
            labels = value.map((val) => column.columnDef.meta?.options!.find((item) => item === val)).filter(Boolean);
        } else {
            labels = value.map((val) => sortedUniqueValues.find((item) => item === val)).filter(Boolean);
        }

        if (labels.length <= MAX_COUNT) {
            return labels.join(', ');
        }

        const firstThree = labels.slice(0, MAX_COUNT);
        const remaining = labels.length - MAX_COUNT;
        return `${firstThree.join(', ')}, +${remaining} more`;
    };

    const containerRef = React.useRef<HTMLDivElement | null>(null);

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const handleSelect = (selected: DateRange | undefined) => {
        column.setFilterValue({
            from: selected?.from || undefined,
            to: selected?.to || undefined,
        });
    };

    return filterVariant === 'select' ?
        <Select
            onValueChange={column.setFilterValue}
            value={columnFilterValue ?? "All"}
        >
            <SelectTrigger className="min-w-32 w-full !h-7 text-xs font-medium rounded-xs">
                <SelectValue placeholder='All'/>
            </SelectTrigger>
            <SelectContent align="end" side="bottom">
                <SelectItem key='all' value={undefined!} className='h-7'>All</SelectItem>
                {sortedUniqueValues.map((value) =>
                    column.id == 'national' ?
                        <SelectItem className='text-xs font-medium' key={value} value={value}>
                            {value == 'Vietnamese' ? '🇻🇳' : value == 'Korean' ? '🇰🇷' : '🇺🇸'} - {value}
                        </SelectItem>
                        :
                        <SelectItem className='text-xs font-medium' key={value} value={value}>{value}</SelectItem>
                )}
            </SelectContent>
        </Select>
        :
        filterVariant === 'multiple' ?
            <Select items={sortedUniqueValues} onValueChange={column.setFilterValue} value={columnFilterValue ?? []}
                    multiple>
                <SelectTrigger className='min-w-32 h-7 text-xs font-medium w-full rounded-xs'>
                    <SelectValue
                        className={`truncate font-medium ${columnFilterValue == '' && 'text-muted-foreground'}`}>{renderValue}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {sortedUniqueValues.map((item) => (
                        column.id == 'national' ?
                            <SelectItem className='text-xs font-medium' key={item} value={item}>
                                {item == 'Vietnamese' ? '🇻🇳' : item == 'Korean' ? '🇰🇷' : '🇺🇸'} - {item}
                            </SelectItem>
                            :
                            <SelectItem key={item} value={item} className='text-xs font-medium h-7'>
                                {item}
                            </SelectItem>
                    ))}

                    <div className='flex *:flex-1 gap-x-1 mt-2'>
                        <Button size='xs' variant='secondary' onClick={() => column.setFilterValue([])}>
                            Clear All
                        </Button>
                        <Button size='xs' onClick={() => column.setFilterValue(sortedUniqueValues)}>
                            Select All
                        </Button>
                    </div>
                </SelectContent>
            </Select>
            :
            filterVariant == 'combobox' ?
                <Combobox items={column.columnDef.meta?.options ?? sortedUniqueValues} value={columnFilterValue ?? []}
                          onValueChange={column.setFilterValue} multiple>
                    <div className="w-full max-w-xs flex flex-col gap-3 p-0! max-h-7">
                        <ComboboxChips variant='xs' ref={containerRef}>
                            <ComboboxValue>
                                {(value) => (
                                    <ComboboxInput variant='xs' className='text-xs font-medium'
                                                   placeholder={renderValue(value)}/>
                                )}
                            </ComboboxValue>
                        </ComboboxChips>
                    </div>

                    <ComboboxContent anchor={containerRef}>
                        <ComboboxEmpty>No languages found.</ComboboxEmpty>
                        <ComboboxList>
                            {(language) => (
                                <ComboboxItem key={language} value={language}>
                                    <ComboboxItemIndicator/>
                                    <div className="col-start-2 text-xs">{language}</div>
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                        <div className='flex *:flex-1 gap-x-1 mt-2 p-1'>
                            <Button size='xs' variant='secondary' onClick={() => column.setFilterValue([])}>
                                Clear All
                            </Button>
                            <Button size='xs'
                                    onClick={() => column.setFilterValue(column.columnDef.meta?.options ?? sortedUniqueValues)}>
                                Select All
                            </Button>
                        </div>
                    </ComboboxContent>
                </Combobox>
                :
                filterVariant == 'range' ?
                    <div>
                        <div className="flex *:flex-1">
                            <DebouncedInput
                                type="number"
                                min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
                                max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
                                value={(columnFilterValue as [number, number])?.[0] ?? ''}
                                onChange={(value) =>
                                    column.setFilterValue((old: [number, number]) => [value, old?.[1]])
                                }
                                placeholder={`Min ${
                                    column.getFacetedMinMaxValues()?.[0] !== undefined
                                        ? `(${column.getFacetedMinMaxValues()?.[0]})`
                                        : ''
                                }`}
                                className="min-w-28 h-7 text-xs! font-medium text-primary rounded-xs focus-visible:outline-0"
                            />
                            <DebouncedInput
                                type="number"
                                min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
                                max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
                                value={(columnFilterValue as [number, number])?.[1] ?? ''}
                                onChange={(value) =>
                                    column.setFilterValue((old: [number, number]) => [old?.[0], value])
                                }
                                placeholder={`Max ${
                                    column.getFacetedMinMaxValues()?.[1]
                                        ? `(${column.getFacetedMinMaxValues()?.[1]})`
                                        : ''
                                }`}
                                className="min-w-28 h-7 text-xs! font-medium text-primary rounded-xs focus-visible:outline-0"
                            />
                        </div>
                    </div>
                    :
                    filterVariant == 'date' ?
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    mode="input"
                                    placeholder={!dateFilterValue?.from && !dateFilterValue?.to}
                                    className="min-w-[200px] w-full h-7! rounded-xs font-medium text-xs"
                                >
                                    <CalendarIcon size={13}/>
                                    {dateFilterValue?.from ? (
                                        dateFilterValue.to ? (
                                            <>
                                                {isEqual(dateFilterValue.from, dateFilterValue.to) ?
                                                    format(dateFilterValue.from, 'yyyy/MM/dd')
                                                    :
                                                    <>
                                                        {format(dateFilterValue.from, 'yyyy/MM/dd')} - {format(dateFilterValue.to, 'yyyy/MM/dd')}
                                                    </>
                                                }
                                            </>
                                        ) : (
                                            format(dateFilterValue.from, 'yyyy/MM/dd')
                                        )
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    autoFocus
                                    mode="range"
                                    defaultMonth={dateFilterValue?.from}
                                    showOutsideDays={false}
                                    selected={dateFilterValue}
                                    onSelect={handleSelect}
                                    numberOfMonths={2}
                                />
                                <div className="flex items-center justify-end gap-1.5 border-t border-border p-3">
                                    <Button variant="outline" onClick={() => column.setFilterValue(undefined)}>
                                        Clear
                                    </Button>
                                    <Button onClick={() => column.setFilterValue({
                                        from: startOfDay(new Date()),
                                        to: startOfDay(new Date())
                                    })}>Today</Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        :
                        <DebouncedInput
                            type="text"
                            value={(columnFilterValue ?? '') as string}
                            onChange={(value) => column.setFilterValue(value)}
                            placeholder={`Search...`}
                            className="w-full h-7 text-xs! text-primary font-medium rounded-xs focus-visible:outline-0"
                        />
}

// A typical debounced input react component
export function DebouncedInput({
                                   value: initialValue,
                                   onChange,
                                   debounce = 500,
                                   ...props
                               }: {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
    const [value, setValue] = React.useState(initialValue)

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)

        return () => clearTimeout(timeout)
    }, [value])

    return (
        <Input
            {...props}
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
    )
}

function DataGridTableHeadRowCellResize<TData>({header}: { header: Header<TData, unknown> }) {
    const {column} = header;

    return (
        <div
            {...{
                onDoubleClick: () => column.resetSize(),
                onMouseDown: header.getResizeHandler(),
                onTouchStart: header.getResizeHandler(),
                className:
                    'absolute top-0 h-full w-4 cursor-col-resize users-select-none touch-none -end-2 z-10 flex justify-center before:absolute before:w-px before:inset-y-0 before:bg-border before:-translate-x-px',
            }}
        />
    );
}

function DataGridTableRowSpacer() {
    return <tbody aria-hidden="true" className="h-2"></tbody>;
}

function DataGridTableBody({children}: { children: ReactNode }) {
    const {props} = useDataGrid();

    return (
        <tbody
            className={cn(
                '[&_tr:last-child]:border-0',
                props.tableLayout?.rowRounded && '[&_td:first-child]:rounded-s-lg [&_td:last-child]:rounded-e-lg',
                props.tableClassNames?.body,
            )}
        >
        {children}
        </tbody>
    );
}

function DataGridTableBodyRowSkeleton({children}: { children: ReactNode }) {
    const {table, props} = useDataGrid();

    return (
        <tr
            className={cn(
                'hover:bg-muted/40 data-[state=selected]:bg-muted/50',
                props.onRowClick && 'cursor-pointer',
                !props.tableLayout?.stripped &&
                props.tableLayout?.rowBorder &&
                'border-b border-border [&:not(:last-child)>td]:border-b',
                props.tableLayout?.cellBorder && '[&_>:last-child]:border-e-0',
                props.tableLayout?.stripped && 'odd:bg-muted/90 hover:bg-transparent odd:hover:bg-muted',
                table.options.enableRowSelection && '[&_>:first-child]:relative',
                props.tableClassNames?.bodyRow,
            )}
        >
            {children}
        </tr>
    );
}

function DataGridTableBodyRowSkeletonCell<TData>({children, column}: { children: ReactNode; column: Column<TData> }) {
    const {props, table} = useDataGrid();
    const bodyCellSpacing = bodyCellSpacingVariants({
        size: props.tableLayout?.dense ? 'dense' : 'default',
    });

    return (
        <td
            className={cn(
                'align-middle',
                bodyCellSpacing,
                props.tableLayout?.cellBorder && 'border-e',
                props.tableLayout?.columnsResizable && column.getCanResize() && 'truncate',
                column.columnDef.meta?.cellClassName,
                props.tableLayout?.columnsPinnable &&
                column.getCanPin() &&
                '[&[data-pinned=left][data-last-col=left]]:border-e! [&[data-pinned=right][data-last-col=right]]:border-s! [&[data-pinned][data-last-col]]:border-border data-pinned:bg-background/90 data-pinned:backdrop-blur-xs"',
                column.getIndex() === 0 || column.getIndex() === table.getVisibleFlatColumns().length - 1
                    ? props.tableClassNames?.edgeCell
                    : '',
            )}
        >
            {children}
        </td>
    );
}

function DataGridTableBodyRow<TData>({
                                         children,
                                         row,
                                         dndRef,
                                         dndStyle,
                                     }: {
    children: ReactNode;
    row: Row<TData>;
    dndRef?: React.Ref<HTMLTableRowElement>;
    dndStyle?: CSSProperties;
}) {
    const {props, table} = useDataGrid();

    return (
        <tr
            ref={dndRef}
            style={{...(dndStyle ? dndStyle : null)}}
            data-state={table.options.enableRowSelection && row.getIsSelected() ? 'selected' : undefined}
            onClick={() => props.onRowClick && props.onRowClick(row.original)}
            className={cn(
                'hover:bg-muted/40 data-[state=selected]:bg-muted/50',
                props.onRowClick && 'cursor-pointer',
                !props.tableLayout?.stripped &&
                props.tableLayout?.rowBorder &&
                'border-b border-border [&:not(:last-child)>td]:border-b',
                props.tableLayout?.cellBorder && '[&_>:last-child]:border-e-0',
                props.tableLayout?.stripped && 'odd:bg-muted/90 hover:bg-transparent odd:hover:bg-muted',
                table.options.enableRowSelection && '[&_>:first-child]:relative',
                props.tableClassNames?.bodyRow,
            )}
        >
            {children}
        </tr>
    );
}

function DataGridTableBodyRowExpandded<TData>({row}: { row: Row<TData> }) {
    const {props, table} = useDataGrid();

    return (
        <tr className={cn(props.tableLayout?.rowBorder && '[&:not(:last-child)>td]:border-b')}>
            <td colSpan={row.getVisibleCells().length}>
                {table
                    .getAllColumns()
                    .find((column) => column.columnDef.meta?.expandedContent)
                    ?.columnDef.meta?.expandedContent?.(row.original)}
            </td>
        </tr>
    );
}

function DataGridTableBodyRowCell<TData>({
                                             children,
                                             cell,
                                             dndRef,
                                             dndStyle,
                                         }: {
    children: ReactNode;
    cell: Cell<TData, unknown>;
    dndRef?: React.Ref<HTMLTableCellElement>;
    dndStyle?: CSSProperties;
}) {
    const {props} = useDataGrid();

    const {column, row} = cell;
    const isPinned = column.getIsPinned();
    const isLastLeftPinned = isPinned === 'left' && column.getIsLastColumn('left');
    const isFirstRightPinned = isPinned === 'right' && column.getIsFirstColumn('right');
    const bodyCellSpacing = bodyCellSpacingVariants({
        size: props.tableLayout?.dense ? 'dense' : 'default',
    });

    return (
        <td
            key={cell.id}
            ref={dndRef}
            {...(props.tableLayout?.columnsDraggable && !isPinned ? {cell} : {})}
            style={{
                ...(props.tableLayout?.columnsPinnable && column.getCanPin() && getPinningStyles(column)),
                ...(dndStyle ? dndStyle : null),
            }}
            data-pinned={isPinned || undefined}
            data-last-col={isLastLeftPinned ? 'left' : isFirstRightPinned ? 'right' : undefined}
            className={cn(
                'align-middle',
                bodyCellSpacing,
                props.tableLayout?.cellBorder && 'border-e',
                props.tableLayout?.columnsResizable && column.getCanResize() && 'truncate',
                cell.column.columnDef.meta?.cellClassName,
                props.tableLayout?.columnsPinnable &&
                column.getCanPin() &&
                '[&[data-pinned=left][data-last-col=left]]:border-e! [&[data-pinned=right][data-last-col=right]]:border-s! [&[data-pinned][data-last-col]]:border-border data-pinned:bg-background/90 data-pinned:backdrop-blur-xs"',
                column.getIndex() === 0 || column.getIndex() === row.getVisibleCells().length - 1
                    ? props.tableClassNames?.edgeCell
                    : '',
            )}
        >
            {children}
        </td>
    );
}

function DataGridTableEmpty() {
    const {table, props} = useDataGrid();
    const totalColumns = table.getAllColumns().length;

    return (
        <tr>
            <td colSpan={totalColumns} className="text-center text-muted-foreground py-6">
                {props.emptyMessage || 'No data available'}
            </td>
        </tr>
    );
}

function DataGridTableLoader() {
    const {props} = useDataGrid();

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
                className="text-muted-foreground bg-card  flex items-center gap-2 px-4 py-2 font-medium leading-none text-sm border shadow-xs rounded-md">
                <svg
                    className="animate-spin -ml-1 h-5 w-5 text-muted-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                            strokeWidth="3"></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                {props.loadingMessage || 'Loading...'}
            </div>
        </div>
    );
}

function DataGridTableRowSelect<TData>({row, size}: { row: Row<TData>; size?: 'sm' | 'md' | 'lg' }) {
    return (
        <>
            <div
                className={cn('hidden absolute top-0 bottom-0 start-0 w-[2px] bg-primary', row.getIsSelected() && 'block')}
            ></div>
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                size={size ?? 'sm'}
                className="align-[inherit]"
            />
        </>
    );
}

function DataGridTableRowSelectAll({size}: { size?: 'sm' | 'md' | 'lg' }) {
    const {table, recordCount, isLoading} = useDataGrid();

    return (
        <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
            disabled={isLoading || recordCount === 0}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            size={size}
            className="align-[inherit]"
        />
    );
}

function DataGridTable<TData>() {
    const {table, isLoading, props} = useDataGrid();
    const pagination = table.getState().pagination;

    return (
        <DataGridTableBase>
            <DataGridTableHead>
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>, index) => {
                    return (
                        <DataGridTableHeadRow headerGroup={headerGroup} key={index}>
                            {headerGroup.headers.map((header, index) => {
                                const {column} = header;

                                return (
                                    <DataGridTableHeadRowCell header={header} key={index}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        {props.tableLayout?.columnsResizable && column.getCanResize() && (
                                            <DataGridTableHeadRowCellResize header={header}/>
                                        )}
                                    </DataGridTableHeadRowCell>
                                );
                            })}
                        </DataGridTableHeadRow>
                    );
                })}
            </DataGridTableHead>

            {(props.tableLayout?.stripped || !props.tableLayout?.rowBorder) && <DataGridTableRowSpacer/>}

            <DataGridTableBody>
                {isLoading && props.loadingMode === 'skeleton' && pagination?.pageSize ? (
                    // Show skeleton loading immediately
                    Array.from({length: pagination.pageSize}).map((_, rowIndex) => (
                        <DataGridTableBodyRowSkeleton key={rowIndex}>
                            {table.getVisibleFlatColumns().map((column, colIndex) => {
                                return (
                                    <DataGridTableBodyRowSkeletonCell column={column} key={colIndex}>
                                        {column.columnDef.meta?.skeleton}
                                    </DataGridTableBodyRowSkeletonCell>
                                );
                            })}
                        </DataGridTableBodyRowSkeleton>
                    ))
                ) : isLoading && props.loadingMode === 'spinner' ? (
                    // Show spinner loading immediately
                    <tr>
                        <td colSpan={table.getVisibleFlatColumns().length} className="p-8">
                            <div className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-muted-foreground"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                {props.loadingMessage || 'Loading...'}
                            </div>
                        </td>
                    </tr>
                ) : table.getRowModel().rows.length ? (
                    // Show actual data when not loading
                    table.getRowModel().rows.map((row: Row<TData>, index) => {
                        return (
                            <Fragment key={row.id}>
                                <DataGridTableBodyRow row={row} key={index}>
                                    {row.getVisibleCells().map((cell: Cell<TData, unknown>, colIndex) => {
                                        return (
                                            <DataGridTableBodyRowCell cell={cell} key={colIndex}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </DataGridTableBodyRowCell>
                                        );
                                    })}
                                </DataGridTableBodyRow>
                                {row.getIsExpanded() && <DataGridTableBodyRowExpandded row={row}/>}
                            </Fragment>
                        );
                    })
                ) : (
                    <DataGridTableEmpty/>
                )}
            </DataGridTableBody>
        </DataGridTableBase>
    );
}

export {
    DataGridTable,
    DataGridTableBase,
    DataGridTableBody,
    DataGridTableBodyRow,
    DataGridTableBodyRowCell,
    DataGridTableBodyRowExpandded,
    DataGridTableBodyRowSkeleton,
    DataGridTableBodyRowSkeletonCell,
    DataGridTableEmpty,
    DataGridTableHead,
    DataGridTableHeadRow,
    DataGridTableHeadRowCell,
    DataGridTableHeadRowCellResize,
    DataGridTableLoader,
    DataGridTableRowSelect,
    DataGridTableRowSelectAll,
    DataGridTableRowSpacer,
};
