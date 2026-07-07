import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Utilities } from './utilities';
import { SliderHandlerEnum } from './slider-handler.enum';

@Component({
  standalone: false,
  selector: 'npn-slider',
  template: `<!--npn-slider template-->
<div class="slider" [class.disabled]="isDisabled">
  <div class="bar" (mousemove)="handlerSliding($event)" (touchmove)="handlerSliding($event)">
    <span class="left-handle"
      [ngClass]="{
        'active': isHandlerActive && currentHandlerIndex === handlerIndex.left,
        'last-active': currentHandlerIndex === handlerIndex.left
      }"
      [style.left.%]="handlerX[handlerIndex.left]"
      (mousedown)="setHandlerActive($event, handlerIndex.left)"
      (touchstart)="setHandlerActive($event, handlerIndex.left)">
      <span *ngIf="!hideTooltip" class="handle-tooltip">{{currentValues[handlerIndex.left]}}</span>
    </span>
    <div class="filler">
      <div class="step-indicators">
        <span *ngFor="let stepPos of stepIndicatorPositions" [style.left.px]="stepPos"></span>
      </div>
      <span *ngIf="multiRange" [style.left.%]="handlerX[0]"
        [style.width.%]="handlerX[handlerIndex.right] - handlerX[handlerIndex.left]"></span>
      <span *ngIf="!multiRange" [style.left.%]="0" [style.width.%]="handlerX[0]"></span>
    </div>
    <span *ngIf="multiRange" class="right-handle"
      [ngClass]="{
        'active': isHandlerActive && currentHandlerIndex === handlerIndex.right,
        'last-active': currentHandlerIndex === handlerIndex.right
      }"
      [style.left.%]="handlerX[handlerIndex.right]"
      (mousedown)="setHandlerActive($event, handlerIndex.right)"
      (touchstart)="setHandlerActive($event, handlerIndex.right)">
      <span *ngIf="!hideTooltip" class="handle-tooltip">{{currentValues[handlerIndex.right]}}</span>
    </span>
  </div>
  <div class="values" *ngIf="!hideValues">
    <span>{{initValues[handlerIndex.left]}}</span>
    <span>{{initValues[handlerIndex.right]}}</span>
  </div>
</div>
`,
  styles: [`.slider,.slider *{box-sizing:border-box}.slider{display:block;width:100%;height:30px;padding:4px 10px;cursor:default;font-size:12px}.slider .bar{width:100%;background:#e8e8e8;height:10px;position:relative;border-radius:5px;box-shadow:inset 1px 1px 5px #bababa}.slider .bar>span.left-handle,.slider .bar>span.right-handle{display:inline-block;width:22px;height:22px;background:#bedcb2;border:7px solid #71b357;border-radius:50%;position:absolute;top:-7px;margin-left:-10px;z-index:1;cursor:pointer;transition:left .2s ease}.slider .bar>span.left-handle.last-active,.slider .bar>span.right-handle.last-active{z-index:2}.slider .bar>span.left-handle .handle-tooltip,.slider .bar>span.right-handle .handle-tooltip{display:block;position:absolute;top:-34px;left:-14px;border:1px solid #8fc37a;border-radius:4px;padding:1px 4px;min-width:20px;text-align:center;background:#d9ebd2;color:#71b357;font-weight:700;transition:opacity .2s ease;opacity:0}.slider .bar>span.left-handle .handle-tooltip:before,.slider .bar>span.right-handle .handle-tooltip:before{content:"";border:5px solid transparent;border-top-color:#8fc37a;position:absolute;top:104%;left:33%}.slider .bar>span.left-handle .handle-tooltip:after,.slider .bar>span.right-handle .handle-tooltip:after{content:"";border:5px solid transparent;border-top-color:#d9ebd2;position:absolute;top:100%;left:33%}.slider .bar>span.left-handle.active>.handle-tooltip,.slider .bar>span.left-handle:hover>.handle-tooltip,.slider .bar>span.right-handle.active>.handle-tooltip,.slider .bar>span.right-handle:hover>.handle-tooltip{opacity:1}.slider .bar div.filler{display:block;width:100%;height:100%;position:relative;overflow:hidden;border-radius:5px;border:1px solid #bedcb2}.slider .bar div.filler>span{display:inline-block;height:100%;position:absolute;top:0;background:#bedcb2;transition:all .2s ease}.slider .bar div.filler>div.step-indicators{width:100%;height:100%;position:relative}.slider .bar div.filler>div.step-indicators>span{width:1px;display:inline-block;height:10px;background:#71b357;position:absolute;left:0}.slider .values{display:block;font-weight:700;margin-top:4px;width:102%;margin-left:-1%;color:#908f90}.slider .values span:first-child{float:left}.slider .values span:last-child{float:right}.slider.disabled{opacity:.4}.slider.disabled .bar{box-shadow:none!important}.slider.disabled .bar>span.left-handle,.slider.disabled .bar>span.right-handle{cursor:not-allowed}.slider.disabled .bar>span.left-handle .handle-tooltip,.slider.disabled .bar>span.right-handle .handle-tooltip{display:none}`]
})
export class NpnSliderComponent extends Utilities implements OnInit, OnChanges {
  private sliderModel: number[] = [0, 0, 0];
  private step = 1;
  private sliderWidth = 0;
  private totalDiff = 0;
  private startClientX = 0;
  private startPleft = 0;
  private startPRight = 0;
  private minValue!: number;
  private maxValue!: number;
  private minSelected!: number;
  private maxSelected!: number;
  private sliderInitiated = false;

  initValues: number[] = [];
  currentValues: number[] = [0, 0];
  handlerX: number[] = [0, 0];
  isHandlerActive = false;
  isTouchEventStart = false;
  isMouseEventStart = false;
  currentHandlerIndex = 0;
  stepIndicatorPositions: number[] = [];
  isDisabled = false;
  hideTooltip = false;
  hideValues = false;
  handlerIndex = SliderHandlerEnum;

  @Input() showStepIndicator = false;
  @Input() multiRange = true;

  @Input('min')
  set setMinValues(value: number) {
    if (!isNaN(value)) {
      this.minValue = Number(value);
    }
  }

  @Input('max')
  set setMaxValues(value: number) {
    if (!isNaN(value)) {
      this.maxValue = Number(value);
    }
  }

  @Input('minSelected')
  set setMinSelectedValues(value: number) {
    if (!isNaN(value) && this.minSelected !== Number(value)) {
      this.minSelected = Number(value);
    }
  }

  @Input('maxSelected')
  set setMaxSelectedValues(value: number) {
    if (!isNaN(value) && this.maxSelected !== Number(value)) {
      this.maxSelected = Number(value);
    }
  }

  @Input('step')
  set stepValue(value: number) {
    if (!isNaN(value)) {
      this.step = Number(value);
    }
  }

  @Input('hide-tooltip')
  set setHideTooltip(value: any) {
    this.hideTooltip = this.toBoolean(value);
  }

  @Input('hide-values')
  set setHideValues(value: any) {
    this.hideValues = this.toBoolean(value);
  }

  @Input('disabled')
  set setDisabled(value: any) {
    this.isDisabled = this.toBoolean(value, 'disabled');
  }

  @Output() onChange = new EventEmitter<number[]>();

  constructor(private el: ElementRef) {
    super();
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  setHandlerActiveOff() {
    this.isMouseEventStart = false;
    this.isTouchEventStart = false;
    this.isHandlerActive = false;
  }

  ngOnInit() {
    this.initializeSlider();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.sliderInitiated) {
      if (!this.isNullOrEmpty(changes['setMinSelectedValues'])
        && changes['setMinSelectedValues'].previousValue === changes['setMinSelectedValues'].currentValue) {
        return;
      }
      if (!this.isNullOrEmpty(changes['setMaxSelectedValues'])
        && changes['setMaxSelectedValues'].previousValue === changes['setMaxSelectedValues'].currentValue) {
        return;
      }
      this.resetModel();
    }
  }

  initializeSlider() {
    try {
      this.sliderWidth = this.el.nativeElement.children[0].children[0].offsetWidth;
      this.resetModel();
      this.sliderInitiated = true;
    } catch (e) {
      console.error(e);
    }
  }

  private resetModel() {
    this.validateSliderValues();
    this.sliderModel = [
      this.currentValues[0] - this.initValues[0],
      this.currentValues[1] - this.currentValues[0],
      this.initValues[1] - this.currentValues[1]
    ];
    this.totalDiff = this.sliderModel.reduce((prevValue, curValue) => prevValue + curValue, 0);
    if (this.totalDiff % this.step !== 0) {
      const newStep = this.findNextValidStepValue(this.totalDiff, this.step);
      console.warn('Invalid step value "' + this.step + '" : and took "' + newStep + '" as default step');
      this.step = newStep;
    }
    this.initializeStepIndicator();
    this.setHandlerPosition();
  }

  private validateSliderValues() {
    if (this.isNullOrEmpty(this.minValue) || this.isNullOrEmpty(this.maxValue)) {
      this.updateInitValues([0, 0]);
      this.updateCurrentValue([0, 0], true);
    } else if (this.minValue > this.maxValue) {
      this.updateInitValues([0, 0]);
      this.updateCurrentValue([0, 0], true);
    } else {
      this.initValues = [this.minValue, this.maxValue];
      if (this.isNullOrEmpty(this.minSelected) || this.minSelected < this.minValue || this.minSelected > this.maxValue) {
        this.minSelected = this.minValue;
      }
      if (this.isNullOrEmpty(this.maxSelected) || this.maxSelected < this.minValue || this.maxSelected > this.maxValue) {
        this.maxSelected = this.maxValue;
      }
      if (this.minSelected > this.maxSelected) {
        this.minSelected = this.minValue;
        this.maxSelected = this.maxValue;
      }
      this.updateCurrentValue([this.minSelected, this.maxSelected], true);
    }
  }

  private initializeStepIndicator() {
    if (this.showStepIndicator) {
      this.stepIndicatorPositions.length = 0;
      const numOfStepIndicators = this.totalDiff / this.step;
      if (this.sliderWidth / numOfStepIndicators >= 10) {
        const increment = this.sliderWidth / numOfStepIndicators;
        let leftPosition = increment;
        while (this.stepIndicatorPositions.length < numOfStepIndicators - 1) {
          this.stepIndicatorPositions.push(+leftPosition.toFixed(2));
          leftPosition += increment;
        }
      } else {
        console.warn(`As 'step' value is too small compared to min & max value difference and slider width,
          Step Indicator can't be displayed!. Provide slight large value for 'step'`);
      }
    } else {
      this.stepIndicatorPositions.length = 0;
    }
  }

  private updateCurrentValue(arrayValue: number[], privateChange = false) {
    this.minSelected = this.currentValues[0] = arrayValue[0];
    this.maxSelected = this.currentValues[1] = arrayValue[1];
    if (!privateChange) {
      this.onChange.emit((this.multiRange) ? this.currentValues : [this.currentValues[0]]);
    }
  }

  private updateInitValues(arrayValue: number[]) {
    this.minValue = this.initValues[0] = arrayValue[0];
    this.maxValue = this.initValues[1] = arrayValue[1];
  }

  private setHandlerPosition() {
    let runningTotal = 0;
    this.updateCurrentValue([
      this.initValues[0] + this.sliderModel[0],
      this.initValues[1] - this.sliderModel[2]
    ]);
    for (let i = 0, len = this.sliderModel.length - 1; i < len; i++) {
      runningTotal += this.sliderModel[i];
      this.handlerX[i] = (runningTotal / this.totalDiff) * 100;
    }
  }

  private setModelValue(index: number, value: number) {
    if (this.step > 1) {
      value = Math.round(value / this.step) * this.step;
    }
    this.sliderModel[index] = value;
  }

  setHandlerActive(event: MouseEvent | TouchEvent, handlerIndex: number) {
    event.preventDefault();
    if (!this.isDisabled) {
      const clientX = (event instanceof MouseEvent)
        ? event.clientX
        : (event as TouchEvent).touches[0]?.clientX;

      if (clientX !== undefined) {
        this.startClientX = clientX;
        this.isMouseEventStart = event instanceof MouseEvent;
        this.isTouchEventStart = !(event instanceof MouseEvent);
        this.currentHandlerIndex = handlerIndex;
        this.startPleft = this.sliderModel[handlerIndex];
        this.startPRight = this.sliderModel[handlerIndex + 1];
        this.isHandlerActive = true;
      }
    }
  }

  handlerSliding(event: MouseEvent | TouchEvent) {
    const clientX = (event instanceof MouseEvent)
      ? event.clientX
      : (event as TouchEvent).touches[0]?.clientX;

    if ((this.isMouseEventStart && event instanceof MouseEvent) ||
        (this.isTouchEventStart && !(event instanceof MouseEvent))) {
      if (clientX !== undefined) {
        const movedX = Math.round((clientX - this.startClientX) / this.sliderWidth * this.totalDiff);
        const nextPLeft = this.startPleft + movedX;
        const nextPRight = this.startPRight - movedX;
        if (nextPLeft >= 0 && nextPRight >= 0) {
          this.setModelValue(this.currentHandlerIndex, nextPLeft);
          this.setModelValue(this.currentHandlerIndex + 1, nextPRight);
          this.setHandlerPosition();
        }
      }
    }
  }
}
