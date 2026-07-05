// ==UserScript==
// @name         Google Translate Dark Mode
// @name:zh-CN   谷歌翻译暗色主题
// @namespace    https://translate.google.com/
// @description  Add a dark theme and a theme toggle button to Google Translate.
// @description:zh-CN   给 Google 翻译添加暗色主题和主题切换按钮
// @copyright    2026, XUMUMI (https://xumumi.com)
// @icon         https://raw.githubusercontent.com/XUMUMI/google-translate-dark-mode/refs/heads/main/icons/google-translate-black-logo.svg
// @version      2.0.0.2-2026-05-27
// @author       XUMUMI
// @license      GPL-3.0
// @match        https://translate.google.com/*
// @include      https://translate.google.com.*/*
// @match        https://ogs.google.com/*
// @match        https://ogs.google.com.hk/*
// @include      https://ogs.google.com.*/*
// @match        https://accounts.google.com/*
// @include      https://accounts.google.com.*/*
// @include      about:blank
// @run-at       document-start
// @grant        none
// @supportURL   https://github.com/XUMUMI/google-translate-dark-mode/issues
// @downloadURL https://update.greasyfork.org/scripts/585631/Google%20Translate%20Theme%20Toggle.user.js
// @updateURL https://update.greasyfork.org/scripts/585631/Google%20Translate%20Theme%20Toggle.meta.js
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY = "gt-theme-mode";
  const BUTTON_ID = "gt-theme-toggle";
  const STYLE_ID = "gt-theme-toggle-style";
  const OGS_WIDGET_STYLE_ID = "gt-theme-ogs-widget-style";
  const THEME_ATTRIBUTE = "data-gt-theme";
  const THEME_SWITCHING_CLASS = "gt-theme-switching";
  const ACCOUNT_WIDGET_CLASS = "gt-theme-account-widget";
  const OGS_ACCOUNT_VIEW_CLASS = "gt-theme-ogs-account-view";
  const OGS_PANEL_ATTRIBUTE = "data-gt-theme-ogs-panel";
  const OGS_ACCOUNT_ROOT_ATTRIBUTE = "data-gt-theme-account-root";
  const OGS_ACCOUNT_SHELL_ATTRIBUTE = "data-gt-theme-account-shell";
  const OGS_ACCOUNT_FRAME_SHELL_ATTRIBUTE = "data-gt-theme-account-frame-shell";
  const OGS_ACCOUNT_SURFACE_ATTRIBUTE = "data-gt-theme-account-surface";
  const OGS_ACCOUNT_ACTION_ATTRIBUTE = "data-gt-theme-account-action";
  const OGS_DARK_SURFACE_ATTRIBUTE = "data-gt-theme-og-dark-surface";
  const MODES = ["light", "dark", "auto"];
  const INPUT_TOOLS_MENU_SELECTOR = ".ita-kd-dropdown-menu";
  const INPUT_TOOLS_STATUSBAR_SELECTOR = ".ita-kd-statusbar, .ita-kd-inputtools-div.ita-kd-statusbar";
  const INPUT_TOOLS_MENU_INLINE_PROPERTIES = ["background", "background-color", "border", "border-radius", "box-shadow", "color", "color-scheme"];
  const INPUT_TOOLS_MENU_TEXT_INLINE_PROPERTIES = ["color", "filter", "opacity"];
  const THEME_MESSAGE_TYPE = "gt-theme-toggle:theme";
  const THEME_REQUEST_MESSAGE_TYPE = "gt-theme-toggle:request-theme";
  const GOOGLE_COUNTRY_HOST_SUFFIX_RE = /^[a-z]{2}(?:\.[a-z]{2})?$/i;
  const THEME_BROADCAST_DELAYS = [100, 300, 700, 1200, 2000, 3500];
  const OGS_FRAME_SELECTOR =
    'iframe[src^="https://ogs.google.com/"], iframe[src^="https://ogs.google.com.hk/"], iframe[src*="//ogs.google."], iframe[src^="https://accounts.google.com/"], iframe[name="account"]';
  const OGS_APP_VIEW_SELECTOR = '[data-ogmv][role="complementary"]';
  const OGS_ACCOUNT_ROOT_SELECTOR = 'main[role="main"], [role="main"], [role="dialog"], [aria-modal="true"]';
  const HANDWRITING_CURSOR_SELECTOR = ".ita-hwt-canvas, .ita-hwt-ime canvas, .ita-hwt-canvas canvas, canvas.ita-hwt-canvas";
  const HANDWRITING_CURSOR_PATCHED_ATTRIBUTE = "data-gt-theme-hwt-cursor-patched";
  const HANDWRITING_CURSOR_INLINE_ATTRIBUTE = "data-gt-theme-hwt-inline-cursor";
  const HANDWRITING_CURSOR_PRIORITY_ATTRIBUTE = "data-gt-theme-hwt-inline-cursor-priority";
  const ACTION_BUTTON_SELECTOR = 'button, a, [role="button"]';
  const ACTION_PATCHED_ATTRIBUTE = "data-gt-theme-action-patched";
  const ACTION_STATE_LAYER_ATTRIBUTE = "data-gt-theme-action-state-layer";
  const ACTION_SCOPE_ATTRIBUTE = "data-gt-theme-action-scope";
  const DOCUMENT_FILE_CARD_ATTRIBUTE = "data-gt-theme-document-file-card";
  const DETAILS_EMPTY_STATE_ATTRIBUTE = "data-gt-theme-details-empty-state";
  const DETAILS_EMPTY_ART_ATTRIBUTE = "data-gt-theme-details-empty-art";
  const DICTIONARY_PANEL_ATTRIBUTE = "data-gt-theme-dictionary-panel";
  const DICTIONARY_SECTION_HEADER_ATTRIBUTE = "data-gt-theme-dictionary-section-header";
  const DICTIONARY_SECTION_TITLE_ATTRIBUTE = "data-gt-theme-dictionary-section-title";
  const DICTIONARY_DIVIDER_ATTRIBUTE = "data-gt-theme-dictionary-divider";
  const DICTIONARY_TRANSLATION_CHIP_ATTRIBUTE = "data-gt-theme-dictionary-chip";
  const HISTORY_PANEL_ATTRIBUTE = "data-gt-theme-history-panel";
  const HISTORY_ENTRY_ATTRIBUTE = "data-gt-theme-history-entry";
  const HISTORY_ENTRY_STATE_LAYER_ATTRIBUTE = "data-gt-theme-history-entry-state-layer";
  const HISTORY_LANGUAGE_PAIR_ATTRIBUTE = "data-gt-theme-history-language-pair";
  const SAVED_PANEL_ATTRIBUTE = "data-gt-theme-saved-panel";
  const SAVED_TITLE_ATTRIBUTE = "data-gt-theme-saved-title";
  const SAVED_LANGUAGE_PAIR_ATTRIBUTE = "data-gt-theme-saved-language-pair";
  const SAVED_STAR_ATTRIBUTE = "data-gt-theme-saved-star";
  const SAVED_SECONDARY_ACTION_ATTRIBUTE = "data-gt-theme-saved-secondary-action";
  const ACTION_EXCLUDED_ANCESTOR_SELECTOR =
    `#${BUTTON_ID}, .gt-theme-toggle-host, header, #gb, nav, [role="navigation"], [role="dialog"], [aria-modal="true"], [role="menu"], [role="listbox"]`;
  const ACTION_CONTEXT_SELECTOR = 'c-wiz[role="region"], [role="region"], section, article, c-wiz';
  const ACTION_PANEL_SIGNAL_SELECTOR = 'h1, h2, h3, h4, [role="heading"], textarea[aria-label], [role="textbox"][aria-label], [role="combobox"][aria-label]';
  const PANEL_CANDIDATE_SELECTOR = "[role='dialog'], [aria-modal='true'], aside, section, article, c-wiz, [role='region'], [role='group']";
  const PANEL_ANCESTOR_DEPTH_LIMIT = 32;
  const TRANSLATION_TYPE_BUTTON_SELECTOR =
    ':is(button, [role="button"]):is([aria-label*="文本翻译"], [aria-label*="文字翻译"], [aria-label*="圖片翻譯"], [aria-label*="图片翻译"], [aria-label*="文档翻译"], [aria-label*="文件翻译"], [aria-label*="網站翻譯"], [aria-label*="网站翻译"], [aria-label*="text translation" i], [aria-label*="image translation" i], [aria-label*="images translation" i], [aria-label*="document translation" i], [aria-label*="documents translation" i], [aria-label*="website translation" i], [aria-label*="websites translation" i])';
  const TRANSLATION_MODEL_BUTTON_SELECTOR =
    ':is(button, [role="button"]):is([aria-label*="翻译模型"], [aria-label*="翻譯模型"], [aria-label*="translation model" i])';
  const ICON_ACTION_LABEL_RE = createLabelRegex([
    "listen",
    "listen to",
    "speak",
    "read aloud",
    "pronounce",
    "pronunciation",
    "play",
    "play audio",
    "copy",
    "copy text",
    "copy source text",
    "copy to clipboard",
    "search",
    "search with google",
    "search google",
    "google search",
    "share",
    "share translation",
    "share this translation",
    "rate",
    "rate translation",
    "rate this translation",
    "good translation",
    "bad translation",
    "thumbs up",
    "thumbs down",
    "like",
    "dislike",
    "朗读",
    "聆听",
    "播放",
    "发音",
    "收听",
    "复制",
    "拷贝",
    "複製",
    "搜索",
    "使用 Google 搜索",
    "Google 搜索",
    "分享",
    "分享译文",
    "分享此译文",
    "評分",
    "评分",
    "评价",
    "評價",
    "赞",
    "讚",
    "踩",
    "喜欢",
    "喜歡",
    "不喜欢",
    "不喜歡",
    "好译文",
    "好譯文",
    "差译文",
    "差譯文",
    "コピー",
    "聞く",
    "聴く",
    "再生",
    "発音",
    "読み上げ",
    "복사",
    "듣기",
    "재생",
    "발음",
    "écouter",
    "ecouter",
    "lire",
    "prononcer",
    "copier",
    "escuchar",
    "reproducir",
    "pronunciar",
    "copiar",
    "ouvir",
    "reproduzir",
    "pronunciar",
    "copiar",
    "anhören",
    "anhoeren",
    "wiedergeben",
    "vorlesen",
    "aussprache",
    "kopieren",
    "ascolta",
    "ascoltare",
    "riproduci",
    "pronuncia",
    "copia",
    "luisteren",
    "afspelen",
    "uitspraak",
    "kopiëren",
    "kopieren",
    "прослушать",
    "слушать",
    "воспроизвести",
    "произнести",
    "копировать",
    "скопировать",
    "прослухати",
    "відтворити",
    "вимова",
    "скопіювати",
    "posłuchaj",
    "odtwórz",
    "wymowa",
    "kopiuj",
    "skopiuj",
    "dinle",
    "oynat",
    "telaffuz",
    "kopyala",
    "استمع",
    "تشغيل",
    "نطق",
    "نسخ",
    "האזנה",
    "השמע",
    "העתק",
    "सुनें",
    "चलाएं",
    "उच्चारण",
    "कॉपी",
    "শুনুন",
    "কপি",
    "ฟัง",
    "เล่น",
    "ออกเสียง",
    "คัดลอก",
    "nghe",
    "phát",
    "phát âm",
    "sao chép",
    "dengarkan",
    "putar",
    "ucapkan",
    "salin",
    "dengar",
    "mainkan",
    "sebutan",
    "makinig",
    "i-play",
    "bigkasin",
    "kopyahin",
    "lyssna",
    "spela upp",
    "uttal",
    "kopiera",
    "lyt",
    "afspil",
    "udtal",
    "kopiér",
    "lytt",
    "spill av",
    "uttale",
    "kuuntele",
    "toista",
    "ääntäminen",
    "kopioi",
    "poslechnout",
    "přehrát",
    "výslovnost",
    "kopírovat",
    "vypočuť",
    "prehrať",
    "výslovnosť",
    "kopírovať",
    "meghallgatás",
    "lejátszás",
    "kiejtés",
    "másolás",
    "ascultă",
    "redă",
    "pronunță",
    "copiază",
    "ακούστε",
    "αναπαραγωγή",
    "προφορά",
    "αντιγραφή",
    "слушане",
    "пусни",
    "произношение",
    "копиране",
    "poslušaj",
    "reproduciraj",
    "izgovor",
    "kopiraj",
    "слушај",
    "репродукуј",
    "изговор",
    "копирај",
    "predvajaj",
    "izgovorjava",
    "klausyti",
    "leisti",
    "tartis",
    "kopijuoti",
    "klausīties",
    "atskaņot",
    "izruna",
    "kopēt",
    "kuula",
    "esita",
    "hääldus",
    "kopeeri",
    "گوش دادن",
    "پخش",
    "تلفظ",
    "کپی",
    "سنیں",
    "چلائیں",
    "کاپی",
    "sikiliza",
    "cheza",
    "tamka",
    "nakili",
  ]);
  const DICTIONARY_ACTION_RE = createLabelRegex([
    "dictionary",
    "look up in dictionary",
    "view dictionary",
    "check dictionary",
    "查字典",
    "字典",
    "詞典",
    "词典",
    "辞書",
    "辞書で調べる",
    "사전",
    "dictionnaire",
    "diccionario",
    "dicionário",
    "dicionario",
    "wörterbuch",
    "woerterbuch",
    "dizionario",
    "woordenboek",
    "словарь",
    "словник",
    "słownik",
    "sözlük",
    "قاموس",
    "معجم",
    "מילון",
    "शब्दकोश",
    "অভিধান",
    "พจนานุกรม",
    "từ điển",
    "kamus",
    "diksiyonaryo",
    "ordbok",
    "ordbog",
    "sanakirja",
    "slovník",
    "szótár",
    "dicționar",
    "dictionar",
    "λεξικό",
    "речник",
    "rječnik",
    "rečnik",
    "slovar",
    "žodynas",
    "vārdnīca",
    "sõnastik",
    "فرهنگ لغت",
    "لغت‌نامه",
    "لغت نامه",
    "لغت",
    "kamusi",
    "woordeboek",
    "diccionari",
    "hiztegia",
    "dicionario",
    "foclóir",
    "geiriadur",
    "fjalor",
    "речник",
    "നിഘണ്ടു",
    "அகராதி",
    "నిఘంటువు",
    "ನಿಘಂಟು",
    "શબ્દકોશ",
    "ਸ਼ਬਦਕੋਸ਼",
    "ශබ්දකෝෂය",
    "វចនានុក្រម",
    "ວັດຈະນານຸກົມ",
    "အဘိဓာန်",
    "толь бичиг",
    "բառարան",
    "ლექსიკონი",
    "lüğət",
    "сөздік",
    "lugʻat",
    "сөздүк",
    "луғат",
  ]);
  const TRANSLATE_ACTION_CONTEXT_RE = createLabelRegex([
    "source text",
    "source",
    "translated text",
    "translation",
    "target text",
    "原文",
    "译文",
    "譯文",
    "翻译",
    "翻譯",
    "翻译结果",
    "翻譯結果",
    "訳文",
    "翻訳",
    "번역",
    "traduction",
    "traducción",
    "tradução",
    "übersetzung",
    "uebersetzung",
  ]);
  const NON_TRANSLATE_ACTION_LABEL_RE = createLabelRegex([
    "search language",
    "language search",
    "search languages",
    "close search",
    "clear search",
    "clear search text",
    "更多源语言",
    "更多目标语言",
    "搜索语言",
    "语言搜索",
    "關閉搜尋",
    "关闭搜索",
    "清除搜索",
    "清除搜索文字",
    "清除搜尋",
    "清除搜尋文字",
  ]);
  const DOCUMENT_CLEAR_FILE_LABEL_RE = createLabelRegex([
    "clear file",
    "clear selected file",
    "remove file",
    "remove selected file",
    "delete file",
    "close file",
    "clear document",
    "remove document",
    "清除文件",
    "移除文件",
    "删除文件",
    "清除檔案",
    "移除檔案",
    "刪除檔案",
    "清除文档",
    "移除文档",
    "删除文档",
    "刪除文件",
    "ファイルをクリア",
    "ファイルを削除",
    "파일 지우기",
    "파일 삭제",
  ]);
  const DOCUMENT_GENERIC_CLEAR_ICON_RE = /^(?:clear|close)$/iu;
  const DOCUMENT_FILE_NAME_RE = /\.(?:pdf|docx?|pptx?|xlsx?|odt|ods|odp|rtf|txt)(?![a-z])/i;
  const DETAILS_EMPTY_STATE_RE = createLabelRegex([
    "highlight text to see details",
    "select text to see details",
    "highlight text for details",
    "选择文本以查看详情",
    "選取文字以查看詳細資訊",
    "突出显示文本以查看详情",
    "醒目显示文字以查看详细信息",
  ]);
  const DICTIONARY_TRANSLATION_TITLE_RE = /translations?\s+of/iu;
  const DICTIONARY_FREQUENCY_RE = createLabelRegex(["frequency", "频率", "頻率"]);
  const DICTIONARY_PART_OF_SPEECH_RE = createLabelRegex([
    "noun",
    "verb",
    "adjective",
    "adverb",
    "pronoun",
    "preposition",
    "conjunction",
    "interjection",
    "名词",
    "名詞",
    "动词",
    "動詞",
    "形容词",
    "形容詞",
    "副词",
    "副詞",
  ]);
  const HISTORY_PANEL_TITLE_RE = createLabelRegex(["history", "历史记录", "歷史記錄"]);
  const HISTORY_PANEL_ACTION_RE = createLabelRegex([
    "clear all history",
    "manage all activity",
    "translation history",
    "清除所有历史记录",
    "管理所有活动",
    "翻译历史记录",
    "清除所有歷史記錄",
    "管理所有活動",
    "翻譯歷史記錄",
  ]);
  const HISTORY_LANGUAGE_PAIR_RE = /\p{L}[\p{L}\p{M}\s().（）-]{1,80}\s*(?:→|->)\s*\p{L}[\p{L}\p{M}\s().（）-]{1,80}/u;
  const SAVED_PANEL_TITLE_RE = createLabelRegex(["saved", "已保存", "已儲存", "已储存", "保存的内容", "儲存的內容"]);
  const SAVED_PANEL_TITLE_EXACT_RE = /^(?:saved|已保存|已儲存|已储存|保存的内容|儲存的內容)$/iu;
  const SAVED_PANEL_ACTION_RE = createLabelRegex([
    "sort",
    "phrase",
    "phrases",
    "add",
    "add phrase",
    "saved translation",
    "排序",
    "短语",
    "詞組",
    "短句",
    "新增",
    "添加",
    "加入",
    "已保存的翻译",
    "已儲存的翻譯",
  ]);
  const SAVED_STAR_LABEL_RE = createLabelRegex([
    "save",
    "saved",
    "star",
    "remove from saved",
    "save translation",
    "saved translation",
    "保存",
    "已保存",
    "移除已保存",
    "保存翻译",
    "已保存的翻译",
    "儲存",
    "已儲存",
    "移除已儲存",
    "儲存翻譯",
    "已儲存的翻譯",
  ]);
  const SAVED_SECONDARY_ACTION_RE = createLabelRegex([
    "learn more",
    "more information",
    "details",
    "了解详情",
    "瞭解詳情",
    "了解更多",
    "瞭解更多",
    "详细信息",
    "詳細資訊",
  ]);
  const STAR_ICON_TEXT_RE = /^(?:star|star_border|grade)$/iu;
  const DICTIONARY_SECTION_TITLE_RE = /^(?:examples?|translations?)\s+of\b/iu;
  const ACTION_INLINE_PROPERTIES = [
    "background",
    "background-color",
    "border-color",
    "box-shadow",
    "color",
    "outline",
    "--mdc-ripple-color",
    "--mdc-ripple-hover-opacity",
    "--mdc-ripple-focus-opacity",
    "--mdc-ripple-pressed-opacity",
    "--mdc-icon-button-hover-state-layer-opacity",
    "--mdc-icon-button-focus-state-layer-opacity",
    "--mdc-icon-button-pressed-state-layer-opacity",
    "--gm3-icon-button-hover-state-layer-color",
    "--gm3-icon-button-focus-state-layer-color",
    "--gm3-icon-button-pressed-state-layer-color",
    "--gm3-icon-button-hover-state-layer-opacity",
    "--gm3-icon-button-focus-state-layer-opacity",
    "--gm3-icon-button-pressed-state-layer-opacity",
    "--gm3-icon-button-hover-container-color",
    "--gm3-icon-button-focus-container-color",
    "--gm3-icon-button-pressed-container-color",
    "--gm3-icon-button-hover-container-opacity",
    "--gm3-icon-button-focus-container-opacity",
    "--gm3-icon-button-pressed-container-opacity",
  ];
  const HISTORY_ENTRY_STATE_LAYER_INLINE_PROPERTIES = [
    "background",
    "background-color",
    "background-image",
    "box-shadow",
    "opacity",
    "pointer-events",
  ];
  const ACTION_STATE_LAYER_INLINE_PROPERTIES = ["background", "background-color", "box-shadow", "opacity"];
  const IS_TRANSLATE_PAGE = isTranslateHost(window.location.hostname);
  const IS_ABOUT_BLANK_ACCOUNT_WIDGET =
    window.location.href === "about:blank" &&
    window.top !== window &&
    (window.name === "account" || getFrameElementAttribute("name") === "account") &&
    isTrustedWidgetFrameContext();
  const IS_ACCOUNT_WIDGET =
    IS_ABOUT_BLANK_ACCOUNT_WIDGET ||
    (isAccountHost(window.location.hostname) && window.top !== window && isTrustedWidgetFrameContext());
  const IS_OGS_WIDGET = isOgsHost(window.location.hostname);
  const invertedCursorCache = new Map();

  if (!IS_TRANSLATE_PAGE && !IS_OGS_WIDGET && !IS_ACCOUNT_WIDGET) {
    return;
  }

  function createLabelRegex(labels) {
    return new RegExp(labels.map(escapeRegExp).join("|"), "iu");
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function isSupportedGoogleComHost(hostname, serviceName) {
    const normalizedHostname = String(hostname || "").toLowerCase();
    const baseHostname = `${serviceName}.google.com`;

    if (normalizedHostname === baseHostname) {
      return true;
    }

    if (!normalizedHostname.startsWith(`${baseHostname}.`)) {
      return false;
    }

    return GOOGLE_COUNTRY_HOST_SUFFIX_RE.test(normalizedHostname.slice(baseHostname.length + 1));
  }

  function isTranslateHost(hostname) {
    return isSupportedGoogleComHost(hostname, "translate");
  }

  function isOgsHost(hostname) {
    return isSupportedGoogleComHost(hostname, "ogs");
  }

  function isAccountHost(hostname) {
    return isSupportedGoogleComHost(hostname, "accounts");
  }

  function isTranslateOrigin(origin) {
    try {
      return isTranslateHost(new URL(origin).hostname);
    } catch (_error) {
      return false;
    }
  }

  const OGS_ACCOUNT_WIDGET_STYLES = `
html[data-gt-theme="dark"] {
  color-scheme: dark;
  --gt-theme-page: #202124;
  --gt-theme-surface: #202124;
  --gt-theme-surface-raised: #303134;
  --gt-theme-surface-tinted: #303134;
  --gt-theme-border: #5f6368;
  --gt-theme-border-soft: #3c4043;
  --gt-theme-text: #e8eaed;
  --gt-theme-text-muted: #bdc1c6;
  --gt-theme-text-subtle: #9aa0a6;
  --gt-theme-blue: #a8c7fa;
  --gt-theme-control-hover: rgba(232, 234, 237, 0.08);
  --gm3-sys-color-background: #202124;
  --gm3-sys-color-on-background: #e8eaed;
  --gm3-sys-color-surface: #202124;
  --gm3-sys-color-surface-dim: #1f1f1f;
  --gm3-sys-color-surface-bright: #3c4043;
  --gm3-sys-color-surface-container-lowest: #131314;
  --gm3-sys-color-surface-container: #1f1f1f;
  --gm3-sys-color-surface-container-low: #1b1b1b;
  --gm3-sys-color-surface-container-high: #282a2c;
  --gm3-sys-color-surface-container-highest: #333537;
  --gm3-sys-color-surface-variant: #444746;
  --gm3-sys-color-on-surface: #e3e3e3;
  --gm3-sys-color-on-surface-variant: #c4c7c5;
  --gm3-sys-color-outline: #8e918f;
  --gm3-sys-color-outline-variant: #3c4043;
  --gm3-sys-color-primary: #a8c7fa;
  --gm3-sys-color-on-primary: #202124;
  --gm3-sys-color-primary-container: #1f3b5f;
  --gm3-sys-color-on-primary-container: #d3e3fd;
  --mdc-theme-background: #202124;
  --mdc-theme-surface: #303134;
  --mdc-theme-on-surface: #e8eaed;
  --mdc-theme-primary: #a8c7fa;
}


html[data-gt-theme="dark"] [${OGS_ACCOUNT_ROOT_ATTRIBUTE}] {
  background: transparent !important;
  background-color: transparent !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${OGS_ACCOUNT_ROOT_ATTRIBUTE}] {
  box-shadow: none !important;
  background-clip: padding-box !important;
  overflow: visible !important;
  scrollbar-width: none !important;
}

html.gt-theme-ogs-account-view[data-gt-theme="dark"],
html.gt-theme-ogs-account-view[data-gt-theme="dark"] body {
  background: transparent !important;
  background-color: transparent !important;
  overflow: hidden !important;
  scrollbar-width: none !important;
}
html.gt-theme-ogs-account-view[data-gt-theme="dark"]::-webkit-scrollbar,
html.gt-theme-ogs-account-view[data-gt-theme="dark"] body::-webkit-scrollbar,
html[data-gt-theme="dark"] [${OGS_ACCOUNT_ROOT_ATTRIBUTE}]::-webkit-scrollbar {
  width: 10px !important;
}

html.gt-theme-ogs-account-view[data-gt-theme="dark"]::-webkit-scrollbar-track,
html.gt-theme-ogs-account-view[data-gt-theme="dark"] body::-webkit-scrollbar-track,
html[data-gt-theme="dark"] [${OGS_ACCOUNT_ROOT_ATTRIBUTE}]::-webkit-scrollbar-track {
  background-color: var(--gt-theme-surface-tinted) !important;
  border-radius: 999px !important;
}

html.gt-theme-ogs-account-view[data-gt-theme="dark"]::-webkit-scrollbar-thumb,
html.gt-theme-ogs-account-view[data-gt-theme="dark"] body::-webkit-scrollbar-thumb,
html[data-gt-theme="dark"] [${OGS_ACCOUNT_ROOT_ATTRIBUTE}]::-webkit-scrollbar-thumb {
  background-color: #5f6368 !important;
  border: 2px solid var(--gt-theme-surface-tinted) !important;
  border-radius: 999px !important;
}

html.gt-theme-ogs-account-view[data-gt-theme="dark"]::-webkit-scrollbar-button,
html.gt-theme-ogs-account-view[data-gt-theme="dark"] body::-webkit-scrollbar-button,
html[data-gt-theme="dark"] [${OGS_ACCOUNT_ROOT_ATTRIBUTE}]::-webkit-scrollbar-button {
  background: transparent !important;
  display: none !important;
  height: 0 !important;
  width: 0 !important;
}

html.gt-theme-ogs-account-view[data-gt-theme="dark"]::-webkit-scrollbar-corner,
html.gt-theme-ogs-account-view[data-gt-theme="dark"] body::-webkit-scrollbar-corner,
html[data-gt-theme="dark"] [${OGS_ACCOUNT_ROOT_ATTRIBUTE}]::-webkit-scrollbar-corner {
  background: transparent !important;
}

html.gt-theme-ogs-account-view[data-gt-theme="dark"]::-webkit-scrollbar,
html.gt-theme-ogs-account-view[data-gt-theme="dark"] body::-webkit-scrollbar,
html.gt-theme-ogs-account-view[data-gt-theme="dark"] [${OGS_ACCOUNT_ROOT_ATTRIBUTE}]::-webkit-scrollbar {
  display: none !important;
  height: 0 !important;
  width: 0 !important;
}



html[data-gt-theme="dark"] [${OGS_ACCOUNT_ROOT_ATTRIBUTE}] img,
html[data-gt-theme="dark"] [${OGS_ACCOUNT_ROOT_ATTRIBUTE}] picture,
html[data-gt-theme="dark"] [${OGS_ACCOUNT_ROOT_ATTRIBUTE}] [style*="background-image"] {
  filter: none !important;
  opacity: 1 !important;
  mix-blend-mode: normal !important;
}

html[data-gt-theme="dark"] [aria-label="关闭"],
html[data-gt-theme="dark"] [aria-label="Close"] {
  background-color: transparent !important;
}

html[data-gt-theme="dark"] [aria-label="关闭"]:focus,
html[data-gt-theme="dark"] [aria-label="关闭"]:focus-visible,
html[data-gt-theme="dark"] [aria-label="Close"]:focus,
html[data-gt-theme="dark"] [aria-label="Close"]:focus-visible {
  background-color: transparent !important;
}

html[data-gt-theme="dark"] [aria-label="关闭"]:hover,
html[data-gt-theme="dark"] [aria-label="Close"]:hover {
  background-color: var(--gt-theme-control-hover) !important;
}
`;

  const OGS_PANEL_STYLES = `
html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] {
  color: var(--gt-theme-text) !important;
  color-scheme: dark;
}

html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] {
  background-color: var(--gt-theme-surface-raised) !important;
}

html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] header,
html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] [role="search"] {
  background-color: var(--gt-theme-page) !important;
  border-color: var(--gt-theme-border) !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] :is(ul, [role="list"], section, article) {
  background-color: var(--gt-theme-page) !important;
  border-color: var(--gt-theme-border) !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] :is([data-text], [data-pid], [data-app-widget-link-name]) {
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] :is(a[data-pid], a[data-app-widget-link-name], [role="button"], button) {
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] :is(a[data-pid], a[data-app-widget-link-name], [role="button"], button):is(:hover, :focus-visible) {
  background-color: var(--gt-theme-control-hover) !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] input,
html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] textarea,
html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] [role="textbox"],
html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] [contenteditable="true"] {
  background-color: transparent !important;
  color: var(--gt-theme-text) !important;
  caret-color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] input::placeholder,
html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] textarea::placeholder {
  color: var(--gt-theme-text-subtle) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] [aria-label*="关闭"],
html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] [aria-label*="Close"] {
  background-color: transparent !important;
  color: var(--gt-theme-control-color) !important;
}

html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] [aria-label*="关闭"]:hover,
html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] [aria-label*="Close"]:hover {
  background-color: var(--gt-theme-control-hover) !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] button,
html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] [role="button"] {
  background-color: var(--gt-theme-border-soft) !important;
  border-color: transparent !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] button:hover,
html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] button:focus-visible,
html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] [role="button"]:hover,
html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] [role="button"]:focus-visible {
  background-color: #4d5156 !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] button svg,
html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] [role="button"] svg,
html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] button svg *:not([fill="none"]),
html[data-gt-theme="dark"] [${OGS_PANEL_ATTRIBUTE}] [role="button"] svg *:not([fill="none"]) {
  color: inherit !important;
  fill: currentColor !important;
}
`;

  // Material Symbols Outlined 24px paths from google/material-design-icons, Apache-2.0.
  const ICON_PATHS = {
    light: "M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z",
    dark: "M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z",
    auto: "M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm40-83q119-15 199.5-104.5T800-480q0-123-80.5-212.5T520-797v634Z",
  };

  const LABELS = {
    light: "Theme: light",
    dark: "Theme: dark",
    auto: "Theme: auto",
  };

  const SETTINGS_LABELS = ["Settings", "设置"];
  const GOOGLE_APPS_LABELS = ["Google apps", "Google 应用"];

  const MEDIA_QUERY = window.matchMedia("(prefers-color-scheme: dark)");
  let selectedMode = IS_TRANSLATE_PAGE ? getStoredMode() : "auto";
  let mountTimer = 0;
  let rerenderTimer = 0;
  let rerenderMaxTimer = 0;
  let themeSwitchId = 0;
  let translateRuntimeStarted = false;
  let ogsEffectiveTheme = "light";
  let ogsApplyTimer = 0;
  let ogsRequestTimer = 0;
  let ogsParentThemeRefreshTimer = 0;
  const ogsThemeBroadcastTimers = [];
  const ogsAccountBroadcastTimers = [];
  const pendingRerenderElements = new Set();

  if (IS_OGS_WIDGET || IS_ACCOUNT_WIDGET) {
    setupOgsWidgetThemeBridge();
    return;
  }

  injectStyles();
  applyThemeAttributes();
  runWhenBodyReady(startTranslateThemeRuntime);
  watchSystemTheme();

  function startTranslateThemeRuntime() {
    if (translateRuntimeStarted) {
      return;
    }

    translateRuntimeStarted = true;
    applyTheme();
    mountButton();
    watchForRerender();
    watchDynamicActionControls();
    watchDocumentUploadFileCards();
    watchThemeBridgeRequests();
    watchOgsFrameLoads();
  }

  function getStoredMode() {
    try {
      const storedMode = localStorage.getItem(STORAGE_KEY);
      return MODES.includes(storedMode) ? storedMode : "auto";
    } catch (_error) {
      return "auto";
    }
  }

  function setStoredMode(mode) {
    selectedMode = mode;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (_error) {
      // Some restricted contexts do not expose localStorage.
    }
    suppressThemeSwitchTransitions();
    applyTheme();
    updateButton();
  }

  function suppressThemeSwitchTransitions() {
    const switchId = ++themeSwitchId;
    document.documentElement.classList.add(THEME_SWITCHING_CLASS);

    const clearSwitchingClass = () => {
      if (switchId === themeSwitchId) {
        document.documentElement.classList.remove(THEME_SWITCHING_CLASS);
      }
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(clearSwitchingClass);
    });
    window.setTimeout(clearSwitchingClass, 120);
  }

  function getEffectiveTheme() {
    if (selectedMode === "auto") {
      return MEDIA_QUERY.matches ? "dark" : "light";
    }

    return selectedMode;
  }

  function applyTheme() {
    const effectiveTheme = getEffectiveTheme();

    applyThemeAttributes(effectiveTheme);

    if (!translateRuntimeStarted || !document.body) {
      return;
    }

    syncTranslateThemeSurfaces(effectiveTheme);
    scheduleOgsThemeBroadcasts(effectiveTheme);
  }

  function applyThemeAttributes(effectiveTheme = getEffectiveTheme()) {
    const root = document.documentElement;

    if (!root) {
      return;
    }

    root.setAttribute(THEME_ATTRIBUTE, effectiveTheme);
    root.setAttribute("data-gt-theme-mode", selectedMode);
    root.style.colorScheme = effectiveTheme;

    if (effectiveTheme === "dark") {
      root.style.setProperty("background-color", "#202124", "important");
      return;
    }

    root.style.removeProperty("background-color");
  }

  function runWhenBodyReady(callback) {
    if (document.body) {
      callback();
      return;
    }

    let didRun = false;
    let observer = null;

    const run = () => {
      if (didRun || !document.body) {
        return;
      }

      didRun = true;
      observer?.disconnect();
      document.removeEventListener("DOMContentLoaded", run);
      callback();
    };

    if (document.documentElement) {
      observer = new MutationObserver(run);
      observer.observe(document.documentElement, { childList: true });
    }

    document.addEventListener("DOMContentLoaded", run, { once: true });
  }

  function appendStyleElement(style) {
    const parent = document.head || document.documentElement;

    if (parent) {
      parent.appendChild(style);
    } else {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          document.head?.appendChild(style);
        },
        { once: true }
      );
      return;
    }

    if (!document.head) {
      runWhenHeadReady(() => {
        if (style.parentNode !== document.head) {
          document.head.appendChild(style);
        }
      });
    }
  }

  function runWhenHeadReady(callback) {
    if (document.head) {
      callback();
      return;
    }

    let didRun = false;
    let observer = null;

    const run = () => {
      if (didRun || !document.head) {
        return;
      }

      didRun = true;
      observer?.disconnect();
      document.removeEventListener("DOMContentLoaded", run);
      callback();
    };

    if (document.documentElement) {
      observer = new MutationObserver(run);
      observer.observe(document.documentElement, { childList: true });
    }

    document.addEventListener("DOMContentLoaded", run, { once: true });
  }

  function syncTranslateThemeSurfaces(effectiveTheme, scopes, shouldScheduleFrames = false) {
    syncInputToolsMenus(effectiveTheme, scopes);
    syncSourceActionControls(effectiveTheme, scopes);
    syncDocumentUploadFileCards(effectiveTheme, scopes);
    syncDetailsEmptyStates(effectiveTheme, scopes);
    syncDictionaryTranslationChips(effectiveTheme, scopes);
    syncHistoryPanels(effectiveTheme, scopes);
    syncSavedPanels(effectiveTheme, scopes);
    syncHandwritingCursor(effectiveTheme, scopes);
    syncOgsFrameShells(scopes);
    postThemeToOgsWidgets(effectiveTheme, scopes, shouldScheduleFrames);
  }

  function cycleTheme() {
    const currentIndex = MODES.indexOf(selectedMode);
    const nextMode = MODES[(currentIndex + 1) % MODES.length] || "light";
    setStoredMode(nextMode);
  }

  function createButton() {
    const button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.className = "gt-theme-toggle-button";
    button.addEventListener("click", cycleTheme);

    updateButton(button);
    return button;
  }

  function updateButton(button = document.getElementById(BUTTON_ID)) {
    if (!button) {
      return;
    }

    const iconPath = button.querySelector("svg path");
    if (iconPath) {
      iconPath.setAttribute("d", ICON_PATHS[selectedMode]);
    } else {
      button.replaceChildren(createIcon(selectedMode));
    }
    button.setAttribute("aria-label", LABELS[selectedMode]);
    button.title = LABELS[selectedMode];
    button.dataset.mode = selectedMode;
  }

  function createIcon(mode) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    svg.setAttribute("viewBox", "0 -960 960 960");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    path.setAttribute("d", ICON_PATHS[mode]);
    svg.appendChild(path);

    return svg;
  }

  function mountButton() {
    const existingButton = document.getElementById(BUTTON_ID);
    const existingHost = existingButton?.parentElement;
    const preferredSlot = getPreferredHeaderSlot();

    if (existingButton && isCorrectHeaderPlacement(existingHost, preferredSlot)) {
      updateButton(existingButton);
      return;
    }

    if (existingHost?.classList.contains("gt-theme-toggle-host")) {
      existingHost.remove();
    } else if (existingButton) {
      existingButton.remove();
    }

    const button = createButton();
    const host = createButtonHost(button);

    if (preferredSlot?.parentElement) {
      preferredSlot.parentElement.insertBefore(host, preferredSlot);
      return;
    }

    host.classList.add("gt-theme-toggle-fallback");
    document.body.appendChild(host);
  }

  function createButtonHost(button) {
    const host = document.createElement("div");
    host.className = "gt-theme-toggle-host";
    host.appendChild(button);
    return host;
  }

  function getPreferredHeaderSlot() {
    return (
      closestHeaderButtonSlot(findElementByAriaLabel(SETTINGS_LABELS)) ||
      closestHeaderButtonSlot(findElementByAriaLabel(GOOGLE_APPS_LABELS))
    );
  }

  function isCorrectHeaderPlacement(host, preferredSlot) {
    if (!host?.classList.contains("gt-theme-toggle-host")) {
      return false;
    }

    if (preferredSlot?.parentElement) {
      return host.parentElement === preferredSlot.parentElement && host.nextElementSibling === preferredSlot;
    }

    return host.classList.contains("gt-theme-toggle-fallback");
  }

  function findElementByAriaLabel(labels) {
    for (const label of labels) {
      const element = document.querySelector(`[aria-label="${label}"]`);

      if (element) {
        return element;
      }
    }

    return null;
  }

  function closestHeaderButtonSlot(element) {
    const header = document.querySelector("header#gb, header");

    if (!element || !header?.contains(element)) {
      return null;
    }

    let current = element;

    while (current.parentElement && current.parentElement !== header) {
      if (current.parentElement.parentElement === header) {
        return current;
      }

      current = current.parentElement;
    }

    return current.parentElement === header ? current : null;
  }

  function watchForRerender() {
    const observer = new MutationObserver((records) => {
      scheduleRerenderSync(records);
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["aria-describedby", "aria-label", "aria-labelledby", "aria-modal", "data-tooltip", "data-tooltip-label", "role", "title"],
      childList: true,
      subtree: true,
    });
  }

  function scheduleRerenderSync(records) {
    collectRerenderElements(records);
    window.clearTimeout(rerenderTimer);
    rerenderTimer = window.setTimeout(flushRerenderSync, 80);

    if (!rerenderMaxTimer) {
      rerenderMaxTimer = window.setTimeout(flushRerenderSync, 240);
    }
  }

  function collectRerenderElements(records) {
    records.forEach((record) => {
      addRerenderScope(record.target);

      record.addedNodes?.forEach((node) => {
        addRerenderScope(node);
      });
    });
  }

  function addRerenderScope(node) {
    const element = node instanceof Element ? node : node?.parentElement;

    if (!element) {
      return;
    }

    let current = element;
    let depth = 0;

    while (current && current !== document.documentElement && depth < 8) {
      if (current === document.body) {
        break;
      }

      if (current instanceof Element) {
        pendingRerenderElements.add(current);
      }

      current = current.parentElement;
      depth += 1;
    }
  }

  function flushRerenderSync() {
    window.clearTimeout(rerenderTimer);
    window.clearTimeout(rerenderMaxTimer);
    rerenderTimer = 0;
    rerenderMaxTimer = 0;

    const scopes = Array.from(pendingRerenderElements).filter((element) => element.isConnected);
    pendingRerenderElements.clear();

    if (scopes.length === 0) {
      return;
    }

    const effectiveTheme = getEffectiveTheme();
    mountButton();
    syncTranslateThemeSurfaces(effectiveTheme, scopes, true);
    scheduleOgsThemeBroadcasts(effectiveTheme);
  }

  function normalizeScopes(scopes) {
    if (!scopes) {
      return [document];
    }

    const input = Array.isArray(scopes) ? scopes : [scopes];
    if (input.includes(document)) {
      return [document];
    }

    const normalized = [];
    const seen = new Set();

    input.forEach((scope) => {
      if (scope instanceof Element && scope.isConnected && !seen.has(scope)) {
        seen.add(scope);
        normalized.push(scope);
      }
    });

    return normalized.length > 0 ? removeNestedScopes(normalized) : [document];
  }

  function removeNestedScopes(scopes) {
    return scopes.filter(
      (scope) => !scopes.some((candidate) => candidate !== scope && candidate.contains(scope))
    );
  }

  function queryAllInScopes(scopes, selector) {
    const elements = new Set();

    normalizeScopes(scopes).forEach((scope) => {
      if (scope instanceof Element && scope.matches(selector)) {
        elements.add(scope);
      }

      scope.querySelectorAll?.(selector).forEach((element) => {
        elements.add(element);
      });
    });

    return Array.from(elements);
  }

  function clearAttributeInScopes(attributeName, scopes) {
    queryAllInScopes(scopes, `[${attributeName}]`).forEach((element) => {
      element.removeAttribute(attributeName);
    });
  }

  function getPanelCandidates(scopes) {
    const candidates = new Set(queryAllInScopes(scopes, PANEL_CANDIDATE_SELECTOR));

    normalizeScopes(scopes).forEach((scope) => {
      if (scope instanceof HTMLElement) {
        candidates.add(scope);
      }
    });

    return Array.from(candidates);
  }

  function addAncestorPanelCandidates(candidates, scopes) {
    normalizeScopes(scopes).forEach((scope) => {
      if (!(scope instanceof HTMLElement)) {
        return;
      }

      let current = scope.parentElement;
      let depth = 0;

      while (current && current !== document.body && current !== document.documentElement && depth < PANEL_ANCESTOR_DEPTH_LIMIT) {
        candidates.add(current);
        current = current.parentElement;
        depth += 1;
      }
    });
  }

  function getExtendedPanelCandidates(scopes) {
    const candidates = new Set(getPanelCandidates(scopes));
    addAncestorPanelCandidates(candidates, scopes);

    queryAllInScopes(scopes, "div").forEach((candidate) => {
      candidates.add(candidate);
    });

    return Array.from(candidates);
  }

  function watchSystemTheme() {
    const listener = () => {
      if (selectedMode === "auto") {
        applyTheme();
      }
    };

    if (typeof MEDIA_QUERY.addEventListener === "function") {
      MEDIA_QUERY.addEventListener("change", listener);
      return;
    }

    MEDIA_QUERY.addListener(listener);
  }

  function watchThemeBridgeRequests() {
    window.addEventListener("message", (event) => {
      const replyOrigin = getThemeRequestReplyOrigin(event);

      if (event.data?.type !== THEME_REQUEST_MESSAGE_TYPE || !replyOrigin || !event.source) {
        return;
      }

      safePostThemeMessage(event.source, createThemeMessage(), replyOrigin);
    });
  }

  function postThemeToOgsWidgets(effectiveTheme = getEffectiveTheme(), scopes, shouldScheduleFrames = false) {
    const message = createThemeMessage(effectiveTheme);

    queryOgsWidgetFrames(scopes).forEach((frame) => {
      postThemeToOgsFrame(frame, message);
      if (shouldScheduleFrames) {
        scheduleOgsFrameThemeBroadcast(frame, effectiveTheme);
      }
    });
  }

  function postThemeToOgsFrame(frame, message = createThemeMessage()) {
    syncOgsFrameShell(frame);

    const targetWindow = frame.contentWindow;
    const targetOrigin = getOgsFrameOrigin(frame);

    if (!targetWindow || !targetOrigin) {
      return;
    }

    safePostThemeMessage(targetWindow, message, targetOrigin);
  }

  function scheduleOgsThemeBroadcasts(effectiveTheme = getEffectiveTheme()) {
    scheduleThemeBroadcasts(
      ogsThemeBroadcastTimers,
      () => getEffectiveTheme() === effectiveTheme,
      () => {
        syncOgsFrameShells();
        postThemeToOgsWidgets(effectiveTheme);
      }
    );
  }

  function scheduleOgsFrameThemeBroadcast(frame, effectiveTheme = getEffectiveTheme()) {
    scheduleFrameThemeBroadcast(
      frame,
      () => getEffectiveTheme() === effectiveTheme,
      () => postThemeToOgsFrame(frame, createThemeMessage(effectiveTheme))
    );
  }

  function scheduleThemeBroadcasts(timers, isCurrentTheme, broadcast) {
    clearTimers(timers);

    THEME_BROADCAST_DELAYS.forEach((delay) => {
      const timer = window.setTimeout(() => {
        if (isCurrentTheme()) {
          broadcast();
        }
      }, delay);

      timers.push(timer);
    });
  }

  function scheduleFrameThemeBroadcast(frame, isCurrentTheme, broadcast) {
    THEME_BROADCAST_DELAYS.forEach((delay) => {
      window.setTimeout(() => {
        if (frame.isConnected && isCurrentTheme()) {
          broadcast();
        }
      }, delay);
    });
  }

  function watchOgsFrameLoads() {
    document.addEventListener(
      "load",
      (event) => {
        const frame = event.target;

        if (!isTrustedOgsWidgetFrame(frame)) {
          return;
        }

        postThemeToOgsFrame(frame, createThemeMessage());
        scheduleOgsFrameThemeBroadcast(frame);
        scheduleOgsThemeBroadcasts();
      },
      true
    );
  }

  function syncOgsFrameShells(scopes) {
    queryOgsWidgetFrames(scopes).forEach(syncOgsFrameShell);
    syncOgsAccountFrameShellMarks();
  }

  function syncOgsFrameShell(frame) {
    const effectiveTheme = getEffectiveTheme();

    frame.style.removeProperty("color-scheme");
    frame.style.setProperty("background", "transparent", "important");
    frame.style.setProperty("background-color", "transparent", "important");

    let shell = frame.parentElement;

    for (let level = 0; shell && level < 12; level += 1) {
      if (shell.matches("html, body, header, #gb")) {
        break;
      }

      shell.style.setProperty("background", "transparent", "important");
      shell.style.setProperty("background-color", "transparent", "important");
      shell.style.setProperty("color-scheme", effectiveTheme, "important");
      shell = shell.parentElement;
    }
  }

  function syncOgsAccountFrameShellMarks() {
    const shells = new Set();

    queryDocumentOgsWidgetFrames().forEach((frame) => {
      if (!(frame instanceof HTMLIFrameElement) || !isAccountWidgetFrame(frame)) {
        return;
      }

      shells.add(frame);

      let shell = frame.parentElement;
      let depth = 0;

      while (shell && shell !== document.body && shell !== document.documentElement && depth < 16) {
        if (shell.matches("header, #gb")) {
          break;
        }

        shells.add(shell);
        shell = shell.parentElement;
        depth += 1;
      }
    });

    syncElementMarks(OGS_ACCOUNT_FRAME_SHELL_ATTRIBUTE, [...shells]);
  }

  function createThemeMessage(effectiveTheme = getEffectiveTheme()) {
    return {
      type: THEME_MESSAGE_TYPE,
      selectedMode,
      effectiveTheme,
    };
  }

  function safePostThemeMessage(targetWindow, message, targetOrigin) {
    try {
      targetWindow.postMessage(message, targetOrigin);
    } catch (error) {
      if (targetOrigin === "*") {
        return;
      }

      try {
        targetWindow.postMessage(message, "*");
      } catch (_fallbackError) {
        // Cross-origin Google widget frames can navigate after src is read; skip if the window is no longer reachable.
      }
    }
  }

  function getOgsFrameOrigin(frame) {
    const origin = getFrameOrigin(frame);

    if (isAccountWidgetFrame(frame)) {
      return getMessageReplyOrigin(origin);
    }

    return origin && isOgsOrigin(origin) ? origin : null;
  }

  function getFrameOrigin(frame) {
    const src = frame.getAttribute("src");

    if (!src) {
      return null;
    }

    try {
      return new URL(src, window.location.href).origin;
    } catch (_error) {
      return null;
    }
  }

  function isOgsOrigin(origin) {
    try {
      return isOgsHost(new URL(origin).hostname);
    } catch (_error) {
      return false;
    }
  }

  function isAccountOrigin(origin) {
    try {
      return isAccountHost(new URL(origin).hostname);
    } catch (_error) {
      return false;
    }
  }

  function isTrustedWidgetOrigin(origin) {
    return isOgsOrigin(origin) || isAccountOrigin(origin);
  }

  function isOpaqueOrigin(origin) {
    return origin === "null";
  }

  function getMessageReplyOrigin(origin) {
    return origin && !isOpaqueOrigin(origin) ? origin : "*";
  }

  function isAccountWidgetFrame(frame) {
    const origin = getFrameOrigin(frame);
    return (
      isAccountOrigin(origin) ||
      (frame?.getAttribute("name") === "account" && isAccountWidgetFallbackSource(frame, origin))
    );
  }

  function isAccountWidgetFallbackSource(frame, origin) {
    if (origin && !isOpaqueOrigin(origin)) {
      return false;
    }

    const src = frame?.getAttribute("src");
    return !src || src.trim().toLowerCase() === "about:blank";
  }

  function isTrustedOgsWidgetFrame(frame) {
    if (!(frame instanceof HTMLIFrameElement)) {
      return false;
    }

    return isAccountWidgetFrame(frame) || isOgsOrigin(getFrameOrigin(frame));
  }

  function queryOgsWidgetFrames(scopes) {
    return queryAllInScopes(scopes, OGS_FRAME_SELECTOR).filter(isTrustedOgsWidgetFrame);
  }

  function queryDocumentOgsWidgetFrames() {
    return Array.from(document.querySelectorAll(OGS_FRAME_SELECTOR)).filter(isTrustedOgsWidgetFrame);
  }

  function isKnownAccountFrameSource(source) {
    if (!source) {
      return false;
    }

    try {
      return queryDocumentOgsWidgetFrames().some((frame) => frame.contentWindow === source && isAccountWidgetFrame(frame));
    } catch (_error) {
      return false;
    }
  }

  function getThemeRequestReplyOrigin(event) {
    if (isTrustedWidgetOrigin(event.origin)) {
      return event.origin;
    }

    if (isKnownAccountFrameSource(event.source)) {
      return getMessageReplyOrigin(event.origin);
    }

    return null;
  }

  function getFrameElementAttribute(attributeName) {
    try {
      return window.frameElement?.getAttribute(attributeName) || "";
    } catch (_error) {
      return "";
    }
  }

  function isTranslateFrameContext() {
    if (document.referrer && isTranslateOrigin(document.referrer)) {
      return true;
    }

    try {
      return isTranslateHost(window.parent?.location?.hostname || "");
    } catch (_error) {
      return false;
    }
  }

  function isOgsFrameContext() {
    if (document.referrer && isOgsOrigin(document.referrer)) {
      return true;
    }

    try {
      return isOgsHost(window.parent?.location?.hostname || "");
    } catch (_error) {
      return false;
    }
  }

  function isTrustedWidgetFrameContext() {
    return isTranslateFrameContext() || isOgsFrameContext();
  }

  function setupOgsWidgetThemeBridge() {
    document.documentElement.classList.toggle(ACCOUNT_WIDGET_CLASS, IS_ACCOUNT_WIDGET);
    injectOgsWidgetStyles();
    watchOgsAccountFrameLoads();
    watchOgsWidgetThemeRefreshTriggers();

    window.addEventListener("message", (event) => {
      const childReplyOrigin = getChildThemeRequestReplyOrigin(event);

      if (event.data?.type === THEME_REQUEST_MESSAGE_TYPE && event.source && childReplyOrigin) {
        safePostThemeMessage(event.source, createOgsWidgetThemeMessage(), childReplyOrigin);
        return;
      }

      if (!isTrustedThemeParentOrigin(event.origin) || event.data?.type !== THEME_MESSAGE_TYPE) {
        return;
      }

      applyOgsNativeTheme(event.data.effectiveTheme, event.data.selectedMode);
    });

    const observer = new MutationObserver(() => {
      scheduleThemeRefreshFromParent();
      scheduleOgsNativeThemeApply();
    });

    const startObserver = () => {
      if (document.documentElement) {
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
        });
      }

      scheduleOgsNativeThemeApply();
      requestThemeFromParent();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", startObserver, { once: true });
    } else {
      startObserver();
    }

    let attempts = 0;
    ogsRequestTimer = window.setInterval(() => {
      attempts += 1;
      requestThemeFromParent();

      if (attempts >= 20) {
        window.clearInterval(ogsRequestTimer);
      }
    }, 250);
  }

  function requestThemeFromParent() {
    getTrustedThemeParentOrigins().forEach((origin) => {
      if (!window.parent) {
        return;
      }

      safePostThemeMessage(
        window.parent,
        {
          type: THEME_REQUEST_MESSAGE_TYPE,
        },
        origin
      );
    });
  }

  function scheduleThemeRefreshFromParent(delay = 60) {
    window.clearTimeout(ogsParentThemeRefreshTimer);
    ogsParentThemeRefreshTimer = window.setTimeout(() => {
      requestThemeFromParent();
    }, delay);
  }

  function watchOgsWidgetThemeRefreshTriggers() {
    window.addEventListener("pageshow", () => {
      scheduleThemeRefreshFromParent(0);
    });

    window.addEventListener("focus", () => {
      scheduleThemeRefreshFromParent(0);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        scheduleThemeRefreshFromParent(0);
      }
    });
  }

  function getTrustedThemeParentOrigins() {
    const origins = ["https://translate.google.com"];

    try {
      const referrerOrigin = document.referrer ? new URL(document.referrer).origin : "";
      if (isTranslateOrigin(referrerOrigin) || isOgsOrigin(referrerOrigin)) {
        origins.push(referrerOrigin);
      }
    } catch (_error) {
      // Ignore malformed or unavailable referrers.
    }

    return [...new Set(origins)];
  }

  function isTrustedThemeParentOrigin(origin) {
    return isTranslateOrigin(origin) || isOgsOrigin(origin);
  }

  function getChildThemeRequestReplyOrigin(event) {
    if (!event.source) {
      return null;
    }

    if (isAccountOrigin(event.origin)) {
      return event.origin;
    }

    if (isKnownAccountFrameSource(event.source)) {
      return getMessageReplyOrigin(event.origin);
    }

    return null;
  }

  function createOgsWidgetThemeMessage() {
    return {
      type: THEME_MESSAGE_TYPE,
      selectedMode: ogsEffectiveTheme,
      effectiveTheme: ogsEffectiveTheme,
    };
  }

  function applyOgsNativeTheme(effectiveTheme, _selectedMode) {
    if (effectiveTheme !== "dark" && effectiveTheme !== "light") {
      return;
    }

    ogsEffectiveTheme = effectiveTheme;
    scheduleOgsNativeThemeApply();
  }

  function scheduleOgsNativeThemeApply() {
    window.clearTimeout(ogsApplyTimer);
    ogsApplyTimer = window.setTimeout(() => {
      document.documentElement.setAttribute(THEME_ATTRIBUTE, ogsEffectiveTheme);
      document.documentElement.style.colorScheme = ogsEffectiveTheme;
      document.documentElement.style.setProperty("background", "transparent", "important");
      document.documentElement.style.setProperty("background-color", "transparent", "important");

      const ogsPanels = getOgsPanels();
      const accountRoots = getOgsAccountRoots(ogsPanels);
      const shouldUseAccountDark = ogsEffectiveTheme === "dark";
      const allAccountSurfaces = getOgsAccountSurfaces(accountRoots);
      const accountSurfaces = shouldUseAccountDark ? allAccountSurfaces : [];
      const accountActions = shouldUseAccountDark ? getOgsAccountActions([...accountRoots, ...accountSurfaces]) : [];
      const accountShells = getOgsAccountShells(accountRoots, allAccountSurfaces);

      document.documentElement.classList.toggle(ACCOUNT_WIDGET_CLASS, IS_ACCOUNT_WIDGET || accountRoots.length > 0);
      document.documentElement.classList.toggle(OGS_ACCOUNT_VIEW_CLASS, accountRoots.length > 0);
      syncOgsPanelMarks(ogsPanels);
      syncOgsAccountShellMarks(accountShells);
      syncOgsAccountRootMarks(accountRoots);
      syncOgsAccountSurfaceMarks(accountSurfaces);
      syncOgsAccountActionMarks(accountActions);

      if (document.body) {
        document.body.style.setProperty("background", "transparent", "important");
        document.body.style.setProperty("background-color", "transparent", "important");
      }

      ogsPanels.forEach((panel) => {
        clearOgsPanelShellBackgrounds(panel);
      });
      postOgsThemeToAccountWidgets(true);
      scheduleOgsAccountThemeBroadcasts(ogsEffectiveTheme);
    }, 0);
  }

  function getOgsPanels() {
    const panels = new Set();

    document.querySelectorAll(OGS_APP_VIEW_SELECTOR).forEach((appView) => {
      const panel = Array.from(appView.children).find(isLikelyOgsPanel);
      if (panel) {
        panels.add(panel);
      } else if (isLikelyOgsPanel(appView)) {
        panels.add(appView);
      }
    });

    return [...panels].filter(Boolean);
  }

  function isLikelyOgsPanel(element) {
    return (
      element instanceof HTMLElement &&
      hasOgsAppPanelSignals(element) &&
      (element.hasAttribute("aria-label") || element.querySelector("[aria-label]")) &&
      Boolean(element.querySelector('a[href], button, [role="button"]'))
    );
  }

  function hasOgsAppPanelSignals(element) {
    const label = element.getAttribute("aria-label") || "";

    return (
      /Google apps|Google 应用|Google 應用/i.test(label) ||
      Boolean(element.querySelector("a[data-pid], [data-app-widget-link-name], [data-text]"))
    );
  }

  function syncOgsPanelMarks(panels) {
    syncDarkSurfaceMarks(OGS_PANEL_ATTRIBUTE, panels);
  }

  function getOgsAccountRoots(ogsPanels) {
    if (!IS_ACCOUNT_WIDGET && !isLikelyOgsAccountView(ogsPanels)) {
      return [];
    }

    const accountRoot = getFirstBodyContentElement();
    if (accountRoot && !ogsPanels.some((panel) => panel === accountRoot || panel.contains(accountRoot))) {
      return [accountRoot];
    }

    const roots = Array.from(document.querySelectorAll(OGS_ACCOUNT_ROOT_SELECTOR)).filter(
      (root) => !ogsPanels.some((panel) => panel === root || panel.contains(root))
    );

    if (roots.length > 0) {
      return roots;
    }

    return [];
  }

  function isLikelyOgsAccountView(ogsPanels) {
    if (!IS_OGS_WIDGET || ogsPanels.length > 0) {
      return false;
    }

    if (isOgsAccountWidgetUrl()) {
      return true;
    }

    return hasOgsAccountTextSignals();
  }

  function isOgsAccountWidgetUrl() {
    return (
      /(?:^|\/)widget\/account(?:\/|$)/i.test(window.location.pathname) ||
      new URLSearchParams(window.location.search).get("cn") === "account"
    );
  }

  function hasOgsAccountTextSignals() {
    const bodyText = getNormalizedText(document.body?.textContent || "");
    const primarySignals = [
      /Manage your Google Account/i,
      /Add account/i,
      /Sign out/i,
      /管理.*Google.*帐号/,
      /管理.*Google.*帳戶/,
      /添加帐号|新增帳戶/,
      /退出|登出/,
    ];
    const secondarySignals = [
      /Hi,\s/i,
      /Privacy Policy/i,
      /Terms of Service/i,
      /隐私权政策|私隱權政策/,
      /服务条款|服務條款/,
    ];
    const primaryCount = primarySignals.filter((signal) => signal.test(bodyText)).length;

    return (
      primaryCount >= 2 ||
      (primaryCount >= 1 && secondarySignals.some((signal) => signal.test(bodyText)))
    );
  }

  function getFirstBodyContentElement() {
    return Array.from(document.body?.children || []).find((element) => !element.matches("script, style"));
  }

  function getOgsAccountSurfaces(accountRoots) {
    if (accountRoots.length === 0) {
      return [];
    }

    const surfaces = new Set();
    accountRoots.forEach((root) => {
      addOgsAccountSurfaceCandidates(surfaces, root);
    });

    document.querySelectorAll("main, [role='main'], [role='dialog'], [aria-modal='true'], section, article").forEach((element) => {
      if (hasOgsAccountElementSignals(element)) {
        addOgsAccountSurfaceCandidates(surfaces, element);
      }
    });

    return [...surfaces].filter(Boolean);
  }

  function getOgsAccountShells(accountRoots, accountSurfaces) {
    const shells = new Set();
    const protectedElements = new Set([...accountRoots, ...accountSurfaces]);

    [...accountRoots, ...accountSurfaces].forEach((element) => {
      if (!(element instanceof HTMLElement)) {
        return;
      }

      let current = element.parentElement;
      let depth = 0;

      while (current && current !== document.body && current !== document.documentElement && depth < 32) {
        if (!protectedElements.has(current)) {
          shells.add(current);
        }

        current = current.parentElement;
        depth += 1;
      }
    });

    return [...shells].filter(Boolean);
  }

  function addOgsAccountSurfaceCandidates(surfaces, element) {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    if (isLikelyOgsAccountSurface(element)) {
      surfaces.add(element);
    }

    const closestCard = element.closest("main, [role='main'], [role='dialog'], [aria-modal='true'], section, article");
    if (closestCard instanceof HTMLElement && isLikelyOgsAccountSurface(closestCard)) {
      surfaces.add(closestCard);
    }

    element.querySelectorAll("main, section, article, div, [role='main'], [role='dialog'], [aria-modal='true']").forEach((candidate) => {
      if (candidate instanceof HTMLElement && isLikelyOgsAccountSurface(candidate)) {
        surfaces.add(candidate);
      }
    });
  }

  function getOgsAccountActions(scopes) {
    const actions = new Set();
    const actionSelector = 'a, button, [role="button"], [tabindex]:not([tabindex="-1"])';

    scopes.forEach((scope) => {
      if (!(scope instanceof HTMLElement)) {
        return;
      }

      scope.querySelectorAll(actionSelector).forEach((candidate) => {
        if (candidate instanceof HTMLElement && isLikelyOgsAccountAction(candidate)) {
          actions.add(candidate);
        }
      });

      if (scope.matches(actionSelector) && isLikelyOgsAccountAction(scope)) {
        actions.add(scope);
      }
    });

    return [...actions].filter(Boolean);
  }

  function hasOgsAccountElementSignals(element) {
    const text = getNormalizedText(element.textContent || "");

    return (
      /Manage your Google Account/i.test(text) ||
      /Add account/i.test(text) ||
      /Sign out/i.test(text) ||
      /管理.*Google.*帐号/.test(text) ||
      /管理.*Google.*帳戶/.test(text) ||
      /添加帐号|新增帳戶/.test(text) ||
      /退出|登出/.test(text) ||
      Boolean(element.querySelector('a[href*="myaccount.google." i], a[href*="accounts.google." i]'))
    );
  }

  function isLikelyOgsAccountSurface(element) {
    if (!(element instanceof HTMLElement) || !hasOgsAccountElementSignals(element)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 240 || rect.height < 160) {
      return false;
    }

    if (isOgsAccountStructuralShell(element) && hasNestedOgsAccountSurfaceCandidate(element)) {
      return false;
    }

    const style = window.getComputedStyle(element);
    const backgroundColor = style.backgroundColor;
    const radius = Math.max(
      Number.parseFloat(style.borderTopLeftRadius) || 0,
      Number.parseFloat(style.borderTopRightRadius) || 0,
      Number.parseFloat(style.borderBottomLeftRadius) || 0,
      Number.parseFloat(style.borderBottomRightRadius) || 0
    );

    return isVisibleBackgroundColor(backgroundColor) && radius >= 12;
  }

  function isOgsAccountStructuralShell(element) {
    return element.matches("main, [role='main'], [role='dialog'], [aria-modal='true']");
  }

  function hasNestedOgsAccountSurfaceCandidate(element) {
    return Array.from(element.querySelectorAll("section, article, div")).some((candidate) => {
      if (!(candidate instanceof HTMLElement) || candidate === element || !hasOgsAccountElementSignals(candidate)) {
        return false;
      }

      const rect = candidate.getBoundingClientRect();
      if (rect.width < 240 || rect.height < 160) {
        return false;
      }

      const style = window.getComputedStyle(candidate);
      const radius = Math.max(
        Number.parseFloat(style.borderTopLeftRadius) || 0,
        Number.parseFloat(style.borderTopRightRadius) || 0,
        Number.parseFloat(style.borderBottomLeftRadius) || 0,
        Number.parseFloat(style.borderBottomRightRadius) || 0
      );

      return isVisibleBackgroundColor(style.backgroundColor) && radius >= 12;
    });
  }

  function isLikelyOgsAccountAction(element) {
    const label = getNormalizedText(
      [
        element.textContent || "",
        element.getAttribute("aria-label") || "",
        element.getAttribute("title") || "",
      ].join(" ")
    );
    const href = element instanceof HTMLAnchorElement ? element.href : "";

    if (/privacypolicy|termsofservice/i.test(href)) {
      return false;
    }

    return (
      /Manage your Google Account/i.test(label) ||
      /Add account/i.test(label) ||
      /Sign out/i.test(label) ||
      /管理.*Google.*帐号/.test(label) ||
      /管理.*Google.*帳戶/.test(label) ||
      /添加帐号|新增帳戶/.test(label) ||
      /退出|登出/.test(label) ||
      /accounts\.google\.[^/]+\/(?:AccountChooser|AddSession|SignOutOptions|Logout)/i.test(href)
    );
  }

  function getNormalizedText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function isVisibleBackgroundColor(value) {
    return Boolean(value && value !== "transparent" && !/^rgba\([^)]*,\s*0\)$/i.test(value));
  }

  function syncOgsAccountRootMarks(roots) {
    syncDarkSurfaceMarks(OGS_ACCOUNT_ROOT_ATTRIBUTE, roots);
  }

  function syncOgsAccountShellMarks(shells) {
    syncElementMarks(OGS_ACCOUNT_SHELL_ATTRIBUTE, shells);
  }

  function syncOgsAccountSurfaceMarks(surfaces) {
    syncDarkSurfaceMarks(OGS_ACCOUNT_SURFACE_ATTRIBUTE, surfaces);
  }

  function syncOgsAccountActionMarks(actions) {
    syncElementMarks(OGS_ACCOUNT_ACTION_ATTRIBUTE, actions);
  }

  function syncElementMarks(attributeName, elements) {
    const nextElements = new Set(elements);

    document.querySelectorAll(`[${attributeName}]`).forEach((element) => {
      if (!nextElements.has(element)) {
        element.removeAttribute(attributeName);
      }
    });

    nextElements.forEach((element) => {
      element.setAttribute(attributeName, "");
    });
  }

  function syncDarkSurfaceMarks(attributeName, elements) {
    const nextElements = new Set(elements);
    const shouldMarkDarkSurface = ogsEffectiveTheme === "dark";

    document.querySelectorAll(`[${attributeName}]`).forEach((element) => {
      if (!nextElements.has(element) || !shouldMarkDarkSurface) {
        element.removeAttribute(OGS_DARK_SURFACE_ATTRIBUTE);
      }
    });

    syncElementMarks(attributeName, nextElements);

    nextElements.forEach((element) => {
      if (shouldMarkDarkSurface) {
        element.setAttribute(OGS_DARK_SURFACE_ATTRIBUTE, "");
      } else {
        element.removeAttribute(OGS_DARK_SURFACE_ATTRIBUTE);
      }
    });
  }

  function postOgsThemeToAccountWidgets(shouldScheduleFrames = false) {
    const message = createOgsWidgetThemeMessage();

    queryDocumentOgsWidgetFrames().forEach((frame) => {
      if (!isAccountWidgetFrame(frame)) {
        return;
      }

      postOgsThemeToAccountFrame(frame, message);
      if (shouldScheduleFrames) {
        scheduleOgsAccountFrameThemeBroadcast(frame, ogsEffectiveTheme);
      }
    });
  }

  function postOgsThemeToAccountFrame(frame, message = createOgsWidgetThemeMessage()) {
    const targetWindow = frame.contentWindow;
    const targetOrigin = getMessageReplyOrigin(getFrameOrigin(frame));

    if (!targetWindow) {
      return;
    }

    safePostThemeMessage(targetWindow, message, targetOrigin);
  }

  function scheduleOgsAccountThemeBroadcasts(effectiveTheme = ogsEffectiveTheme) {
    scheduleThemeBroadcasts(
      ogsAccountBroadcastTimers,
      () => ogsEffectiveTheme === effectiveTheme,
      () => postOgsThemeToAccountWidgets()
    );
  }

  function scheduleOgsAccountFrameThemeBroadcast(frame, effectiveTheme = ogsEffectiveTheme) {
    scheduleFrameThemeBroadcast(
      frame,
      () => ogsEffectiveTheme === effectiveTheme,
      () => postOgsThemeToAccountFrame(frame, createOgsWidgetThemeMessage())
    );
  }

  function watchOgsAccountFrameLoads() {
    document.addEventListener(
      "load",
      (event) => {
        const frame = event.target;

        if (!(frame instanceof HTMLIFrameElement) || !isAccountWidgetFrame(frame)) {
          return;
        }

        postOgsThemeToAccountFrame(frame);
        scheduleOgsAccountFrameThemeBroadcast(frame);
        scheduleOgsAccountThemeBroadcasts();
      },
      true
    );
  }

  function clearTimers(timers) {
    while (timers.length > 0) {
      window.clearTimeout(timers.pop());
    }
  }

  function clearOgsPanelShellBackgrounds(panel) {
    let shell = panel.parentElement;

    while (shell && shell !== document.body && shell !== document.documentElement) {
      shell.style.setProperty("background", "transparent", "important");
      shell.style.setProperty("background-color", "transparent", "important");
      shell = shell.parentElement;
    }
  }

  function injectOgsWidgetStyles() {
    if (document.getElementById(OGS_WIDGET_STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = OGS_WIDGET_STYLE_ID;
    style.textContent = `
html[data-gt-theme],
html[data-gt-theme] body {
  background: transparent !important;
  background-color: transparent !important;
}

html[data-gt-theme] body > :not([${OGS_PANEL_ATTRIBUTE}]) {
  background: transparent !important;
  background-color: transparent !important;
}

${OGS_ACCOUNT_WIDGET_STYLES}

html.${ACCOUNT_WIDGET_CLASS}[data-gt-theme="dark"] {
  color-scheme: dark;
  --gt-account-page: #202124;
  --gt-account-surface: #303134;
  --gt-account-surface-raised: #3c4043;
  --gt-account-surface-hover: #4d5156;
  --gt-account-border: #5f6368;
  --gt-account-text: #e8eaed;
  --gt-account-text-muted: #bdc1c6;
  --gt-account-blue: #8ab4f8;
  --gm3-sys-color-background: var(--gt-account-page);
  --gm3-sys-color-on-background: var(--gt-account-text);
  --gm3-sys-color-surface: var(--gt-account-surface);
  --gm3-sys-color-surface-dim: #1f1f1f;
  --gm3-sys-color-surface-bright: var(--gt-account-surface-raised);
  --gm3-sys-color-surface-container-lowest: #131314;
  --gm3-sys-color-surface-container: var(--gt-account-surface);
  --gm3-sys-color-surface-container-low: #282a2c;
  --gm3-sys-color-surface-container-high: var(--gt-account-surface);
  --gm3-sys-color-surface-container-highest: var(--gt-account-surface-raised);
  --gm3-sys-color-surface-variant: #444746;
  --gm3-sys-color-on-surface: var(--gt-account-text);
  --gm3-sys-color-on-surface-variant: var(--gt-account-text-muted);
  --gm3-sys-color-outline: var(--gt-account-border);
  --gm3-sys-color-outline-variant: var(--gt-account-surface-raised);
  --gm3-sys-color-primary: var(--gt-account-blue);
  --mdc-theme-background: var(--gt-account-page);
  --mdc-theme-surface: var(--gt-account-surface);
  --mdc-theme-on-surface: var(--gt-account-text);
  --mdc-theme-primary: var(--gt-account-blue);
}

html.${ACCOUNT_WIDGET_CLASS}[data-gt-theme="dark"],
html.${ACCOUNT_WIDGET_CLASS}[data-gt-theme="dark"] body {
  background: transparent !important;
  background-color: transparent !important;
  color: var(--gt-account-text) !important;
}

html.${ACCOUNT_WIDGET_CLASS}.gt-theme-ogs-account-view[data-gt-theme="dark"] body :is(
  div,
  main,
  section,
  article,
  c-wiz
):has([${OGS_ACCOUNT_SURFACE_ATTRIBUTE}]):not([${OGS_ACCOUNT_SURFACE_ATTRIBUTE}]) {
  background: transparent !important;
  background-color: transparent !important;
}

html.${ACCOUNT_WIDGET_CLASS}.gt-theme-ogs-account-view[data-gt-theme="dark"] body > :not(script):not(style):not([${OGS_ACCOUNT_SURFACE_ATTRIBUTE}]) {
  background: transparent !important;
  background-color: transparent !important;
}

html.${ACCOUNT_WIDGET_CLASS}.gt-theme-ogs-account-view[data-gt-theme] [${OGS_ACCOUNT_SHELL_ATTRIBUTE}] {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

html.${ACCOUNT_WIDGET_CLASS}[data-gt-theme="dark"] [${OGS_ACCOUNT_SURFACE_ATTRIBUTE}] {
  background: var(--gt-account-surface) !important;
  background-color: var(--gt-account-surface) !important;
  border-color: var(--gt-account-border) !important;
  color: var(--gt-account-text) !important;
  color-scheme: dark;
}

html.${ACCOUNT_WIDGET_CLASS}[data-gt-theme="dark"] :is(div, span, p, h1, h2, h3, h4, header, footer, form) {
  border-color: var(--gt-account-border) !important;
  color: inherit !important;
}

html.${ACCOUNT_WIDGET_CLASS}[data-gt-theme="dark"] [${OGS_ACCOUNT_SURFACE_ATTRIBUTE}][${OGS_DARK_SURFACE_ATTRIBUTE}] [${OGS_ACCOUNT_ACTION_ATTRIBUTE}] {
  background: var(--gt-account-surface-raised) !important;
  background-color: var(--gt-account-surface-raised) !important;
  border-color: var(--gt-account-border) !important;
  color: var(--gt-account-text) !important;
}

html.${ACCOUNT_WIDGET_CLASS}[data-gt-theme="dark"] [${OGS_ACCOUNT_SURFACE_ATTRIBUTE}][${OGS_DARK_SURFACE_ATTRIBUTE}] [${OGS_ACCOUNT_ACTION_ATTRIBUTE}]:hover,
html.${ACCOUNT_WIDGET_CLASS}[data-gt-theme="dark"] [${OGS_ACCOUNT_SURFACE_ATTRIBUTE}][${OGS_DARK_SURFACE_ATTRIBUTE}] [${OGS_ACCOUNT_ACTION_ATTRIBUTE}]:focus-visible {
  background: var(--gt-account-surface-hover) !important;
  background-color: var(--gt-account-surface-hover) !important;
  color: var(--gt-account-text) !important;
}

html.${ACCOUNT_WIDGET_CLASS}[data-gt-theme="dark"] [${OGS_ACCOUNT_SURFACE_ATTRIBUTE}][${OGS_DARK_SURFACE_ATTRIBUTE}] :is(button, [role="button"], a[role="button"]):is(
  [aria-label*="Close" i],
  [aria-label*="关闭"],
  [aria-label*="Dismiss" i]
),
html.${ACCOUNT_WIDGET_CLASS}[data-gt-theme="dark"] [${OGS_ACCOUNT_SURFACE_ATTRIBUTE}][${OGS_DARK_SURFACE_ATTRIBUTE}] :is([aria-label*="Close" i], [aria-label*="关闭"], [aria-label*="Dismiss" i]) {
  background: transparent !important;
  background-color: transparent !important;
  color: var(--gt-account-text-muted) !important;
}

html.${ACCOUNT_WIDGET_CLASS}[data-gt-theme="dark"] a {
  color: var(--gt-account-blue) !important;
}

html.${ACCOUNT_WIDGET_CLASS}[data-gt-theme="dark"] [${OGS_ACCOUNT_SURFACE_ATTRIBUTE}][${OGS_DARK_SURFACE_ATTRIBUTE}] [${OGS_ACCOUNT_ACTION_ATTRIBUTE}] :is(svg, .material-icons, .material-icons-extended) {
  color: var(--gt-account-blue) !important;
  fill: var(--gt-account-blue) !important;
}

html.${ACCOUNT_WIDGET_CLASS}[data-gt-theme="dark"] [${OGS_ACCOUNT_SURFACE_ATTRIBUTE}][${OGS_DARK_SURFACE_ATTRIBUTE}] [${OGS_ACCOUNT_ACTION_ATTRIBUTE}] svg {
  color: var(--gt-account-blue) !important;
}

html.${ACCOUNT_WIDGET_CLASS}[data-gt-theme="dark"] :is(img, picture, canvas) {
  filter: none !important;
  opacity: 1 !important;
}

html.${ACCOUNT_WIDGET_CLASS}[data-gt-theme="dark"] [${OGS_ACCOUNT_SURFACE_ATTRIBUTE}] :is(
  img,
  picture,
  canvas,
  [style*="background-image"]
) {
  background-color: transparent !important;
  filter: none !important;
  mix-blend-mode: normal !important;
  opacity: 1 !important;
}
`;

    appendStyleElement(style);
  }

  function watchDynamicActionControls() {
    document.addEventListener(
      "pointerover",
      (event) => {
        syncSourceActionControlAfterDynamicState(event.target?.closest?.(ACTION_BUTTON_SELECTOR), getEffectiveTheme());
        syncHandwritingCursorTarget(event.target?.closest?.(HANDWRITING_CURSOR_SELECTOR), getEffectiveTheme());
      },
      true
    );

    document.addEventListener(
      "focusin",
      (event) => {
        syncSourceActionControlAfterDynamicState(event.target?.closest?.(ACTION_BUTTON_SELECTOR), getEffectiveTheme());
      },
      true
    );
  }

  function watchDocumentUploadFileCards() {
    if (!IS_TRANSLATE_PAGE) {
      return;
    }

    document.addEventListener(
      "input",
      (event) => {
        if (isDocumentFileInput(event.target)) {
          scheduleDocumentUploadFileCardSync(event.target);
        }
      },
      true
    );

    document.addEventListener(
      "change",
      (event) => {
        if (isDocumentFileInput(event.target)) {
          scheduleDocumentUploadFileCardSync(event.target);
        }
      },
      true
    );

    document.addEventListener("drop", (event) => scheduleDocumentUploadFileCardSync(event.target), true);
  }

  function isDocumentFileInput(target) {
    return target instanceof HTMLInputElement && target.type === "file";
  }

  function scheduleDocumentUploadFileCardSync(scope) {
    const scopes = scope instanceof Element ? [scope] : undefined;

    window.requestAnimationFrame(() => syncDocumentUploadFileCards(getEffectiveTheme(), scopes));
    [120, 500, 1200].forEach((delay) => {
      window.setTimeout(() => syncDocumentUploadFileCards(getEffectiveTheme(), scopes), delay);
    });
  }

  function syncSourceActionControlAfterDynamicState(control, effectiveTheme = getEffectiveTheme()) {
    syncSourceActionControl(control, effectiveTheme);

    if (!control || effectiveTheme !== "dark") {
      return;
    }

    window.requestAnimationFrame(() => syncSourceActionControl(control, getEffectiveTheme()));
    window.setTimeout(() => syncSourceActionControl(control, getEffectiveTheme()), 80);
  }

  function syncSourceActionControls(effectiveTheme = getEffectiveTheme(), scopes) {
    if (effectiveTheme !== "dark") {
      clearPatchedActionControls(scopes);
      return;
    }

    const panelTextCache = new WeakMap();

    queryAllInScopes(scopes, ACTION_BUTTON_SELECTOR).forEach((control) => {
      syncSourceActionControl(control, effectiveTheme, panelTextCache);
    });
  }

  function syncSourceActionControl(control, effectiveTheme = getEffectiveTheme(), panelTextCache = new WeakMap()) {
    if (!control || effectiveTheme !== "dark") {
      return;
    }

    const actionType = getSourceActionControlType(control, panelTextCache);

    if (!actionType) {
      if (control.hasAttribute(ACTION_PATCHED_ATTRIBUTE)) {
        clearPatchedActionControl(control);
      }
      return;
    }

    if (actionType === "icon") {
      patchIconActionControl(control, panelTextCache);
      return;
    }

    if (actionType === "dictionary") {
      patchDictionaryActionControl(control, panelTextCache);
    }
  }

  function getSourceActionControlType(control, panelTextCache) {
    if (!isCandidateTranslateActionControl(control)) {
      return "";
    }

    const actionText = getActionControlText(control, panelTextCache);
    if (NON_TRANSLATE_ACTION_LABEL_RE.test(actionText)) {
      return "";
    }

    const isIconAction = ICON_ACTION_LABEL_RE.test(actionText);
    const isDictionaryAction = DICTIONARY_ACTION_RE.test(actionText);

    if (!isIconAction && !isDictionaryAction) {
      return "";
    }

    const panel = findTranslateActionPanel(control, panelTextCache);

    if (!isStableTranslateActionContext(actionText, panel)) {
      return "";
    }

    if (isIconAction) {
      return "icon";
    }

    if (isDictionaryAction) {
      return "dictionary";
    }

    return "";
  }

  function isCandidateTranslateActionControl(control) {
    return (
      IS_TRANSLATE_PAGE &&
      control instanceof Element &&
      control.matches(ACTION_BUTTON_SELECTOR) &&
      !control.closest(ACTION_EXCLUDED_ANCESTOR_SELECTOR) &&
      !isHistoryOrSavedPanelDescendant(control)
    );
  }

  function isHistoryOrSavedPanelDescendant(control) {
    if (!(control instanceof HTMLElement)) {
      return false;
    }

    if (control.closest(`[${HISTORY_PANEL_ATTRIBUTE}], [${SAVED_PANEL_ATTRIBUTE}]`)) {
      return true;
    }

    let current = control;
    let depth = 0;
    while (current && current !== document.body && current !== document.documentElement && depth < 12) {
      if (isHistoryPanel(current) || isSavedPanel(current)) {
        return true;
      }

      current = current.parentElement;
      depth += 1;
    }

    return false;
  }

  function isStableTranslateActionContext(actionText, panel) {
    return TRANSLATE_ACTION_CONTEXT_RE.test(actionText) || Boolean(panel);
  }

  function getActionControlText(control, panelTextCache) {
    const labels = [];
    collectActionLabelText(control, labels, true);

    control.querySelectorAll("[aria-label], [aria-labelledby], [aria-describedby], [title], [data-tooltip], [data-tooltip-label]").forEach((element) => {
      collectActionLabelText(element, labels, false);
    });

    const boundary = getActionTextBoundary(control, panelTextCache);
    let ancestor = control.parentElement;
    let depth = 0;
    while (ancestor && ancestor !== boundary && depth < 4) {
      collectActionLabelText(ancestor, labels, false);
      ancestor = ancestor.parentElement;
      depth += 1;
    }

    return labels
      .filter(Boolean)
      .join(" ");
  }

  function getActionTextBoundary(control, panelTextCache) {
    return findTranslateActionPanel(control, panelTextCache) || control.closest(ACTION_CONTEXT_SELECTOR) || document.body;
  }

  function findTranslateActionPanel(control, panelTextCache = new WeakMap()) {
    let current = control?.parentElement;
    let depth = 0;

    while (current && current !== document.body && depth < 10) {
      if (isStableTranslateActionPanel(current, panelTextCache)) {
        return current;
      }

      current = current.parentElement;
      depth += 1;
    }

    return null;
  }

  function isStableTranslateActionPanel(element, panelTextCache) {
    return (
      element instanceof Element &&
      !element.matches(ACTION_EXCLUDED_ANCESTOR_SELECTOR) &&
      TRANSLATE_ACTION_CONTEXT_RE.test(getTranslateActionPanelText(element, panelTextCache))
    );
  }

  function getTranslateActionPanelText(element, panelTextCache) {
    if (panelTextCache?.has(element)) {
      return panelTextCache.get(element);
    }

    const labels = [];
    collectActionLabelText(element, labels, false);

    element.querySelectorAll(ACTION_PANEL_SIGNAL_SELECTOR).forEach((signal) => {
      collectActionLabelText(signal, labels, true);
    });

    const text = labels.filter(Boolean).join(" ");
    panelTextCache?.set(element, text);
    return text;
  }

  function collectActionLabelText(element, labels, includeOwnText) {
    if (!element) {
      return;
    }

    ["aria-label", "title", "data-tooltip", "data-tooltip-label"].forEach((attribute) => {
      labels.push(element.getAttribute(attribute));
    });

    collectReferencedLabelText(element.getAttribute("aria-labelledby"), labels);
    collectReferencedLabelText(element.getAttribute("aria-describedby"), labels);

    if (includeOwnText) {
      labels.push(element.textContent);
    }
  }

  function collectReferencedLabelText(idList, labels) {
    if (!idList) {
      return;
    }

    idList
      .split(/\s+/)
      .map((id) => id.trim())
      .filter(Boolean)
      .forEach((id) => {
        const label = document.getElementById(id);
        if (label) {
          labels.push(label.textContent);
        }
      });
  }

  function patchIconActionControl(control, panelTextCache) {
    markActionControl(control, panelTextCache);
    control.style.setProperty("border-color", "transparent", "important");
    control.style.setProperty("box-shadow", "none", "important");
    control.style.setProperty("color", "var(--gt-theme-control-color)", "important");
    control.style.setProperty("outline", "none", "important");
    neutralizeActionRipple(control);
    clearActionStateLayers(control);
  }

  function patchDictionaryActionControl(control, panelTextCache) {
    markActionControl(control, panelTextCache);
    control.style.setProperty("background", "transparent", "important");
    control.style.setProperty("background-color", "transparent", "important");
    control.style.setProperty("border-color", "transparent", "important");
    control.style.setProperty("box-shadow", "none", "important");
    control.style.setProperty("outline", "none", "important");
    neutralizeActionRipple(control);
    clearActionStateLayers(control);
  }

  function neutralizeActionRipple(control) {
    control.style.setProperty("--mdc-ripple-color", "transparent", "important");
    control.style.setProperty("--mdc-ripple-hover-opacity", "0", "important");
    control.style.setProperty("--mdc-ripple-focus-opacity", "0", "important");
    control.style.setProperty("--mdc-ripple-pressed-opacity", "0", "important");
    control.style.setProperty("--mdc-icon-button-hover-state-layer-opacity", "0", "important");
    control.style.setProperty("--mdc-icon-button-focus-state-layer-opacity", "0", "important");
    control.style.setProperty("--mdc-icon-button-pressed-state-layer-opacity", "0", "important");
    control.style.setProperty("--gm3-icon-button-hover-state-layer-color", "transparent", "important");
    control.style.setProperty("--gm3-icon-button-focus-state-layer-color", "transparent", "important");
    control.style.setProperty("--gm3-icon-button-pressed-state-layer-color", "transparent", "important");
    control.style.setProperty("--gm3-icon-button-hover-state-layer-opacity", "0", "important");
    control.style.setProperty("--gm3-icon-button-focus-state-layer-opacity", "0", "important");
    control.style.setProperty("--gm3-icon-button-pressed-state-layer-opacity", "0", "important");
    control.style.setProperty("--gm3-icon-button-hover-container-color", "transparent", "important");
    control.style.setProperty("--gm3-icon-button-focus-container-color", "transparent", "important");
    control.style.setProperty("--gm3-icon-button-pressed-container-color", "transparent", "important");
    control.style.setProperty("--gm3-icon-button-hover-container-opacity", "0", "important");
    control.style.setProperty("--gm3-icon-button-focus-container-opacity", "0", "important");
    control.style.setProperty("--gm3-icon-button-pressed-container-opacity", "0", "important");
  }

  function clearActionStateLayers(control) {
    getDecorativeActionStateLayers(control).forEach((layer) => {
      layer.setAttribute(ACTION_STATE_LAYER_ATTRIBUTE, "");
      setActionStateLayerStyles(layer);
    });
  }

  function getDecorativeActionStateLayers(control) {
    return Array.from(control.children).filter(isDecorativeActionStateLayer);
  }

  function isDecorativeActionStateLayer(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    if (element.hasAttribute(ACTION_STATE_LAYER_ATTRIBUTE)) {
      return true;
    }

    if (element.matches("svg, img, canvas, input, textarea, select, option")) {
      return false;
    }

    if (element.getAttribute("role") && element.getAttribute("role") !== "presentation") {
      return false;
    }

    if (element.hasAttribute("aria-label") || element.hasAttribute("aria-labelledby")) {
      return false;
    }

    if (element.textContent.trim()) {
      return false;
    }

    return !element.querySelector(
      "svg, img, canvas, input, textarea, select, option, [aria-label], [aria-labelledby], [role]:not([role='presentation'])",
    );
  }

  function setActionStateLayerStyles(layer) {
    layer.style.setProperty("background", "transparent", "important");
    layer.style.setProperty("background-color", "transparent", "important");
    layer.style.setProperty("box-shadow", "none", "important");
    layer.style.setProperty("opacity", "0", "important");
  }

  function markActionControl(control, panelTextCache) {
    control.setAttribute(ACTION_PATCHED_ATTRIBUTE, "");
    markActionScope(control, panelTextCache);
  }

  function clearPatchedActionControls(scopes) {
    queryAllInScopes(scopes, `[${ACTION_PATCHED_ATTRIBUTE}]`).forEach((control) => {
      clearPatchedActionControl(control);
    });

    queryAllInScopes(scopes, `[${ACTION_SCOPE_ATTRIBUTE}]`).forEach((scope) => {
      scope.removeAttribute(ACTION_SCOPE_ATTRIBUTE);
    });
  }

  function markActionScope(control, panelTextCache) {
    const scope = findActionScope(control, panelTextCache);

    if (scope && scope !== document.body && scope !== document.documentElement) {
      scope.setAttribute(ACTION_SCOPE_ATTRIBUTE, "");
    }
  }

  function findActionScope(control, panelTextCache) {
    return findTranslateActionPanel(control, panelTextCache) || control.parentElement;
  }

  function clearPatchedActionControl(control) {
    ACTION_INLINE_PROPERTIES.forEach((property) => control.style.removeProperty(property));
    control.removeAttribute(ACTION_PATCHED_ATTRIBUTE);

    control.querySelectorAll(`[${ACTION_STATE_LAYER_ATTRIBUTE}]`).forEach((layer) => {
      ACTION_STATE_LAYER_INLINE_PROPERTIES.forEach((property) => layer.style.removeProperty(property));
      layer.removeAttribute(ACTION_STATE_LAYER_ATTRIBUTE);
    });
  }

  function syncDocumentUploadFileCards(effectiveTheme = getEffectiveTheme(), scopes) {
    clearDocumentUploadFileCards(scopes);

    if (!IS_TRANSLATE_PAGE || effectiveTheme !== "dark") {
      return;
    }

    queryAllInScopes(scopes, ACTION_BUTTON_SELECTOR).forEach((control) => {
      const card = findDocumentUploadFileCardFromControl(control);

      if (!card) {
        return;
      }

      card.setAttribute(DOCUMENT_FILE_CARD_ATTRIBUTE, "");
    });
  }

  function clearDocumentUploadFileCards(scopes) {
    clearAttributeInScopes(DOCUMENT_FILE_CARD_ATTRIBUTE, scopes);
  }

  function findDocumentUploadFileCardFromControl(control) {
    if (!(control instanceof Element) || !control.matches(ACTION_BUTTON_SELECTOR)) {
      return null;
    }

    const labelText = getDocumentControlLabelText(control);
    const isExplicitClearFileControl = DOCUMENT_CLEAR_FILE_LABEL_RE.test(labelText);
    const isGenericClearIcon = DOCUMENT_GENERIC_CLEAR_ICON_RE.test(labelText.trim());

    if (!isExplicitClearFileControl && !isGenericClearIcon) {
      return null;
    }

    return findDocumentUploadFileCard(control);
  }

  function getDocumentControlLabelText(control) {
    const labels = [];
    collectActionLabelText(control, labels, true);

    control.querySelectorAll("[aria-label], [aria-labelledby], [aria-describedby], [title], [data-tooltip], [data-tooltip-label]").forEach((element) => {
      collectActionLabelText(element, labels, true);
    });

    return labels.filter(Boolean).join(" ");
  }

  function findDocumentUploadFileCard(control) {
    let current = control?.parentElement;
    let depth = 0;

    while (current && current !== document.body && depth < 8) {
      if (isDocumentUploadFileCard(current, control)) {
        return current;
      }

      current = current.parentElement;
      depth += 1;
    }

    return null;
  }

  function isDocumentUploadFileCard(element, control) {
    if (!(element instanceof HTMLElement) || !element.contains(control)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 220 || rect.width > 1100 || rect.height < 40 || rect.height > 180) {
      return false;
    }

    return DOCUMENT_FILE_NAME_RE.test(element.textContent || "");
  }

  function syncDetailsEmptyStates(effectiveTheme = getEffectiveTheme(), scopes) {
    clearDetailsEmptyStates(scopes);

    if (!IS_TRANSLATE_PAGE || effectiveTheme !== "dark") {
      return;
    }

    queryAllInScopes(scopes, "h1, h2, h3, h4, [role='heading'], p, div, span").forEach((candidate) => {
      if (!isDetailsEmptyStateText(candidate)) {
        return;
      }

      const emptyState = findDetailsEmptyStateRoot(candidate);
      if (!emptyState) {
        return;
      }

      emptyState.setAttribute(DETAILS_EMPTY_STATE_ATTRIBUTE, "");
      markDetailsEmptyStateArtwork(emptyState, candidate);
    });
  }

  function clearDetailsEmptyStates(scopes) {
    clearAttributeInScopes(DETAILS_EMPTY_ART_ATTRIBUTE, scopes);
    clearAttributeInScopes(DETAILS_EMPTY_STATE_ATTRIBUTE, scopes);
  }

  function isDetailsEmptyStateText(element) {
    if (!(element instanceof HTMLElement) || !isRenderedElement(element)) {
      return false;
    }

    const text = getNormalizedText(element.textContent);
    return text.length <= 140 && DETAILS_EMPTY_STATE_RE.test(text);
  }

  function findDetailsEmptyStateRoot(textElement) {
    let best = null;
    let current = textElement;
    let depth = 0;

    while (current && current !== document.body && current !== document.documentElement && depth < 6) {
      if (!isDetailsEmptyStateRoot(current, textElement)) {
        break;
      }

      best = current;
      current = current.parentElement;
      depth += 1;
    }

    return best;
  }

  function isDetailsEmptyStateRoot(element, textElement) {
    if (!(element instanceof HTMLElement) || !element.contains(textElement) || !isRenderedElement(element)) {
      return false;
    }

    const text = getNormalizedText(element.textContent);
    if (!DETAILS_EMPTY_STATE_RE.test(text) || text.length > 180) {
      return false;
    }

    if (element.querySelector("button, a, input, textarea, select, option")) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width >= 120 && rect.width <= 560 && rect.height >= 48 && rect.height <= 380;
  }

  function markDetailsEmptyStateArtwork(emptyState, textElement) {
    emptyState.querySelectorAll("svg, img, canvas, div, span").forEach((candidate) => {
      if (isDetailsEmptyStateArtwork(candidate, emptyState, textElement)) {
        candidate.setAttribute(DETAILS_EMPTY_ART_ATTRIBUTE, "");
      }
    });
  }

  function isDetailsEmptyStateArtwork(element, emptyState, textElement) {
    if (!(element instanceof Element) || element === emptyState || element.contains(textElement) || !emptyState.contains(element)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8 || rect.width > 340 || rect.height > 160) {
      return false;
    }

    const styles = window.getComputedStyle(element);
    if (styles.display === "none" || styles.visibility === "hidden" || styles.opacity === "0") {
      return false;
    }

    if (element.matches("svg, img, canvas")) {
      return true;
    }

    if (getNormalizedText(element.textContent)) {
      return false;
    }

    return hasLightDetailsEmptyStatePaint(styles);
  }

  function hasLightDetailsEmptyStatePaint(styles) {
    return (
      isLightThemeColor(styles.backgroundColor) ||
      (hasVisibleBorderEdge(styles.borderTopWidth, styles.borderTopStyle) && isLightThemeColor(styles.borderTopColor)) ||
      (hasVisibleBorderEdge(styles.borderBottomWidth, styles.borderBottomStyle) && isLightThemeColor(styles.borderBottomColor)) ||
      (hasVisibleBorderEdge(styles.borderLeftWidth, styles.borderLeftStyle) && isLightThemeColor(styles.borderLeftColor)) ||
      (hasVisibleBorderEdge(styles.borderRightWidth, styles.borderRightStyle) && isLightThemeColor(styles.borderRightColor))
    );
  }

  function syncDictionaryTranslationChips(effectiveTheme = getEffectiveTheme(), scopes) {
    clearDictionaryTranslationChips(scopes);

    if (!IS_TRANSLATE_PAGE || effectiveTheme !== "dark") {
      return;
    }

    getDictionaryTranslationPanels(scopes).forEach((panel) => {
      panel.setAttribute(DICTIONARY_PANEL_ATTRIBUTE, "");

      panel.querySelectorAll("span, div, button, a, [role='button']").forEach((candidate) => {
        if (isDictionaryTranslationChip(candidate, panel)) {
          candidate.setAttribute(DICTIONARY_TRANSLATION_CHIP_ATTRIBUTE, "");
        }
      });

      panel.querySelectorAll("h1, h2, h3, h4, [role='heading'], span, div").forEach((candidate) => {
        if (isDictionarySectionTitle(candidate, panel)) {
          candidate.setAttribute(DICTIONARY_SECTION_TITLE_ATTRIBUTE, "");
          markDictionarySectionHeader(candidate, panel);
        }
      });

      panel.querySelectorAll("hr, [role='separator'], div, span").forEach((candidate) => {
        if (isDictionaryDivider(candidate, panel)) {
          candidate.setAttribute(DICTIONARY_DIVIDER_ATTRIBUTE, "");
        }
      });
    });
  }

  function clearDictionaryTranslationChips(scopes) {
    clearAttributeInScopes(DICTIONARY_PANEL_ATTRIBUTE, scopes);
    clearAttributeInScopes(DICTIONARY_SECTION_HEADER_ATTRIBUTE, scopes);
    clearAttributeInScopes(DICTIONARY_SECTION_TITLE_ATTRIBUTE, scopes);
    clearAttributeInScopes(DICTIONARY_DIVIDER_ATTRIBUTE, scopes);
    clearAttributeInScopes(DICTIONARY_TRANSLATION_CHIP_ATTRIBUTE, scopes);
  }

  function getDictionaryTranslationPanels(scopes) {
    return getPanelCandidates(scopes).filter(isDictionaryTranslationPanel);
  }

  function isDictionaryTranslationPanel(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 120 || rect.height < 48 || rect.width > 1200 || rect.height > 900) {
      return false;
    }

    const text = element.textContent || "";
    return DICTIONARY_TRANSLATION_TITLE_RE.test(text) || (DICTIONARY_FREQUENCY_RE.test(text) && DICTIONARY_PART_OF_SPEECH_RE.test(text));
  }

  function isDictionaryTranslationChip(element, panel) {
    if (!(element instanceof HTMLElement) || element === panel || !panel.contains(element)) {
      return false;
    }

    const text = element.textContent.trim().replace(/\s+/g, " ");
    if (!text || text.length > 60 || DICTIONARY_FREQUENCY_RE.test(text) || DICTIONARY_PART_OF_SPEECH_RE.test(text)) {
      return false;
    }

    if (element.querySelector("input, textarea, select, option, svg, img, canvas")) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 24 || rect.width > 220 || rect.height < 14 || rect.height > 52) {
      return false;
    }

    const styles = window.getComputedStyle(element);
    if (styles.display === "none" || styles.visibility === "hidden") {
      return false;
    }

    return isLightThemeColor(styles.backgroundColor);
  }

  function isDictionarySectionTitle(element, panel) {
    if (!(element instanceof HTMLElement) || element === panel || !panel.contains(element)) {
      return false;
    }

    const text = element.textContent.trim().replace(/\s+/g, " ");
    if (!text || text.length > 80 || !DICTIONARY_SECTION_TITLE_RE.test(text)) {
      return false;
    }

    if (element.querySelector("input, textarea, select, option, svg, img, canvas")) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 48 || rect.width > 520 || rect.height < 12 || rect.height > 60) {
      return false;
    }

    const styles = window.getComputedStyle(element);
    return styles.display !== "none" && styles.visibility !== "hidden";
  }

  function markDictionarySectionHeader(title, panel) {
    let current = title.parentElement;
    let depth = 0;

    while (current && current !== panel && panel.contains(current) && depth < 6) {
      if (isDictionarySectionHeader(current, title)) {
        current.setAttribute(DICTIONARY_SECTION_HEADER_ATTRIBUTE, "");
        return;
      }

      current = current.parentElement;
      depth += 1;
    }
  }

  function isDictionarySectionHeader(element, title) {
    if (!(element instanceof HTMLElement) || element === title || !element.contains(title)) {
      return false;
    }

    const titleText = title.textContent.trim().replace(/\s+/g, " ");
    if (!titleText || !element.textContent.includes(titleText)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 120 || rect.width > 700 || rect.height < 12 || rect.height > 520) {
      return false;
    }

    const styles = window.getComputedStyle(element);
    if (styles.display === "none" || styles.visibility === "hidden") {
      return false;
    }

    return hasVisibleBorderEdge(styles.borderTopWidth, styles.borderTopStyle) && isVisibleCssColor(styles.borderTopColor);
  }

  function isDictionaryDivider(element, panel) {
    if (!(element instanceof HTMLElement) || element === panel || !panel.contains(element)) {
      return false;
    }

    if (element.textContent.trim() || element.querySelector("input, textarea, select, option, svg, img, canvas")) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 120 || rect.height > 6) {
      return false;
    }

    const styles = window.getComputedStyle(element);
    if (styles.display === "none" || styles.visibility === "hidden") {
      return false;
    }

    return hasVisibleDividerColor(styles);
  }

  function hasVisibleDividerColor(styles) {
    return (
      isVisibleCssColor(styles.backgroundColor) ||
      (hasVisibleBorderEdge(styles.borderTopWidth, styles.borderTopStyle) && isVisibleCssColor(styles.borderTopColor)) ||
      (hasVisibleBorderEdge(styles.borderBottomWidth, styles.borderBottomStyle) && isVisibleCssColor(styles.borderBottomColor))
    );
  }

  function hasVisibleBorderEdge(width, style) {
    return Number.parseFloat(width) > 0 && style !== "none" && style !== "hidden";
  }

  function isVisibleCssColor(color) {
    return Boolean(color && color !== "transparent" && color !== "rgba(0, 0, 0, 0)");
  }

  function isLightThemeColor(color) {
    const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) {
      return false;
    }

    const [, red, green, blue] = match.map(Number);
    return red >= 220 && green >= 220 && blue >= 220;
  }

  function syncHistoryPanels(effectiveTheme = getEffectiveTheme(), scopes) {
    clearHistoryPanelMarks(scopes);

    if (!IS_TRANSLATE_PAGE || effectiveTheme !== "dark") {
      return;
    }

    getHistoryPanels(scopes).forEach((panel) => {
      panel.setAttribute(HISTORY_PANEL_ATTRIBUTE, "");
      panel.querySelectorAll("span, div, p").forEach((candidate) => {
        if (isHistoryLanguagePairLabel(candidate, panel)) {
          candidate.setAttribute(HISTORY_LANGUAGE_PAIR_ATTRIBUTE, "");
        }
      });
      markHistoryEntries(panel);
    });
  }

  function clearHistoryPanelMarks(scopes) {
    queryAllInScopes(scopes, `[${HISTORY_ENTRY_STATE_LAYER_ATTRIBUTE}]`).forEach((layer) => {
      clearHistoryEntryStateLayer(layer);
    });
    clearAttributeInScopes(HISTORY_ENTRY_ATTRIBUTE, scopes);
    clearAttributeInScopes(HISTORY_LANGUAGE_PAIR_ATTRIBUTE, scopes);
    clearAttributeInScopes(HISTORY_PANEL_ATTRIBUTE, scopes);
  }

  function markHistoryEntries(panel) {
    panel.querySelectorAll(`[${HISTORY_LANGUAGE_PAIR_ATTRIBUTE}]`).forEach((languagePair) => {
      const entry = findHistoryEntryRoot(languagePair, panel);
      if (!entry) {
        return;
      }

      entry.setAttribute(HISTORY_ENTRY_ATTRIBUTE, "");
      markHistoryEntryStateLayers(entry);
    });
  }

  function findHistoryEntryRoot(languagePair, panel) {
    let best = null;
    let current = languagePair.parentElement;
    let depth = 0;

    while (current && current !== panel && panel.contains(current) && depth < 8) {
      if (isHistoryEntryRoot(current, languagePair, panel)) {
        best = current;
      }

      current = current.parentElement;
      depth += 1;
    }

    return best;
  }

  function isHistoryEntryRoot(element, languagePair, panel) {
    if (!(element instanceof HTMLElement) || element === panel || !element.contains(languagePair) || !isRenderedElement(element)) {
      return false;
    }

    const text = getNormalizedText(element.textContent);
    const languagePairText = getNormalizedText(languagePair.textContent);
    if (!text || text.length <= languagePairText.length + 8) {
      return false;
    }

    if (HISTORY_PANEL_TITLE_RE.test(text) && HISTORY_PANEL_ACTION_RE.test(text)) {
      return false;
    }

    if (element.querySelectorAll(`[${HISTORY_LANGUAGE_PAIR_ATTRIBUTE}]`).length !== 1) {
      return false;
    }

    if (element.querySelector("input, textarea, select, option")) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    if (rect.width < 160 || rect.width > panelRect.width + 24 || rect.height < 44 || rect.height > 700) {
      return false;
    }

    return true;
  }

  function markHistoryEntryStateLayers(entry) {
    entry.querySelectorAll("div, span").forEach((candidate) => {
      if (isHistoryEntryStateLayer(candidate, entry)) {
        candidate.setAttribute(HISTORY_ENTRY_STATE_LAYER_ATTRIBUTE, "");
        setHistoryEntryStateLayerStyles(candidate);
      }
    });
  }

  function isHistoryEntryStateLayer(element, entry) {
    if (!(element instanceof HTMLElement) || element === entry || !entry.contains(element)) {
      return false;
    }

    if (element.hasAttribute(HISTORY_ENTRY_STATE_LAYER_ATTRIBUTE)) {
      return true;
    }

    if (!isDecorativeActionStateLayer(element)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    const entryRect = entry.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 12 || rect.width > entryRect.width + 24 || rect.height > entryRect.height + 24) {
      return false;
    }

    const overlapsEntry =
      rect.right > entryRect.left && rect.left < entryRect.right && rect.bottom > entryRect.top && rect.top < entryRect.bottom;
    if (!overlapsEntry) {
      return false;
    }

    const styles = window.getComputedStyle(element);
    return styles.position === "absolute" || styles.position === "fixed" || styles.position === "sticky";
  }

  function setHistoryEntryStateLayerStyles(layer) {
    layer.style.setProperty("background", "transparent", "important");
    layer.style.setProperty("background-color", "transparent", "important");
    layer.style.setProperty("background-image", "none", "important");
    layer.style.setProperty("box-shadow", "none", "important");
    layer.style.setProperty("opacity", "0", "important");
    layer.style.setProperty("pointer-events", "none", "important");
  }

  function clearHistoryEntryStateLayer(layer) {
    HISTORY_ENTRY_STATE_LAYER_INLINE_PROPERTIES.forEach((property) => {
      layer.style.removeProperty(property);
    });
    layer.removeAttribute(HISTORY_ENTRY_STATE_LAYER_ATTRIBUTE);
  }

  function getHistoryPanels(scopes) {
    return getExtendedPanelCandidates(scopes).filter(isHistoryPanel);
  }

  function isHistoryPanel(element) {
    if (!(element instanceof HTMLElement) || !isRenderedElement(element)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 240 || rect.width > 560 || rect.height < 180 || rect.height > 1000) {
      return false;
    }

    const text = element.textContent || "";
    return HISTORY_PANEL_TITLE_RE.test(text) && HISTORY_PANEL_ACTION_RE.test(text);
  }

  function isHistoryLanguagePairLabel(element, panel) {
    if (!(element instanceof HTMLElement) || element === panel || !panel.contains(element) || !isRenderedElement(element)) {
      return false;
    }

    const text = getNormalizedText(element.textContent);
    if (!text || text.length > 96 || !HISTORY_LANGUAGE_PAIR_RE.test(text)) {
      return false;
    }

    if (element.querySelector("button, a, input, textarea, select, option, svg, img, canvas")) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 40 || rect.width > 360 || rect.height < 12 || rect.height > 40) {
      return false;
    }

    return true;
  }

  function syncSavedPanels(effectiveTheme = getEffectiveTheme(), scopes) {
    clearSavedPanelMarks(scopes);

    if (!IS_TRANSLATE_PAGE || effectiveTheme !== "dark") {
      return;
    }

    getSavedPanels(scopes).forEach((panel) => {
      panel.setAttribute(SAVED_PANEL_ATTRIBUTE, "");

      panel.querySelectorAll("h1, h2, h3, h4, [role='heading'], span, div, p").forEach((candidate) => {
        if (isSavedPanelTitle(candidate, panel)) {
          candidate.setAttribute(SAVED_TITLE_ATTRIBUTE, "");
        }

        if (isSavedLanguagePairLabel(candidate, panel)) {
          candidate.setAttribute(SAVED_LANGUAGE_PAIR_ATTRIBUTE, "");
        }
      });

      panel.querySelectorAll(ACTION_BUTTON_SELECTOR).forEach((control) => {
        if (isSavedStarControl(control, panel)) {
          control.setAttribute(SAVED_STAR_ATTRIBUTE, "");
        }

        if (isSavedSecondaryAction(control, panel)) {
          control.setAttribute(SAVED_SECONDARY_ACTION_ATTRIBUTE, "");
        }
      });
    });
  }

  function clearSavedPanelMarks(scopes) {
    clearAttributeInScopes(SAVED_SECONDARY_ACTION_ATTRIBUTE, scopes);
    clearAttributeInScopes(SAVED_STAR_ATTRIBUTE, scopes);
    clearAttributeInScopes(SAVED_LANGUAGE_PAIR_ATTRIBUTE, scopes);
    clearAttributeInScopes(SAVED_TITLE_ATTRIBUTE, scopes);
    clearAttributeInScopes(SAVED_PANEL_ATTRIBUTE, scopes);
  }

  function getSavedPanels(scopes) {
    return getExtendedPanelCandidates(scopes).filter(isSavedPanel);
  }

  function isSavedPanel(element) {
    if (!(element instanceof HTMLElement) || !isRenderedElement(element)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 240 || rect.width > 560 || rect.height < 180 || rect.height > 1000) {
      return false;
    }

    const text = getNormalizedText(element.textContent);
    if (!SAVED_PANEL_TITLE_RE.test(text)) {
      return false;
    }

    const hasSavedAction = SAVED_PANEL_ACTION_RE.test(text);
    const hasSavedEntry = HISTORY_LANGUAGE_PAIR_RE.test(text) && hasSavedStarControl(element);

    return hasSavedAction || hasSavedEntry;
  }

  function isSavedPanelTitle(element, panel) {
    if (!(element instanceof HTMLElement) || element === panel || !panel.contains(element) || !isRenderedElement(element)) {
      return false;
    }

    const text = getNormalizedText(element.textContent);
    if (!SAVED_PANEL_TITLE_EXACT_RE.test(text)) {
      return false;
    }

    if (element.querySelector("button, a, input, textarea, select, option, svg, img, canvas")) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width >= 24 && rect.width <= 420 && rect.height >= 18 && rect.height <= 72;
  }

  function isSavedLanguagePairLabel(element, panel) {
    if (!(element instanceof HTMLElement) || element === panel || !panel.contains(element) || !isRenderedElement(element)) {
      return false;
    }

    const text = getNormalizedText(element.textContent);
    if (!text || text.length > 96 || !HISTORY_LANGUAGE_PAIR_RE.test(text)) {
      return false;
    }

    if (element.querySelector("button, a, input, textarea, select, option, svg, img, canvas")) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width >= 64 && rect.width <= 360 && rect.height >= 14 && rect.height <= 48;
  }

  function hasSavedStarControl(panel) {
    return Array.from(panel.querySelectorAll(ACTION_BUTTON_SELECTOR)).some((control) => isSavedStarControl(control, panel));
  }

  function isSavedStarControl(control, panel) {
    if (!(control instanceof HTMLElement) || !panel.contains(control) || !isRenderedElement(control) || !isSavedIconButtonShape(control)) {
      return false;
    }

    const labelText = getSavedControlLabelText(control);
    const hasSaveLabel = SAVED_STAR_LABEL_RE.test(labelText);
    const hasStarSignal = hasStarIconSignal(control, labelText);

    return (hasSaveLabel && hasStarSignal) || (control.getAttribute("aria-pressed") === "true" && hasStarSignal);
  }

  function isSavedSecondaryAction(control, panel) {
    if (!(control instanceof HTMLElement) || !panel.contains(control) || !isRenderedElement(control) || isSavedStarControl(control, panel)) {
      return false;
    }

    const labelText = getSavedControlLabelText(control);
    if (!SAVED_SECONDARY_ACTION_RE.test(labelText)) {
      return false;
    }

    const rect = control.getBoundingClientRect();
    return rect.width >= 72 && rect.width <= 260 && rect.height >= 28 && rect.height <= 72;
  }

  function getSavedControlLabelText(control) {
    const labels = [];
    collectActionLabelText(control, labels, true);

    control.querySelectorAll("[aria-label], [aria-labelledby], [aria-describedby], [title], [data-tooltip], [data-tooltip-label]").forEach((element) => {
      collectActionLabelText(element, labels, true);
    });

    return getNormalizedText(labels.filter(Boolean).join(" "));
  }

  function hasStarIconSignal(control, labelText) {
    if (STAR_ICON_TEXT_RE.test(labelText)) {
      return true;
    }

    if (SAVED_STAR_LABEL_RE.test(labelText) && control.querySelector("svg")) {
      return true;
    }

    if (control.getAttribute("aria-pressed") === "true" && control.querySelector("svg")) {
      return true;
    }

    return Array.from(control.querySelectorAll("span, i, .material-icons, .material-icons-extended")).some((icon) => {
      const iconText = getNormalizedText(icon.textContent);
      return STAR_ICON_TEXT_RE.test(iconText);
    });
  }

  function isSavedIconButtonShape(control) {
    const rect = control.getBoundingClientRect();
    const shorterSide = Math.min(rect.width, rect.height);
    const longerSide = Math.max(rect.width, rect.height);

    return shorterSide >= 24 && longerSide <= 96 && longerSide / shorterSide <= 2.4;
  }

  function isRenderedElement(element) {
    const styles = window.getComputedStyle(element);
    return styles.display !== "none" && styles.visibility !== "hidden" && styles.opacity !== "0";
  }

  function syncHandwritingCursor(effectiveTheme = getEffectiveTheme(), scopes) {
    if (!IS_TRANSLATE_PAGE) {
      return;
    }

    queryAllInScopes(scopes, HANDWRITING_CURSOR_SELECTOR).forEach((target) => {
      syncHandwritingCursorTarget(target, effectiveTheme);
    });
  }

  function syncHandwritingCursorTarget(target, effectiveTheme = getEffectiveTheme()) {
    if (!target) {
      return;
    }

    if (effectiveTheme !== "dark") {
      clearHandwritingCursorTarget(target);
      return;
    }

    if (target.hasAttribute(HANDWRITING_CURSOR_PATCHED_ATTRIBUTE)) {
      return;
    }

    const cursor = parseCursorValue(window.getComputedStyle(target).cursor);

    if (!cursor) {
      return;
    }

    target.setAttribute(HANDWRITING_CURSOR_PATCHED_ATTRIBUTE, "");
    target.setAttribute(HANDWRITING_CURSOR_INLINE_ATTRIBUTE, target.style.getPropertyValue("cursor"));
    target.setAttribute(HANDWRITING_CURSOR_PRIORITY_ATTRIBUTE, target.style.getPropertyPriority("cursor"));

    getInvertedCursorDataUrl(cursor.url)
      .then((dataUrl) => {
        if (!target.isConnected || getEffectiveTheme() !== "dark") {
          return;
        }

        target.style.setProperty("cursor", `url("${dataUrl}")${cursor.hotspot}, ${cursor.fallback}`, "important");
      })
      .catch(() => {
        clearHandwritingCursorTarget(target);
      });
  }

  function clearHandwritingCursorTarget(target) {
    if (!target?.hasAttribute?.(HANDWRITING_CURSOR_PATCHED_ATTRIBUTE)) {
      return;
    }

    const originalCursor = target.getAttribute(HANDWRITING_CURSOR_INLINE_ATTRIBUTE) || "";
    const originalPriority = target.getAttribute(HANDWRITING_CURSOR_PRIORITY_ATTRIBUTE) || "";

    if (originalCursor) {
      target.style.setProperty("cursor", originalCursor, originalPriority);
    } else {
      target.style.removeProperty("cursor");
    }

    target.removeAttribute(HANDWRITING_CURSOR_PATCHED_ATTRIBUTE);
    target.removeAttribute(HANDWRITING_CURSOR_INLINE_ATTRIBUTE);
    target.removeAttribute(HANDWRITING_CURSOR_PRIORITY_ATTRIBUTE);
  }

  function parseCursorValue(cursorValue) {
    const match = cursorValue.match(/url\((['"]?)(.*?)\1\)\s*(?:(\d+)\s+(\d+))?\s*(?:,\s*(.*))?$/);

    if (!match?.[2]) {
      return null;
    }

    const hotspot = match[3] && match[4] ? ` ${match[3]} ${match[4]}` : "";
    const fallback = match[5] || "auto";

    return {
      fallback,
      hotspot,
      url: match[2],
    };
  }

  function getInvertedCursorDataUrl(url) {
    if (!invertedCursorCache.has(url)) {
      invertedCursorCache.set(url, invertCursorImage(url));
    }

    return invertedCursorCache.get(url);
  }

  function invertCursorImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();

      if (!url.startsWith("data:")) {
        image.crossOrigin = "anonymous";
      }

      image.addEventListener(
        "load",
        () => {
          try {
            const width = image.naturalWidth || image.width;
            const height = image.naturalHeight || image.height;
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (!width || !height || !context) {
              reject(new Error("Cannot invert cursor image"));
              return;
            }

            canvas.width = width;
            canvas.height = height;
            context.drawImage(image, 0, 0);

            const imageData = context.getImageData(0, 0, width, height);
            const pixels = imageData.data;

            for (let index = 0; index < pixels.length; index += 4) {
              pixels[index] = 255 - pixels[index];
              pixels[index + 1] = 255 - pixels[index + 1];
              pixels[index + 2] = 255 - pixels[index + 2];
            }

            context.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } catch (error) {
            reject(error);
          }
        },
        { once: true }
      );

      image.addEventListener("error", reject, { once: true });
      image.src = url;
    });
  }

  function syncInputToolsMenus(effectiveTheme = getEffectiveTheme(), scopes) {
    if (!IS_TRANSLATE_PAGE) {
      return;
    }

    queryAllInScopes(scopes, INPUT_TOOLS_MENU_SELECTOR).forEach((menu) => {
      if (effectiveTheme === "dark") {
        applyInputToolsMenuInlineStyles(menu);
      } else {
        clearInputToolsMenuInlineStyles(menu);
      }
    });

    queryAllInScopes(scopes, INPUT_TOOLS_STATUSBAR_SELECTOR).forEach((statusbar) => {
      clearInputToolsMenuInlineStyles(statusbar);
    });
  }

  function applyInputToolsMenuInlineStyles(menu) {
    menu.style.setProperty("background", "var(--gt-theme-surface-raised)", "important");
    menu.style.setProperty("background-color", "var(--gt-theme-surface-raised)", "important");
    menu.style.setProperty("border", "1px solid var(--gt-theme-border)", "important");
    menu.style.setProperty("border-radius", "4px", "important");
    menu.style.setProperty("box-shadow", "0 8px 24px rgba(0, 0, 0, 0.42)", "important");
    menu.style.setProperty("color", "var(--gt-theme-text)", "important");
    menu.style.setProperty("color-scheme", "dark", "important");

    menu.querySelectorAll(".ita-kd-menuitem, .ita-kd-menuitem-span, .ita-kd-menuitem-inputtool-name, .ita-kd-menuitem-setting, .ita-kd-icon-button, .ita-kd-dropdown, td").forEach((element) => {
      element.style.setProperty("background", "transparent", "important");
      element.style.setProperty("background-color", "transparent", "important");
      element.style.setProperty("color", "var(--gt-theme-text)");
    });

    menu.querySelectorAll(".ita-kd-img").forEach((image) => {
      image.style.setProperty(
        "filter",
        "invert(75%) sepia(48%) saturate(685%) hue-rotate(183deg) brightness(102%) contrast(95%)",
        "important"
      );
      image.style.setProperty("opacity", "1", "important");
    });
  }

  function clearInputToolsMenuInlineStyles(menu) {
    INPUT_TOOLS_MENU_INLINE_PROPERTIES.forEach((property) => menu.style.removeProperty(property));
    menu.querySelectorAll(".ita-kd-menuitem, .ita-kd-menuitem-span, .ita-kd-menuitem-inputtool-name, .ita-kd-menuitem-setting, .ita-kd-icon-button, .ita-kd-dropdown, td, .ita-kd-img").forEach((element) => {
      INPUT_TOOLS_MENU_TEXT_INLINE_PROPERTIES.forEach((property) => element.style.removeProperty(property));
      ["background", "background-color"].forEach((property) => element.style.removeProperty(property));
    });
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
:root {
  --gt-theme-control-color: #5f6368;
  --gt-theme-control-hover: rgba(60, 64, 67, 0.08);
  --gt-theme-focus-ring: #1a73e8;
}

html[data-gt-theme="light"] {
  color-scheme: light;
}

html.gt-theme-switching,
html.gt-theme-switching *,
html.gt-theme-switching *::before,
html.gt-theme-switching *::after {
  transition: none !important;
}


html[data-gt-theme="dark"] {
  color-scheme: dark;
  --gt-theme-page: #202124;
  --gt-theme-surface: #202124;
  --gt-theme-surface-raised: #303134;
  --gt-theme-surface-tinted: #303134;
  --gt-theme-border: #5f6368;
  --gt-theme-border-soft: #3c4043;
  --gt-theme-text: #e8eaed;
  --gt-theme-text-muted: #bdc1c6;
  --gt-theme-text-subtle: #9aa0a6;
  --gt-theme-blue: #8ab4f8;
  --gt-theme-blue-bg: #1f3b5f;
  --gt-theme-blue-container-text: #d3e3fd;
  --gt-theme-control-color: #bdc1c6;
  --gt-theme-control-hover: rgba(232, 234, 237, 0.08);
  --gt-theme-focus-ring: #8ab4f8;
  --gm3-sys-color-background: var(--gt-theme-page);
  --gm3-sys-color-on-background: var(--gt-theme-text);
  --gm3-sys-color-surface: var(--gt-theme-surface-raised);
  --gm3-sys-color-surface-bright: #3c4043;
  --gm3-sys-color-surface-container: var(--gt-theme-surface-raised);
  --gm3-sys-color-surface-container-high: #3c4043;
  --gm3-sys-color-surface-container-highest: #4d5156;
  --gm3-sys-color-surface-container-low: var(--gt-theme-page);
  --gm3-sys-color-surface-container-lowest: #131314;
  --gm3-sys-color-surface-dim: #1f1f1f;
  --gm3-sys-color-surface-variant: #444746;
  --gm3-sys-color-on-surface: var(--gt-theme-text);
  --gm3-sys-color-on-surface-variant: var(--gt-theme-text-muted);
  --gm3-sys-color-outline: var(--gt-theme-border);
  --gm3-sys-color-outline-variant: var(--gt-theme-border-soft);
  --gm3-sys-color-primary: var(--gt-theme-blue);
  --gm3-sys-color-on-primary: #202124;
  --gm3-sys-color-primary-container: var(--gt-theme-blue-bg);
  --gm3-sys-color-on-primary-container: var(--gt-theme-blue-container-text);
  --gm3-sys-color-secondary: var(--gt-theme-blue);
  --gm3-sys-color-on-secondary: #202124;
  --gm3-sys-color-secondary-container: #3c4043;
  --gm3-sys-color-on-secondary-container: var(--gt-theme-blue);
  --gm3-dropdown-button-filled-tonal-container-color: var(--gt-theme-surface-raised);
  --gm3-dropdown-button-filled-tonal-hover-container-color: #3c4043;
  --gm3-dropdown-button-filled-tonal-focus-container-color: #3c4043;
  --gm3-dropdown-button-filled-tonal-pressed-container-color: #3c4043;
  --gm3-dropdown-button-filled-tonal-label-text-color: var(--gt-theme-blue);
  --gm3-dropdown-button-filled-tonal-hover-label-text-color: var(--gt-theme-blue);
  --gm3-dropdown-button-filled-tonal-focus-label-text-color: var(--gt-theme-blue);
  --gm3-dropdown-button-filled-tonal-pressed-label-text-color: var(--gt-theme-blue);
  --mdc-theme-background: var(--gt-theme-page);
  --mdc-theme-surface: var(--gt-theme-surface-raised);
  --mdc-theme-on-surface: var(--gt-theme-text);
  --mdc-theme-primary: var(--gt-theme-blue);
  --mdc-theme-on-primary: #202124;
}

html[data-gt-theme="dark"] ${TRANSLATION_MODEL_BUTTON_SELECTOR},
html[data-gt-theme="dark"] ${TRANSLATION_MODEL_BUTTON_SELECTOR}:hover,
html[data-gt-theme="dark"] ${TRANSLATION_MODEL_BUTTON_SELECTOR}:focus,
html[data-gt-theme="dark"] ${TRANSLATION_MODEL_BUTTON_SELECTOR}:focus-visible {
  background-color: transparent !important;
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] ${TRANSLATION_MODEL_BUTTON_SELECTOR} > :is(span, svg, .material-icons, .material-icons-extended),
html[data-gt-theme="dark"] ${TRANSLATION_MODEL_BUTTON_SELECTOR} > :is(span, svg, .material-icons, .material-icons-extended) * {
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] ${TRANSLATION_MODEL_BUTTON_SELECTOR} svg :is(path, circle, ellipse, line, polyline, polygon):not([fill="none"]) {
  fill: currentColor !important;
}

html[data-gt-theme="dark"] ${TRANSLATION_MODEL_BUTTON_SELECTOR} svg [fill="none"] {
  fill: none !important;
}

html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR} {
  border-color: var(--gt-theme-border) !important;
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}[aria-current="page"],
html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}[aria-current="true"],
html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}[aria-pressed="true"] {
  background-color: var(--gt-theme-blue-bg) !important;
  border-color: transparent !important;
  color: var(--gt-theme-blue-container-text) !important;
}

html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}:hover,
html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}:focus-visible {
  background-color: rgba(138, 180, 248, 0.1) !important;
}

html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}[aria-current="page"]:hover,
html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}[aria-current="page"]:focus-visible,
html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}[aria-current="true"]:hover,
html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}[aria-current="true"]:focus-visible,
html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}[aria-pressed="true"]:hover,
html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}[aria-pressed="true"]:focus-visible {
  background-color: #284b78 !important;
}

html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR} * {
  color: inherit !important;
}

html[data-gt-theme="dark"] c-wiz[role="main"] :is(div, c-wiz):has([role="tab"])::after {
  background-color: transparent !important;
  background-image: linear-gradient(to right, rgba(32, 33, 36, 0), var(--gt-theme-page)) !important;
}

html[data-gt-theme="dark"] nav:has(${TRANSLATION_TYPE_BUTTON_SELECTOR})::after {
  background-color: transparent !important;
  background-image: linear-gradient(to right, rgba(32, 33, 36, 0), var(--gt-theme-page)) !important;
}

html[data-gt-theme="dark"] [role="dialog"][aria-label*="drawer" i] :is(a, [role="link"]):is([aria-label*="Google"], [title*="Google"]) {
  background-color: transparent !important;
  box-shadow: none !important;
}

html[data-gt-theme="dark"] [role="dialog"][aria-label*="drawer" i] :is(a, [role="link"]):is([aria-label*="Google"], [title*="Google"]):is(:hover, :focus, :focus-visible) {
  background-color: transparent !important;
  box-shadow: none !important;
}

html[data-gt-theme="dark"] img[src*="/translate/drag_and_drop.png"] {
  filter: brightness(0.84) saturate(0.88) contrast(1.02) !important;
}

html[data-gt-theme="dark"] [${DOCUMENT_FILE_CARD_ATTRIBUTE}] {
  background: var(--gt-theme-surface-raised) !important;
  background-color: var(--gt-theme-surface-raised) !important;
  background-image: none !important;
  border: 1px solid var(--gt-theme-border-soft) !important;
  border-radius: 8px !important;
  box-shadow: none !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${DOCUMENT_FILE_CARD_ATTRIBUTE}] *,
html[data-gt-theme="dark"] [${DOCUMENT_FILE_CARD_ATTRIBUTE}] :is(svg, .material-icons, .material-icons-extended),
html[data-gt-theme="dark"] [${DOCUMENT_FILE_CARD_ATTRIBUTE}] svg *:not([fill="none"]) {
  color: inherit !important;
  fill: currentColor !important;
}

html[data-gt-theme="dark"] [${DOCUMENT_FILE_CARD_ATTRIBUTE}] :is(button, [role="button"]) {
  background-color: transparent !important;
  color: var(--gt-theme-control-color) !important;
}

html[data-gt-theme="dark"] [${DOCUMENT_FILE_CARD_ATTRIBUTE}] :is(button, [role="button"]):is(:hover, :focus, :focus-visible) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${DETAILS_EMPTY_STATE_ATTRIBUTE}] {
  color: var(--gt-theme-text-muted) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [${DETAILS_EMPTY_STATE_ATTRIBUTE}] * {
  color: inherit !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [${DETAILS_EMPTY_ART_ATTRIBUTE}] {
  background: var(--gt-theme-surface-tinted) !important;
  background-color: var(--gt-theme-surface-tinted) !important;
  border-color: var(--gt-theme-border-soft) !important;
  box-shadow: none !important;
}

html[data-gt-theme="dark"] [${DETAILS_EMPTY_STATE_ATTRIBUTE}] :is(img, canvas) {
  filter: brightness(0.72) contrast(1.05) saturate(0.9) !important;
  opacity: 0.9 !important;
}

html[data-gt-theme="dark"] [${DETAILS_EMPTY_STATE_ATTRIBUTE}] svg :is(rect, path, circle, ellipse, polygon):is([fill="#fff"], [fill="#ffffff"], [fill="white"], [fill="#f1f3f4"], [fill="#e8eaed"]) {
  fill: var(--gt-theme-surface-tinted) !important;
}

html[data-gt-theme="dark"] [${DETAILS_EMPTY_STATE_ATTRIBUTE}] svg :is(rect, path, circle, ellipse, polygon):is([stroke="#fff"], [stroke="#ffffff"], [stroke="white"], [stroke="#f1f3f4"], [stroke="#e8eaed"]) {
  stroke: var(--gt-theme-border-soft) !important;
}

html[data-gt-theme="dark"] [${DICTIONARY_TRANSLATION_CHIP_ATTRIBUTE}] {
  background: #3c4043 !important;
  background-color: #3c4043 !important;
  background-image: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${DICTIONARY_TRANSLATION_CHIP_ATTRIBUTE}] *,
html[data-gt-theme="dark"] [${DICTIONARY_TRANSLATION_CHIP_ATTRIBUTE}] :is(svg, .material-icons, .material-icons-extended),
html[data-gt-theme="dark"] [${DICTIONARY_TRANSLATION_CHIP_ATTRIBUTE}] svg *:not([fill="none"]) {
  color: inherit !important;
  fill: currentColor !important;
}

html[data-gt-theme="dark"] [${HISTORY_LANGUAGE_PAIR_ATTRIBUTE}] {
  color: var(--gt-theme-text-muted) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [${HISTORY_LANGUAGE_PAIR_ATTRIBUTE}] * {
  color: inherit !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [${HISTORY_ENTRY_ATTRIBUTE}] {
  --mdc-list-list-item-hover-state-layer-color: transparent !important;
  --mdc-list-list-item-focus-state-layer-color: transparent !important;
  --mdc-list-list-item-pressed-state-layer-color: transparent !important;
  --mdc-list-list-item-hover-state-layer-opacity: 0 !important;
  --mdc-list-list-item-focus-state-layer-opacity: 0 !important;
  --mdc-list-list-item-pressed-state-layer-opacity: 0 !important;
  --gm3-list-list-item-hover-state-layer-color: transparent !important;
  --gm3-list-list-item-focus-state-layer-color: transparent !important;
  --gm3-list-list-item-pressed-state-layer-color: transparent !important;
  --gm3-list-list-item-hover-state-layer-opacity: 0 !important;
  --gm3-list-list-item-focus-state-layer-opacity: 0 !important;
  --gm3-list-list-item-pressed-state-layer-opacity: 0 !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

html[data-gt-theme="dark"] [${HISTORY_ENTRY_ATTRIBUTE}]:is(:hover, :focus, :focus-visible, :focus-within) {
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

html[data-gt-theme="dark"] [${HISTORY_PANEL_ATTRIBUTE}] [${ACTION_PATCHED_ATTRIBUTE}],
html[data-gt-theme="dark"] [${HISTORY_ENTRY_ATTRIBUTE}][${ACTION_PATCHED_ATTRIBUTE}] {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  color: inherit !important;
}

html[data-gt-theme="dark"] [${HISTORY_PANEL_ATTRIBUTE}] [${ACTION_PATCHED_ATTRIBUTE}]:is(:hover, :focus, :focus-visible, :focus-within),
html[data-gt-theme="dark"] [${HISTORY_ENTRY_ATTRIBUTE}][${ACTION_PATCHED_ATTRIBUTE}]:is(:hover, :focus, :focus-visible, :focus-within) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  color: inherit !important;
}

html[data-gt-theme="dark"] [${HISTORY_ENTRY_ATTRIBUTE}]::before,
html[data-gt-theme="dark"] [${HISTORY_ENTRY_ATTRIBUTE}]::after,
html[data-gt-theme="dark"] [${HISTORY_ENTRY_STATE_LAYER_ATTRIBUTE}],
html[data-gt-theme="dark"] [${HISTORY_ENTRY_STATE_LAYER_ATTRIBUTE}]::before,
html[data-gt-theme="dark"] [${HISTORY_ENTRY_STATE_LAYER_ATTRIBUTE}]::after {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  opacity: 0 !important;
}

html[data-gt-theme="dark"] [${HISTORY_ENTRY_STATE_LAYER_ATTRIBUTE}] {
  pointer-events: none !important;
}

html[data-gt-theme="dark"] [${SAVED_PANEL_ATTRIBUTE}] {
  background-color: var(--gt-theme-surface-raised) !important;
  border-color: var(--gt-theme-border-soft) !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${SAVED_TITLE_ATTRIBUTE}] {
  color: var(--gt-theme-text) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [${SAVED_PANEL_ATTRIBUTE}] :is(h1, h2, h3, [role="heading"]) {
  color: var(--gt-theme-text) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [${SAVED_TITLE_ATTRIBUTE}] * {
  color: inherit !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] :is([${HISTORY_PANEL_ATTRIBUTE}], [${SAVED_PANEL_ATTRIBUTE}]) :is(button, a, [role="button"]):is([aria-label*="Close" i], [aria-label*="关闭"], [aria-label*="關閉"]) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border-color: transparent !important;
  border-radius: 50% !important;
  box-shadow: none !important;
  color: var(--gt-theme-control-color) !important;
}

html[data-gt-theme="dark"] :is([${HISTORY_PANEL_ATTRIBUTE}], [${SAVED_PANEL_ATTRIBUTE}]) :is(button, a, [role="button"]):is([aria-label*="Close" i], [aria-label*="关闭"], [aria-label*="關閉"]):is(:hover, :focus, :focus-visible) {
  background-color: var(--gt-theme-control-hover) !important;
  border-radius: 50% !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${SAVED_LANGUAGE_PAIR_ATTRIBUTE}] {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border-color: var(--gt-theme-text-muted) !important;
  box-shadow: none !important;
  color: var(--gt-theme-text-muted) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [${SAVED_LANGUAGE_PAIR_ATTRIBUTE}] * {
  color: inherit !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] :is(button, a, [role="button"])[${SAVED_STAR_ATTRIBUTE}],
html[data-gt-theme="dark"] :is(button, a, [role="button"])[${SAVED_STAR_ATTRIBUTE}][aria-pressed="true"] {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] :is(button, a, [role="button"])[${SAVED_STAR_ATTRIBUTE}]:is(:hover, :focus, :focus-visible),
html[data-gt-theme="dark"] :is(button, a, [role="button"])[${SAVED_STAR_ATTRIBUTE}][aria-pressed="true"]:is(:hover, :focus, :focus-visible) {
  background-color: var(--gt-theme-control-hover) !important;
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] [${SAVED_STAR_ATTRIBUTE}] *,
html[data-gt-theme="dark"] [${SAVED_STAR_ATTRIBUTE}] :is(svg, .material-icons, .material-icons-extended),
html[data-gt-theme="dark"] [${SAVED_STAR_ATTRIBUTE}] svg *:not([fill="none"]) {
  color: inherit !important;
  fill: currentColor !important;
}

html[data-gt-theme="dark"] [${SAVED_STAR_ATTRIBUTE}] svg [fill="none"] {
  fill: none !important;
}

html[data-gt-theme="dark"] [${SAVED_STAR_ATTRIBUTE}]::before,
html[data-gt-theme="dark"] [${SAVED_STAR_ATTRIBUTE}]::after,
html[data-gt-theme="dark"] [${SAVED_STAR_ATTRIBUTE}] *::before,
html[data-gt-theme="dark"] [${SAVED_STAR_ATTRIBUTE}] *::after {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

html[data-gt-theme="dark"] [${SAVED_SECONDARY_ACTION_ATTRIBUTE}],
html[data-gt-theme="dark"] [${SAVED_SECONDARY_ACTION_ATTRIBUTE}]:is(:hover, :focus, :focus-visible) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border: 0 !important;
  box-shadow: none !important;
  color: var(--gt-theme-blue) !important;
  outline: 0 !important;
}

html[data-gt-theme="dark"] [${SAVED_SECONDARY_ACTION_ATTRIBUTE}] *,
html[data-gt-theme="dark"] [${SAVED_SECONDARY_ACTION_ATTRIBUTE}]::before,
html[data-gt-theme="dark"] [${SAVED_SECONDARY_ACTION_ATTRIBUTE}]::after,
html[data-gt-theme="dark"] [${SAVED_SECONDARY_ACTION_ATTRIBUTE}] *::before,
html[data-gt-theme="dark"] [${SAVED_SECONDARY_ACTION_ATTRIBUTE}] *::after {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border: 0 !important;
  box-shadow: none !important;
  color: inherit !important;
  outline: 0 !important;
}

.gt-theme-toggle-host {
  align-items: center;
  align-self: center;
  display: inline-flex;
  flex: 0 0 48px;
  height: 48px;
  justify-content: center;
  margin: 0;
  width: 48px;
}

.gt-theme-toggle-fallback {
  position: fixed;
  right: 104px;
  top: 8px;
  z-index: 2147483646;
}

.gt-theme-toggle-button {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 50%;
  box-sizing: border-box;
  color: var(--gt-theme-control-color);
  cursor: pointer;
  display: inline-flex;
  height: 48px;
  justify-content: center;
  margin: 0;
  outline: 0;
  padding: 12px;
  transition: background-color 120ms ease, color 120ms ease;
  width: 48px;
}

.gt-theme-toggle-button:hover {
  background-color: var(--gt-theme-control-hover);
}

.gt-theme-toggle-button:focus-visible {
  box-shadow: 0 0 0 2px var(--gt-theme-focus-ring) inset;
}

.gt-theme-toggle-button svg {
  display: block;
  fill: currentColor;
  height: 24px;
  pointer-events: none;
  width: 24px;
}

.gt-theme-toggle-button svg * {
  pointer-events: none;
}

html[data-gt-theme="dark"],
html[data-gt-theme="dark"] body,
html[data-gt-theme="dark"] #yDmH0d,
html[data-gt-theme="dark"] c-wiz[role="main"] {
  background-color: var(--gt-theme-page) !important;
  color: var(--gt-theme-text) !important;
}
html[data-gt-theme="dark"] header,
html[data-gt-theme="dark"] header#gb,
html[data-gt-theme="dark"] div#gb {
  background-color: var(--gt-theme-page) !important;
  border-color: var(--gt-theme-border-soft) !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] #gb :is(a, button, [role="button"]) * {
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] :is(header, #gb) iframe:is([src*="//ogs.google."], [src*="//accounts.google."], [name="account"]),
html[data-gt-theme="dark"] :is(header, #gb) :is(div, span):has(> iframe:is([src*="//ogs.google."], [src*="//accounts.google."], [name="account"])) {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

html[data-gt-theme] [${OGS_ACCOUNT_FRAME_SHELL_ATTRIBUTE}],
html[data-gt-theme] iframe[${OGS_ACCOUNT_FRAME_SHELL_ATTRIBUTE}],
html[data-gt-theme] :is(header, #gb) :is(div, span, section, aside):has(iframe:is([src*="//accounts.google."], [name="account"])) {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

html[data-gt-theme="dark"] textarea,
html[data-gt-theme="dark"] input,
html[data-gt-theme="dark"] [contenteditable="true"],
html[data-gt-theme="dark"] [role="textbox"],
html[data-gt-theme="dark"] [aria-label="Source text"] {
  background-color: transparent !important;
  color: var(--gt-theme-text) !important;
  caret-color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] textarea::placeholder,
html[data-gt-theme="dark"] input::placeholder {
  color: var(--gt-theme-text-subtle) !important;
}

html[data-gt-theme="dark"] button,
html[data-gt-theme="dark"] [role="button"],
html[data-gt-theme="dark"] a[role="button"],
html[data-gt-theme="dark"] [aria-label="Settings"],
html[data-gt-theme="dark"] [aria-label="设置"],
html[data-gt-theme="dark"] [aria-label="Google apps"],
html[data-gt-theme="dark"] [aria-label="Google 应用"] {
  color: var(--gt-theme-control-color) !important;
}

html[data-gt-theme="dark"] [aria-label="Settings"],
html[data-gt-theme="dark"] [aria-label="设置"],
html[data-gt-theme="dark"] [aria-label="Google apps"],
html[data-gt-theme="dark"] [aria-label="Google 应用"] {
  background-color: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}:not(#${BUTTON_ID})[aria-current="page"],
html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}:not(#${BUTTON_ID})[aria-current="true"],
html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}:not(#${BUTTON_ID})[aria-pressed="true"] {
  background-color: var(--gt-theme-blue-bg) !important;
  border-color: transparent !important;
  color: var(--gt-theme-blue-container-text) !important;
}

html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}:not(#${BUTTON_ID})[aria-current="page"] *,
html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}:not(#${BUTTON_ID})[aria-current="true"] *,
html[data-gt-theme="dark"] ${TRANSLATION_TYPE_BUTTON_SELECTOR}:not(#${BUTTON_ID})[aria-pressed="true"] * {
  color: inherit !important;
}

html[data-gt-theme="dark"] .gt-theme-toggle-button:hover,
html[data-gt-theme="dark"] [aria-label="Settings"]:hover,
html[data-gt-theme="dark"] [aria-label="设置"]:hover,
html[data-gt-theme="dark"] [aria-label="Google apps"]:hover,
html[data-gt-theme="dark"] [aria-label="Google 应用"]:hover {
  background-color: var(--gt-theme-control-hover) !important;
  border-radius: 50% !important;
}

html[data-gt-theme="dark"] a {
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] #gb a[aria-label="Sign in"],
html[data-gt-theme="dark"] #gb a[aria-label="登录"],
html[data-gt-theme="dark"] #gb a[aria-label="登入"] {
  border-color: transparent !important;
  color: #fff !important;
}

html[data-gt-theme="dark"] #gb a[aria-label="Sign in"] *,
html[data-gt-theme="dark"] #gb a[aria-label="登录"] *,
html[data-gt-theme="dark"] #gb a[aria-label="登入"] * {
  color: inherit !important;
}

html[data-gt-theme="dark"] svg:not([fill]) {
  color: currentColor !important;
}

html[data-gt-theme="dark"] svg [fill="#5f6368"],
html[data-gt-theme="dark"] svg [fill="#3c4043"],
html[data-gt-theme="dark"] svg [fill="currentColor"] {
  color: currentColor !important;
  fill: currentColor !important;
}

html[data-gt-theme="dark"] .ita-kd-statusbar,
html[data-gt-theme="dark"] .ita-kd-inputtools-div.ita-kd-statusbar,
html[data-gt-theme="dark"] body > .ita-kd-statusbar {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border: 0 !important;
  border-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  color: var(--gt-theme-control-color) !important;
  color-scheme: dark !important;
  outline: 0 !important;
}

html[data-gt-theme="dark"] .ita-kd-statusbar :is(table, tbody, tr, td),
html[data-gt-theme="dark"] .ita-kd-inputtools-div.ita-kd-statusbar :is(table, tbody, tr, td) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
  color: inherit !important;
  outline: 0 !important;
}

html[data-gt-theme="dark"] .ita-kd-statusbar :is(.ita-kd-dropdown, .ita-kd-button, .ita-kd-menu-button, .ita-kd-icon-button, a[role="button"]),
html[data-gt-theme="dark"] .ita-kd-inputtools-div.ita-kd-statusbar :is(.ita-kd-dropdown, .ita-kd-button, .ita-kd-menu-button, .ita-kd-icon-button, a[role="button"]) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border: 0 !important;
  border-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  color: var(--gt-theme-control-color) !important;
  outline: 0 !important;
}

html[data-gt-theme="dark"] .ita-kd-statusbar :is(.ita-kd-dropdown, .ita-kd-button, .ita-kd-menu-button, .ita-kd-icon-button, a[role="button"]):hover,
html[data-gt-theme="dark"] .ita-kd-inputtools-div.ita-kd-statusbar :is(.ita-kd-dropdown, .ita-kd-button, .ita-kd-menu-button, .ita-kd-icon-button, a[role="button"]):hover {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border: 0 !important;
  border-color: transparent !important;
  box-shadow: none !important;
  color: var(--gt-theme-blue) !important;
  outline: 0 !important;
}

html[data-gt-theme="dark"] .ita-kd-statusbar :is(.ita-kd-dropdown, .ita-kd-button, .ita-kd-menu-button, .ita-kd-icon-button, a[role="button"]) *,
html[data-gt-theme="dark"] .ita-kd-inputtools-div.ita-kd-statusbar :is(.ita-kd-dropdown, .ita-kd-button, .ita-kd-menu-button, .ita-kd-icon-button, a[role="button"]) *,
html[data-gt-theme="dark"] .ita-kd-statusbar :is(.ita-kd-dropdown, .ita-kd-button, .ita-kd-menu-button, .ita-kd-icon-button, a[role="button"])::before,
html[data-gt-theme="dark"] .ita-kd-statusbar :is(.ita-kd-dropdown, .ita-kd-button, .ita-kd-menu-button, .ita-kd-icon-button, a[role="button"])::after,
html[data-gt-theme="dark"] .ita-kd-inputtools-div.ita-kd-statusbar :is(.ita-kd-dropdown, .ita-kd-button, .ita-kd-menu-button, .ita-kd-icon-button, a[role="button"])::before,
html[data-gt-theme="dark"] .ita-kd-inputtools-div.ita-kd-statusbar :is(.ita-kd-dropdown, .ita-kd-button, .ita-kd-menu-button, .ita-kd-icon-button, a[role="button"])::after {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
  outline: 0 !important;
}

html[data-gt-theme="dark"] .ita-kd-statusbar .ita-kd-img,
html[data-gt-theme="dark"] .ita-kd-inputtools-div.ita-kd-statusbar .ita-kd-img {
  filter: invert(89%) sepia(7%) saturate(205%) hue-rotate(178deg) brightness(95%) contrast(90%) !important;
  opacity: 0.86 !important;
}

html[data-gt-theme="dark"] #itamenu,
html[data-gt-theme="dark"] #itamenu .goog-container,
html[data-gt-theme="dark"] #itamenu .goog-container-horizontal,
html[data-gt-theme="dark"] #itamenu .ita-kd-inputtools-div {
  color: var(--gt-theme-control-color) !important;
  color-scheme: dark !important;
}

html[data-gt-theme="dark"] #itamenu {
  border-radius: 4px !important;
}

html[data-gt-theme="dark"] #itamenu :is(.ita-kd-dropdown, .ita-kd-button, .ita-kd-menu-button, .ita-kd-icon-button) {
  background: transparent !important;
  background-color: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

html[data-gt-theme="dark"] #itamenu :is(.ita-kd-dropdown, .ita-kd-button, .ita-kd-menu-button, .ita-kd-icon-button) *,
html[data-gt-theme="dark"] #itamenu :is(.ita-kd-dropdown, .ita-kd-button, .ita-kd-menu-button, .ita-kd-icon-button)::before,
html[data-gt-theme="dark"] #itamenu :is(.ita-kd-dropdown, .ita-kd-button, .ita-kd-menu-button, .ita-kd-icon-button)::after {
  color: inherit !important;
}

html[data-gt-theme="dark"] #itamenu .ita-kd-icon-button {
  background-color: transparent !important;
  border-radius: 0 !important;
  color: var(--gt-theme-control-color) !important;
  overflow: visible !important;
  position: relative !important;
}

html[data-gt-theme="dark"] #itamenu .ita-kd-icon-button:hover,
html[data-gt-theme="dark"] #itamenu .ita-kd-icon-button:focus-visible,
html[data-gt-theme="dark"] #itamenu .ita-kd-icon-button.ita-kd-icon-button-hover {
  background-color: transparent !important;
}

html[data-gt-theme="dark"] .ita-kd-img {
  filter: invert(89%) sepia(7%) saturate(205%) hue-rotate(178deg) brightness(95%) contrast(90%) !important;
  opacity: 0.86 !important;
  position: relative !important;
  z-index: 1 !important;
}

html[data-gt-theme="dark"] #itamenu .ita-kd-inputtool-icon .ita-kd-img,
html[data-gt-theme="dark"] #itamenu .ita-kd-dropdown .ita-kd-img {
  filter: invert(75%) sepia(48%) saturate(685%) hue-rotate(183deg) brightness(102%) contrast(95%) !important;
  opacity: 1 !important;
}



html[data-gt-theme="dark"] .ita-kd-icon-button:hover .ita-kd-img,
html[data-gt-theme="dark"] .ita-kd-icon-button:focus-visible .ita-kd-img,
html[data-gt-theme="dark"] .ita-kd-menuitem-hover .ita-kd-img,
html[data-gt-theme="dark"] .ita-kd-menuitem:hover .ita-kd-img {
  filter: invert(75%) sepia(48%) saturate(685%) hue-rotate(183deg) brightness(102%) contrast(95%) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] .ita-kd-dropdown-menu,
html[data-gt-theme="dark"] ul.ita-kd-dropdown-menu,
html[data-gt-theme="dark"] body > .ita-kd-dropdown-menu {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.42) !important;
  color: var(--gt-theme-text) !important;
  color-scheme: dark !important;
}

html[data-gt-theme="dark"] .ita-kd-dropdown-menu .ita-kd-menuitem,
html[data-gt-theme="dark"] .ita-kd-dropdown-menu .ita-kd-menuitem-span,
html[data-gt-theme="dark"] .ita-kd-dropdown-menu .ita-kd-menuitem-inputtool-name,
html[data-gt-theme="dark"] .ita-kd-dropdown-menu .ita-kd-menuitem-setting,
html[data-gt-theme="dark"] .ita-kd-menuitem,
html[data-gt-theme="dark"] .ita-kd-menuitem-span,
html[data-gt-theme="dark"] .ita-kd-menuitem-inputtool-name,
html[data-gt-theme="dark"] .ita-kd-menuitem-setting {
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] .ita-kd-dropdown-menu .ita-kd-menuitem-hover,
html[data-gt-theme="dark"] .ita-kd-dropdown-menu .ita-kd-menuitem:hover,
html[data-gt-theme="dark"] .ita-kd-menuitem-hover,
html[data-gt-theme="dark"] .ita-kd-menuitem:hover {
  background-color: var(--gt-theme-control-hover) !important;
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] .ita-kd-dropdown-menu .ita-kd-menuitem-hover *,
html[data-gt-theme="dark"] .ita-kd-dropdown-menu .ita-kd-menuitem:hover *,
html[data-gt-theme="dark"] .ita-kd-menuitem-hover *,
html[data-gt-theme="dark"] .ita-kd-menuitem:hover * {
  color: inherit !important;
}

html[data-gt-theme="dark"] .ita-kd-separator {
  border-color: var(--gt-theme-border) !important;
}

html[data-gt-theme="dark"] #kbd.vk-box,
html[data-gt-theme="dark"] .vk-box {
  background-color: var(--gt-theme-surface-raised) !important;
  border-color: var(--gt-theme-border) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.42) !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] .vk-t {
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] .vk-t-btn-o {
  border-radius: 50% !important;
}

html[data-gt-theme="dark"] .vk-t-btn-o:hover {
  background-color: var(--gt-theme-control-hover) !important;
}

html[data-gt-theme="dark"] .vk-btn {
  background: var(--gt-theme-surface-tinted) !important;
  border-color: var(--gt-theme-border) !important;
  box-shadow: none !important;
  color: var(--gt-theme-text-muted) !important;
  text-shadow: none !important;
}

html[data-gt-theme="dark"] .vk-btn:hover,
html[data-gt-theme="dark"] .vk-btn-hover {
  background: rgba(138, 180, 248, 0.12) !important;
  border-color: var(--gt-theme-blue) !important;
  color: var(--gt-theme-blue-container-text) !important;
}

html[data-gt-theme="dark"] .vk-btn:active,
html[data-gt-theme="dark"] .vk-btn-active,
html[data-gt-theme="dark"] .vk-btn-pressed {
  background: var(--gt-theme-blue-bg) !important;
  border-color: var(--gt-theme-blue) !important;
  color: var(--gt-theme-blue-container-text) !important;
}

html[data-gt-theme="dark"] .vk-cap {
  color: inherit !important;
  text-shadow: none !important;
}

html[data-gt-theme="dark"] .ita-hwt-ime {
  background-color: var(--gt-theme-surface-raised) !important;
  border-color: var(--gt-theme-border) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.42) !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] .ita-hwt-canvas {
  background-color: #fff !important;
  filter: invert(1) hue-rotate(180deg) contrast(0.94) !important;
}

html[data-gt-theme="dark"] .ita-hwt-candidates {
  background-color: var(--gt-theme-surface) !important;
  border-color: var(--gt-theme-border) !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] .ita-hwt-candidate {
  background-color: transparent !important;
  border-color: var(--gt-theme-border) !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] .ita-hwt-candidate:hover,
html[data-gt-theme="dark"] .ita-hwt-candidate-selected {
  background-color: var(--gt-theme-control-hover) !important;
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] .ita-hwt-buttons {
  background-color: var(--gt-theme-surface-raised) !important;
  border-color: var(--gt-theme-border) !important;
}

html[data-gt-theme="dark"] .ita-hwt-button,
html[data-gt-theme="dark"] .ita-hwt-jfk {
  background: var(--gt-theme-surface-tinted) !important;
  border-color: var(--gt-theme-border) !important;
  color: var(--gt-theme-text) !important;
  text-shadow: none !important;
}

html[data-gt-theme="dark"] .ita-hwt-button:hover,
html[data-gt-theme="dark"] .ita-hwt-jfk-hover {
  background: rgba(138, 180, 248, 0.12) !important;
  border-color: var(--gt-theme-blue) !important;
  color: var(--gt-theme-blue-container-text) !important;
}

html[data-gt-theme="dark"] .ita-hwt-close,
html[data-gt-theme="dark"] .ita-hwt-grip,
html[data-gt-theme="dark"] .ita-hwt-backspace-img,
html[data-gt-theme="dark"] .ita-hwt-enter-img {
  background-color: transparent !important;
  filter: invert(89%) sepia(7%) saturate(205%) hue-rotate(178deg) brightness(95%) contrast(90%) !important;
}

html[data-gt-theme="dark"] .ita-hwt-close:hover,
html[data-gt-theme="dark"] .ita-hwt-close-hover {
  filter: invert(75%) sepia(48%) saturate(685%) hue-rotate(183deg) brightness(102%) contrast(95%) !important;
}

html[data-gt-theme="dark"] .ita-hwt-enter-img-white {
  filter: none !important;
}

html[data-gt-theme="dark"] c-wiz[role="main"] > :is(div, section, article):has([role="tab"]):has(:is(textarea, [role="textbox"], [contenteditable="true"], [role="progressbar"])) {
  background-color: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

html[data-gt-theme="dark"] :is(c-wiz, section, article, [role="region"]):has(:is(textarea, [role="textbox"], [contenteditable="true"])),
html[data-gt-theme="dark"] :is(textarea, [role="textbox"], [contenteditable="true"])[aria-label],
html[data-gt-theme="dark"] :is(textarea, [role="textbox"], [contenteditable="true"]):has(+ [aria-label]) {
  background-color: var(--gt-theme-surface) !important;
  border-color: var(--gt-theme-border) !important;
  color: var(--gt-theme-text) !important;
  outline-color: var(--gt-theme-border) !important;
}

html[data-gt-theme="dark"] :is(c-wiz, section, article, [role="region"]):has([aria-label*="翻译结果"]),
html[data-gt-theme="dark"] :is(c-wiz, section, article, [role="region"]):has([aria-label*="翻譯結果"]),
html[data-gt-theme="dark"] :is(c-wiz, section, article, [role="region"]):has([aria-label*="translation result" i]) {
  background-color: transparent !important;
  border-color: transparent !important;
}

html[data-gt-theme="dark"] :is(c-wiz, section, article, [role="region"]):has([aria-label*="翻译结果"]) > [${ACTION_SCOPE_ATTRIBUTE}],
html[data-gt-theme="dark"] :is(c-wiz, section, article, [role="region"]):has([aria-label*="翻譯結果"]) > [${ACTION_SCOPE_ATTRIBUTE}],
html[data-gt-theme="dark"] :is(c-wiz, section, article, [role="region"]):has([aria-label*="translation result" i]) > [${ACTION_SCOPE_ATTRIBUTE}],
html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}]:has([aria-label*="翻译结果"]),
html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}]:has([aria-label*="翻譯結果"]),
html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}]:has([aria-label*="translation result" i]) {
  background-color: var(--gt-theme-surface-tinted) !important;
  border-color: transparent !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] :is(c-wiz, section, article, [role="region"]):has(:is(textarea, [role="textbox"], [contenteditable="true"])) :is(textarea, [role="textbox"], [contenteditable="true"]) {
  background-color: transparent !important;
}

html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [role="progressbar"],
html[data-gt-theme="dark"] :is(c-wiz, section, article, [role="region"]) [role="progressbar"] {
  color: var(--gt-theme-blue) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [role="progressbar"] {
  color: var(--gt-theme-blue) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [role="progressbar"] svg,
html[data-gt-theme="dark"] [role="progressbar"] svg * {
  color: inherit !important;
  fill: none !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [role="progressbar"] circle {
  stroke: currentColor !important;
}

html[data-gt-theme="dark"] [role="progressbar"] circle:first-of-type {
  stroke: rgba(138, 180, 248, 0.35) !important;
  stroke-opacity: 1 !important;
}

html[data-gt-theme="dark"] [role="progressbar"] circle:not(:first-of-type) {
  stroke: var(--gt-theme-blue) !important;
  stroke-opacity: 1 !important;
  opacity: 1 !important;
}



html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] .notranslate,
html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] svg,
html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] svg *:not([fill="none"]) {
  color: var(--gt-theme-control-color) !important;
  fill: currentColor !important;
}

html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] :is(button, a, [role="button"]):is(:hover, :focus-visible, :focus-within) .notranslate,
html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] :is(button, a, [role="button"]):is(:hover, :focus-visible, :focus-within) svg {
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] :is(button, a, [role="button"])[aria-pressed="true"] {
  background-color: var(--gt-theme-blue-bg) !important;
  border-color: transparent !important;
  color: var(--gt-theme-blue-container-text) !important;
}



html[data-gt-theme="dark"] [role="tab"][aria-selected="true"],
html[data-gt-theme="dark"] [data-selected="true"] {
  background-color: transparent !important;
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] [role="tab"] {
  border-radius: 4px 4px 0 0 !important;
}

html[data-gt-theme="dark"] [role="tab"]:hover,
html[data-gt-theme="dark"] [role="tab"]:focus-visible {
  background-color: rgba(232, 234, 237, 0.08) !important;
}

html[data-gt-theme="dark"] [role="tab"][aria-selected="true"]:hover,
html[data-gt-theme="dark"] [role="tab"][aria-selected="true"]:focus-visible,
html[data-gt-theme="dark"] [data-selected="true"]:hover,
html[data-gt-theme="dark"] [data-selected="true"]:focus-visible {
  background-color: rgba(138, 180, 248, 0.12) !important;
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] c-wiz[role="main"] [role="tab"]:is(:hover, :focus, :focus-visible) {
  background-color: var(--gt-theme-control-hover) !important;
  color: var(--gt-theme-text) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] c-wiz[role="main"] [role="tab"][aria-selected="true"]:is(:hover, :focus, :focus-visible) {
  background-color: rgba(138, 180, 248, 0.12) !important;
  color: var(--gt-theme-blue) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] c-wiz[role="main"] [role="tab"]:is(:hover, :focus, :focus-visible) * {
  color: inherit !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] c-wiz[role="main"] [role="tab"] :is(div, span):empty,
html[data-gt-theme="dark"] c-wiz[role="main"] [role="tab"] *::before,
html[data-gt-theme="dark"] c-wiz[role="main"] [role="tab"] *::after {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

html[data-gt-theme="dark"] [${ACTION_STATE_LAYER_ATTRIBUTE}] {
  background-color: transparent !important;
  border-radius: inherit !important;
}

html[data-gt-theme="dark"] [role="listbox"],
html[data-gt-theme="dark"] [role="menu"],
html[data-gt-theme="dark"] [role="dialog"] {
  background-color: var(--gt-theme-surface-raised) !important;
  border-color: var(--gt-theme-border) !important;
  color: var(--gt-theme-text) !important;
}





html[data-gt-theme="dark"] [role="option"],
html[data-gt-theme="dark"] [role="menuitem"],
html[data-gt-theme="dark"] [role="tab"] {
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] :is([role="listbox"], [role="menu"], [role="dialog"]) :is([role="option"], [role="menuitem"]) {
  background-color: transparent !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] :is([role="listbox"], [role="menu"], [role="dialog"]) :is([role="option"], [role="menuitem"]) *,
html[data-gt-theme="dark"] :is([role="listbox"], [role="menu"], [role="dialog"]) :is([role="option"], [role="menuitem"]) *::before,
html[data-gt-theme="dark"] :is([role="listbox"], [role="menu"], [role="dialog"]) :is([role="option"], [role="menuitem"]) *::after {
  background-color: transparent !important;
  box-shadow: none !important;
  color: inherit !important;
}

html[data-gt-theme="dark"] :is([role="tab"], [role="option"], [role="menuitem"]) :is(svg, .material-icons, .material-icons-extended) {
  color: var(--gt-theme-text-muted) !important;
}

html[data-gt-theme="dark"] [aria-selected="true"] :is(svg, .material-icons, .material-icons-extended),
html[data-gt-theme="dark"] [role="tab"][aria-selected="true"] :is(svg, .material-icons, .material-icons-extended) {
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] :is([role="listbox"], [role="menu"], [role="dialog"]) :is([role="option"], [role="menuitem"]):is(:hover, :focus, :focus-visible) {
  background-color: var(--gt-theme-control-hover) !important;
}

html[data-gt-theme="dark"] :is([role="listbox"], [role="menu"], [role="dialog"]) :is([role="option"], [role="menuitem"]):is([aria-selected="true"], [aria-checked="true"], [data-selected="true"]) {
  background-color: rgba(138, 180, 248, 0.16) !important;
  color: var(--gt-theme-blue-container-text) !important;
}

html[data-gt-theme="dark"] :is([role="listbox"], [role="menu"], [role="dialog"]) :is([role="option"], [role="menuitem"]):is([aria-selected="true"], [aria-checked="true"], [data-selected="true"]):is(:hover, :focus, :focus-visible) {
  background-color: rgba(138, 180, 248, 0.22) !important;
}

html[data-gt-theme="dark"] :is([role="listbox"], [role="menu"], [role="dialog"]) :is([role="option"], [role="menuitem"]):is([aria-selected="true"], [aria-checked="true"], [data-selected="true"]) * {
  color: inherit !important;
}

html[data-gt-theme="dark"] :is([role="listbox"], [role="menu"], [role="dialog"]) :is([role="option"], [role="menuitem"]):is([aria-selected="true"], [aria-checked="true"], [data-selected="true"]) :is(svg, .material-icons, .material-icons-extended) {
  color: var(--gt-theme-blue) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [aria-disabled="true"],
html[data-gt-theme="dark"] :disabled,
html[data-gt-theme="dark"] [disabled] {
  color: var(--gt-theme-text-subtle) !important;
}

html[data-gt-theme="dark"] [${DICTIONARY_PANEL_ATTRIBUTE}] {
  border-color: var(--gt-theme-border-soft) !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${DICTIONARY_PANEL_ATTRIBUTE}] [role="tab"] {
  background-color: transparent !important;
  color: var(--gt-theme-text-muted) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [${DICTIONARY_PANEL_ATTRIBUTE}] [role="tab"] * {
  color: inherit !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [${DICTIONARY_PANEL_ATTRIBUTE}] [role="tab"][aria-selected="true"],
html[data-gt-theme="dark"] [${DICTIONARY_PANEL_ATTRIBUTE}] [role="tab"][data-selected="true"] {
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] [${DICTIONARY_PANEL_ATTRIBUTE}] [role="tab"]:is(:hover, :focus, :focus-visible) {
  background-color: var(--gt-theme-control-hover) !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${DICTIONARY_PANEL_ATTRIBUTE}] [role="tab"][aria-selected="true"]:is(:hover, :focus, :focus-visible),
html[data-gt-theme="dark"] [${DICTIONARY_PANEL_ATTRIBUTE}] [role="tab"][data-selected="true"]:is(:hover, :focus, :focus-visible) {
  background-color: rgba(138, 180, 248, 0.12) !important;
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] [${DICTIONARY_SECTION_TITLE_ATTRIBUTE}] {
  color: var(--gt-theme-text-muted) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [${DICTIONARY_SECTION_TITLE_ATTRIBUTE}] * {
  color: inherit !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [${DICTIONARY_SECTION_TITLE_ATTRIBUTE}] :is(b, strong) {
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${DICTIONARY_SECTION_HEADER_ATTRIBUTE}] {
  border-top: 1px solid var(--gt-theme-border-soft) !important;
  border-bottom-color: var(--gt-theme-border-soft) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [${DICTIONARY_DIVIDER_ATTRIBUTE}] {
  background-color: var(--gt-theme-border-soft) !important;
  border-color: var(--gt-theme-border-soft) !important;
  opacity: 1 !important;
}

html[data-gt-theme="dark"] [role="tooltip"],
html[data-gt-theme="dark"] [popover] {
  background-color: var(--gt-theme-surface-raised) !important;
  border-color: var(--gt-theme-border) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.42) !important;
  color: var(--gt-theme-text) !important;
}

html[data-gt-theme="dark"] [${ACTION_STATE_LAYER_ATTRIBUTE}] {
  background-color: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

html[data-gt-theme="dark"] [role="tooltip"] button,
html[data-gt-theme="dark"] [popover] button {
  background-color: var(--gt-theme-surface-raised) !important;
  border-color: var(--gt-theme-border-soft) !important;
  color: var(--gt-theme-control-color) !important;
}

html[data-gt-theme="dark"] [role="tooltip"] button:hover,
html[data-gt-theme="dark"] [popover] button:hover {
  background-color: var(--gt-theme-control-hover) !important;
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] [role="tooltip"] svg,
html[data-gt-theme="dark"] [popover] svg,
html[data-gt-theme="dark"] [role="tooltip"] svg *:not([fill="none"]),
html[data-gt-theme="dark"] [popover] svg *:not([fill="none"]) {
  color: inherit !important;
  fill: currentColor !important;
}



html[data-gt-theme="dark"] hr,
html[data-gt-theme="dark"] [role="separator"] {
  border-color: var(--gt-theme-border) !important;
}

${OGS_PANEL_STYLES}

html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [data-gt-theme-action-patched] {
  background: transparent !important;
  background-color: transparent !important;
  border-color: transparent !important;
  border-radius: 50% !important;
  box-shadow: none !important;
  color: var(--gt-theme-control-color) !important;
  outline: none !important;
}

html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [data-gt-theme-action-patched]:hover,
html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [data-gt-theme-action-patched]:focus-visible {
  background-color: rgba(232, 234, 237, 0.14) !important;
  border-radius: 50% !important;
  color: var(--gt-theme-blue) !important;
}

html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [data-gt-theme-action-patched] {
  --mdc-ripple-color: transparent !important;
  --gm3-icon-button-hover-state-layer-color: transparent !important;
  --gm3-icon-button-focus-state-layer-color: transparent !important;
  --gm3-icon-button-pressed-state-layer-color: transparent !important;
  --gm3-icon-button-hover-state-layer-opacity: 0 !important;
  --gm3-icon-button-focus-state-layer-opacity: 0 !important;
  --gm3-icon-button-pressed-state-layer-opacity: 0 !important;
  --gm3-icon-button-hover-container-color: transparent !important;
  --gm3-icon-button-focus-container-color: transparent !important;
  --gm3-icon-button-pressed-container-color: transparent !important;
  --gm3-icon-button-hover-container-opacity: 0 !important;
  --gm3-icon-button-focus-container-opacity: 0 !important;
  --gm3-icon-button-pressed-container-opacity: 0 !important;
  --mdc-icon-button-hover-state-layer-opacity: 0 !important;
  --mdc-icon-button-focus-state-layer-opacity: 0 !important;
  --mdc-icon-button-pressed-state-layer-opacity: 0 !important;
  --mdc-ripple-hover-opacity: 0 !important;
  --mdc-ripple-focus-opacity: 0 !important;
  --mdc-ripple-pressed-opacity: 0 !important;
}

html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [data-gt-theme-action-patched] *,
html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [data-gt-theme-action-patched] svg,
html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [data-gt-theme-action-patched] svg *:not([fill="none"]) {
  color: inherit !important;
  fill: currentColor !important;
}

html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [data-gt-theme-action-patched]::before,
html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [data-gt-theme-action-patched]::after,
html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [data-gt-theme-action-patched] *::before,
html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [data-gt-theme-action-patched] *::after {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  opacity: 0 !important;
}

html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [data-gt-theme-action-patched] [${ACTION_STATE_LAYER_ATTRIBUTE}] {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  opacity: 0 !important;
}

html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [data-gt-theme-action-patched] svg {
  color: inherit !important;
  fill: none !important;
}

html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [data-gt-theme-action-patched] svg :is(rect, path, circle, ellipse, line, polyline, polygon)[fill="none"] {
  fill: none !important;
}

html[data-gt-theme="dark"] [${ACTION_SCOPE_ATTRIBUTE}] [data-gt-theme-action-patched] svg :is(rect, path, circle, ellipse, line, polyline, polygon):not([fill="none"]) {
  fill: currentColor !important;
}
`;

    appendStyleElement(style);
  }
})();
