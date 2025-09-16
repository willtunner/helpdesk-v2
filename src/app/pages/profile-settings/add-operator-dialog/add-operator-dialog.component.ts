import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CustomInputComponent } from '../../../shared/components/custom-input/custom-input.component';
import { emailExistsValidator } from '../../../services/email-exists.validator';
import { EmailValidationService } from '../../../services/email-validation.service';

@Component({
    selector: 'app-add-operator-dialog',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatDialogModule,
        CustomInputComponent
    ],
    templateUrl: './add-operator-dialog.component.html',
    styleUrl: './add-operator-dialog.component.scss'
})
export class AddOperatorDialogComponent {
  operatorForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private emailValidator: EmailValidationService,
    @Inject(MAT_DIALOG_DATA) public helpDeskCompanyId: string
  ) {
    this.operatorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email], 
      [emailExistsValidator(this.emailValidator, ['helpCompanies', 'users', 'clients'])]],
      phone: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      helpDeskCompanyId: [this.helpDeskCompanyId, Validators.required],
      roles: [['OPERATOR']],
      created: [new Date()],
      isLoggedIn: [false]
    });
  }
}
