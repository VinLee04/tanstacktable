'use client';

import {Button} from '@/components/table/button.tsx';
import {Calendar} from '@/components/table/calendar.tsx';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover.tsx';
import {cn} from '@/lib/utils.ts';
import {
    endOfMonth,
    endOfWeek,
    endOfYear,
    format,
    isEqual,
    startOfDay,
    startOfMonth, startOfToday,
    startOfWeek,
    startOfYear,
    subDays,
    subMonths,
    subYears,
} from 'date-fns';
import {Calendar as CalendarIcon} from 'lucide-react';
import {useEffect, useState} from 'react';
import {type DateRange} from 'react-day-picker';

type DatePickerSelectProps = {
    date: DateRange | undefined,
    setDate: (date: DateRange) => void,
}

export default function DatePickerSelect({date, setDate}: DatePickerSelectProps) {
    const today = startOfToday();
    // console.log('This Week: ' + format(startOfWeek(today), 'dd') + ' - ' + format(endOfWeek(today), 'dd'));
    // console.log('Last Week: ' + format(startOfWeek(subDays(today, 7)), 'dd') + ' - ' + format(endOfWeek(subDays(today, 7)), 'dd'));
    // console.log('Last 2 Week: ' + format(startOfWeek(subDays(today, 7*2)), 'dd') + ' - ' + format(endOfWeek(subDays(today, 7*2)), 'dd'));
    // console.log('Last 3 Week: ' + format(startOfWeek(subDays(today, 7*3)), 'dd') + ' - ' + format(endOfWeek(subDays(today, 7*3)), 'dd'));
    // console.log('Last 4 Week: ' + format(startOfWeek(subDays(today, 7*4)), 'dd') + ' - ' + format(endOfWeek(subDays(today, 7*4)), 'dd'));

    // Define preset ranges in an array
    const presets = [
        {label: 'This Week', range: {from: startOfWeek(today), to: endOfWeek(today)}},
        {label: 'Last Week', range: {from: startOfWeek(subDays(today, 7)), to: endOfWeek(subDays(today, 7))}},
        {label: 'Last 2 Week', range: {from: startOfWeek(subDays(today, 7 * 2)), to: endOfWeek(subDays(today, 7 * 2))}},
        {label: 'Last 3 Week', range: {from: startOfWeek(subDays(today, 7 * 3)), to: endOfWeek(subDays(today, 7 * 3))}},
        {label: 'This Month', range: {from: startOfMonth(today), to: today}},
        {
            label: 'Last month',
            range: {
                from: startOfMonth(subMonths(today, 1)),
                to: endOfMonth(subMonths(today, 1)),
            },
        },
        {label: 'This Year', range: {from: startOfYear(today), to: today}},
        {
            label: 'Last year',
            range: {
                from: startOfYear(subYears(today, 1)),
                to: endOfYear(subYears(today, 1)),
            },
        },
    ];
    useEffect(() => {
        setDate(defaultPreset.range);
    }, []);

    const [month, setMonth] = useState(today);
    const defaultPreset = presets[1];
    const [selectedPreset, setSelectedPreset] = useState<string | null>(defaultPreset.label);

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const handleApply = () => {
        if (date) {
            setDate(date);
        }
        setIsPopoverOpen(false);
    };

    const handleReset = () => {
        setDate(defaultPreset.range);
        setSelectedPreset(defaultPreset.label);
        setIsPopoverOpen(false);
    };

    const handleSelect = (selected: DateRange | undefined) => {
        setDate({
            from: selected?.from || undefined,
            to: selected?.to || undefined,
        });
        setSelectedPreset(null); // Clear preset when manually selecting a range
    };

    // Update `selectedPreset` whenever `date` changes
    useEffect(() => {
        const matchedPreset = presets.find(
            (preset) =>
                isEqual(startOfDay(preset.range.from), startOfDay(date?.from || new Date(0))) &&
                isEqual(startOfDay(preset.range.to), startOfDay(date?.to || new Date(0))),
        );
        setSelectedPreset(matchedPreset?.label || null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    mode="input"
                    placeholder={!date?.from && !date?.to}
                    className="w-[250px]"
                >
                    <CalendarIcon/>
                    {date?.from ? (
                        date.to ? (
                            <>
                                {selectedPreset ? selectedPreset :
                                    <>
                                        {format(date.from, 'yyyy/MM/dd')} - {format(date.to, 'yyyy/MM/dd')}
                                    </>
                                }
                            </>
                        ) : (
                            format(date.from, 'yyyy/MM/dd')
                        )
                    ) : (
                        <span>Pick a date range</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
                <div className="flex max-sm:flex-col">
                    <div className="relative border-border max-sm:order-1 max-sm:border-t sm:w-32">
                        <div className="h-full border-border sm:border-e py-2">
                            <div className="flex flex-col px-2 gap-[2px]">
                                {presets.map((preset, index) => (
                                    <Button
                                        key={index}
                                        type="button"
                                        variant="ghost"
                                        className={cn('h-8 w-full justify-start', selectedPreset === preset.label && 'bg-accent')}
                                        onClick={() => {
                                            setDate(preset.range);

                                            // Update the calendar to show the starting month of the selected range
                                            setMonth(preset.range.from || today);

                                            setSelectedPreset(preset.label); // Explicitly set the active preset
                                        }}
                                    >
                                        {preset.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <Calendar
                        autoFocus
                        mode="range"
                        month={month}
                        onMonthChange={setMonth}
                        showOutsideDays={false}
                        selected={date}
                        onSelect={handleSelect}
                        numberOfMonths={2}
                    />
                </div>
                <div className="flex items-center justify-end gap-1.5 border-t border-border p-3">
                    <Button variant="outline" onClick={handleReset}>
                        Reset
                    </Button>
                    <Button onClick={handleApply}>Apply</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
