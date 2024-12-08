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

  getScheduleForRange(translation: Translation, fromBook: string, toBook: string, numberOfDays: number): Heading[] | string {
    if(!fromBook.includes(" ") || !toBook.includes(" "))
      return "The book, chapter, and verse must be provided. Example: Genesis 1:1"
    let fromChapter: number = +fromBook.split(" ")[1].split(":")[0]
    let fromVerse: number = +fromBook.split(" ")[1].split(":")[1]
    fromBook = fromBook.split(" ")[0]
    let toChapter: number = +toBook.split(" ")[1].split(":")[0]
    let toVerse: number = +toBook.split(" ")[1].split(":")[1]
    toBook = toBook.split(" ")[0]
    if(Number.isNaN(fromChapter) || Number.isNaN(toChapter))
      return "The chapter, and verse must be provided. Example: Genesis 1:1"
    if(Number.isNaN(fromVerse) || Number.isNaN(toVerse))
      return "The verse must be provided. Example: Genesis 1:1"

    // Get bible
    let bible
    for(let b of BIBLES) {
      if(b.translation === translation) {
        bible = b
        break;
      }
    }
    if(bible === undefined) {
      return "This is not a valid translation."
    }
    // Validate from book / chapter / verse
    let isValidBook: boolean = false
    let isValidChapter: boolean = false
    let isValidVerse: boolean = false
    let fromBookIdx = 0
    if(fromBook.toLowerCase() === "song of songs" || fromBook.toLowerCase() === "song of solomon") {
      fromBookIdx = 21
      let book = bible!.books.at(fromBookIdx)!
      isValidBook = true
      for(let chapter of book.chapters) {
        if(fromChapter === chapter.chapter) {
          isValidChapter = true
          for(let verse of chapter.verses) {
            if(fromVerse === verse.verse) {
              isValidVerse = true
              break
            }
          }
          break
        }
      }
    } else {
      while(fromBookIdx < bible!.books.length) {
        let book = bible!.books.at(fromBookIdx)!
        if(book.title.toLowerCase() === fromBook.toLowerCase()) {
          isValidBook = true
          for(let chapter of book.chapters) {
            if(fromChapter === chapter.chapter) {
              isValidChapter = true
              for(let verse of chapter.verses) {
                if(fromVerse === verse.verse) {
                  isValidVerse = true
                  break
                }
              }
              break
            }
          }
          break
        }
        fromBookIdx++
      }
    }
    if(!isValidBook)
      return "The starting book '" + fromBook + "' does not exist in. Check for typos."
    if(!isValidChapter)
      return "The starting chapter '" + fromChapter + "' for '" + fromBook + "' does not exist in."
    if(!isValidVerse)
      return "The starting verse '" + fromVerse + "' for '" + fromBook + " " + fromChapter + "' does not exist in '" + translation + "'."

    // Validate to book / chapter / verse
    isValidBook = false
    isValidChapter = false
    isValidVerse = false
    let toBookIdx = fromBookIdx
    if(toBook.toLowerCase() === "song of songs" || toBook.toLowerCase() === "song of solomon") {
      toBookIdx  = 21
      let book = bible!.books.at(toBookIdx)!
      isValidBook = true
      for(let chapter of book.chapters) {
        if(toChapter === chapter.chapter) {
          isValidChapter = true
          for(let verse of chapter.verses) {
            if(toVerse === verse.verse) {
              isValidVerse = true
              break
            }
          }
          break
        }
      }
    } else {
      while(toBookIdx < bible!.books.length) {
        let book = bible!.books.at(toBookIdx)!
        if(book.title.toLowerCase() === toBook.toLowerCase()) {
          isValidBook = true
          for(let chapter of book.chapters) {
            if(toChapter === chapter.chapter) {
              isValidChapter = true
              for(let verse of chapter.verses) {
                if(toVerse === verse.verse) {
                  isValidVerse = true
                  break
                }
              }
              break
            }
          }
          break
        }
        toBookIdx++
      }
    }
    
    if(!isValidBook)
      return "'" + toBook + "' does not exist. Check for typos."
    if(!isValidChapter)
      return "Chapter '" + toChapter + "' for '" + toBook + "' does not exist."
    if(!isValidVerse)
      return "Verse '" + toVerse + "' for '" + toBook + " " + toChapter + "' does not exist in '" + translation + "'."

    // Convert chapters | verses to indexes
    fromChapter--
    toChapter--
    fromVerse--
    toVerse--
    // If needed, add additional headings
    let headings: Heading[] = []
    let allHeadings: Heading[] = this.getHeading(translation)
    let idx: number = 0;
    // get starting heading
    while(idx < allHeadings.length) {
      let h = allHeadings.at(idx)!
      if(h.to.book > fromBookIdx || (h.to.book === fromBookIdx && h.to.chapter > fromChapter) ||
      (h.to.book === fromBookIdx && h.to.chapter === fromChapter && h.to.verse >= fromVerse)) {
        // Calculate word count before heading
        let wordCount: number = 0
        let currIndex: BibleIndex = {
          book: fromBookIdx,
          chapter: fromChapter,
          verse: fromVerse
        }
        while(currIndex.book < h.to.book || currIndex.chapter < h.to.chapter || currIndex.verse < h.to.verse) {
          const verse = bible.books.at(currIndex.book)!.chapters.at(currIndex.chapter)!.verses.at(currIndex.verse)!
          wordCount += (verse.wordCount === null ? 0 : verse.wordCount)
          currIndex = this.nextIndex(bible, currIndex)
        }
        const verse = bible.books.at(currIndex.book)!.chapters.at(currIndex.chapter)!.verses.at(currIndex.verse)!
        wordCount += (verse.wordCount === null ? 0 : verse.wordCount)
        let heading: Heading = {
          from: {
            book: fromBookIdx,
            chapter: fromChapter,
            verse: fromVerse
          },
          to: {
            book: h.to.book,
            chapter: h.to.chapter,
            verse: h.to.verse
          },
          wordCount: wordCount
        }
        headings.push(heading)
        idx++
        break
      }
      idx++
    }
    // Add middle headings
    while(idx < allHeadings.length) {
      let h = allHeadings.at(idx)!
      // heading is equal to ending
      if(h.to.book === toBookIdx && h.to.chapter === toChapter && h.to.verse == toVerse) {
        headings.push(h)
        break
      // heading is greater than ending
      } else if(h.to.book > toBookIdx || (h.to.book === toBookIdx && h.to.chapter > toChapter) 
        || (h.to.book === toBookIdx && h.to.chapter === toChapter && h.to.verse >= toVerse)) {
        let wordCount = h.wordCount
        let currIndex: BibleIndex = this.nextIndex(bible,{
          book: toBookIdx,
          chapter: toChapter,
          verse: toVerse
        })
        // Subtract all word count of all extra verses from current heading
        while(currIndex.book < h.from.book || (currIndex.book === h.from.book && currIndex.chapter < h.from.chapter) 
          || (currIndex.book === h.from.book && currIndex.chapter === h.from.chapter && currIndex.verse < h.from.verse)) {
          const verse = bible.books.at(currIndex.book)!.chapters.at(currIndex.chapter)!.verses.at(currIndex.verse)!
          wordCount -= (verse.wordCount === null ? 0 : verse.wordCount)
          currIndex = this.nextIndex(bible, currIndex)
        }
        let heading: Heading = {
          from: {
            book: h.from.book,
            chapter: h.from.chapter,
            verse: h.from.verse
          },
          to: {
            book: toBookIdx,
            chapter: toChapter,
            verse: toVerse
          },
          wordCount: wordCount
        }
        headings.push(heading)
        break
      } else {
        idx++
        headings.push(h)
      }
    }
    if(headings.length === 0) {
      headings.push({
        from: {
          book: fromBookIdx,
          chapter: fromChapter,
          verse: fromVerse
        },
        to: {
          book: toBookIdx,
          chapter: toChapter,
          verse: toVerse
        },
        wordCount: 1
      })
    }
    if(translation === 'all-translations')
      this.reduceAllTranslationHeadings(headings)
    
    // Calculate word count
    let wordsRemaining: number = 0
    for(let heading of headings) {
      wordsRemaining += heading.wordCount
    }
    // Get schedule
    let headingsSchedule: Heading[] = []
    let daysRemaining: number = numberOfDays
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

  private reduceAllTranslationHeadings(headings: Heading[]): Heading[] {
    let reducedHeadings: Heading[] = []
    let wordCount = 0;
    let leftIdx = 0;
    let h: Heading;
    let minInCommon;
    for(let i = 0; i < headings.length; i++) {
      h = headings.at(i)!
      wordCount += h.wordCount
      minInCommon = h.to.book < 39 ? 3 : 4
      if(h.missingTranslations?.length! <= ((BIBLES.length - 1) - minInCommon) || i === headings.length - 1) {
        if(leftIdx === i){
          reducedHeadings.push(h)
          leftIdx++
        } else {
          h = this.newHeading(headings.at(leftIdx)!, h)
          h.wordCount = wordCount
          leftIdx = i + 1
        }
        wordCount = 0
      }
    }
    return headings
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

  printAllTranslations() {
    let allTranslationsBible: Bible = BIBLES.at(0)!
    let books: Book[] = allTranslationsBible.books
    for(let bookIdx = 0; bookIdx < books.length; bookIdx++) {
      let chapters: Chapter[] = books.at(bookIdx)!.chapters
      for(let chapterIdx = 0; chapterIdx < chapters.length; chapterIdx++) {
        let verses: Verse[] = chapters.at(chapterIdx)!.verses
        for(let verseIdx = 0; verseIdx < verses.length; verseIdx++) {
          let verse: Verse = verses.at(verseIdx)!
          let wordCount = verse.wordCount!
          for(let bibleIdx = 1; bibleIdx < BIBLES.length; bibleIdx++) {
            let v: Verse = BIBLES.at(bibleIdx)!.books.at(bookIdx)!.chapters.at(chapterIdx)!.verses.at(verseIdx)!
            wordCount += v.wordCount!
          }
          verse.wordCount = (wordCount / 6.0)
        }
      }
    }
  }
}