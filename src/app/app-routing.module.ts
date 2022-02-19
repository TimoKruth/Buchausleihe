import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {BuecherlisteComponent} from "./buecherliste/buecherliste.component";
import {SignupComponent} from "./signup/signup.component";
import {MeComponent} from "./me/me.component";
import {DBLoggedIn, DBReady} from "./db";
import { ChatsRoutingModule } from './chats/chats-routing.module';


const routes: Routes = [
  { path: 'buecherliste', component: BuecherlisteComponent, resolve: { db: DBReady }},
  { path: 'signup', component: SignupComponent, resolve: { db: DBReady } }, // will activate the route after the db is ready
  { path: 'signup/me', component: MeComponent, resolve: { db: DBReady }, canActivate: [DBLoggedIn] }, // will prevent none logged in users from accessing it
  { path: 'chats', loadChildren: () => ChatsRoutingModule}, // Using loadChildren to async load the route
  { path: '', redirectTo: '/buecherliste', pathMatch: 'full', resolve: { db: DBReady }},
  { path: '**', redirectTo : '/buecherliste'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }


export const routingComponents = [
  BuecherlisteComponent
]
