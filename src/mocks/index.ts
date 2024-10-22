import { TUser, Role, THttpRequest, HttpMethod } from '../types';

export const userMock: TUser = {
    name: 'User Name',
    age: 26,
    roles: [
        Role.USER,
        Role.ADMIN
    ],
    createdAt: new Date(),
    isDeleted: false,
};

export const requestsMock: THttpRequest<TUser>[] = [
    {
        method: HttpMethod.POST,
        host: 'service.example',
        path: 'user',
        body: userMock,
        params: {},
    },
    {
        method: HttpMethod.GET,
        host: 'service.example',
        path: 'user',
        params: {
            id: '3f5h67s4s'
        },
    }
];