import { Component, OnInit } from '@angular/core';
import { db } from 'baqend';

@Component({
    selector: 'app-chats',
    templateUrl: './chats.component.html',
    styleUrls: ['./chats.component.scss'],
    standalone: false
})
export class ChatsComponent implements OnInit {

  public messages: any[] = [];

  getImageUrl(message) {
    return new db.File(message.face).url;
  }

  ngOnInit() {
    db.Message
      .find()
      .resultList()
      .then(messages => this.messages = messages);
  }

}
