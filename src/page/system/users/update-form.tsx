import {useForm} from "@tanstack/react-form";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/table/dialog.tsx";
import {Button} from "@/components/table/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import type {TUser} from "@/mock/user.ts";
import z from 'zod';
import {toast} from "sonner";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field.tsx";

interface UserManagementUpdateFormProps {
    user?: TUser | undefined
}

const formSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters.")
        .max(20, "Username must be at most 14 characters."),
    email: z.email(),
    role: z
        .string()
        .min(1, "Please select your role.")
        .refine((val) => val !== "auto", {
            message:
                "Auto-detection is not allowed. Please select a specific role.",
        }),
    active: z.boolean(),
    joinDate: z.date(),
    salary: z.number().min(100).max(500),
});

const UserManagementUpdateForm = ({user}: UserManagementUpdateFormProps) => {

    const form = useForm({
        defaultValues: {...user},
        validators: {onSubmit: formSchema,},
        onSubmit: async ({value}) => {
            toast("You submitted the following values:", {
                description: (
                    <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
                    <code>{JSON.stringify(value, null, 2)}</code>
                  </pre>
                ),
                position: "bottom-right",
                classNames: {
                    content: "flex flex-col gap-2",
                },
                style: {
                    "--border-radius": "calc(var(--radius)  + 4px)",
                } as React.CSSProperties,
            })
        },
    });


    return (
        <Dialog>
            <DialogTrigger asChild
                           children={<Button className='cursor-pointer' size='xs' variant='secondary'>Update</Button>}/>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Make changes to your profile here.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="user-update-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >
                    <FieldGroup>
                        <form.Field
                            name="username"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            placeholder="Enter New Username"
                                            autoComplete="off"
                                        />
                                        {isInvalid && (
                                            <FieldError errors={field.state.meta.errors}/>
                                        )}
                                    </Field>
                                )
                            }}
                        />

                    </FieldGroup>
                </form>


                <DialogFooter className="mt-8 flex [&>*]:flex-1">
                    <Button type="button" className='max-w-[80px]' variant="secondary" onClick={() => form.reset()}>
                        Reset
                    </Button>
                    <DialogClose asChild children={<Button variant="outline">Cancel</Button>}/>
                    <Button type="submit" form="user-update-form">
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default UserManagementUpdateForm;