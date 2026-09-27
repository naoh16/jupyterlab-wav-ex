export class AudioDump {
  readonly rawData: string | undefined;
  readonly filesize: number = -1;
  readonly datasize: number = -1;
  readonly format: number = -1;
  readonly nChannel: number = -1;
  readonly nSamplesPerSec: number = -1;
  readonly nAvgBytesPerSec: number = -1;
  readonly nBlockAlign: number = -1;
  readonly wBitsPerSample: number = -1;

  constructor(base64Text: string, limitSize: number = 128) {
    const rawData = atob(base64Text).slice(0, limitSize);
    this.rawData = rawData;

    if ('RIFF' !== rawData.slice(0, 4)) {
      return;
    }

    this.filesize = getUint32LE(rawData, 4) + 8;

    if (rawData.slice(8, 12) !== 'WAVE') {
      return;
    }

    // Process the WAVE data
    let offset = 12;
    while (offset < 128) {
      if (rawData.slice(offset, offset + 4) === 'fmt ') {
        const chunk_size = getUint32LE(rawData, offset + 4);
        offset += 8;
        this.format = getInt16LE(rawData, offset + 0);
        this.nChannel = getInt16LE(rawData, offset + 2);
        this.nSamplesPerSec = getUint32LE(rawData, offset + 4);
        this.nAvgBytesPerSec = getUint32LE(rawData, offset + 8);
        this.nBlockAlign = getInt16LE(rawData, offset + 12);
        this.wBitsPerSample = getInt16LE(rawData, offset + 14);
        //cbSize          =  getInt16LE(rawData, offset+16); // not used.
        offset += chunk_size;
        continue;
      }
      if (rawData.slice(offset, offset + 4) === 'data') {
        this.datasize = getUint32LE(rawData, offset + 4);
        offset += this.datasize + 8;
        continue;
      }
    }
  }

  length_second(): number {
    return this.datasize / this.nAvgBytesPerSec;
  }
  length_sample(): number {
    return this.datasize / this.nBlockAlign;
  }
  soxDuration(): string {
    let val: number = this.length_second();
    const hour = Math.floor(val / 3600);
    val = val - hour * 3600;
    const min = Math.floor(val / 60);
    val = val - min * 60;
    const sec = val;

    const hour_str = hour.toString().padStart(2, '0');
    const min_str = min.toString().padStart(2, '0');
    const sec_str = sec.toFixed(2).padStart(5, '0');

    const cdda_sectors = this.length_second() * 75.0;

    return (
      `${hour_str}:${min_str}:${sec_str} sec` +
      ` = ${this.length_sample()} samples` +
      ` ~ (${cdda_sectors.toFixed(1)} CDDA sectors)`
    );
  }
  soxBitRate(): string {
    return (
      ((this.wBitsPerSample * this.nSamplesPerSec) / 1000.0).toFixed(0) + 'k'
    );
  }
  soxFilesize(): string {
    return (this.filesize / 1000.0).toFixed(0) + 'k';
  }

  hexDumpHtml(): string {
    if (!this.rawData) {
      return '';
    }
    return '<code>' + getDumpText(this.rawData, 8) + '</code>';
  }

  formatAsString(): string {
    if (this.format === 1) return 'WAVE_FORMAT_PCM';
    if (this.format === 3) return 'WAVE_FORMAT_IEEE_FLOAT';
    return 'Unknown';
  }
}

export function getUint32LE(raw: string, offset: number) {
  const dv = new DataView(new ArrayBuffer(4));
  dv.setUint8(0, raw.charCodeAt(offset + 0));
  dv.setUint8(1, raw.charCodeAt(offset + 1));
  dv.setUint8(2, raw.charCodeAt(offset + 2));
  dv.setUint8(3, raw.charCodeAt(offset + 3));
  return dv.getUint32(0, true); // Little endian
}

export function getInt32LE(raw: string, offset: number) {
  const dv = new DataView(new ArrayBuffer(4));
  dv.setUint8(0, raw.charCodeAt(offset + 0));
  dv.setUint8(1, raw.charCodeAt(offset + 1));
  dv.setUint8(2, raw.charCodeAt(offset + 2));
  dv.setUint8(3, raw.charCodeAt(offset + 3));
  return dv.getInt32(0, true); // Little endian
}

export function getInt16LE(raw: string, offset: number) {
  const dv = new DataView(new ArrayBuffer(2));
  dv.setUint8(0, raw.charCodeAt(offset + 0));
  dv.setUint8(1, raw.charCodeAt(offset + 1));
  return dv.getInt16(0, true); // Little endian
}

export function getDumpText(raw: string, maxcol: number) {
  let dump_text = '';

  dump_text += '       |  0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F';
  dump_text += '  | ASCII TEXT\n';
  dump_text += '-------+------------------------------------------------';
  dump_text += '--+-----------------\n';
  for (let i = 0; i < maxcol; i++) {
    const target = raw.slice(i * 16, (i + 1) * 16);
    let hex_text: string = '';
    let chr_text: string = '';
    for (const v of target) {
      const val = v.charCodeAt(0);
      const hex2digit = ('0' + val.toString(16)).substring(0, 2);
      hex_text += hex2digit + ' ';
      chr_text += val < 0x20 || 0x7e < val ? '.' : v;
    }
    // console.log(hex_text + " | " + chr_text);
    dump_text += '0x' + ('0' + i.toString(16)).substring(0, 2) + '__';
    dump_text += ' | ' + hex_text + ' | ' + chr_text + '\n';
  }
  return dump_text;
}
