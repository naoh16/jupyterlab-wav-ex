import { TabPanel, Widget } from '@lumino/widgets';

import { AudioDump } from './audiofile.js';
import { ConfigWidget } from './config_widget.js';

export class DebugWidget extends TabPanel {
  public tabConfig: ConfigWidget;
  public tabInspector: Widget;
  public tabDebug: Widget;
  private audioDump: AudioDump | undefined;

  constructor(tabConfig: ConfigWidget) {
    super({
      tabPlacement: 'bottom'
    });
    // this.node.style.backgroundColor = 'lightgray';
    // this.node.style.overflowY = 'scroll';
    this.node.style.minHeight = '48px';
    this.node.style.backgroundColor = 'lightgray';
    this.node.style.borderTop = '1px solid gray';

    this.tabConfig = tabConfig; // new ConfigWidget();
    this.tabConfig.title.iconClass = 'fa fa-cog'; // ⚙️
    // eslint-disable-next-line jupyter/no-untranslated-string
    this.tabConfig.title.label = 'Config';
    this.tabConfig.node.style.backgroundColor = this.node.style.backgroundColor;
    this.addWidget(this.tabConfig);

    this.tabInspector = new Widget();
    this.tabInspector.title.iconClass = 'fa fa-search'; // 🔍
    // eslint-disable-next-line jupyter/no-untranslated-string
    this.tabInspector.title.label = 'WAV Inspector';
    this.tabInspector.node.style.backgroundColor =
      this.node.style.backgroundColor;
    this.tabInspector.node.style.overflowY = 'scroll';
    this.addWidget(this.tabInspector);

    this.tabDebug = new Widget();
    this.tabDebug.title.iconClass = 'fa fa-bug'; // 🐞
    // eslint-disable-next-line jupyter/no-untranslated-string
    this.tabDebug.title.label = 'Debug';
    this.tabDebug.node.style.backgroundColor = this.node.style.backgroundColor;
    // this.tabDebug.node.style.whiteSpace = 'pre-wrap';
    this.tabDebug.node.style.overflowY = 'scroll';
    this.addWidget(this.tabDebug);
  }

  setContent(content: string) {
    //this.tabDebug.node.innerHTML = `<pre>${content}</pre>`;

    this.audioDump = new AudioDump(content, 256);
    this.tabConfig.setOriginalSampleRate(this.audioDump.nSamplesPerSec);

    this.tabInspector.node.innerHTML = `<b>sox-like output:</b><br>
    <table style="padding-left: 1em;">
      <tr><td>Channels:</td><td>${this.audioDump.nChannel}</td></tr>
      <tr><td>Sample Rate:</td><td>${this.audioDump.nSamplesPerSec} Hz</td></tr>
      <tr><td>Precision:</td><td>${this.audioDump.wBitsPerSample}-bit</td></tr>
      <tr><td>Duration:</td><td>${this.audioDump.soxDuration()}</td></tr>
      <tr><td>Bit rate:</td><td>${this.audioDump.soxBitRate()}</td></tr>
      <tr><td>File Size:</td><td>${this.audioDump.soxFilesize()}</td></tr>
    </table><br>
    <b>WAV Header Information:</b><br>
    <table style="padding-left: 1em;">
      <tr><td>File Size:</td><td>${this.audioDump.filesize} bytes</td></tr>
      <tr><td>Data Size:</td><td>${this.audioDump.datasize} bytes</td></tr>
      <tr><td>Format:</td><td>${this.audioDump.format} (${this.audioDump.formatAsString()})</td></tr>
      <tr><td>Channels:</td><td>${this.audioDump.nChannel}</td></tr>
      <tr><td>Sample Rate:</td><td>${this.audioDump.nSamplesPerSec} Hz</td></tr>
      <tr><td>Avg Bytes/Sec:</td><td>${this.audioDump.nAvgBytesPerSec} bytes/sec</td></tr>
      <tr><td>Block Align:</td><td>${this.audioDump.nBlockAlign} bytes</td></tr>
      <tr><td>Bits/Sample:</td><td>${this.audioDump.wBitsPerSample} bits</td></tr>
    </table>`;

    this.tabDebug.node.innerHTML = `<b>Hex Dump (first 256 bytes):</b><br>
    <pre>${this.audioDump.hexDumpHtml()}</pre>
    <b>Raw Blob Data (first 258 bytes):</b><br>
    <pre>${content.slice(0, 258)}</pre>
    `;
    //console.log('AudioDump:', this.audioDump.rawData);
  }
}
