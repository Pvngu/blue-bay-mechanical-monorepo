'use client';

import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { UseMutationResult } from '@tanstack/react-query';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface CustomAction<TData> {
    label: string;
    onClick: (row: TData) => void;
    className?: string;
}

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
    resource: string;
    deleteItem: UseMutationResult<any, Error, string | number, unknown>;
    onEdit: (id: string | number) => void;
    customActions?: CustomAction<TData>[];
}

// Make sure TData has an 'id' field
interface WithId {
    id: string | number;
}

export function DataTableRowActions<TData extends WithId>({
    row,
    resource,
    deleteItem,
    onEdit,
    customActions = [],
}: DataTableRowActionsProps<TData>) {
    const [isDeleting, setIsDeleting] = useState(false);
    const itemId = row.original.id;

    const handleDelete = () => {
        deleteItem.mutate(itemId, {
            onSettled: () => {
                    setIsDeleting(false);
            },
        });
    }

    return(
        <>
            <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this {resource}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleting(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            disabled={deleteItem.isPending}
                        >
                            {deleteItem.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {customActions.length > 0 && (
                        <>
                            {customActions.map((action, index) => (
                                <DropdownMenuItem
                                    key={index}
                                    onClick={() => action.onClick(row.original)}
                                    className={action.className}
                                >
                                    {action.label}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                        </>
                    )}
                    <DropdownMenuItem onClick={() => onEdit(itemId)}>
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={() => setIsDeleting(true)}
                        className="text-red-600 focus:text-red-600 hover:text-red-600"
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
};