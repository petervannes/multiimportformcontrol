import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MultiInputFormControl} from '../components/multi-input-form-control/multi-input-form-control';
import {FormControlDemo} from '../components/form-control-demo/form-control-demo';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MultiInputFormControl, FormControlDemo],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'multiinputformcontrol';

}
