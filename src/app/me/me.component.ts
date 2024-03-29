import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { model, db } from 'baqend';
import {FileService} from "../buecherliste/file.service";
import {timer} from "rxjs";

@Component({
  selector: 'app-me',
  templateUrl: './me.component.html',
  styleUrls: ['./me.component.scss']
})
export class MeComponent implements OnInit {

  me: model.User;
  books: any;
  newBook;
  kats;
  succeeded: boolean;
  successMessage = "Buch eingetragen.";
  sub;

  constructor(private router: Router, private files : FileService) {}

  ngOnInit() {
    this.me = db.User.me;
    this.getBooks();
    this.newBook = new db.Book();
    this.files.getKategorien().then(kats => this.kats = kats);
  }

  getBooks(){
    this.files.getVerlieheneBooks().then(books => this.books = books);
  }

  gotBookBack(i){
    let b = this.books[i];
    db.Book.find().eq('id',b.id).singleResult().then(book => {
        book.Anzahl = 1;
        book.Verliehen = false;
        book.update();
      }
    );
  }

  add() {
    this.newBook.insert().then(() => {
      this.newBook = new db.Book();
      this.succeeded = true;
      let time = timer(1000,2000);
      this.sub = time.subscribe(val => {
        if(val > 3){
          this.succeeded = false;
          this.unsub();
        }
      });
    });
  }
  unsub(){
    this.sub.unsubscribe();
  }
  closeSuccess() {
    this.succeeded = false;
  }

  setKat(kat){
    this.newBook.Kategorie = kat;
  }

  delete(i){
    this.books[i].delete();
    this.getBooks();
  }

  update(){
    db.Book.find().singleResult().then(b => {
      b.Nummer = 1;
      b.update();
    });
    this.getBooks();
  }

  setBook(book){
    this.newBook.nummer = book.nummer;
    this.newBook.name = book.name;
    this.newBook.autor = book.autor;
    this.newBook.anzahl = book.anzahl;
  }

  logout() {
    db.User.logout().then(() => {
      this.router.navigate(['/']);
    })
  }
}
