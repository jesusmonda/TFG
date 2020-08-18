import { Component, OnInit, ViewChild } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { UserService } from '../../services/user.service';
import { RequestService } from '../../services/request.service';
import { AngularAgoraRtcService } from 'angular-agora-rtc';
import * as uuid from 'uuid';

@Component({
  selector: 'app-call',
  templateUrl: './call.page.html',
  styleUrls: ['./call.page.scss'],
})
export class CallPage implements OnInit {
  // views
  user: any;
  onCall = false;
  incomingCall = false;
  outgoingCall = false;
  activedVideo = true;

  // internet
  connectionInternet: boolean;
  internetSubscription: any;

  // socket
  socket: any;
  eventReceiveCall: any;

  // WebRTC
  localStream: any;
  uid: number;
  remoteId: string;

  constructor(
    private androidPermissions: AndroidPermissions,
    private vibration: Vibration,
    private requestService: RequestService,
    private userService: UserService,
    private ngxAgoraService: AngularAgoraRtcService
  ) {}

  ionViewWillLeave() {
    this.socket.disconnect();
  }

  ngOnInit() {
    this.androidPermissions.requestPermissions([
      this.androidPermissions.PERMISSION.RECORD_AUDIO,
      this.androidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS,
      this.androidPermissions.PERMISSION.CAMERA,
    ]);

    this.uid = Math.floor(Math.random() * Math.random());
    this.updateConnectionTimeReal();
    this.getUser();
  }

  // acept o next call
  makeCall() {
    this.outgoingCall = true;
    if (this.socket) this.socket.emit('toCall', this.user);
  }
  getUser() {
    this.outgoingCall = false;
    this.userService
      .getUserAvailable()
      .then((response) => (this.user = response.data));
  }

  // accept o reject call
  acceptCall() {
    this.vibration.vibrate(0);
    if (this.socket) {
      this.incomingCall = false;
      this.onCall = true;

      const roomId = uuid.v4();
      this.join(roomId);
      this.socket.emit('answerCall', {
        acceptCall: true,
        user: this.user,
        roomId: roomId,
      });
    }
  }
  rejectCall() {
    this.vibration.vibrate(0);
    if (this.socket) {
      this.remoteId = null;
      this.incomingCall = false;
      this.onCall = false;

      this.socket.emit('answerCall', { rejectCall: true, user: this.user });
    }

    this.getUser();
  }

  receiveCall() {
    this.eventReceiveCall = (data) => {
      console.log(data);
      // receving call
      if (data.status == 100) {
        this.incomingCall = true;
        this.onCall = false;
        this.user = data.callFrom;
        this.vibration.vibrate(10000);
      }

      // reject call
      if (data.status == 400) {
        this.incomingCall = false;
        this.onCall = false;
        this.vibration.vibrate(0);
      }

      // accept call
      if (data.status == 200) {
        this.incomingCall = false;
        this.onCall = true;
        this.vibration.vibrate(0);

        this.join(data.roomId);
      }
    };

    this.socket.on('receiveCall', this.eventReceiveCall);
  }
  async hangUp(stream, updateUser) {
    if (updateUser) await this.userService.updateProfile({ onCall: false });
    this.getUser();

    if (this.onCall) {
      this.ngxAgoraService.client.leave(
        (response) => console.log('Leavel channel successfully'),
        (error) => console.log('Leave local stream error: ' + error)
      );
    }

    stream.close();
    this.onCall = false;
    this.incomingCall = false;
    this.outgoingCall = false;
    this.activedVideo = true;

    // WebRTC
    this.ngxAgoraService.client = null;
    this.localStream = null;
    this.remoteId = null;
  }

  // Socket
  updateConnectionTimeReal() {
    // Internet
    this.connectionInternet = this.requestService.connectionInternet;
    this.internetSubscription = this.requestService.internetEvent.subscribe((data: any) => {
      this.connectionInternet = data.connectionInternet;
    });
    
    // Socket
    const socket = this.requestService.connectSocket('call');
    socket.on('connect', () => {
      this.socket = socket;
      this.receiveCall();
    });

    socket.on('disconnect', (reason) => {
      this.userService.updateProfile({ onCall: false, socketId: null });
      this.socket.off('receiveCall', this.eventReceiveCall);
      this.socket = null;
      if (this.onCall) this.hangUp(this.localStream, false);
      this.vibration.vibrate(0);
    });
  }

  // WebRTC
  disableVideo() {
    this.activedVideo = false;
    this.localStream.muteVideo();
  }
  activeVideo() {
    this.activedVideo = true;
    this.localStream.unmuteVideo();
  }
  join(roomId: number) {
    this.ngxAgoraService.createClient('rtc');

    this.localStream = this.ngxAgoraService.createStream(
      this.uid,
      true,
      null,
      null,
      true,
      false
    );

    this.localStream.init(
      () => {
        this.localStream.play('agora_local');

        this.ngxAgoraService.client.join(
          null,
          roomId,
          this.uid,
          (response) => {
            this.ngxAgoraService.client.publish(this.localStream, (error) =>
              this.hangUp(this.localStream, true)
            );
            this.userService.updateProfile({ onCall: true });
          },
          (error) => {
            console.log('local stream error: ', error);
            this.hangUp(this.localStream, true);
          }
        );
      },
      (error) => {
        console.log('local stream error: ', error);
        this.hangUp(this.localStream, true);
      }
    );

    this.ngxAgoraService.client.on('stream-added', (evt) => {
      const stream = evt.stream;
      this.ngxAgoraService.client.subscribe(stream, (error) => {
        console.log('local stream error: ', error);
        this.hangUp(this.localStream, true);
      });
    });

    this.ngxAgoraService.client.on('stream-subscribed', (evt) => {
      const stream = evt.stream;
      this.remoteId = `agora_remote-${stream.getId()}`;
      setTimeout(() => stream.play(this.remoteId), 200);
    });

    this.ngxAgoraService.client.on('peer-leave', (evt) => {
      const stream = evt.stream;
      this.hangUp(stream, true);
    });
  }
}
