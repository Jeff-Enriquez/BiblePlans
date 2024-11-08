import { Routes } from '@angular/router';
import { ReadingPlannerComponent } from './reading-planner/reading-planner.component';

export const routes: Routes = [
    {
        path: '',
        component: ReadingPlannerComponent,
        title: 'Reading Planner'
    }
];
