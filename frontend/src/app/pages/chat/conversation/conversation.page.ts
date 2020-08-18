import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ChatService } from '../../../services/chat.service';
import { ActivatedRoute } from '@angular/router';
import { RequestService } from '../../../services/request.service';
import { UserService } from '../../../services/user.service';
import { CacheService } from '../../../services/cache.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.page.html',
  styleUrls: ['./conversation.page.scss'],
})
export class ConversationPage implements OnInit {
  @ViewChild(IonContent, {}) content: IonContent;

  messages: any;

  // internet
  connectionInternet: boolean;
  internetSubscription: any;

  // socket
  socket: any;
  socketSubscription: any;
  send_message_response: any;

  // infinite scroll
  page: number;
  hideInfiniteScroll = false;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private requestService: RequestService,
    public userService: UserService,
    private cacheService: CacheService
  ) {}

  ngOnInit() {
    this.socketOff();
    this.updateConnectionTimeReal();
    this.getMessages('init', null, { page: 0 });
  }

  ionViewWillLeave() {
    // read message
    if (this.messages.data.length) {
      this.cacheService.readMessage(this.route.snapshot.params.receiveeId);
      this.chatService.readMessage(this.route.snapshot.params.receiveeId);
    }

    this.socketOff();
    this.internetSubscription.unsubscribe();
    this.socketSubscription.unsubscribe();
  }

  socketOff() {
    if (this.socket) { this.socket.off('send-message-response', this.send_message_response); }
  }

  scrollToBottom() {
    setTimeout((x) => {
      this.content.scrollToBottom().then();
    }, 50);
  }

  updateConnectionTimeReal() {
    this.connectionInternet = this.requestService.connectionInternet;
    this.internetSubscription = this.requestService.internetEvent.subscribe((data: any) => {
      this.connectionInternet = data.connectionInternet;
    });

    this.socket = this.requestService.socketChat;
    if (this.socket != undefined) { this.listenMessage(this.socket); }
    this.socketSubscription = this.requestService.socketChatEvent.subscribe((data: any) => {
      if (data.socket != undefined) { this.listenMessage(data.socket); }
      if (data.socket == undefined) { this.socketOff(); }
      this.socket = data.socket;
    });
  }

  getMessages(sourceType: string, sourceData: any, requestData: any) {
    this.chatService
      .getMessageRoom(this.route.snapshot.params.receiveeId, requestData)
      .then((response) => {
        // update this.feeds
        if (sourceType == 'init') {
          // init
          this.messages = response;
          this.messages.data = response.data.reverse();
          this.page = 1;
          this.scrollToBottom();
        } else {
          this.messages.data.unshift(...response.data.reverse()); // scroll infinite
          this.page += 1;
        }

        if (response.data.length < 15) { this.hideInfiniteScroll = true; } // disabled scroll
        if (response.data.length == 0 && sourceType == 'infiniteScroll') { this.hideInfiniteScroll = true; } // disabled scroll
        if (response.data.length > 0 && sourceType == 'infiniteScroll') { sourceData.target.complete(); } // complete infinite scroll
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // send message
  sendMessage(event: any) {
    this.scrollToBottom();
    if (this.socket) { this.socket.emit('send-message', { type: event.type, content: event.content, receiveeId: this.route.snapshot.params.receiveeId }); }
  }

  // receive message
  listenMessage(socket: any) {
    this.send_message_response = (data) => {
      if (data.status == 200) {
        const message = { type: data.type, content: data.content, created_at: data.created_at, userId: data.userId, roomId: data.roomId };
        this.messages.data.push(message);

        // cache
        const otherUserId = data.userId != this.userService.getUserMeId() ? data.userId : data.otherUserId;
        this.cacheService.createMessage(otherUserId, message);
        this.cacheService.listRoom(message);

        this.scrollToBottom();
      }
    };

    socket.on('send-message-response', this.send_message_response);
  }

  // infinite scroll
  infiniteScrollData(event) {
    setTimeout(() => {
      this.getMessages('infiniteScroll', event, { page: this.page });
    }, 500);
  }
}
