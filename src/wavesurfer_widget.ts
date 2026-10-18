import { Widget } from '@lumino/widgets';

import WaveSurfer from 'wavesurfer.js';
import RegionPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';

import { ToolbarWidget } from './toolbar_widget.js';
import { ConfigWidget } from './config_widget.js';

export class WavesurferWidget extends Widget {
  private _ws: WaveSurfer | null = null;
  private _wsRegion: RegionPlugin | null = null;
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
    this.node.style.backgroundColor = 'black';

    this._ws = WaveSurfer.create({
      container: this.node as HTMLElement,
      waveColor: '#4BF2A7',
      progressColor: '#4BF2A7',
      cursorColor: 'pink',
      sampleRate: this._config?.sampleRate
    });
    this._ws.registerPlugin(
      TimelinePlugin.create({
        height: 20,
        timeInterval: 0.1,
        primaryLabelInterval: 1,
        style: {
          fontSize: '1rem',
          color: '#3e6c99'
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

    // Region plugin
    this.registerRegionPlugin();

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

  registerRegionPlugin() {
    this._wsRegion = RegionPlugin.create();
    this._ws?.registerPlugin(this._wsRegion);

    this._wsRegion.enableDragSelection({
      color: 'rgba(255, 64, 64, 0.3)'
    });
    this._wsRegion.on('region-out', region => {
      // console.log('region-out', region);
      if (this._ws?.isPlaying() && this._ws?.getCurrentTime() > region.end) {
        this._ws?.pause();
      }
      console.log(this._wsRegion?.getRegions());
    });
    this._wsRegion.on('region-created', region => {
      // console.log('region-created', region);
      this._wsRegion?.getRegions().forEach(r => {
        if (region.id !== r.id) {
          r.remove();
        }
      });
      const sr = this._config?.originalSampleRate || -1;
      this._toolbar?.updateRangeDisplay(region.start, region.end, sr);
    });
    this._wsRegion.on('region-updated', region => {
      // console.log('region-updated', region);
      const sr = this._config?.originalSampleRate || -1;
      this._toolbar?.updateRangeDisplay(region.start, region.end, sr);
    });
    this._ws?.on('interaction', newTime => {
      // console.log('interaction', newTime);
      const r = this._wsRegion?.getRegions();
      if (r && r.length > 0) {
        if (newTime < r[0].start || r[0].end < newTime) {
          this._wsRegion?.clearRegions();
          this._toolbar?.updateRangeDisplay(null, null, -1);
        }
      }
    });
  }

  load(data: string) {
    if (!data.startsWith('data:')) {
      data = 'data:audio/wav;base64,' + data;
    }

    this._audioUrl = data;
    this._ws?.load(data);
  }

  playPause(): void {
    if (this._ws?.isPlaying()) {
      this._ws?.pause();
    } else {
      const r = this._wsRegion?.getRegions();
      if (r && r.length > 0) {
        const ct = this._ws?.getCurrentTime();
        if (ct && (ct < r[0].start || r[0].end < ct)) {
          this._ws?.setTime(r[0].start);
        }
      }
      this._ws?.play();
    }
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
