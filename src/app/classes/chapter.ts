import { Verse } from './verse';
export class Chapter {
    chapterNumber: number;
    verses: Verse[] = [];
    constructor(chapterNumber: number) {
        this.chapterNumber = chapterNumber;
    }
}
