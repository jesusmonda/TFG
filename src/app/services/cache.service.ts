import { Injectable } from '@angular/core';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  constructor(private userService: UserService) {}

  createLike(feedId: number, likeMe: boolean) {
    for (let key in localStorage) {
      if (key.includes(`/feed/${feedId}`)) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data != null) {
          // save num likes
          if (likeMe) {
            data.like += 1;
          } else {
            data.like -= 1;
          }
          // save like action
          data.likeMe = likeMe;

          // save on localStorage
          localStorage.setItem(key, JSON.stringify(data));
        }
      }

      if (key.includes('/feed/type') || key.includes(`/feed/user/${this.userService.getUserMeId()}`)) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data != null) {
          data.map((feed) => {
            // search feedId
            if (feed.id == feedId) {
              // save num likes
              if (likeMe) {
                feed.like += 1;
              } else {
                feed.like -= 1;
              }
              // save like action
              feed.likeMe = likeMe;
            }
          });

          // save on localStorage
          localStorage.setItem(key, JSON.stringify(data));
        }
      }
    }
  }

  createComment(feed: any) {
    for (let key in localStorage) {
      if (key.includes(`/feed/${feed.id}`)) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data != null) {
          data.numComment = data.numComment + 1;

          // save on localStorage
          localStorage.setItem(key, JSON.stringify(data));
        }
      }

      if (key.includes('/feed/type') || key.includes(`/feed/user/${this.userService.getUserMeId()}`)) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data != null) {
          data.map((x) => {
            // search feedId
            if (x.id == feed.id) {
              x.numComment = x.numComment + 1;
            }
          });

          // save on localStorage
          localStorage.setItem(key, JSON.stringify(data));
        }
      }

      if (key.includes(`/feed/${feed.id}/comment`)) {
        const data = JSON.parse(localStorage.getItem(key));
        data.unshift(feed);

        // save on localStorage
        localStorage.setItem(key, JSON.stringify(data));
      }
    }
  }

  createFeed(feed: any) {
    for (let key in localStorage) {
      if (key.includes(`/feed/user/${this.userService.getUserMeId()}?limit=2`)) {
        const data = JSON.parse(localStorage.getItem(key));
        data.unshift(feed);
        if (data.length > 2) { data.pop(); }

        // save on localStorage
        localStorage.setItem(key, JSON.stringify(data));
      }

      if (key.includes(`/feed/user/${this.userService.getUserMeId()}?page=`)) {
        const data = JSON.parse(localStorage.getItem(key));
        data.unshift(feed);

        // save on localStorage
        localStorage.setItem(key, JSON.stringify(data));
      }

      if (key.includes(`/user/${this.userService.getUserMeId()}`)) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data != null) {
          data.numFeed = Number(data.numFeed) + 1;

          // save on localStorage
          localStorage.setItem(key, JSON.stringify(data));
        }
      }
    }
  }

  editProfile(userInfo: any) {
    for (let key in localStorage) {
      if (key.includes(`/feed/`)) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data != null) {
          // feed/{feedId}
          if (data.user) {
            if (data.user.id == this.userService.getUserMeId()) {
              data.user.name = userInfo.name;
              data.user.surname = userInfo.surname;
              data.user.languages = userInfo.languages;
            }
          }

          // other endpoint
          if (!data.user) {
            data.map((x) => {
              if (x.user.id == this.userService.getUserMeId()) {
                x.user.name = userInfo.name;
                x.user.surname = userInfo.surname;
                x.user.languages = userInfo.languages;
              }
            });
          }

          // save on localStorage
          localStorage.setItem(key, JSON.stringify(data));
        }
      }

      if (key.includes(`/user/${this.userService.getUserMeId()}`)) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data != null) {
          data.name = userInfo.name;
          data.surname = userInfo.surname;
          data.aboutUser = userInfo.aboutUser;
          data.profileTopics = userInfo.profileTopics;
          data.languages = userInfo.languages;

          // save on localStorage
          localStorage.setItem(key, JSON.stringify(data));
        }
      }
    }
  }

  editAvatar(avatar: string) {
    for (let key in localStorage) {
      if (key.includes(`/feed/`)) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data != null) {
          // feed/{feedId}
          if (data.user) {
            if (data.user.id == this.userService.getUserMeId()) {
              data.user.image = avatar;
            }
          }

          // other endpoint
          if (!data.user) {
            data.map((x) => {
              if (x.user.id == this.userService.getUserMeId()) {
                x.user.image = avatar;
              }
            });
          }

          // save on localStorage
          localStorage.setItem(key, JSON.stringify(data));
        }
      }

      if (key.includes(`/user/${this.userService.getUserMeId()}`)) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data != null) {
          data.image = avatar;

          // save on localStorage
          localStorage.setItem(key, JSON.stringify(data));
        }
      }
    }
  }

  createMessage(receiveeId: number, message: any) {
    for (let key in localStorage) {
      if (key.includes(`/chat/${receiveeId}/conversation?page=0`)) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data != null) {
          data.data.unshift(message);

          // save on localStorage
          localStorage.setItem(key, JSON.stringify(data));
        }
      }
    }
  }

  listRoom(message: any) {
    for (let key in localStorage) {
      if (key.includes(`/chat/me`)) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data != null) {
          const roomIndex = data.chats.findIndex((x) => x.roomId == message.roomId);
          if (roomIndex != -1) {
            data.chats[roomIndex].content = message.content;
            data.chats[roomIndex].readed_at = null;
            data.chats[roomIndex].type = message.type;
            data.chats[roomIndex].userWriter = message.userId;
            data.chats[roomIndex].created_at = message.created_at;

            // save on localStorage
            localStorage.setItem(key, JSON.stringify(data));
          }
        }
      }
    }
  }

  readMessage(userId: number) {
    for (let key in localStorage) {
      if (key.includes(`/chat/me`)) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data != null) {
          data.chats.map((conversation) => {
            if (Number(conversation.user.id) == userId) { conversation.readed_at = new Date(); }
          });

          // save on localStorage
          localStorage.setItem(key, JSON.stringify(data));
        }
      }
    }
  }
}
