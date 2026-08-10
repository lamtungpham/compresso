import { h, Component } from 'preact';

import { linkRef } from 'shared/prerendered-app/util';
import logoWithText from 'data-url-text:./imgs/logo-with-text.svg';
import * as style from './style.css';
import type SnackBarElement from 'shared/custom-els/snack-bar';
import { t, getLang, setLang, Lang } from 'shared/i18n';

const supportsClipboardAPI =
  !__PRERENDER__ && navigator.clipboard && navigator.clipboard.read;

async function getImageClipboardItem(
  items: ClipboardItem[],
): Promise<undefined | Blob> {
  for (const item of items) {
    const type = item.types.find((type) => type.startsWith('image/'));
    if (type) return item.getType(type);
  }
}

interface Props {
  onFile?: (files: File[]) => void;
  showSnack?: SnackBarElement['showSnackbar'];
}
interface State {
  lang: Lang;
}

export default class Intro extends Component<Props, State> {
  state: State = { lang: getLang() };
  private fileInput?: HTMLInputElement;

  componentDidMount() {
    // Re-render when the language changes.
    window.addEventListener('langchange', this.onLangChange);
    // Pick up the persisted/browser language now that we're on the client.
    if (getLang() !== this.state.lang) this.setState({ lang: getLang() });
  }

  componentWillUnmount() {
    window.removeEventListener('langchange', this.onLangChange);
  }

  private onLangChange = () => {
    this.setState({ lang: getLang() });
  };

  private onSelectLang = (lang: Lang) => {
    setLang(lang);
  };

  private onFileChange = (event: Event): void => {
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;
    if (!files?.length) return;
    this.props.onFile!([...files]);
    this.fileInput!.value = '';
  };

  private onOpenClick = () => {
    this.fileInput!.click();
  };

  private onPasteClick = async () => {
    let clipboardItems: ClipboardItem[];

    try {
      clipboardItems = await navigator.clipboard.read();
    } catch (err) {
      this.props.showSnack!(`No permission to access clipboard`);
      return;
    }

    const blob = await getImageClipboardItem(clipboardItems);

    if (!blob) {
      this.props.showSnack!(`No image found in the clipboard`);
      return;
    }

    this.props.onFile!([new File([blob], 'image.unknown')]);
  };

  render({}: Props, { lang }: State) {
    return (
      <div class={style.intro}>
        <input
          class={style.hide}
          multiple
          ref={linkRef(this, 'fileInput')}
          type="file"
          onChange={this.onFileChange}
        />

        <header class={style.topBar}>
          <img
            class={style.brand}
            src={logoWithText}
            alt="Compresso"
            width="420"
            height="84"
          />
          <nav class={style.topNav}>
            <div
              class={style.langSwitch}
              role="group"
              aria-label={t('lang.label')}
            >
              <button
                class={lang === 'en' ? style.langActive : style.langOption}
                aria-pressed={lang === 'en'}
                onClick={() => this.onSelectLang('en')}
              >
                EN
              </button>
              <button
                class={lang === 'vi' ? style.langActive : style.langOption}
                aria-pressed={lang === 'vi'}
                onClick={() => this.onSelectLang('vi')}
              >
                VI
              </button>
            </div>
          </nav>
        </header>

        <main class={style.hero}>
          <div class={style.dropCard} onClick={this.onOpenClick}>
            <div class={style.dropIcon}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 15V4m0 0l-4 4m4-4l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M5 15v3a2 2 0 002 2h10a2 2 0 002-2v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <h1 class={style.heroTitle}>{t('hero.title')}</h1>
            <p class={style.heroSub}>{t('hero.sub')}</p>
            <div class={style.heroActions}>
              <button
                class={style.primaryBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  this.onOpenClick();
                }}
              >
                {t('hero.choose')}
              </button>
              {supportsClipboardAPI && (
                <button
                  class={style.ghostBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.onPasteClick();
                  }}
                >
                  {t('hero.paste')}
                </button>
              )}
            </div>
            <p class={style.heroHint}>{t('hero.hint')}</p>
          </div>
        </main>

        <section class={style.features}>
          <div class={style.feature}>
            <svg class={style.featureIcon} viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <h2 class={style.featureTitle}>{t('feat.bulk.title')}</h2>
            <p class={style.featureText}>{t('feat.bulk.text')}</p>
          </div>
          <div class={style.feature}>
            <svg class={style.featureIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 20L20 4M20 4h-6M20 4v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <h2 class={style.featureTitle}>{t('feat.smaller.title')}</h2>
            <p class={style.featureText}>{t('feat.smaller.text')}</p>
          </div>
          <div class={style.feature}>
            <svg class={style.featureIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
              <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <h2 class={style.featureTitle}>{t('feat.private.title')}</h2>
            <p class={style.featureText}>{t('feat.private.text')}</p>
          </div>
        </section>

        <footer class={style.footer}>
          <p class={style.footerTagline}>{t('footer.tagline')}</p>
        </footer>
      </div>
    );
  }
}
