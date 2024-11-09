export interface Bible {
    translation: string,
    fullName: string,
    publisher: string,
    publicationYears: number[],
    books: Book[]
}
export interface Book {
    title: string,
    chapters: Chapter[]
}
export interface Chapter {
    chapter: number,
    verses: Verse[]
}
export interface Verse {
    verse: number,
    wordCount: number | null,
    heading?: string | null,
    subHeading?: string | null
}