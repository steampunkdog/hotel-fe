/* tslint:disable:no-trailing-whitespace */
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UnavailableApartment} from '../../../../../component/unavailable-apartment';
import {Apartments} from '../../../../../component/apartments';
import {HttpClient} from '@angular/common/http';
import {ConstantsService} from '../../../../../services/constants.service';
import {DataTransferService} from '../../../../../services/data-transfer.service';
import {Unsubscribable} from '../../../../../component/Unsubscribable';
import {SelectService} from '../../../../../services/select.service';
import {Subscription} from 'rxjs';
import {MatDialog} from '@angular/material';
import {DeleteUnavailableApartmentDialogComponent} from '../delete-unavailable-apartment-dialog/delete-unavailable-apartment-dialog.component';

/**
 * @title Dialog with header, scrollable content and actions
 */

const URL = new ConstantsService().BASE_URL;

@Component({
  selector: 'app-change-unavailable-apartment-dialog',
  styleUrls: ['../../../styles/change-dialog.css'],
  templateUrl: './change-unavailable-apartment-dialog.html',
})
export class ChangeUnavailableApartmentDialogComponent extends Unsubscribable implements OnInit {

  addForm: FormGroup;

  unavailableApartment = {} as UnavailableApartment;
  subscription: Subscription;

  apartmentsList: Apartments[];
  selectedApartments: Apartments;

  // tslint:disable-next-line:max-line-length
  constructor(public dialog: MatDialog,
              private formBuilder: FormBuilder,
              private http: HttpClient,
              private dataTransfer: DataTransferService,
              public selectService: SelectService) {
    super(selectService);
    this.getAllApartments();
    this.unavailableApartment = dataTransfer.getData();
    console.log(this.unavailableApartment);
  }

  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      apartment: ['', Validators.required], // outputs room number
      causeDescription: ['', Validators.required],
      startDate: ['', Validators.pattern('(\\d{4})-(\\d{2})-(\\d{2})')],
      endDate: ['', Validators.pattern('(\\d{4})-(\\d{2})-(\\d{2})')]
    });
    this.checkValid();
    this.subscription = this.selectService.selectAnnounced$
      .subscribe(row => {
        console.log(row);
        this.selectedApartments = this.unavailableApartment.apartment;
        this.fillForm(row);
      });
  }

  fillForm(row: UnavailableApartment) {
    this.addForm.setValue({
      startDate: row.startDate,
      endDate: row.endDate,
      causeDescription: row.causeDescription,
      apartment: row.apartment.roomNumber
    });
  }

  checkValid() {
    this.addForm.markAllAsTouched();
    console.log('FormGroup: ', this.addForm.valid);
  }

  isSubmitDisabled(): boolean {
    return !this.addForm.valid && this.addForm.value.startDate >= this.addForm.value.endDate;
    //

  }

  onSubmit() {
    if (this.addForm.valid) {
      this.setUnavailableApartment();
      this.createUnavailableApartment();
    }
  }

  setUnavailableApartment() {
    this.unavailableApartment.apartment = this.selectedApartments;
    this.unavailableApartment.startDate = this.addForm.value.startDate;
    this.unavailableApartment.endDate = this.addForm.value.endDate;
    this.unavailableApartment.causeDescription = this.addForm.value.causeDescription;
    console.log(this.unavailableApartment);
  }

  createUnavailableApartment() {
    this.http.put(URL + 'unavailableApartments/' + this.unavailableApartment.id, this.unavailableApartment).subscribe(
      res => {
        console.log(res);
        this.unavailableApartment = (res as UnavailableApartment);
      });
  }


  onSelectApartment(apartments: Apartments): void {
    this.selectedApartments = apartments;
  }


  getAllApartments() {
    this.http.get(URL + 'apartments').subscribe(res => {
      console.log(res);
      this.apartmentsList = (res as Apartments[]);
    });
  }


  deleteUnavailableApartment() {
    const dialogRef = this.dialog.open(DeleteUnavailableApartmentDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}


