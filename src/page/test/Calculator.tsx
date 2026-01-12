import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx"
import {Input} from "@/components/ui/input.tsx";
import {cn} from "@/lib/utils.ts";
import {useCallback, useEffect, useState} from "react";

export const Calculator = () => {
    const [calText, setCalText] = useState<string>('');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleCalculation = () => {
        setCalText(eval(calText));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const buttons = [
        '7', '8', '9', 'C', '<',
        '4', '5', '6', '+', '-',
        '1', '2', '3', '*', '/',
        'x²', '0', '.', '%', '=',
    ]
    const onButtonClicked = useCallback((btn: string) => {
        switch (btn) {
            case '<': {
                setCalText(prev => prev.slice(0, -1))
                break;
            }
            case 'C': {
                setCalText('');
                break;
            }
            case 'x²': {
                setCalText(eval(calText+'*'+calText));
                break;
            }
            // case '.' :{
            //     // eslint-disable-next-line react-hooks/unsupported-syntax
            //     setCalText(eval(calText+'/2'));
            //     break;
            // }
            case '=': {
                handleCalculation();
                break;
            }
            default:
                setCalText(calText + btn);
        }
    }, [calText, handleCalculation])

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            buttons.forEach(v => {
                if(e.key == v){
                    e.preventDefault();
                    onButtonClicked(v);
                }
            })

            if(e.key == 'Backspace'){
                e.preventDefault();
                onButtonClicked('<');
            }
            if(e.ctrlKey && e.key == 'Backspace'){
                e.preventDefault();
                onButtonClicked('C');
            }
            if(e.key == 'Enter'){
                e.preventDefault();
                onButtonClicked('=');
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [buttons, onButtonClicked]);

    return (
        <Card className='w-md'>
            <CardHeader>
                <Input value={calText} className='!text-lg h-14'/>
            </CardHeader>
            <CardContent>

                <div className='grid grid-cols-5 gap-3'>
                    {buttons.map((button) => (
                        <div
                            onClick={() => onButtonClicked(button)}
                            className={cn(
                                'w-full border shadow aspect-square cursor-pointer rounded-md select-none text-center text-xl font-bold font-sans leading-[70px]',
                                'hover:scale-95 active:scale-[1.002] transition-transform ease-in-out'
                            )}>
                            {button}
                        </div>
                    ))}
                </div>

            </CardContent>
        </Card>
    );
};