import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { model, db } from 'baqend';
import {FileService} from "../buecherliste/file.service";

@Component({
  selector: 'app-me',
  templateUrl: './me.component.html',
  styleUrls: ['./me.component.scss']
})
export class MeComponent implements OnInit {

  me: model.User;
  books: any;
  book = {
    nummer: 99,
    name:'',
    autor:'',
    anzahl: 1
  };

  constructor(private router: Router, private files : FileService) {}

  ngOnInit() {
    this.me = db.User.me;
    this.getBooks();
    this.getHighNumber();
  }

  getBooks(){
    this.files.getBooks().then(books => this.books = books);
  }

  getHighNumber(){
    this.files.getLastBook().then(book => this.book.nummer = book.Nummer);
  }

  add(){
    this.book.nummer = this.book.nummer + 1;
    let b = new db.Book({
      Nummer : this.book.nummer,
      Name : this.book.name,
      Autor : this.book.autor,
      Anzahl : this.book.anzahl
    });
    b.insert();
    this.getHighNumber();
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
    this.book.nummer = book.nummer;
    this.book.name = book.name;
    this.book.autor = book.autor;
    this.book.anzahl = book.anzahl;
  }

  logout() {
    db.User.logout().then(() => {
      this.router.navigate(['/']);
    })
  }
}
