import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {BuecherlisteComponent} from "./buecherliste/buecherliste.component";


const routes: Routes = [

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


export const routingComponents = [
  BuecherlisteComponent
]
