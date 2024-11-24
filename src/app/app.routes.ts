import { Routes } from '@angular/router';
import { IntroductionMainComponent } from './introduction/introduction-main/introduction-main.component';
import { ReadingPlannerComponent } from './reading-planner/reading-planner.component';
import { UnityPlanMainComponent } from './unity-plan/unity-plan-main/unity-plan-main.component';

export const routes: Routes = [
    {
        path: 'introduction',
        component: IntroductionMainComponent,
        title: 'Introduction'
    },
    {
        path: 'reading-planner',
        component: ReadingPlannerComponent,
        title: 'Reading Planner'
    },
    {
        path: 'todays-reading',
        component: UnityPlanMainComponent,
        title: 'Unity in Bible Reading'
    },
    {
        path: '',
        redirectTo: '/todays-reading',
        pathMatch: 'full'
    }
];
