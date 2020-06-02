import {Injectable, OnInit} from '@angular/core';
import {db, model} from "baqend";

@Injectable({
  providedIn: 'root'
})
export class FileService implements OnInit{

  books;

  constructor() {
  }

  ngOnInit() {
    this.getBooks().then(b => this.books = b);
  }

  getBooks() : Promise<model.Book> {
    return db.Book
      .find()
      .resultList();
  }

  getBook(bookId){
    return db.Book.load(bookId);
  }

  getBooksByKat(kat){
    return db.Book
      .find()
      .eq('Kategorie', kat)
      .ascending("Name")
      .resultList();
  }

  getKategorien(){
    return db.Buchreihe
      .find()
      .ascending("name")
      .ascending("Lesestufe")
      .resultList();
  }

  getKategorienOhneSchueler(){
    return db.Buchreihe
      .find()
      .ascending("name")
      .ascending("Lesestufe")
      .ne('name',"Schülerbücher")
      .resultList();
  }

  getKatSchueler(){
    return db.Buchreihe
      .find()
      .ascending("name")
      .ascending("Lesestufe")
      .equal('name',"Schülerbücher")
      .singleResult();
  }

  getAusleihen() : Promise<model.Ausleihen> {
    return db.Ausleihen
      .find()
      .resultList();
  }

  getLastTwoWeeksAusleihenByBook(id){
    return db.Ausleihen
      .find()
      .where({book:id})
      .greaterThan('Ausleihen.Zeitpunkt',new Date())
      .count();
  }

  twoWeeksSince(element) {
    return (element.Zeitpunkt.getDate()+2*7 > (new Date()));
  }


  getLastBook() : Promise<model.Book> {
    return db.Book
      .find()
      .descending('nummer')
      .singleResult();
  }

}
