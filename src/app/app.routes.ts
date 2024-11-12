import { Routes } from '@angular/router';
import { ReadingPlannerComponent } from './reading-planner/reading-planner.component';
import { MainPageComponent } from './main-page/main-page.component';

export const routes: Routes = [
    {
        path: 'plan-generator',
        component: ReadingPlannerComponent,
        title: 'Reading Planner'
    },
    {
        path: '',
        component: MainPageComponent,
        title: 'Unity in Bible Reading'
    }
];
