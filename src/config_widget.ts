import { Widget } from '@lumino/widgets';

import colormap from 'colormap';

import { WavesurferWidget } from './wavesurfer_widget.js';

const _configHtml = `<div>
  <div><label>
    Sample Rate (Conversion):
    <select id="wsSampleRate" style="text-align-last: right;">
      <option value="8000"  style="text-align: right;">8,000 Hz</option>
      <option value="11025" style="text-align: right;">11,025 Hz</option>
      <option value="16000" style="text-align: right;" selected>16,000 Hz</option>
      <option value="22050" style="text-align: right;">22,050 Hz</option>
      <option value="32000" style="text-align: right;">32,000 Hz</option>
      <option value="44100" style="text-align: right;">44,100 Hz</option>
      <option value="48000" style="text-align: right;">48,000 Hz</option>
    </select>
  </label>
  <span>(Original: <span id="wsOriginalSampleRate">-</span> Hz)</span>
  </div>
  <div><label>
    Max Frequency:
    <select id="wsMaxFreq">
      <option value="-1">Not specified</option>
      <hr>
      <option value="1000">&le; 1000 Hz</option>
      <option value="2000">&le; 2000 Hz</option>
      <option value="5000" selected>&le; 5000 Hz</option>
      <option value="10000">&le; 10000 Hz</option>
      <option value="12000">&le; 12000 Hz</option>
    </select>
  </label>
  <label>
    FFT Size:
    <select id="wsFftSize">
      <option value="256" selected>256 point</option>
      <option value="512">512 point</option>
      <option value="1024">1024 point</option>
      <option value="2048">2048 point</option>
      <option value="4096">4096 point</option>
    </select>
  </label>
  <label>
    Overlap:
    <select id="wsOverlapRate">
      <option value="0.0">0%</option>
      <option value="0.10">10%</option>
      <option value="0.25">25%</option>
      <option value="0.50" selected>50% (Half-overlap)</option>
      <option value="0.75">75%</option>
      <option value="0.90">90%</option>
    </select>
  </label>
  <label>
    Window Function:
    <select id="wsWindowFunction">
      <option value="rectangular">No Window (Rectangular)</option>
      <hr>
      <option value="hamming" selected>Hamming</option>
      <option value="hann">Hann</option>
      <option value="blackman">Blackman</option>
      <option value="cosine">Cosine</option>
      <option value="triangular">Triangular</option>
      <option value="bartlett">Bartlett</option>
      <option value="bartlettHann">Bartlett Hann</option>
      <option value="gauss">Gaussian</option>
      <option value="lancoz">Lancoz</option>
    </select>
  </label></div>
  <div><label>
    Scale:
    <select id="wsFrequencyScale">
      <option value="linear" selected>Linear</option>
      <option value="logarithmic">Logarithmic</option>
      <option value="mel">Mel</option>
      <option value="bark">Bark</option>
      <option value="erb">ERB</option>
    </select>
  </label>
  <label>
    Colormap:
    <select id="wsColormap">
      <optgroup label="Wavesurfer.js Built-in">
        <option value="gray">Gray</option>
        <option value="igray">Inversed Gray</option>
        <option value="roseus">Roseus</option>
      </optgroup>
      <optgroup label="Custom Colormaps (from Matplotlib)">
        <option value="viridis" selected>Viridis</option>
        <option value="inferno">Inferno</option>
        <option value="magma">Magma</option>
        <option value="plasma">Plasma</option>
        <option value="jet">Jet (not recommended)</option>
      </optgroup>
    </select>
  </label></div>
</div>`;

export class ConfigWidget extends Widget {
  public sampleRate: number = 16000;
  public originalSampleRate: number = 0;
  public maxFrequency: number | undefined = 5000;
  public frequencyScale: string = 'linear';
  public fftSize: number = 256;
  public windowFunction: string = 'hamming';
  public noverlap: number = Math.floor(this.fftSize * 0.5);
  public colormap: string | number[][] = this._convertColormap('viridis');

  constructor() {
    super();
    this.node.style.backgroundColor = 'lightgray';
    this.node.style.minHeight = '32px';
    this.node.innerHTML = _configHtml;
  }

  private _convertColormap(selectedColormap: string) {
    return colormap({
      colormap: selectedColormap,
      nshades: 256,
      format: 'float'
    });
  }

  public setOriginalSampleRate(sampleRate: number) {
    // Before updating the originalSampleRate,
    // we need to parse WAV information on DebugWidget.
    console.log(`ConfigWidget: setOriginalSampleRate(${sampleRate})`);
    this.originalSampleRate = sampleRate;
    const originalSampleRateSpan = this.node.querySelector(
      '#wsOriginalSampleRate'
    ) as HTMLSpanElement | null;
    originalSampleRateSpan!.textContent = this.originalSampleRate.toString();
  }

  registerHandlers(wsWidget: WavesurferWidget) {
    const sampleRateSelect = this.node.querySelector(
      '#wsSampleRate'
    ) as HTMLSelectElement | null;
    sampleRateSelect?.addEventListener('change', () => {
      this.sampleRate = parseInt(sampleRateSelect.value, 10);
      wsWidget.rebuildForSpectrogramSettings();
    });
    const maxFreqSelect = this.node.querySelector(
      '#wsMaxFreq'
    ) as HTMLSelectElement | null;
    maxFreqSelect?.addEventListener('change', () => {
      const selectedValue = parseInt(maxFreqSelect.value, 10);
      this.maxFrequency = selectedValue === -1 ? undefined : selectedValue;
      wsWidget.rebuildForSpectrogramSettings();
    });
    const fftSizeSelect = this.node.querySelector(
      '#wsFftSize'
    ) as HTMLSelectElement | null;
    fftSizeSelect?.addEventListener('change', () => {
      this.fftSize = parseInt(fftSizeSelect.value, 10);
      this.noverlap = Math.floor(this.fftSize * 0.5);
      wsWidget.rebuildForSpectrogramSettings();
    });
    const freqScaleSelect = this.node.querySelector(
      '#wsFrequencyScale'
    ) as HTMLSelectElement | null;
    freqScaleSelect?.addEventListener('change', () => {
      this.frequencyScale = freqScaleSelect.value;
      wsWidget.rebuildForSpectrogramSettings();
    });
    const windowFunctionSelect = this.node.querySelector(
      '#wsWindowFunction'
    ) as HTMLSelectElement | null;
    windowFunctionSelect?.addEventListener('change', () => {
      this.windowFunction = windowFunctionSelect.value;
      wsWidget.rebuildForSpectrogramSettings();
    });
    const overlapRateSelect = this.node.querySelector(
      '#wsOverlapRate'
    ) as HTMLSelectElement | null;
    overlapRateSelect?.addEventListener('change', () => {
      this.noverlap = Math.floor(this.fftSize * 0.5);
      wsWidget.rebuildForSpectrogramSettings();
    });
    const colormapSelect = this.node.querySelector(
      '#wsColormap'
    ) as HTMLSelectElement | null;
    colormapSelect?.addEventListener('change', () => {
      const selectedColormap = colormapSelect.value;
      if (
        selectedColormap === 'gray' ||
        selectedColormap === 'igray' ||
        selectedColormap === 'roseus'
      ) {
        // Use built-in colormaps
        this.colormap = selectedColormap;
      } else {
        this.colormap = this._convertColormap(selectedColormap);
      }
      wsWidget.rebuildForSpectrogramSettings();
    });
  }
}
