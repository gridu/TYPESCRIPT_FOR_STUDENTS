import {HttpRequest} from "./HttpRequest";
import {HttpMethod} from "./HttpMethod";
import {Role} from "../model/Role";
import {User} from "../model/User";

export const userMock: User = new User(
    'Jon',
    26,
    [
        Role.user,
        Role.admin
    ],
    new Date(),
    false);


export const requestsMock: HttpRequest<User>[] = [
    new HttpRequest(HttpMethod.POST,
        'service.example',
        'user',
        new Map(),
        userMock),
    new HttpRequest(HttpMethod.GET,
        'service.example',
        'user',
        new Map<string, string>([['id', '3f5h67s4s']]))
];
