import { Component, inject } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BiblesService } from '../services/bibles/bibles.service';
import { Translation, translations } from '../interfaces/bible';
import { Heading } from '../interfaces/heading';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-reading-planner',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavBarComponent, RouterModule],
  templateUrl: './reading-planner.component.html',
  styleUrl: './reading-planner.component.scss'
})
export class ReadingPlannerComponent {
  newPlanMessage: String[] = []
  errorMessage: string = ""
  warnMessage: String[] = []
  dates: DateParts[] = []
  isTodayIdx: number = -1
  books: string[] = []
  bibleSchedule: Heading[] = []
  biblesService: BiblesService = inject(BiblesService)
  applyForm = new FormGroup({
    translation: new FormControl('all-translations'),
    fromDate: new FormControl(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0,10)),
    toDate: new FormControl(new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0,10)),
    fromBook: new FormControl(''),
    toBook: new FormControl('')
  })
  initDate(addDays: number): string {
    let date = new Date()
    date.setDate(date.getDate() + addDays)
    return date.toISOString().slice(0,10)
  }

  constructor(private route: ActivatedRoute, private viewportScroller: ViewportScroller, 
    private router: Router) {}

  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.scrollToElementWithOffset(fragment, 70)
      } else {
        this.scrollToTop(0)
      }
    })
    this.route.queryParamMap.subscribe((params) => {
      let from = params.get('from')
      let to = params.get('to')
      let translation = params.get('translation')
      let fromBook = params.get('fromBook')
      fromBook = fromBook === null ? '' : fromBook
      let toBook = params.get('toBook')
      toBook = toBook === null ? '' : toBook
      if(from === null || to === null || !this.isValidDate(from) || !this.isValidDate(to) || translation === null)
        return
      this.applyForm.patchValue({
        fromDate: from,
        toDate: to,
        translation: translation,
        fromBook: fromBook,
        toBook: toBook
      })
      this.buildPlan()
    })
  }
  scrollToTop(offset: number) {
    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    });
  }
  scrollToElementWithOffset(elementId: string, offset: number): void {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  submitForm() {
    let queryParams
    this.applyForm.value.fromBook = this.applyForm.value.fromBook?.trim()
    this.applyForm.value.toBook = this.applyForm.value.toBook?.trim()
    if(this.applyForm.value.fromBook!.length > 0 && this.applyForm.value.toBook!.length > 0)
      queryParams = {
        from: [this.applyForm.value.fromDate],
        to: [this.applyForm.value.toDate],
        translation: [this.applyForm.value.translation],
        fromBook: this.applyForm.value.fromBook!,
        toBook: this.applyForm.value.toBook!
      }
    else if(this.applyForm.value.fromBook!.length > 0)
      queryParams = {
        from: [this.applyForm.value.fromDate],
        to: [this.applyForm.value.toDate],
        translation: [this.applyForm.value.translation],
        fromBook: this.applyForm.value.fromBook!
      }
    else if(this.applyForm.value.toBook!.length > 0)
      queryParams = {
        from: [this.applyForm.value.fromDate],
        to: [this.applyForm.value.toDate],
        translation: [this.applyForm.value.translation],
        toBook: this.applyForm.value.toBook!
      }
    else
      queryParams = {
        from: [this.applyForm.value.fromDate],
        to: [this.applyForm.value.toDate],
        translation: [this.applyForm.value.translation]
      }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'replace' 
    })
    this.buildPlan()
  }

  buildPlan() {
    this.isTodayIdx = -1
    const fromDate = this.applyForm.value.fromDate!
    const toDate = this.applyForm.value.toDate!
    const numberOfDays = this.getDaysBetweenDates(fromDate, toDate)
    this.warnMessage = []
    if(numberOfDays < 1) {
      this.errorMessage = "'From' date must be before 'To' date."
      this.bibleSchedule = []
      this.newPlanMessage = []
      return
    }
    else {
      this.errorMessage = ""
      this.newPlanMessage = []
      if(this.applyForm.value.translation! === 'all-translations')
        this.newPlanMessage.push({value:'All Translations'})
      else
        this.newPlanMessage.push({value:this.applyForm.value.translation!})
    }
    let rawDates: Date[] = []
    let dates: DateParts[] = []
    this.getDatesInRange(fromDate, toDate).forEach(date => {
      rawDates.push(date)
      dates.push(this.formatDate(date))
    })

    let today = new Date()
    for(let i = 0; i < rawDates.length; i++) {
      let date: Date = rawDates.at(i)!
      if(date.getDay() === today.getDay() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
        this.isTodayIdx = i
        break;
      }
    }

    this.dates = dates
    let translation: Translation = this.applyForm.value.translation as Translation
    this.books = this.biblesService.getBooksFor(translation)   
    let fromBook = this.applyForm.value.fromBook!
    fromBook = fromBook === '' ? 'Genesis 1:1' : fromBook
    let toBook = this.applyForm.value.toBook!
    toBook = toBook === '' ? 'Revelation 22:21' : toBook
    let temp: Heading[] | string = this.biblesService.getScheduleForRange(
      translation, fromBook, toBook, numberOfDays)
      if(typeof temp === 'string')
        this.errorMessage = temp
      else
        this.bibleSchedule = temp
    if(this.bibleSchedule.length > 0 && this.bibleSchedule.length < numberOfDays) {
      this.warnMessage.push({value:"'" + fromBook + " - " + toBook + "' is too short to divide from '" + this.applyForm.value.fromDate + "' to '"
        + this.applyForm.value.toDate + "'."})
    }
  }
  private getDatesInRange(startDate: string, endDate: string): Date[] {
    const result: Date[] = []
    let current = new Date(startDate)
    current.setDate(current.getDate() + 1)
    const end = new Date(endDate)
    end.setDate(end.getDate() + 1)
    while (current <= end) {
      const date = new Date(current)
      result.push(date)
      current.setDate(current.getDate() + 1)
    }
    return result
  }
  
  private formatDate(date: Date): DateParts {
    const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    // Add ordinal suffix to the day
    const day = date.getDate()
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                    day === 2 || day === 22 ? 'nd' :
                    day === 3 || day === 23 ? 'rd' : 'th'
    const monthNum = date.getMonth()
    const month = monthNum === 0 ? "Jan." :
      monthNum === 1 ? "Feb." :
      monthNum === 2 ? "Mar." :
      monthNum === 3 ? "Apr." :
      monthNum === 4 ? "May" : 
      monthNum === 5 ? "Jun." :
      monthNum === 6 ? "Jul." :
      monthNum === 7 ? "Aug." :
      monthNum === 8 ? "Sep." :
      monthNum === 9 ? "Oct." :
      monthNum === 10 ? "Nov." :  "Dec."
    const year = date.getFullYear()
    return {
      month: month,
      day: day,
      daySuffix: suffix,
      year: year
    }
  }
  // Returns number of days between the dates, includes the dates given
  private getDaysBetweenDates(startDate: string, endDate: string): number {
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);
    // Calculate the difference in time (milliseconds)
    const differenceInTime = date2.getTime() - date1.getTime();
    // Convert milliseconds to days
    const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);
    return Math.floor(differenceInDays) + 1; 
  }

  downloadPlan() {
    let csvData = ["Date (mm/dd/yyyy),Reading"]
    let dates = []
    for(let i = 0; i < this.bibleSchedule.length; i++) {
      let heading = this.bibleSchedule.at(i)!
      let dateParts = this.dates.at(i)!
      let m = dateParts.month
      const month = m === "Jan." ? "01" :
        m === "Feb." ? "02" :
        m === "Mar." ? "03" :
        m === "Apr." ? "04" :
        m === "May" ? "05" : 
        m === "Jun." ? "06" :
        m === "Jul." ? "07" :
        m === "Aug." ? "08" :
        m === "Sep." ? "09" :
        m === "Oct." ? "10" :
        m === "Nov." ? "11" :  "12"
      let day = "" + dateParts.day
      if(day.length === 1)
        day = "0" + day
      let date = month + "/" + day + "/" + dateParts.year
      let reading
      if(heading.from.book === heading.to.book) {
        reading = this.books.at(heading.from.book) + " " + (heading.from.chapter + 1) + ":"
          + (heading.from.verse + 1) + " - " + (heading.to.chapter + 1) + ":" + (heading.to.verse + 1)
      }
      else {
        reading = this.books.at(heading.from.book) + " " + (heading.from.chapter + 1) + ":"
          + (heading.from.verse + 1) + " - " + this.books.at(heading.to.book) + " " + (heading.to.chapter + 1)
          + ":" + (heading.to.verse + 1)
      }
      dates.push(date)
      csvData.push(date + "," + reading)
    }
    const blob = new Blob([csvData.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const docName = this.applyForm.value.translation?.toLowerCase() + "-reading-plan-" + dates.at(0)?.replaceAll("/", "-") + "-to-" + dates.at(dates.length-1)?.replaceAll("/", "-") + ".csv"
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', docName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  isValidDate(date:string):boolean {
    return !Number.isNaN(Date.parse(date))
  }
}
interface DateParts {
  month: string,
  day: number,
  daySuffix: string | undefined,
  year: number
}

// Need interface so that Angular recognizes the changes
interface String {
  value: string
}