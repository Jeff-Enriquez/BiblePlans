import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BiblesService } from '../services/bibles/bibles.service';
import { Translation } from '../interfaces/bible';
import { Heading } from '../interfaces/heading';

@Component({
  selector: 'app-reading-planner',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reading-planner.component.html',
  styleUrl: './reading-planner.component.scss'
})
export class ReadingPlannerComponent {
  dates: string[] = []
  books: string[] = []
  bibleSchedule: Heading[] = []
  biblesService: BiblesService = inject(BiblesService);
  applyForm = new FormGroup({
    translation: new FormControl('all-translations'),
    fromDate: new FormControl(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0,10)),
    toDate: new FormControl(new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0,10))
  })
  submitForm() {
    const fromDate = this.applyForm.value.fromDate!
    const toDate = this.applyForm.value.toDate!
    const numberOfDays = this.getDaysBetweenDates(fromDate, toDate)
    this.dates = this.getFormattedDatesInRange(fromDate, toDate)
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
    console.log(this.bibleSchedule)
  }
  private getFormattedDatesInRange(startDate: string, endDate: string): string[] {
    const result: string[] = []
    let current = new Date(startDate)
    current.setDate(current.getDate() + 1)
    const end = new Date(endDate)
    end.setDate(end.getDate() + 1)
    
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }

    while (current <= end) {
        const formattedDate = current.toLocaleDateString('en-US', options)

        // Add ordinal suffix to the day
        const day = current.getDate()
        const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                       day === 2 || day === 22 ? 'nd' :
                       day === 3 || day === 23 ? 'rd' : 'th'
        
        // Format as "January 1st, 2024"
        result.push(formattedDate.replace(/\d+/, `${day}${suffix}`))

        // Increment the date by one day
        current.setDate(current.getDate() + 1)
    }

    return result
  }
  private includesLeapDay(dates: string[]): number {
    for(let i = 0; i < dates.length; i++) {
      if(dates.at(i)!.startsWith("February 29"))
        return i
    }
    return -1
  }
  private formatDate(dateString: string): string {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const suffixes = ["th", "st", "nd", "rd"];

    // Parse the input date string
    const [month, day, year] = dateString.split("/").map(Number);

    // Get month name
    const monthName = months[month - 1];

    // Determine suffix
    const daySuffix =
        day % 10 <= 3 && Math.floor(day / 10) !== 1 ? suffixes[day % 10] : "th";

    // Format the date
    return `${monthName} ${day}${daySuffix}, ${year}`;
  }
  private getDaysBetweenDates(startDate: string, endDate: string): number {
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);
    // Calculate the difference in time (milliseconds)
    const differenceInTime = Math.abs(date2.getTime() - date1.getTime());
    // Convert milliseconds to days
    const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);
    return Math.floor(differenceInDays); 
  }
}
