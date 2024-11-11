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
  constructor() {
    this.initWordCounts();
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
      heading.wordCount = Math.round(wordCount / 6)
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
  // getScheduleFor(translation: Translation, fromDate: Date, toDate: Date) {
  //   let daysRemaining: number = this.getDaysBetweenDates(fromDate, toDate)
  //   let wordsRemaining: number = this.totalWordCounts.get(translation)!
  //   let bible: Bible | null = null;
  //   for(let b of BIBLES)
  //     if(b.translation === translation){
  //       bible = b
  //       break
  //     }
  //   if(bible === null)
  //     return null;
  //   let prevDayIdx: BibleIndex = {
  //     book: 0,
  //     chapter: 0,
  //     verse: 0
  //   }
  //   while(daysRemaining > 0) {
  //     let wordGoal: number = wordsRemaining / daysRemaining
  //     daysRemaining -= 1
  //     let wordCount = 0;
  //     let verseBeforeHeading: BibleIndex = {
  //       book: prevDayIdx.book,
  //       chapter: prevDayIdx.chapter,
  //       verse: prevDayIdx.verse
  //     }
  //     let currIdx: BibleIndex = this.nextIndex(bible, prevDayIdx)
  //     let nextIdx: BibleIndex = this.nextIndex(bible, currIdx)
  //     let currVerse: Verse = this.getVerse(bible, currIdx)
  //     let nextVerse: Verse = this.getVerse(bible, nextIdx)
  //     while(((wordCount < wordGoal && (nextIdx.verse != 0 || nextVerse.heading === undefined))) || (currIdx.book !== 65 && currIdx.chapter !== 21 && currIdx.verse !== 21)) {
  //       currVerse = this.getVerse(bible, currIdx)
  //       wordCount += (currVerse.wordCount == null ? 0 : currVerse.wordCount)
  //       currIdx = nextIdx
  //       nextIdx = this.nextIndex(bible, nextIdx)
  //       currVerse = nextVerse
  //       nextVerse = this.getVerse(bible, nextIdx)
  //     }
  //     if(currIdx.book !== 65 && currIdx.chapter !== 21 && currIdx.verse !== 21) {

  //     }
  //     else if(wordCount === wordGoal){

  //     }
  //     return null
  //   }
  // }
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
  private getDaysBetweenDates(startDate: Date, endDate: Date): number {
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    const diffInMs = endDate.getTime() - startDate.getTime();
    return Math.round(diffInMs / oneDay);
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