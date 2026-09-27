import { Widget } from '@lumino/widgets';

import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';

import { ToolbarWidget } from './toolbar_widget.js';
import { ConfigWidget } from './config_widget.js';

export class WavesurferWidget extends Widget {
  private _ws: WaveSurfer | null = null;
  private _toolbar: ToolbarWidget | null = null;
  private _config: ConfigWidget | null = null;
  private _audioUrl: string | null = null;

  constructor(
    toolbalWidget: ToolbarWidget,
    configWidget: ConfigWidget,
    widgetSpectrogram?: Widget
  ) {
    super();
    this.node.style.minHeight = '100px';
    this.node.style.overflowX = 'scroll';
    this.node.style.overflowY = 'auto';

    this._toolbar = toolbalWidget;
    this._config = configWidget;
    this._toolbar.registerHandlers(this);
    this._config.registerHandlers(this);
    this.rebuildForSpectrogramSettings();
  }

  rebuildForSpectrogramSettings() {
    if (this._ws) {
      this._ws.destroy();
      this._ws = null;
    }

    this._ws = WaveSurfer.create({
      container: this.node as HTMLElement,
      waveColor: 'violet',
      progressColor: 'purple',
      sampleRate: this._config?.sampleRate
    });
    this._ws.registerPlugin(
      TimelinePlugin.create({
        height: 20,
        timeInterval: 0.1,
        primaryLabelInterval: 1,
        style: {
          fontSize: '1rem',
          color: '#333333'
        }
      })
    );
    this._ws.registerPlugin(
      SpectrogramPlugin.create({
        labels: true,
        height: this._toolbar?.spectrogramHeight,
        splitChannels: true,
        scale: this._config?.frequencyScale as any,
        frequencyMin: 0,
        frequencyMax: this._config?.maxFrequency,
        fftSamples: this._config?.fftSize,
        windowFunc: this._config?.windowFunction as any,
        noverlap: this._config?.noverlap,
        colorMap: this._config?.colormap as any
      })
    );

    this._ws.once('ready', () => {
      console.log('WaveSurfer is ready.');
      this.zoom(this._toolbar?.getZoom() || 100);
    });

    this._ws.on('error', e => {
      console.error('WaveSurfer error:', e);
    });

    if (this._audioUrl) {
      this._ws.load(this._audioUrl);
    }

    this.adjustHeight();
  }

  load(data: string) {
    if (!data.startsWith('data:')) {
      data = 'data:audio/wav;base64,' + data;
    }

    this._audioUrl = data;
    this._ws?.load(data);
  }

  playPause(): void {
    this._ws?.playPause();
  }

  zoom(minPxPerSec: number): void {
    this._ws?.zoom(minPxPerSec);
  }

  adjustHeight(): void {
    if (this._ws) {
      // toolbar + timeline =~ 52px
      const heigthOffset = 52 + (this._toolbar?.spectrogramHeight || 400);
      const newHeight = this.node.clientHeight - heigthOffset;
      this._ws.setOptions({
        height: newHeight > 80 ? newHeight : 80
        // width: this.node.clientWidth,
      });
    }
  }

  protected onResize(msg: Widget.ResizeMessage): void {
    super.onResize(msg);
    this.adjustHeight();
  }

  dispose(): void {
    this._ws?.destroy();
    this._ws = null;
    super.dispose();
  }
}
