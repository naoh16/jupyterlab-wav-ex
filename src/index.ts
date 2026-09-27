import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { BoxPanel, SplitPanel } from '@lumino/widgets';

import { WavesurferWidget } from './wavesurfer_widget.js';
import { ToolbarWidget } from './toolbar_widget.js';
import { ConfigWidget } from './config_widget.js';
import { DebugWidget } from './debug_widget.js';

/**
 * The default mime type for the extension.
 */
const MIME_TYPE = 'audio/wav';

/**
 * A widget for rendering wav data.
 */
export class RootPanel extends BoxPanel implements IRenderMime.IRenderer {
  private _toolbar: ToolbarWidget;
  private _content: SplitPanel;
  private _widgetWaveSurfer: WavesurferWidget;
  private _widgetDebug: DebugWidget;
  private _widgetConfig: ConfigWidget;

  /**
   * Construct a new output widget.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super({ direction: 'top-to-bottom', spacing: 0 });
    this._mimeType = options.mimeType;
    // this.addClass(CLASS_ROOTPANEL);

    this._toolbar = new ToolbarWidget();
    // this._toolbar.addClass(CLASS_TOOLBAR);
    BoxPanel.setSizeBasis(this._toolbar, 32);
    BoxPanel.setStretch(this._toolbar, 0);

    this._widgetConfig = new ConfigWidget();

    this._widgetWaveSurfer = new WavesurferWidget(
      this._toolbar,
      this._widgetConfig
    );
    this._widgetDebug = new DebugWidget(this._widgetConfig);

    this._content = new SplitPanel({ orientation: 'vertical' });
    // this._content.addClass(CLASS_CONTENT);
    this._content.addWidget(this._widgetWaveSurfer);
    // this._content.addWidget(this._widgetSpectrogram);
    this._content.addWidget(this._widgetDebug);
    this._content.setRelativeSizes([4, 1]);

    this.addWidget(this._toolbar);
    this.addWidget(this._content);
    BoxPanel.setStretch(this._content, 1);
  }

  /**
   * Render wav data into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    const data = model.data[this._mimeType] as string;
    // console.log('data', data);

    this._widgetDebug.setContent(data.slice(0, 16384));
    this._widgetWaveSurfer.load(`data:${MIME_TYPE};base64,${data}`);

    return Promise.resolve();
  }

  private _mimeType: string;
}

/**
 * A mime renderer factory for  data.
 */
export const rendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: [MIME_TYPE],
  createRenderer: options => new RootPanel(options)
};

/**
 * Extension definition.
 */
const extension: IRenderMime.IExtension = {
  id: 'jupyterlab-wav-ex:plugin',
  // description: 'Adds MIME type renderer for  content',
  rendererFactory,
  rank: 100,
  dataType: 'string',
  fileTypes: [
    {
      name: 'wav',
      fileFormat: 'base64',
      mimeTypes: [MIME_TYPE],
      extensions: ['.wav']
    }
  ],
  documentWidgetFactoryOptions: {
    name: 'Audio Viewer (jupyterlab-wav-ex)',
    primaryFileType: 'wav',
    modelName: 'base64',
    fileTypes: ['wav'],
    defaultFor: ['wav']
  }
};

export default extension;
