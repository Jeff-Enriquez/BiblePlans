import { Injectable } from '@angular/core';
import { Bible, Book, Chapter, Verse, Translation, BibleIndex } from '../../interfaces/bible';
import { NASB_HEADINGS, ESV_HEADINGS, NKJV_HEADINGS, NIV_HEADINGS, NLT_HEADINGS, CSB_HEADINGS, ALL_TRANSLATIONS_HEADINGS } from './headings';
import { BIBLES } from './bibles';
import { Heading } from '../../interfaces/heading';
@Injectable({
  providedIn: 'root'
})
export class BiblesService {
  totalWordCounts = new Map<Translation, number>();
  books = new Map<Translation, string[]>();
  constructor() {
    this.totalWordCounts.set("NASB", 768400)
    this.totalWordCounts.set("ESV", 741480)
    this.totalWordCounts.set("NKJV", 752071)
    this.totalWordCounts.set("NIV", 706821)
    this.totalWordCounts.set("NLT", 727812)
    this.totalWordCounts.set("CSB", 699004)
    this.totalWordCounts.set("all-translations", 732598)
    for(let bible of BIBLES) {
      let books: string[] = []
      for(let book of bible.books) {
        books.push(book.title)
      }
      this.books.set(bible.translation, books)
    }
    this.books.set("all-translations", this.books.get("NASB")!)
  }
  getNasbHeaders() {
    let csbBible: Bible = BIBLES.at(5)!
    let headings = []
    let idx: BibleIndex = {
      book: 0,
      chapter: 0,
      verse: -1
    }
    do {
      let heading: Heading = {
        from: {
          book: 0,
          chapter: 0,
          verse: 0
        },
        to: {
          book: 0,
          chapter: 0,
          verse: 0
        },
        missingTranslations: [],
        wordCount: 0
      }
      idx = this.nextIndex(csbBible, idx)
      let verses: Verse[] = []
      for(let bible of BIBLES)
        verses.push(this.getVerse(bible, idx))
      heading.from.book = idx.book
      heading.from.chapter = idx.chapter
      heading.from.verse = idx.verse
      let wordCount = 0
      for(let verse of verses)
        wordCount += (verse.wordCount === null ? 0 : verse.wordCount)
      let isHeading = false
      do {
        idx = this.nextIndex(csbBible, idx)
        verses = []
        for(let bible of BIBLES)
          verses.push(this.getVerse(bible, idx))
        for(let verse of verses)
          wordCount += (verse.wordCount === null ? 0 : verse.wordCount)
        for(let verse of verses)
          if(this.isHeading(idx.verse, verse.heading)){
            isHeading = true
            break;
          }
      } while(!isHeading && !this.isEnd(idx));
      let missing: string[] = []
      if(!this.isEnd(idx)) {
        for(let verse of verses)
          wordCount -= (verse.wordCount === null ? 0 : verse.wordCount)
        if(idx.verse !== 0) {
          for(let j = 0; j < 6; j++) {
            let v: Verse = verses.at(j)!
            if(v.heading !== undefined)
              continue
            if(j === 0)
              missing.push("NASB")
            else if(j === 1)
              missing.push("ESV")
            else if(j === 2)
              missing.push("NKJV")
            else if(j === 3)
              missing.push("NIV")
            else if(j === 4)
              missing.push("NLT")
            else if(j === 5)
              missing.push("CSB")
          }
        }
        idx = this.prevIndex(csbBible, idx)
        verses = []
        for(let bible of BIBLES)
          verses.push(this.getVerse(bible, idx))
      }
      heading.to.book = idx.book
      heading.to.chapter = idx.chapter
      heading.to.verse = idx.verse
      heading.wordCount = (wordCount / 6)
      heading.missingTranslations = missing
      headings.push(heading)
    } while(!this.isEnd(idx));
    console.log(headings)
  }
  isHeading(verseNumber: number, heading: string | undefined): boolean {
    return verseNumber === 0 || heading !== undefined
  }
  isEnd(index: BibleIndex): boolean {
    return index.book === 65 && index.chapter === 21 && index.verse === 20
  }
  getBibles(): Bible[] {
    return BIBLES;
  }
  getBooksFor(translation: Translation): string[] {
    return this.books.get(translation)!
  }
  getScheduleFor(translation: Translation, numberOfDays: number): Heading[] {
    if(translation === 'all-translations')
      return this.getScheduleForAllTranslations(numberOfDays);
    let headingsSchedule: Heading[] = []
    let daysRemaining: number = numberOfDays
    let wordsRemaining: number = this.totalWordCounts.get(translation)!
    let headings: Heading[] = this.getHeading(translation)
    let hIdx = 0;
    while(daysRemaining > 0 && hIdx < headings.length) {
      let wordGoal: number = wordsRemaining / daysRemaining
      daysRemaining--
      let startHeading: Heading = headings.at(hIdx)!
      let endHeading: Heading;
      let wordCount: number = 0
      do {
        endHeading = headings.at(hIdx)!
        wordCount += endHeading.wordCount
        hIdx++
      } while(wordCount < wordGoal && hIdx < headings.length);
      let h: Heading
      if(startHeading === endHeading) {
        h = this.newHeading(startHeading, endHeading)
        h.wordCount = wordCount
        headingsSchedule.push(h)
      }
      else if(wordCount === wordGoal || hIdx === headings.length) {
        h = this.newHeading(startHeading, endHeading)
        h.wordCount = wordCount
        headingsSchedule.push(h)
      }
      else {
        let prevWordCount = wordCount - endHeading.wordCount
        if(wordGoal - prevWordCount < wordCount - wordGoal) {
          hIdx--
          endHeading = headings.at(hIdx - 1)!
          wordCount = prevWordCount
        }
        h = this.newHeading(startHeading, endHeading)
        h.wordCount = wordCount
        headingsSchedule.push(h)
      }
      wordsRemaining -= wordCount
    }
    return headingsSchedule
  }
  private getScheduleForAllTranslations(numberOfDays: number): Heading[] {
    let headingsSchedule: Heading[] = []
    let daysRemaining: number = numberOfDays
    let wordsRemaining: number = this.totalWordCounts.get("all-translations")!
    let headings: Heading[] = this.getHeading("all-translations")
    let hIdx = 0
    let minInCommon = 3
    while(daysRemaining > 0 && hIdx < headings.length) {
      let wordGoal: number = wordsRemaining / daysRemaining
      daysRemaining--
      let startHeading: Heading = headings.at(hIdx)!
      let prevEndHeading: Heading | undefined
      let endHeading: Heading
      let wordCount: number = 0
      do {
        endHeading = headings.at(hIdx)!
        wordCount += endHeading.wordCount
        hIdx++
        minInCommon = endHeading.to.book < 39 ? 3 : 5
        if(endHeading.missingTranslations?.length! <= minInCommon || hIdx === headings.length) {
          if(wordCount >= wordGoal || hIdx === headings.length) {
            break;
          }
          else {
            prevEndHeading = endHeading
          }
        }
      } while(true);
      let h: Heading
      if(startHeading === endHeading || wordCount === wordGoal || hIdx === headings.length) {
        h = this.newHeading(startHeading, endHeading)
        h.wordCount = wordCount
        headingsSchedule.push(h)
      }
      else {
        if(prevEndHeading !== undefined) {
          let prevWordCount: number = wordCount
          let prevIdx = hIdx - 1
          while(headings.at(prevIdx) !== prevEndHeading) {
            prevWordCount -= headings.at(prevIdx)?.wordCount!
            prevIdx--
          }
          prevIdx++
          if(wordGoal - prevWordCount < wordCount - wordGoal) {
            hIdx = prevIdx
            endHeading = prevEndHeading
            wordCount = prevWordCount
          }
        }
        h = this.newHeading(startHeading, endHeading)
        h.wordCount = wordCount
        headingsSchedule.push(h)
      }
      wordsRemaining -= wordCount
    }
    return headingsSchedule
  }
  private newHeading(fromheading: Heading, toHeading: Heading): Heading {
    let h: Heading = {
      from: {
        book: 0,
        chapter: 0,
        verse: 0
      },
      to: {
        book: 0,
        chapter: 0,
        verse: 0
      },
      wordCount: 0
    }
    h.from.book = fromheading.from.book
    h.from.chapter = fromheading.from.chapter
    h.from.verse = fromheading.from.verse
    h.to.book = toHeading.to.book
    h.to.chapter = toHeading.to.chapter
    h.to.verse = toHeading.to.verse
    return h
  }
  private getHeading(translation: Translation): Heading[] {
    if(translation === "NASB")
      return NASB_HEADINGS
    else if(translation === "ESV")
      return ESV_HEADINGS
    else if(translation === "NIV")
      return NIV_HEADINGS
    else if(translation === "CSB")
      return CSB_HEADINGS
    else if(translation === "NKJV")
      return NKJV_HEADINGS
    else if(translation === "NLT")
      return NLT_HEADINGS
    else if(translation === "all-translations")
      return ALL_TRANSLATIONS_HEADINGS
    else
      return []
  }
  private getVerse(bible: Bible, currentIndex: BibleIndex): Verse {
    return bible.books.at(currentIndex.book)?.chapters.at(currentIndex.chapter)?.verses.at(currentIndex.verse)!;
  }
  private prevIndex(bible: Bible, currentIndex: BibleIndex): BibleIndex {
    let newIdx: BibleIndex = {
      book: currentIndex.book,
      chapter: currentIndex.chapter,
      verse: currentIndex.verse
    }
    if(newIdx.verse > 0) {
      newIdx.verse -= 1
    }
    else if(newIdx.chapter > 0) {
      newIdx.chapter -= 1
      newIdx.verse = bible.books.at(newIdx.book)?.chapters.at(newIdx.chapter)?.verses.length! - 1
    }
    else if(newIdx.book > 0) {
      newIdx.book -= 1
      newIdx.chapter = bible.books.at(newIdx.book)?.chapters.length! - 1
      newIdx.verse = bible.books.at(newIdx.book)?.chapters.at(newIdx.chapter)?.verses.length! - 1
    }
    else {
      newIdx.book = 0
      newIdx.chapter = 0
      newIdx.verse = 0
    }
    return newIdx;
  }
  private nextIndex(bible: Bible, currentIndex: BibleIndex): BibleIndex {
    let newIdx: BibleIndex = {
      book: currentIndex.book,
      chapter: currentIndex.chapter,
      verse: currentIndex.verse
    }
    const chapters: Chapter[] = bible.books.at(newIdx.book)?.chapters!
    const verses: Verse[] = chapters.at(newIdx.chapter)?.verses!
    if(newIdx.verse + 1 < verses.length) {
      newIdx.verse += 1
    }
    else if(newIdx.chapter + 1 < chapters.length) {
      newIdx.chapter += 1
      newIdx.verse = 0
    }
    else if(newIdx.book + 1 < 66) {
      newIdx.book += 1
      newIdx.chapter = 0
      newIdx.verse = 0
    }
    else {
      newIdx.book = 65
      newIdx.chapter = 21
      newIdx.verse = 20
    }
    return newIdx
  }
  
  private initWordCounts() {
    let totalWordCount = 0;
    for(const bible of BIBLES) {
      let wordCount = 0;
      for(const book of bible.books) {
        for(const chapter of book.chapters) {
          for(const verse of chapter.verses) {
            wordCount += (verse.wordCount == null ? 0 : verse.wordCount);
          }
        }
      }
      this.totalWordCounts.set(bible.translation, wordCount);
      totalWordCount += wordCount;
    }
    this.totalWordCounts.set("all-translations", totalWordCount);
  }
}