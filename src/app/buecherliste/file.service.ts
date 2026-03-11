import { Injectable } from '@angular/core';
import { db } from "baqend";

@Injectable({
  providedIn: 'root'
})
export class FileService {

  books;

  getBooks(): Promise<any[]> {
    return db.Book
      .find()
      .resultList();
  }

  getVerlieheneBooks(): Promise<any[]> {
    return db.Book
      .find()
      .eq('Verliehen', true)
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

  getAusleihen(): Promise<any[]> {
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


  getLastBook(): Promise<any> {
    return db.Book
      .find()
      .descending('nummer')
      .singleResult();
  }

}
