import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ApartmentsClass} from '../../../../../component/apartments-class';
import {HttpClient} from '@angular/common/http';
import {ConstantsService} from '../../../../../services/constants.service';
import {Booking} from '../../../../../component/booking';
import {DataTransferService} from '../../../../../services/data-transfer.service';
import {Unsubscribable} from '../../../../../component/Unsubscribable';
import {SelectService} from '../../../../../services/select.service';
import {Subscription} from 'rxjs';
import {User} from '../../../../../component/user';
import {Apartments} from '../../../../../component/apartments';
import {BookingStatus} from '../../../../../component/booking-status.type';
import {MatDialog} from '@angular/material';
import {DeleteBookingDialogComponent} from '../delete-booking-dialog/delete-booking-dialog.component';

/**
 * @title Dialog with header, scrollable content and actions
 */

const URL = new ConstantsService().BASE_URL;

@Component({
  selector: 'app-change-booking-dialog',
  styleUrls: ['../../../styles/change-dialog.css'],
  templateUrl: './change-booking-dialog.html',
})
export class ChangeBookingDialogComponent extends Unsubscribable implements OnInit {

  addForm: FormGroup;

  booking = {} as Booking;
  subscription: Subscription;

  apartmentsClassesList: ApartmentsClass[];
  apartmentsList: Apartments[];
  selectedApartmentsClass: ApartmentsClass;
  selectedApartment: Apartments;
  user: User;

  status = [
    'Created',
    'CheckedIn',
    'Closed',
    'Canceled'
  ];
  private selectedStatus: BookingStatus;

  // tslint:disable-next-line:max-line-length
  constructor(public dialog: MatDialog,
              private formBuilder: FormBuilder,
              private http: HttpClient,
              private dataTransfer: DataTransferService,
              public selectService: SelectService) {
    super(selectService);
    this.getAllApartmentsClasses();
    this.booking = dataTransfer.getData();
    console.log(this.booking);
  }

  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      startDate: [this.booking.startDate, Validators.pattern('(\\d{4})-(\\d{2})-(\\d{2})')],
      endDate: [this.booking.endDate, Validators.pattern('(\\d{4})-(\\d{2})-(\\d{2})')],
      // totalPrice: [this.booking.totalPrice],
      comment: [this.booking.comment],
      review: [this.booking.review],
      bookingStatus: [this.booking.bookingStatus, Validators.required],
      email: [this.booking.user.email, Validators.pattern('^[a-zA-Z0-9.!#$%&’*+=?^_`{|}~-]+\\@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-]+$')],
      nameClass: [this.booking.apartmentClass.nameClass, Validators.required],
      roomNumber: [this.getRoomNumber(this.booking.apartment), Validators.required]
    });

    this.getUserByEmail();

    // if (this.booking.apartment !== null) {
    //   this.addForm.value.roomNumber = this.booking.apartment.roomNumber;
    // }
    this.checkValid();

    this.subscription = this.selectService.selectAnnounced$
      .subscribe(row => {
        console.log(row);
        this.selectedStatus = this.booking.bookingStatus;
        this.selectedApartmentsClass = this.booking.apartmentClass;
        if (this.booking.apartment !== null) {
          this.selectedApartment = this.booking.apartment;
        } else {
          this.getFreeApartments(this.booking.startDate, this.booking.endDate, this.booking.apartmentClass.id);
        }
        this.fillForm(row);
      });
  }

  getRoomNumber(apartment: Apartments): string {
    let roomNumber = '';
    if (apartment !== null) {
      roomNumber = apartment.roomNumber.toString();
    }
    return roomNumber;
  }

  fillForm(row: Booking) {
    this.addForm.setValue({
      startDate: row.startDate,
      endDate: row.endDate,
      // totalPrice: row.totalPrice,
      comment: row.comment,
      review: row.review,
      bookingStatus: row.bookingStatus,
      email: row.user.email,
      nameClass: row.apartmentClass.nameClass,
      roomNumber: this.getRoomNumber(row.apartment)
    });
  }

  checkValid() {
    this.addForm.markAllAsTouched();
    console.log('FormGroup: ', this.addForm.valid);
  }

  isValidForAprtmnt(): boolean {
    if ((this.addForm.value.startDate !== '') && (this.addForm.value.endDate !== '') && (this.selectedApartmentsClass !== null)) {
      return true;
    }
    return false;
  }

  isSubmitDisabled(): boolean {
    return !this.addForm.valid;
  }

  onSubmit() {
    if (this.addForm.valid) {
      this.getUserByEmail();
      this.setBooking();
      this.createBooking();
    }
  }

  createBooking() {
    this.http.put(URL + 'bookings/' + this.booking.id, this.booking).subscribe(
      res => {
        console.log(res);
        this.booking = (res as Booking);
      });
  }

  setBooking() {
    this.booking.apartmentClass = this.selectedApartmentsClass;
    this.booking.apartment = this.selectedApartment;
    this.booking.startDate = this.addForm.value.startDate;
    this.booking.endDate = this.addForm.value.endDate;
    // this.booking.totalPrice = this.addForm.value.totalPrice;
    this.booking.comment = this.addForm.value.comment;
    this.booking.review = this.addForm.value.review;
    this.booking.bookingStatus = this.selectedStatus;
    this.booking.user = this.user;
    console.log(this.booking);
  }

  onSelectAprtmntClass(apartmentsClass: ApartmentsClass): void {
    this.selectedApartmentsClass = apartmentsClass;
    this.getFreeApartments(this.addForm.value.startDate, this.addForm.value.endDate, apartmentsClass.id);
    this.addForm.setValue({
      roomNumber: ''
    });
  }

  onSelectAprtmnt(apartments: Apartments): void {
    this.selectedApartment = apartments;
  }

  onSelectStatus(status: any): void {
    this.selectedStatus = status;
  }

  getUserByEmail() {
    let uList: User[];
    this.http.get(URL + 'users' + '?email=' + this.addForm.value.email).subscribe(
      res => {
        console.log(res);
        uList = (res as User[]);
        this.user = uList[0];
        console.log(this.user);
      });
  }

  getAllApartmentsClasses() {
    this.http.get(URL + 'apartmentsClasses').subscribe(res => {
      console.log(res);
      this.apartmentsClassesList = (res as ApartmentsClass[]);
    });
  }

  getFreeApartments(startDate: Date, endDate: Date, classId: number) {
    this.http.get(URL + 'bookings' + '/findList?'
      + 'startDate=' + startDate
      + '&endDate=' + endDate
      + '&apartmentClass=' + classId)
      .subscribe(res => {
        console.log(res);
        this.apartmentsList = (res as Apartments[]);
      });
  }

  deleteBooking() {
    const dialogRef = this.dialog.open(DeleteBookingDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}



