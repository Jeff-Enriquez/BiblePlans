import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BiblesService } from '../services/bibles/bibles.service';
import { Bible } from '../interfaces/bible';

@Component({
  selector: 'app-reading-planner',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reading-planner.component.html',
  styleUrl: './reading-planner.component.scss'
})
export class ReadingPlannerComponent {
  biblesService: BiblesService = inject(BiblesService);
  applyForm = new FormGroup({
    translation: new FormControl('all-translations'),
    fromDate: new FormControl(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0,10)),
    toDate: new FormControl(new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0,10))
  })
  submitForm() {
    console.log(this.biblesService.getBibles());
  }
}
