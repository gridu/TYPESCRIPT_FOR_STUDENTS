import {Role} from "./Role";

export class User {

    private _name: string;
    private _age: number;
    private _roles: Role[];
    private _createdAt: Date;
    private _isDeleted: boolean;

    constructor(name: string, age: number, roles: Role[], createdAt: Date, isDeleted: boolean) {
        this._name = name;
        this._age = age;
        this._roles = roles;
        this._createdAt = createdAt;
        this._isDeleted = isDeleted;
    }

    get name(): string {
        return this._name;
    }

    get age(): number {
        return this._age;
    }

    get roles(): Role[] {
        return this._roles;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get isDeleted(): boolean {
        return this._isDeleted;
    }
}
