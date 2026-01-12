import type {RowData} from "@tanstack/react-table";
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import MainLayout from "@/components/layout/main-layout.tsx";
import UserManagementPage from "@/page/system/users";

declare module '@tanstack/react-table' {
    //allows us to define custom properties for our columns
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: 'text' | 'range' | 'select' | 'combobox' | 'multiple' | 'date';
        options?: string[];
        headerAlign?: 'left' | 'center' | 'right';
    }
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout/>,
        children: [
            {index: true, element: <UserManagementPage/>},
            {path: 'users', element: <UserManagementPage/>},

        ]
    }
]);

function App() {

    return (
        <RouterProvider router={router}></RouterProvider>
    )
}

export default App
