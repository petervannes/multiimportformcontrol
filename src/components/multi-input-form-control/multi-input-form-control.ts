import {
  booleanAttribute,
  Component, computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  signal, untracked,
  viewChild
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NgControl,
  ReactiveFormsModule, Validators
} from '@angular/forms';
import {MAT_FORM_FIELD, MatFormFieldControl} from '@angular/material/form-field';
import {Subject} from 'rxjs';
import {FocusMonitor} from '@angular/cdk/a11y';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MultiInputType} from './multi-input-form-control-types';

@Component({
  selector: 'multi-input-form-control',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './multi-input-form-control.html',
  styleUrl: './multi-input-form-control.scss',
  providers: [{provide: MatFormFieldControl, useExisting: MultiInputFormControl}],
  host: {
    '[class.example-floating]': 'shouldLabelFloat',
    '[id]': 'id',
  },
})

export class MultiInputFormControl implements MatFormFieldControl<MultiInputType>, OnDestroy {

  inputDefinition = input.required<MultiInputType>() ;
  readonly _value = model<MultiInputType | null>(null, {alias: 'value'});  //revise 'alias'


  // MatformFieldControl overrides
  static nextId = 0; // Shared across all instances of component class
  readonly id = `multi-input-form-control-${MultiInputFormControl.nextId++}`;


  readonly parts: FormGroup<{
    area: FormControl<string | null>;
    exchange: FormControl<string | null>;
    subscriber: FormControl<string | null>;
  }>;


  readonly areaInput = viewChild.required<HTMLInputElement>('area');
  readonly exchangeInput = viewChild.required<HTMLInputElement>('exchange');
  readonly subscriberInput = viewChild.required<HTMLInputElement>('subscriber');
  ngControl = inject(NgControl, {optional: true, self: true});

  readonly stateChanges = new Subject<void>();
  readonly touched = signal(false);
  // readonly controlType = 'example-tel-input';

  readonly _userAriaDescribedBy = input<string>('', {alias: 'aria-describedby'});
  readonly _placeholder = input<string>('', {alias: 'placeholder'});
  readonly _required = input<boolean, unknown>(false, {
    alias: 'required',
    transform: booleanAttribute,
  });
  readonly _disabledByInput = input<boolean, unknown>(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });



  protected readonly _formField = inject(MAT_FORM_FIELD, {
    optional: true,
  });

  private readonly _focused = signal(false);
  private readonly _disabledByCva = signal(false);
  private readonly _disabled = computed(() => this._disabledByInput() || this._disabledByCva());
  private readonly _focusMonitor = inject(FocusMonitor);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  onChange = (_: any) => {};
  onTouched = () => {};

  get focused(): boolean {
    return this._focused();
  }

  get empty() {
    const {
      value: {area, exchange, subscriber},
    } = this.parts;

    return !area && !exchange && !subscriber;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  get userAriaDescribedBy() {
    return this._userAriaDescribedBy();
  }

  get placeholder(): string {
    return this._placeholder();
  }

  get required(): boolean {
    return this._required();
  }

  get disabled(): boolean {
    return this._disabled();
  }

  get value(): MultiInputType | null {
    return this._value();
  }

  get errorState(): boolean {
    return this.parts.invalid && this.touched();
  }
  constructor() {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

    this.parts = inject(FormBuilder).group({
      area: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      exchange: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      subscriber: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
    });

    effect(() => {
      // Read signals to trigger effect.
      this._placeholder();
      this._required();
      this._disabled();
      this._focused();
      // Propagate state changes.
      untracked(() => this.stateChanges.next());
    });

    effect(() => {
      if (this._disabled()) {
        untracked(() => this.parts.disable());
      } else {
        untracked(() => this.parts.enable());
      }
    });

    // effect(() => {
    //   const value = this._value() || new MyMultiInput[]('', '', '');
    //   untracked(() => this.parts.setValue(value));
    // });

    this.parts.statusChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.stateChanges.next();
    });

    // this.parts.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
    //   const tel = this.parts.valid
    //     ? new MyMultiInput[](
    //       this.parts.value.area || '',
    //       this.parts.value.exchange || '',
    //       this.parts.value.subscriber || '',
    //     )
    //     : null;
    //   this._updateValue(tel);
    // });
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  onFocusIn() {
    if (!this._focused()) {
      this._focused.set(true);
    }
  }

  onFocusOut(event: FocusEvent) {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this.touched.set(true);
      this._focused.set(false);
      this.onTouched();
    }
  }

  autoFocusNext(control: AbstractControl, nextElement?: HTMLInputElement): void {
    if (!control.errors && nextElement) {
      this._focusMonitor.focusVia(nextElement, 'program');
    }
  }

  autoFocusPrev(control: AbstractControl, prevElement: HTMLInputElement): void {
    if (control.value.length < 1) {
      this._focusMonitor.focusVia(prevElement, 'program');
    }
  }

  setDescribedByIds(ids: string[]) {
    const controlElement = this._elementRef.nativeElement.querySelector(
      '.example-tel-input-container',
    )!;
    controlElement.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick() {
    if (this.parts.controls.subscriber.valid) {
      this._focusMonitor.focusVia(this.subscriberInput(), 'program');
    } else if (this.parts.controls.exchange.valid) {
      this._focusMonitor.focusVia(this.subscriberInput(), 'program');
    } else if (this.parts.controls.area.valid) {
      this._focusMonitor.focusVia(this.exchangeInput(), 'program');
    } else {
      this._focusMonitor.focusVia(this.areaInput(), 'program');
    }
  }

  writeValue(tel: MultiInputType | null): void {
    this._updateValue(tel);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabledByCva.set(isDisabled);
  }

  _handleInput(control: AbstractControl, nextElement?: HTMLInputElement): void {
    this.autoFocusNext(control, nextElement);
    this.onChange(this.value);
  }

  private _updateValue(tel: MultiInputType | null) {
    const current = this._value();
    // if (
    //   tel === current ||
    //   (tel?.area === current?.area &&
    //     tel?.exchange === current?.exchange &&
    //     tel?.subscriber === current?.subscriber)
    // ) {
    //   return;
    // }
    this._value.set(tel);
  }

  protected readonly Object = Object;
  protected readonly JSON = JSON;
}




