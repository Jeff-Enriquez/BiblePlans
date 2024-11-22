import { Component, inject } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BiblesService } from '../services/bibles/bibles.service';
import { Translation } from '../interfaces/bible';
import { Heading } from '../interfaces/heading';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reading-planner',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavBarComponent],
  templateUrl: './reading-planner.component.html',
  styleUrl: './reading-planner.component.scss'
})
export class ReadingPlannerComponent {
  newPlanMessage: Plan[] = []
  errorMessage: string = ""
  dates: DateParts[] = []
  books: string[] = []
  bibleSchedule: Heading[] = []
  biblesService: BiblesService = inject(BiblesService)
  applyForm = new FormGroup({
    translation: new FormControl('all-translations'),
    fromDate: new FormControl(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0,10)),
    toDate: new FormControl(new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0,10))
  })

  constructor(private route: ActivatedRoute, private viewportScroller: ViewportScroller) {}

  ngOnInit() {
    this.viewportScroller.setOffset([0,70])
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.viewportScroller.scrollToAnchor(fragment);
      }
    });
  }

  submitForm() {
    const fromDate = this.applyForm.value.fromDate!
    const toDate = this.applyForm.value.toDate!
    const numberOfDays = this.getDaysBetweenDates(fromDate, toDate)
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
    let dates: DateParts[] = []
    this.getDatesInRange(fromDate, toDate).forEach(date => {
      dates.push(this.formatDate(date))
    })
    this.dates = dates
    let translation: Translation = this.applyForm.value.translation as Translation
    this.books = this.biblesService.getBooksFor(translation)
    const leapIndex = this.includesLeapDay(this.dates)
    if(leapIndex >= 0) {
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
        wordCount: -100
      }
      let temp: Heading[] = this.biblesService.getScheduleFor(
        translation, numberOfDays - 1)
      this.bibleSchedule = [...temp.slice(0, leapIndex), heading, ...temp.slice(leapIndex)]
    }
    else {
      this.bibleSchedule = this.biblesService.getScheduleFor(
        translation, numberOfDays)
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
      year: (year % 1000) % 100
    }
  }
  private includesLeapDay(dates: DateParts[]): number {
    let date: DateParts;
    for(let i = 0; i < dates.length; i++) {
      date = dates.at(i)!
      if(date.day === 29 && date.month === "February")
        return i
    }
    return -1
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
}
interface DateParts {
  month: string,
  day: number,
  daySuffix: string | undefined,
  year: number
}

// Need interface so that Angular recognizes the changes
interface Plan {
  value: string
}