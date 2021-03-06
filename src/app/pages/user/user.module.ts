import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {UserComponent} from './user.component';
import {HttpService} from '../../http.service';
import {NgModule} from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatButtonModule,
  MatInputModule,
  MatNativeDateModule,
  MatStepperModule
} from '@angular/material';
import {MatCarouselModule} from '@ngmodule/material-carousel';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import {AuthenticationFormsModule} from '../../modules/authentication/authentication-forms.module';
import {APP_DATE_FORMATS, AppDateAdapter} from "../../utils/AppDateAdapter";
import {UserHeaderComponent} from "./components/user-header/user-header.component";
import {BookingCreatorComponent} from "./components/booking-creator/booking-creator.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AnimationsModule} from "../../modules/animations/animations.module";
import {UserBookingHistoryComponent} from "./components/user-booking-history/user-booking-history.component";
import {ConstantsService} from "../../services/constants.service";
import {NgxTweetModule} from "ngx-tweet";


@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    MatButtonModule,
    RouterModule,
    MatButtonModule,
    MatCarouselModule.forRoot(),
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    NgxTweetModule,
    AuthenticationFormsModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    AnimationsModule
  ],
  declarations: [
    UserComponent,
    UserHeaderComponent,
    BookingCreatorComponent,
    UserBookingHistoryComponent
  ],
  exports: [
    UserComponent,
    UserHeaderComponent,
    BookingCreatorComponent,
    UserBookingHistoryComponent
  ],
  providers: [
    ConstantsService,
    HttpService,
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class UserModule {
}
