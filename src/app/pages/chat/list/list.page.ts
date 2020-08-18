import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { RequestService } from '../../../services/request.service';
import { UserService } from '../../../services/user.service';
import { CacheService } from '../../../services/cache.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  chats: any;

  // internet
  connectionInternet: boolean;
  internetSubscription: any;

  // socket
  socket: any;
  socketSubscription: any;
  send_message_response: any;

  constructor(
    private platform: Platform,
    private chatService: ChatService,
    private requestService: RequestService,
    public userService: UserService,
    private cacheService: CacheService
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.socketOff();
    this.updateConnectionTimeReal();
    this.getRoom();
    this.joinRoom();
  }

  ionViewWillLeave() {
    this.socketOff();
    this.internetSubscription.unsubscribe();
    this.socketSubscription.unsubscribe();
  }

  socketOff() {
    if (this.socket) { this.socket.off('send-message-response', this.send_message_response); }
  }

  updateConnectionTimeReal() {
    this.connectionInternet = this.requestService.connectionInternet;
    this.internetSubscription = this.requestService.internetEvent.subscribe((data: any) => {
      this.connectionInternet = data.connectionInternet;
    });

    this.socket = this.requestService.socketChat;
    if (this.socket != undefined) { this.messageResponse(this.socket); }
    this.socketSubscription = this.requestService.socketChatEvent.subscribe((data: any) => {
      if (data.socket != undefined) { this.messageResponse(data.socket); }
      if (data.socket == undefined) { this.socketOff(); }
      this.socket = data.socket;
    });
  }

  getRoom() {
    this.chatService
      .getRoomsByUserId()
      .then((response) => {
        this.chats = response;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  joinRoom() {
    if (this.socket != undefined) { this.socket.emit('joinRoom', null); }
  }
  messageResponse(socket) {
    this.send_message_response = (data: any) => {
      if (data.status == 200 && this.chats.chats.length) {
        const roomIndex = this.chats.chats.findIndex((x) => x.roomId == data.roomId);
        if (roomIndex != -1) {
          this.chats.chats[roomIndex].content = data.content;
          this.chats.chats[roomIndex].userWriter = data.userId;
          this.chats.chats[roomIndex].readed_at = null;
          this.chats.chats[roomIndex].created_at = data.created_at;
          this.chats.chats[roomIndex].type = data.type;

          // cache
          this.cacheService.createMessage(this.chats.chats[roomIndex].user.id, data);
          this.cacheService.listRoom(data);
        }
      }
    };

    socket.on('send-message-response', this.send_message_response);
  }
}
