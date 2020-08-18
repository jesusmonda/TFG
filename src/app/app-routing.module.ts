import { NgModule, ErrorHandler } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ErrorHandlerService } from './services/error-handler.service';

const routes: Routes = [
  // Home
  { path: '', loadChildren: () => import('./pages/login/login.module').then((m) => m.LoginPageModule) },

  // Chat
  { path: 'chat/:receiveeId', loadChildren: () => import('./pages/chat/conversation/conversation.module').then((m) => m.ConversationPageModule) },
  { path: 'feed/:id', loadChildren: () => import('./pages/feed/comment/comment.module').then((m) => m.CommentsPageModule) },
  { path: 'profile/edit', loadChildren: () => import('./pages/profile/profile-edit/profile-edit.module').then((m) => m.ProfileEditPageModule) },
  { path: 'profile/:id/feeds', loadChildren: () => import('./pages/profile/profile-feeds/profile-feeds.module').then((m) => m.ProfileFeedsPageModule) },
  { path: 'profile/:id', loadChildren: () => import('./pages/profile/profile-main/profile-main.module').then((m) => m.ProfileMainPageModule) },
  { path: 'settings', loadChildren: () => import('./pages/settings/settings-main/settings-main.module').then((m) => m.SettingsMainPageModule) },

  // Tabs
  { path: 'feed', loadChildren: () => import('./pages/feed/list/list.module').then((m) => m.ListPageModule) },
  { path: 'chat', loadChildren: () => import('./pages/chat/list/list.module').then((m) => m.ListPageModule) },
  { path: 'discover', loadChildren: () => import('./pages/discover/discover.module').then((m) => m.DiscoverPageModule) },
  { path: 'call', loadChildren: () => import('./pages/call/call.module').then((m) => m.CallPageModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class AppRoutingModule {}
