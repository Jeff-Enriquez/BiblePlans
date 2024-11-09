export class Verse {
    verseNumber: number;
    heading: string | null = null;
    subHeading: string | null = null;
    wordCount: number | null = null;
    constructor(verseNumber: number) {
        this.verseNumber = verseNumber;
    }
}
