import { Widget } from '@lumino/widgets';

import { WavesurferWidget } from './wavesurfer_widget.js';

const _toolbarHtml = `<div>
  <div style="float: left; margin: 0; padding: 0;">
    <button id="play">Play/Pause</button>
    <label>Region:
      <span id="wsRegionLeftSeconds"></span> &ndash;
      <span id="wsRegionRightSeconds"></span> seconds
      (<span id="wsRegionLeftSample"></span> &ndash;
      <span id="wsRegionRightSample"></span> samples)
    </label>
  </div>
  <div style="float: right; margin: 0; padding: 0;">
    <label>Zoom:
      <input id="wsTimeZoom" type="range" min="10" max="1000" value="100" />
    </label>
    &nbsp;
    <label>Spectrogram Height:
      <input id="wsSpectrogramHeight" type="range" step="100" min="100" max="600" value="400" />
    </label>
  </div>
</div>`;

export class ToolbarWidget extends Widget {
  public spectrogramHeight: number = 400;

  constructor() {
    super();
    this.node.style.backgroundColor = 'lightgray';
    this.node.style.minHeight = '32px';
    this.node.innerHTML = _toolbarHtml;
  }

  registerHandlers(wsWidget: WavesurferWidget) {
    const playButton = this.node.querySelector(
      '#play'
    ) as HTMLButtonElement | null;
    playButton?.addEventListener('click', () => {
      wsWidget.playPause();
    });

    const timeZoomSlider = this.node.querySelector(
      '#wsTimeZoom'
    ) as HTMLInputElement | null;
    timeZoomSlider?.addEventListener('input', () => {
      wsWidget.zoom(timeZoomSlider.valueAsNumber);
    });

    const specHeightSlider = this.node.querySelector(
      '#wsSpectrogramHeight'
    ) as HTMLInputElement | null;
    specHeightSlider?.addEventListener('input', () => {
      this.spectrogramHeight = specHeightSlider.valueAsNumber;
      wsWidget.rebuildForSpectrogramSettings();
    });
  }

  getZoom(): number {
    const timeZoomSlider = this.node.querySelector(
      '#wsTimeZoom'
    ) as HTMLInputElement | null;
    return timeZoomSlider?.valueAsNumber || 100;
  }

  updateRangeDisplay(
    left: number | null,
    right: number | null,
    sampleRate: number
  ) {
    const elLeftSample = this.node.querySelector(
      '#wsRegionLeftSample'
    ) as HTMLSpanElement | null;
    const elRightSample = this.node.querySelector(
      '#wsRegionRightSample'
    ) as HTMLSpanElement | null;
    const elLeftSeconds = this.node.querySelector(
      '#wsRegionLeftSeconds'
    ) as HTMLSpanElement | null;
    const elRightSeconds = this.node.querySelector(
      '#wsRegionRightSeconds'
    ) as HTMLSpanElement | null;

    if (elLeftSample) elLeftSample.innerHTML = '';
    if (elRightSample) elRightSample.innerHTML = '';
    if (elLeftSeconds) elLeftSeconds.innerHTML = '';
    if (elRightSeconds) elRightSeconds.innerHTML = '';
    if (left === null || right === null) return;

    if (elLeftSeconds) elLeftSeconds.innerHTML = left.toFixed(3);
    if (elRightSeconds) elRightSeconds.innerHTML = right.toFixed(3);
    if (elLeftSample) elLeftSample.innerHTML = (left * sampleRate).toFixed(0);
    if (elRightSample) elRightSample.innerHTML = (right * sampleRate).toFixed(0); // prettier-ignore
  }
}
