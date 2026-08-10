import { Component, Fragment, h } from 'preact';
import { DownloadIcon, EditIcon } from 'client/lazy-app/icons';
import PQueue from 'p-queue';
import { t } from 'shared/i18n';
import 'shared/custom-els/loading-spinner';
import * as style from './style.css';
import 'add-css:./style.css';
import {
  encoderMap,
  EncoderState,
  ProcessorState,
  EncoderOptions,
} from 'client/lazy-app/feature-meta';
import {
  compressImage,
  decodeImage,
  processImage,
  processSvg,
} from '../pipeline';
import { drawableToImageData } from 'client/lazy-app/util/canvas';
import { cleanSet } from 'client/lazy-app/util/clean-modify';
import WorkerBridge from 'client/lazy-app/worker-bridge';
import { SourceImage, OutputType } from '..';
import { onDownloadAll } from '../jszip';
import Options from '../Options';
import prettyBytes from '../Results/pretty-bytes';

interface BulkSettings {
  processorState: ProcessorState;
  encoderState?: EncoderState;
}

interface Task {
  file: File;
  status: 'pending' | 'finished' | 'error';
  response?: File;
  previewURL: string;
}
interface Props {
  files: File[];
  onBack: () => void;
  settings: BulkSettings;
}

interface State {
  tasks: Task[];
  settings: BulkSettings;
  showSettings: boolean;
}

const DEFAULT_SETTINGS: BulkSettings = {
  processorState: {
    quantize: { enabled: false, zx: 0, maxNumColors: 256, dither: 1 },
    resize: {
      enabled: false,
      width: 1,
      height: 1,
      scale: 100,
      method: 'lanczos3',
      fitMethod: 'stretch',
      premultiply: true,
      linearRGB: true,
    },
  },
  encoderState: {
    type: 'mozJPEG',
    options: encoderMap.mozJPEG.meta.defaultOptions,
  },
};

function sizeSaved(orig: number, comp: number): number {
  if (!orig) return 0;
  return Math.round((1 - comp / orig) * 100);
}

export default class Table extends Component<Props, State> {
  state: State = {
    tasks: [],
    settings: this.props.settings || DEFAULT_SETTINGS,
    showSettings: false,
  };
  private readonly workerBridge = new WorkerBridge();
  private queue = new PQueue({
    concurrency: navigator.hardwareConcurrency - 2 || 1,
  });
  // Bumped on every (re)compress so stale results from an earlier settings
  // pass are ignored when they resolve.
  private generation = 0;
  private recomputeTimer?: ReturnType<typeof setTimeout>;

  componentDidMount() {
    this.compressAll();
    window.addEventListener('langchange', this.onLangChange);
  }

  componentWillUnmount() {
    window.removeEventListener('langchange', this.onLangChange);
    this.state.tasks.forEach((task) => URL.revokeObjectURL(task.previewURL));
    if (this.recomputeTimer) clearTimeout(this.recomputeTimer);
  }

  private onLangChange = () => this.forceUpdate();

  /** (Re)compress every file with the current settings. */
  private compressAll() {
    const gen = ++this.generation;
    this.queue.clear();

    this.setState((prev) => {
      const tasks: Task[] = this.props.files.map((file, i) => {
        const old = prev.tasks[i];
        if (old?.previewURL) URL.revokeObjectURL(old.previewURL);
        return {
          file,
          status: 'pending',
          previewURL: URL.createObjectURL(file),
        };
      });
      return { tasks };
    });

    this.props.files.forEach((file, index) => {
      this.queue.add(() =>
        this.compressImage(file)
          .then((compressed) => {
            if (gen !== this.generation) return;
            this.setState((prev) => {
              const tasks = [...prev.tasks];
              const current = tasks[index];
              if (current?.previewURL) URL.revokeObjectURL(current.previewURL);
              tasks[index] = {
                status: 'finished',
                response: compressed,
                file,
                previewURL: URL.createObjectURL(compressed),
              };
              return { tasks };
            });
          })
          .catch(() => {
            if (gen !== this.generation) return;
            this.setState((prev) => {
              const tasks = [...prev.tasks];
              tasks[index] = { ...tasks[index], status: 'error' };
              return { tasks };
            });
          }),
      );
    });
  }

  private scheduleRecompress() {
    if (this.recomputeTimer) clearTimeout(this.recomputeTimer);
    this.recomputeTimer = setTimeout(() => this.compressAll(), 400);
  }

  private edit(url: string, name: string, type: string) {
    window.open(
      `${location.origin}?url=${encodeURIComponent(
        url,
      )}&name=${encodeURIComponent(name)}&${encodeURIComponent(type)}`,
      '_blank',
    );
  }

  private async compressImage(file: File) {
    const mainAbortController = new AbortController();
    const mainSignal = mainAbortController.signal;
    let decoded: ImageData;
    let vectorImage: HTMLImageElement | undefined;
    if (file.type.startsWith('image/svg+xml')) {
      vectorImage = await processSvg(mainSignal, file);
      decoded = drawableToImageData(vectorImage);
    } else {
      decoded = await decodeImage(mainSignal, file, this.workerBridge);
    }

    const source: SourceImage = {
      decoded,
      vectorImage,
      preprocessed: decoded,
      file,
    };

    // Work on a copy so we never mutate the settings held in state.
    const { processorState } = this.state.settings;
    const resize = processorState.resize;
    const effectiveProcessorState: ProcessorState =
      resize.enabled && resize.scale
        ? cleanSet(processorState, 'resize', {
            ...resize,
            width: Math.floor((decoded.width * resize.scale) / 100),
            height: Math.floor((decoded.height * resize.scale) / 100),
          })
        : processorState;

    const processed = await processImage(
      mainSignal,
      source,
      effectiveProcessorState,
      this.workerBridge,
    );
    const compressedFile = await compressImage(
      mainSignal,
      processed,
      this.state.settings.encoderState || {
        type: 'mozJPEG',
        options: encoderMap.mozJPEG.meta.defaultOptions,
      },
      source.file.name,
      this.workerBridge,
    );
    return compressedFile;
  }

  private downloadAll() {
    const files = this.state.tasks
      .map((task) => task.response)
      .filter((file): file is File => !!file);
    onDownloadAll(files);
  }

  private onDownload = () => {
    ga('send', 'event', 'compression', 'download');
  };

  // --- Settings panel wiring (mirrors the bulk config on the intro) ---------

  private persistSettings() {
    try {
      localStorage.setItem('bulkSettings', JSON.stringify(this.state.settings));
      window.dispatchEvent(new CustomEvent('bulkSettings'));
    } catch {}
  }

  private updateSettings(settings: BulkSettings) {
    this.setState({ settings }, () => this.scheduleRecompress());
  }

  private onEncoderTypeChange = (_index: 0 | 1, newType: OutputType) => {
    this.updateSettings(
      cleanSet(
        this.state.settings,
        'encoderState',
        newType === 'identity'
          ? undefined
          : { type: newType, options: encoderMap[newType].meta.defaultOptions },
      ),
    );
  };

  private onEncoderOptionsChange = (_index: 0 | 1, options: EncoderOptions) => {
    this.updateSettings(
      cleanSet(this.state.settings, 'encoderState.options', options),
    );
  };

  private onProcessorOptionsChange = (
    _index: 0 | 1,
    options: ProcessorState,
  ) => {
    this.updateSettings(cleanSet(this.state.settings, 'processorState', options));
  };

  private onScaleChange = (value: number) => {
    this.updateSettings(
      cleanSet(this.state.settings, 'processorState.resize.scale', value),
    );
  };

  private onSaveBulkSettings = () => {
    this.persistSettings();
  };

  private onResetBulkSettings = () => {
    this.updateSettings(DEFAULT_SETTINGS);
  };

  render(
    { onBack }: Props,
    { tasks, settings, showSettings }: State,
  ) {
    const finishedTasks = tasks.filter((t) => t.status === 'finished');
    const doneCount = finishedTasks.length;
    const total = tasks.length;
    const finishedAll = total > 0 && doneCount === total;

    const totalOrig = tasks.reduce((sum, t) => sum + t.file.size, 0);
    const totalComp = finishedTasks.reduce(
      (sum, t) => sum + (t.response?.size || 0),
      0,
    );
    // Only compare like-for-like: original size of the images already done.
    const doneOrig = finishedTasks.reduce((sum, t) => sum + t.file.size, 0);
    const savedPct = sizeSaved(doneOrig, totalComp);
    const prettyOrig = prettyBytes(totalOrig);
    const prettyComp = prettyBytes(totalComp);

    return (
      <Fragment>
        <button class={style.back} onClick={onBack} title={t('tip.back')}>
          <svg viewBox="0 0 24 24">
            <title>{t('tip.back')}</title>
            <path
              fill="currentColor"
              d="M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"
            />
          </svg>
        </button>

        <div class={style.workspace}>
          <div class={style.grid}>
            {tasks.length === 0 ? (
              <div class={style.empty}>{t('bulk.empty')}</div>
            ) : (
              tasks.map((task) => {
                const orig = task.file.size;
                const comp = task.response?.size || 0;
                const pct = sizeSaved(orig, comp);
                return (
                  <div class={style.card}>
                    <div class={style.thumbWrap}>
                      <img class={style.previewImg} src={task.previewURL} />
                      {task.status === 'pending' && (
                        <div class={style.pending}>
                          <loading-spinner />
                        </div>
                      )}
                      {task.status === 'finished' && task.response && (
                        <div class={style.cardActions}>
                          <button
                            class={style.iconBtn}
                            title={t('bulk.edit')}
                            onClick={() =>
                              this.edit(
                                task.previewURL,
                                task.response!.name,
                                task.response!.type,
                              )
                            }
                          >
                            <EditIcon />
                          </button>
                          <a
                            class={style.iconBtn}
                            href={task.previewURL}
                            download={task.response.name}
                            title={t('opt.download')}
                            onClick={this.onDownload}
                          >
                            <DownloadIcon />
                          </a>
                        </div>
                      )}
                    </div>
                    <div class={style.meta}>
                      <div class={style.fileName} title={task.file.name}>
                        {task.file.name}
                      </div>
                      {task.status === 'finished' ? (
                        <div class={style.sizeRow}>
                          <span class={style.sizeOrig}>
                            {prettyBytes(orig).value}
                            {prettyBytes(orig).unit}
                          </span>
                          <span class={style.arrow}>→</span>
                          <span class={style.sizeComp}>
                            {prettyBytes(comp).value}
                            {prettyBytes(comp).unit}
                          </span>
                          <span
                            class={
                              pct >= 0 ? style.badgeSaved : style.badgeGrown
                            }
                          >
                            {pct >= 0 ? '−' : '+'}
                            {Math.abs(pct)}%
                          </span>
                        </div>
                      ) : task.status === 'error' ? (
                        <div class={style.sizeRowMuted}>{t('bulk.error')}</div>
                      ) : (
                        <div class={style.sizeRowMuted}>
                          {t('bulk.compressing')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div class={style.summaryBar}>
          <button
            class={style.settingsToggle}
            onClick={() => this.setState({ showSettings: !showSettings })}
          >
            <svg viewBox="0 0 1024 1024" width="20" height="20">
              <path
                fill="currentColor"
                d="M512 662c82 0 150-68 150-150s-68-150-150-150-150 68-150 150 68 150 150 150zM830 554l90 70c8 6 10 18 4 28l-86 148c-6 10-16 12-26 8l-106-42c-22 16-46 32-72 42l-16 112c-2 10-10 18-20 18l-172 0c-10 0-18-8-20-18l-16-112c-26-10-50-24-72-42l-106 42c-10 4-20 2-26-8l-86-148c-6-10-4-22 4-28l90-70c-2-14-2-28-2-42s0-28 2-42l-90-70c-8-6-10-18-4-28l86-148c6-10 16-12 26-8l106 42c22-16 46-32 72-42l16-112c2-10 10-18 20-18l172 0c10 0 18 8 20 18l16 112c26 10 50 24 72 42l106-42c10-4 20-2 26 8l86 148c6 10 4 22-4 28l-90 70c2 14 2 28 2 42s0 28-2 42z"
              />
            </svg>
            {t('bulk.settings')}
          </button>

          <div class={style.summaryStats}>
            <span class={style.summaryDone}>
              {t('bulk.done')} {doneCount}/{total}
            </span>
            {doneCount > 0 && (
              <span class={style.summarySize}>
                {prettyOrig.value}
                {prettyOrig.unit} → {prettyComp.value}
                {prettyComp.unit}
                <span class={style.summaryBadge}>
                  −{savedPct}% {t('bulk.saved')}
                </span>
              </span>
            )}
          </div>

          <button
            class={style.downloadAllBtn}
            disabled={!finishedAll}
            onClick={() => this.downloadAll()}
          >
            {!finishedAll && total > 0 ? (
              <loading-spinner />
            ) : (
              <DownloadIcon />
            )}
            {t('bulk.downloadAll')}
          </button>
        </div>

        {showSettings && (
          <div class={style.settingsPanel}>
            <div class={style.settingsHead}>
              <span>{t('bulk.settings')}</span>
              <button
                class={style.settingsClose}
                onClick={() => this.setState({ showSettings: false })}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="currentColor"
                    d="M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"
                  />
                </svg>
              </button>
            </div>
            <div class={style.settingsBody}>
              <Options
                index={0}
                onlyConfig
                mobileView={false}
                processorState={settings.processorState}
                encoderState={settings.encoderState}
                onEncoderTypeChange={this.onEncoderTypeChange}
                onEncoderOptionsChange={this.onEncoderOptionsChange}
                onProcessorOptionsChange={this.onProcessorOptionsChange}
                onCopyToOtherSideClick={() => {}}
                onSaveSideSettingsClick={this.onSaveBulkSettings}
                onImportSideSettingsClick={() => {}}
                onScaleChange={this.onScaleChange}
                onResetBulkSettings={this.onResetBulkSettings}
              />
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}
