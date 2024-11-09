import { Chapter } from './chapter';
export class Book {
    bookTitle: string;
    bookId: number;
    chapters: Chapter[] = [];
    constructor(bookTitle: string, bookId: number) {
        this.bookTitle = bookTitle;
        this.bookId = bookId;
    }
}
