import {Component, Directive, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren} from '@angular/core';
import {FileService} from "./file.service";
import db from 'baqend';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError} from "rxjs/operators";
import {throwError} from "rxjs";


interface Book{
  Nummer: number;
  Name: string;
  Autor: string;
  Anzahl: number;
  Verliehen: boolean;
  Vorgemerkt: boolean;
  vorgemerktFuer: string;
  Kategorie: string;
}

export type SortColumn = keyof Book | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: {[key: string]: SortDirection} = { 'asc': 'desc', 'desc': '', '': 'asc' };
const compare = (v1: string, v2: string) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

@Directive({
  selector: 'th[sortable]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()'
  }
})
export class NgbdSortableHeader {

  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({column: this.sortable, direction: this.direction});
  }
}




@Component({
  selector: 'app-buecherliste',
  templateUrl: './buecherliste.component.html',
  styleUrls: ['./buecherliste.component.css']
})
export class BuecherlisteComponent implements OnInit {

  books: {[id:string]: any;} = [""];
  kats = [""];
  schueler:string;
  schuelerHinweis: string;

  constructor(private files : FileService,
              private http: HttpClient) {
    this.schuelerHinweis = "Der Name des Schülers wird verwendet, um die Bücher auszugeben und für die Kinder zu reservieren."
  }

  ngOnInit() {
    this.getKats();
  }

  getKats(){
    this.files.getKategorienOhneSchueler()
      .then(kats =>{
        this.kats = kats;
        this.files.getKatSchueler().then(kat => {
          this.kats.push(kat);
          this.getBooks();
        });
      });
  }

  getBooks(){
    let kat;
    for(kat of this.kats){
      this.files.getBooksByKat(kat.id)
        .then(books => {
          if(books != null){
            this.books[books[0].Kategorie.id] = books;
          }
        })
    }
  }

  ausleihen(id){
    this.files.getLastTwoWeeksAusleihenByBook(id).then(ausleihen =>{
      if(ausleihen<=0){
        this.buchAusleihen(id);
      }
    });
  }

  buchAusleihen(bookId){
    this.files.getBook(bookId).then(book => {
      book.Verliehen = true;
      book.Anzahl = 0;
      book.update();
      let ausleih = new db.Ausleihen({
        Buch : book,
        Schueler : this.schueler,
        Zeitpunkt: new Date()
      });
      ausleih.insert();
      this.sendAusleiheMail(book);
    });
  }

  sendAusleiheMail(book){
    let url = "https://formspree.io/mzbjedjk";
    let body = {name : this.schueler + " hat Buch ausgeliehen: " + book.Name};
    this.http.post(url,body).subscribe(res => {
      return res;
    });
  }

  handleError(error: HttpErrorResponse){
    if(error.error instanceof ErrorEvent){
      console.error(error.error.message);
    }else {
      console.error(error.status+ " : "+ error.error);
    }
    return throwError("shit happens")
  }


  vormerken(id){
    let book = this.books[id];
    book.Vorgemerkt = true;
    book.vorgemerktFuer = this.schueler;
    book.update();
  }

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  onSort({column, direction}: SortEvent) {

    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting countries
    if (direction === '' || column === '') {
      this.getKats();
    } else {
      this.kats = [...this.kats].sort((a, b) => {
        const res = compare(`${a[column]}`, `${b[column]}`);
        return direction === 'asc' ? res : -res;
      });
    }
  }}

