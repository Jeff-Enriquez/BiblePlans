export interface Heading {
    from: BibleIndex,
    to: BibleIndex,
    missingTranslations?: string[],
    wordCount: number
}
export interface BibleIndex {
    book: number,
    chapter: number,
    verse: number
}