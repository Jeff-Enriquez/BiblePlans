import { Book } from './book';
export class Bible {
    version: string;
    books: Book[] = [];
    constructor(version: string) {
        this.version = version;
    }
}
