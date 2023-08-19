import { User, Role, HTTPMethod, Request_ } from "./types";


const userMock: User = {
    name: 'User Name',
    age: 26,
    roles: [
      Role.User,
      Role.Admin,
    ],
    createdAt: new Date(),
    isDeleated: false,
};


export const requestsMock: Request_[] = [
    {
        method: HTTPMethod.POST,
        host: 'service.example',
        path: 'user',
        body: userMock,
        params: {},
    },
    {
        method: HTTPMethod.GET,
        host: 'service.example',
        path: 'user',
        params: {
            id: '3f5h67s4s'
        },
    }
];