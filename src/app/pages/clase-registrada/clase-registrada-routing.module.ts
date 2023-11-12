import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClaseRegistradaPage } from './clase-registrada.page';

const routes: Routes = [
  {
    path: '',
    component: ClaseRegistradaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClaseRegistradaPageRoutingModule {}
