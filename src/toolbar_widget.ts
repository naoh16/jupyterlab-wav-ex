import { Widget } from '@lumino/widgets';

import { WavesurferWidget } from './wavesurfer_widget.js';

const _toolbarHtml = `<div>
  <button id="play">Play/Pause</button>
  <label>Zoom:
    <input id="wsTimeZoom" type="range" min="10" max="1000" value="100" />
  </label>
  &nbsp;
  <label>Spectrogram Height:
    <input id="wsSpectrogramHeight" type="range" step="100" min="100" max="600" value="400" />
  </label>
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
}
