import {faker} from "@faker-js/faker/locale/vi";
import {startOfDay} from "date-fns";

export type TUser = {
    id: string;
    username: string;
    avatar: string;
    email: string;
    role: string;
    active: boolean;
    joinDate: Date;
    salary: number;
    national: string;
    flag: string;
}

const getFlag = (name: string) => {
    return name == 'Vietnamese' ? '🇻🇳' : name == 'Korean' ? '🇰🇷' : '🇺🇸';
}

export const makeUser = (num: number) => {
    const today = new Date();

    const users: TUser[] = [];
    for (let i = 0; i < num; i++) {
        users.push({
            id: faker.string.uuid(),
            username: faker.internet.username(),
            avatar: faker.image.avatar(),
            email: faker.internet.email(),
            role: faker.helpers.arrayElement(['STAFF', 'LEADER', 'MANAGER', "INTERN"]),
            active: faker.datatype.boolean(),
            joinDate: startOfDay(faker.date.between({from: '2025/12/1', to: today})),
            salary: faker.number.int({min: 100, max: 500}),
            national: faker.helpers.arrayElement(['Vietnamese', 'Korean', 'United State']),
            flag: '',
        })
    }

    return users.map((user: TUser) => ({
        ...user,
        flag: getFlag(user.national),
    }));
}