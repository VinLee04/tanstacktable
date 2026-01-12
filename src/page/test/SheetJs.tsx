import {faker} from "@faker-js/faker/locale/vi";
import {useCallback, useEffect, useState} from "react";
import * as XLSX from "xlsx";
import {Button} from "@/components/ui/button.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";

interface Material {
    id: number;
    code: string;
    name: string;
    description: string;
    price: number;
    status: string;
    stock: number;
}

const makeMaterial = (num: number) => {
    const materials: Material[] = [];
    for (let i = 0; i < num; i++) {
        materials.push({
            id: i + 1,
            code: faker.string.nanoid(10),
            name: faker.commerce.productMaterial(),
            description: faker.commerce.productDescription(),
            price: Number(faker.commerce.price({min: 100, max: 800})),
            status: faker.helpers.arrayElement(['In Stock', 'Out of Stock', 'Disabled']),
            stock: 0,
        })
    }

    const result: Material[] = materials.map(m => ({
        ...m,
        stock: m.status == 'Out of Stock' ? 0 : faker.number.int({min: 30, max: 500})
    }));
    return result;
}

export const SheetJs = () => {

    /* the component state is an array of presidents */
    const [pres, setPres] = useState<Material[]>([]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPres(makeMaterial(20));
    }, []);

    /* get state data and export to XLSX */
    const exportFile = useCallback(() => {
        /* generate worksheet from state */
        const workSheet = XLSX.utils.json_to_sheet(pres);
        /* create workbook and append worksheet */
        const workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, "Data");
        /* export to XLSX */
        XLSX.writeFile(workBook, "SheetJSReactAoO.xlsx");
    }, [pres]);


    return (
        <>
            <section className='h-screen flex justify-center items-center'>

                <div className='w-fit'>
                    <div className='flex justify-end gap-x-4 mb-3'>
                        {/* Import Button */}

                        <Button variant="outline" onClick={() => setPres([])}>Clear</Button>
                        <div className='relative'>
                            <Button variant="outline">Import</Button>
                            <input type="file" className='absolute inset-0 opacity-0 cursor-pointer'
                                   onChange={async (e: any) => {
                                       /* get data as an ArrayBuffer */
                                       const file = e.target.files[0];
                                       const data = await file.arrayBuffer();

                                       /* parse and load first worksheet */
                                       const wb = XLSX.read(data);
                                       const ws = wb.Sheets[wb.SheetNames[0]];
                                       setPres(XLSX.utils.sheet_to_json(ws))
                                   }}/>
                        </div>
                        <Button variant="outline" onClick={exportFile}>Export</Button>
                    </div>
                    <Table border={2}>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Index</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Stock</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pres.map(row => (
                                <TableRow>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.code}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.description}</TableCell>
                                    <TableCell>{row.status}</TableCell>
                                    <TableCell>{row.stock}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

            </section>
        </>
    )
}

