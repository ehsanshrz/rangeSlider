import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  codeSnippetText = 'Source Code';

  // Basic multi-range
  currentValues = [0, 0];
  // Price range
  priceValues = [200, 800];
  // Temperature
  tempValues = [-10, 30];
  // Percentage
  percentValues = [20, 75];
  // Year
  yearValues = [2010, 2023];
  // Single range - volume
  volumeValue = [60];
  // Step with indicators
  stepValues = [2000, 4000];
  // Single range - rating
  ratingValue = [7];
  // Large range
  largeValues = [10000, 80000];
  // Fine-grained steps
  fineValues = [0.2, 0.6];
  // Custom single range - progress
  progressValue = [45];
  // Multi-range - distance
  distanceValues = [5, 25];

  onSliderChange(selectedValues: number[]) {
    this.currentValues = selectedValues;
  }
  onPriceChange(v: number[]) { this.priceValues = v; }
  onTempChange(v: number[]) { this.tempValues = v; }
  onPercentChange(v: number[]) { this.percentValues = v; }
  onYearChange(v: number[]) { this.yearValues = v; }
  onVolumeChange(v: number[]) { this.volumeValue = v; }
  onStepChange(v: number[]) { this.stepValues = v; }
  onRatingChange(v: number[]) { this.ratingValue = v; }
  onLargeChange(v: number[]) { this.largeValues = v; }
  onFineChange(v: number[]) { this.fineValues = v; }
  onProgressChange(v: number[]) { this.progressValue = v; }
  onDistanceChange(v: number[]) { this.distanceValues = v; }
}
