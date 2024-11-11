export interface Bible {
    translation: Translation,
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
    heading?: string | undefined,
    subHeading?: string | undefined
}
export interface BibleIndex {
    book: number,
    chapter: number,
    verse: number
}
export const translations = ["all-translations", "CSB", "ESV", "NASB", "NIV", "NKJV", "NLT"] as const;
export type Translation = typeof translations[number];