import {ChangeDetectionStrategy, Component, forwardRef} from '@angular/core';
import {MultiInputFormControl} from '../multi-input-form-control/multi-input-form-control';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MultiInputType} from '../multi-input-form-control/multi-input-form-control-types';

@Component({
  selector: 'app-form-control-demo',
  templateUrl: './form-control-demo.html',
  styleUrl: './form-control-demo.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    // forwardRef(() => MultiInputFormControl),
    MultiInputFormControl,
    MatIconModule,
    AsyncPipe,
    JsonPipe,

  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class FormControlDemo {

  inputDefinition: MultiInputType = {
    year : {
    label: 'Jaar',
    size: 3,
    maxLength: 3,
    value: "" ,
  },
    month: {
      label: 'Maand',
      size: 3,
      maxLength: 3,
      value: "",
    }}

  readonly form = new FormGroup({
    time_period: new FormControl<MultiInputType>(this.inputDefinition),
    // default: new FormControl(null),
  });

}
