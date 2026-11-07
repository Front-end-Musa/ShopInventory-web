import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AnalyticsDay } from './analytics.service';
@Component({
  selector: 'app-trend-chart',
  imports: [DecimalPipe],
  template: `<h2>{{ title() }}</h2>
    @if (points().length) {
      <svg
        viewBox="0 0 600 190"
        role="img"
        [attr.aria-label]="title() + '. Exact values are in the data table below.'"
      >
        <path d="M40 10V140H580 M40 75H580" fill="none" stroke="#738176" />
        <text x="0" y="18">{{ max() | number: '1.0-0' }}</text>
        <text x="0" y="79">0</text>
        <text x="0" y="140">−{{ max() | number: '1.0-0' }}</text>
        <text x="40" y="174">{{ days()[0]?.date }}</text>
        <text x="580" y="174" text-anchor="end">{{ days()[days().length - 1]?.date }}</text>
        @for (segment of segments(); track $index) {
          <polyline [attr.points]="segment" fill="none" stroke="#087360" stroke-width="3" />
        }
        @for (point of points(); track point.date) {
          <circle [attr.cx]="point.x" [attr.cy]="point.y" r="3" fill="#087360" />
        }
      </svg>
    } @else {
      <p role="status">No historical data available for this period.</p>
    }
    <details>
      <summary>View {{ title() }} data table</summary>
      <div class="table-scroll" tabindex="0" role="region" [attr.aria-label]="title() + ' data'">
        <table>
          <caption>
            {{
              title()
            }}
          </caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">{{ unit() }}</th>
            </tr>
          </thead>
          <tbody>
            @for (day of days(); track day.date) {
              <tr>
                <th scope="row">{{ day.date }}</th>
                <td>
                  {{ day[metric()] === null ? 'Unavailable' : (day[metric()] | number: '1.0-2') }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </details>`,
  styles: [
    `
      svg {
        width: 100%;
        height: 180px;
      }
      text {
        fill: #17243b;
        font: 12px sans-serif;
      }
      summary {
        cursor: pointer;
        padding: 12px 0;
        color: #087360;
      }
      td,
      th {
        padding: 8px;
        text-align: left;
        border-bottom: 1px solid #e4e9ed;
      }
    `,
  ],
})
export class TrendChart {
  readonly title = input.required<string>();
  readonly unit = input.required<string>();
  readonly days = input.required<AnalyticsDay[]>();
  readonly metric = input.required<'inventoryValue' | 'revenue' | 'unitsSold' | 'quantity'>();
  readonly max = computed(() =>
    Math.max(1, ...this.days().map((day) => Math.abs(day[this.metric()] ?? 0))),
  );
  readonly points = computed(() =>
    this.days().flatMap((day, index) =>
      day[this.metric()] === null
        ? []
        : [
            {
              date: day.date,
              x: 40 + (index * 540) / Math.max(1, this.days().length - 1),
              y: 75 - ((day[this.metric()] ?? 0) / this.max()) * 60,
            },
          ],
    ),
  );
  readonly segments = computed(() => {
    const segments: string[] = [];
    let current: string[] = [];
    this.days().forEach((day, index) => {
      const value = day[this.metric()];
      if (value === null) {
        if (current.length) segments.push(current.join(' '));
        current = [];
      } else
        current.push(
          40 +
            (index * 540) / Math.max(1, this.days().length - 1) +
            ',' +
            (75 - (value / this.max()) * 60),
        );
    });
    if (current.length) segments.push(current.join(' '));
    return segments;
  });
}
