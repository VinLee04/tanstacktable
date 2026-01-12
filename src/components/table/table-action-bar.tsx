import type {Table} from "@tanstack/react-table";
import React from "react";
import {ActionBar} from "@/components/table/action-bar.tsx";
import {ButtonGroup} from "@/components/ui/button-group.tsx";
import {Button} from "@/components/table/button.tsx";
import {X} from "lucide-react";

export function TableActionBar<T>({table, selectedIds, children}: {
    table: Table<T>,
    // @ts-ignore
    selectedIds: Pick<T, 'id'>[],
    children: React.ReactNode
}) {
    const rows = table.getFilteredSelectedRowModel().rows;

    const onOpenChange = React.useCallback((open: boolean) => {
            if (!open) {
                table.toggleAllRowsSelected(false);
            }
        },
        [table],
    );

    return (
        <ActionBar open={rows.length > 0} onOpenChange={onOpenChange}>
            <ButtonGroup>
                <Button size='sm'>{rows.length} selected</Button>
                <Button size='sm' onClick={() => table.setRowSelection({})}><X/></Button>
            </ButtonGroup>

            {children}

            {/*<Button size='sm' variant='outline' className='rounded-sm' onClick={() => alert(JSON.stringify(rows, null, 2))}>Selected*/}
            {/*    Rows</Button>*/}
            <Button size='sm' variant='outline' className='rounded-sm'
                    onClick={() => alert(JSON.stringify(selectedIds, null, 2))}>Selected Ids</Button>
        </ActionBar>
    );
}
