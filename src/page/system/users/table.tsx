import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/table/avatar"
import {Card, CardFooter, CardHeader, CardTitle} from "@/components/table/card"
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area"
import {
    type ColumnDef,
    type ColumnFiltersState,
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type PaginationState,
    type RowSelectionState,
    type SortingState,
    useReactTable
} from "@tanstack/react-table";
import {
    DataGridTable,
    DataGridTableRowSelect,
    DataGridTableRowSelectAll,
    DebouncedInput
} from "@/components/table/data-grid-table.tsx";
import {makeUser, type TUser} from "@/mock/user.ts";
import {useEffect, useMemo, useState} from "react";
import {DataGridColumnHeader} from "@/components/table/data-grid-column-header.tsx";
import {DataGrid} from "@/components/table/data-grid.tsx";
import {DataGridPagination} from "@/components/table/data-grid-pagination.tsx";
import {CardTable, CardToolbar} from "@/components/table/card.tsx";
import {DataGridColumnVisibility} from "@/components/table/data-grid-column-visibility.tsx";
import {Cat, ListFilter, Pause, Play, Settings2, X} from "lucide-react";
import {TableActionBar} from "@/components/table/table-action-bar.tsx";
import {Button} from "@/components/table/button.tsx";
import {ActiveBadge, Badge, type TUserRole, UserRoleBadge} from "@/components/table/badge.tsx";
import {Checkbox} from "@/components/table/checkbox.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Skeleton} from "@/components/table/skeleton.tsx";
import UserManagementUpdateForm from "@/page/system/users/update-form.tsx";
import type {DateRange} from "react-day-picker";
import {format, isWithinInterval} from "date-fns";
import {ButtonGroup} from "@/components/ui/button-group.tsx";

const UserManagementTable = () => {
    const [userData, setUserData] = useState<TUser[] | undefined>(undefined);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const newData = makeUser(20000);
        new Promise(resolve => setTimeout(resolve, 4300)).then(() => {
                setUserData(newData);
                setLoading(false);
            }
        )
    }, []);

    const [sorting, setSorting] = useState<SortingState>([{id: 'name', desc: true}]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 25,
    });
    const [isShowFilter, setIsShowFilter] = useState<boolean>(false);

    const [selectedIds, setSelectedIds] = useState<Pick<TUser, 'id'>[]>([]);
    const [selectedUser, setSelectedUser] = useState<TUser | undefined>(undefined);

    useEffect(() => {
        const selectedRowIds = Object.keys(rowSelection) as unknown as Pick<TUser, 'id'>[];
        setSelectedIds(selectedRowIds.length > 0 ? selectedRowIds : []);
    }, [rowSelection]);

    useEffect(() => {
        if (selectedIds.length == 1) {
            const user = userData?.filter(u => u.id as unknown as Pick<TUser, 'id'> == selectedIds[0])[0];
            setSelectedUser(user);
        }
    }, [selectedIds, userData]);

    const [selectedRole, setSelectedRole] = useState<string[]>([]);

    const roleCount = useMemo(() => {
        return userData?.reduce(
            (acc, item) => {
                acc[item.role] = (acc[item.role] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );
    }, [userData]);
    const handleRoleChange = (checked: boolean, value: string) => {
        setSelectedRole(
            (
                prev = [],
            ) => (checked ? [...prev, value] : prev.filter((v) => v !== value)),
        );
    };

    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredData = useMemo(() => {
        return userData?.filter((item) => {
            // Filter by status
            const matchesRole = !selectedRole?.length || selectedRole.includes(item.role);

            // Filter by search query (case-insensitive)
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                !searchQuery ||
                Object.values(item)
                    .join(' ')
                    .toLowerCase()
                    .includes(searchLower);

            return matchesRole && matchesSearch;
        });
    }, [searchQuery, selectedRole, userData]);

    const columns = useMemo<ColumnDef<TUser>[]>(
        () => [
            {
                accessorKey: 'id',
                header: () => <DataGridTableRowSelectAll/>,
                cell: ({row}) => <DataGridTableRowSelect row={row}/>,
                size: 10,
                meta: {
                    headerClassName: 'max-w-[35px]',
                    cellClassName: 'max-w-[35px]',
                },
                enableSorting: false,
                enableHiding: false,
                enableColumnFilter: false,
                enableResizing: false,
            },
            {
                accessorKey: 'username',
                id: 'username',
                header: ({column}) => <DataGridColumnHeader column={column} title='Username'/>,
                cell: ({row}) => {
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                                <AvatarImage src={row.original.avatar} alt={row.original.username}/>
                                <AvatarFallback>N</AvatarFallback>
                            </Avatar>
                            <div className="space-y-px">
                                <div className="font-medium text-foreground">{row.original.username}</div>
                                <div className="text-muted-foreground">{row.original.email}</div>
                            </div>
                        </div>
                    );
                },
                filterFn: (row, _, filterValue: string) => {
                    return row.original.username.toLowerCase().includes(filterValue.toLowerCase()) || row.original.email.toLowerCase().includes(filterValue.toLowerCase())
                },
                meta: {
                    skeleton: (
                        <div className="flex items-center gap-3 h-[41px]">
                            <Skeleton className="size-8 rounded-full"/>
                            <div className="space-y-1">
                                <Skeleton className="h-5 w-52"/>
                                <Skeleton className="h-4 w-64"/>
                            </div>
                        </div>
                    ),
                },
                enableSorting: true,
                enableHiding: false,
                enableColumnFilter: isShowFilter
            },
            {
                accessorKey: 'role',
                id: 'role',
                header: ({column}) => <DataGridColumnHeader column={column} title='Role'/>,
                cell: ({cell}) => <UserRoleBadge className='py-3.5' role={cell.getValue() as TUserRole}/>,
                filterFn: (row, _, filterValue: (string | null)[]) => {
                    if (filterValue.length == 0) return true;
                    return filterValue.includes(row.original.role);
                },
                meta: {
                    headerClassName: '',
                    cellClassName: '',
                    filterVariant: 'combobox',
                    skeleton: <Skeleton className="w-28 h-7"/>,
                },
                enableSorting: true,
                enableHiding: true,
                enableResizing: true,
                enableColumnFilter: isShowFilter,
            },
            {
                accessorKey: 'national',
                header: ({column}) => <DataGridColumnHeader column={column} title='Nationality'/>,
                cell: ({row}) => {
                    return (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger className='text-2xl'>{row.original.flag}</TooltipTrigger>
                                <TooltipContent>
                                    {row.original.national}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                },
                size: 160,
                meta: {
                    headerClassName: '',
                    cellClassName: 'text-center',
                    filterVariant: 'multiple',
                    skeleton: <Skeleton className="w-9 h-7 mx-auto"/>,
                    headerTitle: 'Nationality',
                },
                filterFn: (row, _, filterValue: (string | null)[]) => {
                    if (!filterValue) return true;
                    if (filterValue.length == 0) return true;
                    return filterValue.includes(row.original.national);
                },
                enableSorting: true,
                enableHiding: true,
                enableResizing: true,
                enableColumnFilter: isShowFilter,
            },
            {
                accessorKey: "salary",
                header: ({column}) => <DataGridColumnHeader column={column} title='Salary'/>,
                cell: ({row}) => {
                    const amount = parseFloat(row.getValue("salary"))

                    // Format the amount as a dollar amount
                    const formatted = new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                    }).format(amount)

                    return <div className="text-center text-emerald-500 font-bold">{formatted}</div>
                },
                enableColumnFilter: isShowFilter,
                meta: {
                    filterVariant: 'range',
                    skeleton: <Skeleton className="w-28 h-7"/>,
                },
            },
            {
                accessorKey: 'joinDate',
                id: 'joinDate',
                header: ({column}) => <DataGridColumnHeader column={column} title='Join Date'/>,
                cell: ({row}) => format(row.original.joinDate, 'yyyy/MM/dd'),
                meta: {
                    headerClassName: '',
                    skeleton: <Skeleton className="w-28 h-7"/>,
                    filterVariant: 'date',
                    headerTitle: 'Join Date'
                },
                filterFn: (row, _, filterValue: DateRange | undefined) => {
                    return !filterValue || !filterValue.from || isWithinInterval(row.original.joinDate, {
                        start: filterValue.from,
                        end: filterValue.to!
                    });
                },
                enableSorting: true,
                enableHiding: true,
                enableResizing: true,
                enableColumnFilter: isShowFilter,
            },
            {
                accessorKey: 'active',
                id: 'available-disabled',
                header: ({column}) => <DataGridColumnHeader column={column} title='Active'/>,
                cell: ({cell}) => <ActiveBadge className='py-3.5' isActive={cell.getValue() as boolean}/>,
                meta: {
                    headerClassName: '',
                    cellClassName: '',
                    filterVariant: 'select',
                    skeleton: <Skeleton className="w-28 h-7"/>,
                    headerTitle: 'Active'
                },
                enableSorting: true,
                enableHiding: true,
                enableResizing: true,
                enableColumnFilter: isShowFilter,
            },

        ], [isShowFilter]
    )

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        columns,
        data: filteredData ?? [],
        pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
        getRowId: (row: TUser) => String(row.id),
        state: {
            pagination,
            sorting,
            columnFilters,
            rowSelection,
        },
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange: setPagination,
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),

        columnResizeMode: 'onChange',
    });

    const handleActive = (isActive: boolean) => {
        setUserData(prev => prev?.map(u => selectedIds.includes(u.id as unknown as Pick<TUser, 'id'>) ? {
            ...u,
            active: isActive ? 'Available' : 'Disabled'
        } : u));
        table.setRowSelection({});
    }
    return (
        <>
            <section className='minHeight max-w-7xl w-full px-6'>

                <DataGrid
                    table={table}
                    recordCount={filteredData?.length || 0}
                    isLoading={loading}
                    loadingMode='skeleton'
                    tableLayout={{
                        headerBorder: true,
                        headerBackground: false,
                        headerSticky: true,
                        rowBorder: true,
                        cellBorder: false,

                        width: "auto",

                    }}
                >
                    <Card>
                        <CardHeader className="py-3.5">
                            <CardTitle>User Management </CardTitle>

                            <DebouncedInput
                                value={searchQuery}
                                onChange={(value) => setSearchQuery(value as string)}
                                placeholder="Search everything..."
                                className="max-w-sm"
                            />

                            <CardToolbar>
                                <Button onClick={() => setLoading(prev => !prev)}
                                        size='xs'>{loading ? <Pause/> : <Play/>}</Button>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size='xs'>
                                            <Cat/>
                                            Role
                                            {selectedRole.length > 0 && (
                                                <Badge size="sm" appearance="outline">
                                                    {selectedRole.length}
                                                </Badge>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-44 p-3" align="end">
                                        <div className="space-y-3">
                                            <div className="text-xs font-medium text-muted-foreground">Filters</div>
                                            <div className="space-y-3">
                                                {roleCount && Object.keys(roleCount).map((role) => (
                                                    <div key={role} className="flex items-center gap-2.5">
                                                        <Checkbox
                                                            id={role}
                                                            checked={selectedRole.includes(role)}
                                                            onCheckedChange={(checked) => handleRoleChange(checked === true, role)}
                                                        />
                                                        <Label
                                                            htmlFor={role}
                                                            className="grow flex items-center justify-between font-normal gap-1.5"
                                                        >
                                                            {role}
                                                            {/* <TaskStatusBadge status={role as TTaskStatus}/> */}
                                                            <span
                                                                className="text-muted-foreground">{roleCount[role]}</span>
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <ButtonGroup>
                                    <Button variant='secondary' size='xs'
                                            onClick={() => setIsShowFilter(prev => !prev)}><ListFilter/> Filter</Button>
                                    {columnFilters.length > 0 && (
                                        <Button variant='primary' size='xs'
                                                onClick={() => setColumnFilters([])}><X/></Button>
                                    )}
                                </ButtonGroup>
                                <DataGridColumnVisibility
                                    table={table}
                                    trigger={
                                        <Button variant="outline" size="xs">
                                            <Settings2/>
                                            Columns
                                        </Button>
                                    }
                                />
                            </CardToolbar>
                        </CardHeader>
                        <CardTable>
                            <ScrollArea className='h-[600px] overflow-auto'>
                                <DataGridTable/>
                                <ScrollBar orientation="horizontal"/>
                            </ScrollArea>
                        </CardTable>
                        <CardFooter>
                            <DataGridPagination/>
                        </CardFooter>
                    </Card>


                </DataGrid>


                <TableActionBar table={table} selectedIds={selectedIds}>

                    <Button size='sm' className='p-0'>
                        <Badge className='w-full h-full font-semibold' variant='success'
                               appearance='outline' onClick={() => handleActive(true)}>Active</Badge>
                    </Button>
                    <Button size='sm' className='p-0'>
                        <Badge className='w-full h-full font-semibold' variant='destructive'
                               appearance='outline' onClick={() => handleActive(false)}>Disable</Badge>
                    </Button>
                    {selectedIds.length == 1 && <UserManagementUpdateForm user={selectedUser}/>}
                </TableActionBar>
            </section>
        </>
    );
}

export default UserManagementTable;