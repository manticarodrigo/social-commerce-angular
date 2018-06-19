import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from './../../auth/auth.service';
import { ApiService } from './../../core/api.service';
import { UtilsService } from './../../core/utils.service';
import { FilterSortService } from './../../core/filter-sort.service';
import { Subscription } from 'rxjs';
import { UserModel } from './../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  pageTitle = 'My Profile';
  loggedInSub: Subscription;
  userProfileSub: Subscription;
  user: UserModel;
  loading: boolean;
  error: boolean;
  userIdp: string;

  constructor(
    private title: Title,
    public auth: AuthService,
    private api: ApiService,
    public fs: FilterSortService,
    public utils: UtilsService
  ) { }

  ngOnInit() {
    console.log(this.auth.userProfile);
    this.loggedInSub = this.auth.loggedIn$.subscribe(
      loggedIn => {
        this.loading = true;
        if (loggedIn) {
          this._getCurrentUser();
        }
      }
    );
    this.title.setTitle(this.pageTitle);
  }

  private _getCurrentUser() {
    // Get user profile
    this.userProfileSub = this.api
      .getUserById$(this.auth.userProfile._id)
      .subscribe(
        res => {
          this.user = res;
          this.loading = false;
        },
        err => {
          console.error(err);
          this.loading = false;
          this.error = true;
        }
      );
  }

  ngOnDestroy() {
    this.loggedInSub.unsubscribe();
    this.userProfileSub.unsubscribe();
  }

}
