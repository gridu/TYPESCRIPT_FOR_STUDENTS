import { 
    IsNumber,
    IsString,
    Min,
    Max,
    Length,
} from "class-validator"


export enum ProjectStatus {
    ACTIVE,
    FINISHED,
}

export class Project {
    @IsString()
    id: string

    @IsString()
    @Length(1, 10)
    title: string

    @IsString()
    @Length(1, )
    description: string

    @IsNumber()
    @Min(1)
    @Max(10)
    people: number

    constructor(
        _title: string,
        _description: string,
        _people: number,
        public status: ProjectStatus,
    ) {
        this.id = Math.random().toString();

        this.title = _title;
        this.description = _description;
        this.people = _people;
    }
}