import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CommentsPage } from './comment.page';
import { FeedItemModule } from '../../../components/feed/feed-item/feed-item.module';
import { FeedCommentModule } from '../../../components/feed/feed-comment/feed-comment.module';
import { InputBarModule } from '../../../components/input-bar/input-bar.module';
import { AuthGuard } from '../../../guards/auth.guard';
import { ErrorHandlerService } from '../../../services/error-handler.service';

const routes: Routes = [
  {
    path: '',
    component: CommentsPage,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), FeedItemModule, FeedCommentModule, InputBarModule],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
  declarations: [CommentsPage],
})
export class CommentsPageModule {}
