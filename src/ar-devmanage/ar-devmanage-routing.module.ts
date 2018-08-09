import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import * as fromContainers from './containers';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'com-record' },
  {
    path: 'com-record',
    component: fromContainers.ComRecordComponent,
  },
  {
    path: 'add-bayonet',
    loadChildren: '../ar-add-bayonet/ar-add-bayonet.module#ArAddBayonetModule'
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class ArDevmanageRoutingModule {}
