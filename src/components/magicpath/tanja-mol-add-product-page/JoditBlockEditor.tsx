import { useMemo, useRef, useState } from 'react';
import { Jodit } from 'jodit';
import JoditEditor from 'jodit-react';
import type { IJodit } from 'jodit/esm/types/jodit';
import 'jodit/es2021/jodit.min.css';
import type { ProductDetailBlock } from '../../../storefrontRuntime';

const joditButtons = [
  'undo', 'redo', '|',
  'paragraph', 'font', 'fontsize', '|',
  'bold', 'italic', 'underline', 'strikethrough', 'brush', 'eraser', '|',
  'ul', 'ol', 'outdent', 'indent', 'align', '|',
  'link', 'uploadInlineImage', 'image', 'video', 'table', 'hr', '|',
  'source', 'fullsize',
];

const unorderedListOptions = {
  disc: '•',
  circle: '◦',
  square: '▪',
} as const;

const orderedListOptions = {
  decimal: '1 2 3',
  'decimal-leading-zero': '01 02 03',
  'lower-alpha': 'a b c',
  'upper-alpha': 'A B C',
  'lower-roman': 'i ii iii',
  'upper-roman': 'I II III',
} as const;

const fontOptions = {
  'Cairo, Arial, sans-serif': 'Cairo',
  'Tajawal, Cairo, sans-serif': 'Tajawal',
  '"Noto Sans Arabic Variable", Cairo, Arial, sans-serif': 'Noto Sans Arabic',
} as const;

function plainTextToHtml(text: string) {
  return text
    .split('\n')
    .map(line => line.trim() ? `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : '<p><br></p>')
    .join('');
}

function htmlToPlainText(html: string) {
  if (!html.trim()) return '';
  const element = document.createElement('div');
  element.innerHTML = html;
  return element.innerText.trim();
}

function safeAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function readableUploadError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '');
  return message || 'Unknown upload error';
}

function getCurrentFontSize(editor: IJodit) {
  const anyEditor = editor as any;
  const current = editor.s.current();
  const ownerWindow = anyEditor.ow || window;
  let element = current?.nodeType === Node.ELEMENT_NODE
    ? current as HTMLElement
    : current?.parentElement;

  while (element && element !== editor.editor && ownerWindow.getComputedStyle(element).fontSize === '') {
    element = element.parentElement;
  }

  const rawSize = ownerWindow.getComputedStyle(element || editor.editor).fontSize || '16px';
  const parsed = Number.parseFloat(rawSize);
  return Number.isFinite(parsed) ? Math.round(parsed) : 16;
}

function applyListStyle(editor: IJodit, element: 'ul' | 'ol', listStyleType: string) {
  (editor.s as any).commitStyle({
    element,
    attributes: {
      style: {
        listStyleType: listStyleType === 'default' ? null : listStyleType,
      },
    },
  });
  editor.synchronizeValues();
}

export function JoditBlockEditor({
  detail,
  folder,
  onChange,
}: {
  detail: ProductDetailBlock;
  folder: string;
  onChange: (html: string, text: string) => void;
}) {
  const editorRef = useRef<IJodit | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const value = detail.richTextHtml || plainTextToHtml(detail.text);

  const syncValue = (html: string) => {
    onChange(html, htmlToPlainText(html));
  };

  const insertInlineImages = async (files: FileList | null) => {
    if (!files?.length || !editorRef.current) return;
    setIsUploading(true);
    try {
      const { uploadProductImages } = await import('../../../lib/supabaseStorage');
      const urls = await uploadProductImages(Array.from(files), folder);
      if (!urls.length) {
        window.alert('تعذر رفع الصورة: لم يرجع Supabase رابطا للصورة.');
        return;
      }

      urls.forEach(url => {
        editorRef.current?.s.insertHTML(`<p><img src="${safeAttribute(url)}" alt="" /></p>`);
      });
      syncValue(editorRef.current.value);
    } catch (error) {
      console.error('Failed to upload editor image', error);
      window.alert(`تعذر رفع الصورة: ${readableUploadError(error)}`);
    } finally {
      setIsUploading(false);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
  };

  const config = useMemo(() => ({
    readonly: false,
    direction: 'rtl',
    language: 'en',
    height: 340,
    minHeight: 280,
    toolbarSticky: false,
    toolbarAdaptive: false,
    textIcons: false,
    showTooltip: true,
    useNativeTooltip: false,
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: 'insert_as_html',
    enter: 'P',
    spellcheck: true,
    placeholder: 'اكتب تفاصيل المنتج هنا...',
    toolbarButtonSize: 'large',
    buttons: joditButtons,
    buttonsMD: joditButtons,
    buttonsSM: ['undo', 'redo', '|', 'paragraph', 'font', 'fontsize', '|', 'bold', 'italic', 'underline', 'brush', 'eraser', '|', 'ul', 'ol', 'align', '|', 'link', 'uploadInlineImage', 'table', 'source'],
    buttonsXS: ['undo', 'redo', '|', 'bold', 'italic', 'underline', 'brush', '|', 'ul', 'ol', '|', 'link', 'uploadInlineImage', 'source'],
    uploader: {
      insertImageAsBase64URI: false,
    },
    style: {
      fontFamily: 'Cairo, Arial, sans-serif',
      fontSize: '16px',
      lineHeight: '2',
      textAlign: 'right',
    },
    controls: {
      font: {
        list: Jodit.atom(fontOptions),
        childTemplate: (_editor: IJodit, _key: string, value: string) => `<span style="font-family:${value}">${fontOptions[value as keyof typeof fontOptions] || value}</span>`,
      },
      fontsize: {
        icon: 'tm-fontsize-text',
        text: '16px',
        list: [12, 14, 16, 18, 20, 24, 28, 32, 36, 44, 52],
        textTemplate: (_editor: IJodit, value: string) => `${value || 16}px`,
        childTemplate: (_editor: IJodit, _key: string, value: string) => `<span style="font-size:${value}px;line-height:1.4">${value}px</span>`,
        update: (editor: IJodit, button: any) => {
          button.state.text = `${getCurrentFontSize(editor)}px`;
          return false;
        },
      },
      ul: {
        list: Jodit.atom(unorderedListOptions),
        childTemplate: (_editor: IJodit, _key: string, value: string) => `<span style="display:block;min-width:54px;text-align:center;font-size:24px;line-height:1">${value}</span>`,
        exec: (editor: IJodit) => applyListStyle(editor, 'ul', 'disc'),
        childExec: (editor: IJodit, _current: unknown, options: any) => applyListStyle(editor, 'ul', String(options.control?.args?.[0] || 'disc')),
      },
      ol: {
        list: Jodit.atom(orderedListOptions),
        childTemplate: (_editor: IJodit, _key: string, value: string) => `<span style="display:block;min-width:72px;text-align:center;font-weight:800">${value}</span>`,
        exec: (editor: IJodit) => applyListStyle(editor, 'ol', 'decimal'),
        childExec: (editor: IJodit, _current: unknown, options: any) => applyListStyle(editor, 'ol', String(options.control?.args?.[0] || 'decimal')),
      },
      uploadInlineImage: {
        name: 'Upload image',
        tooltip: 'Upload image',
        icon: 'image',
        exec: () => uploadInputRef.current?.click(),
      },
      video: {
        popup: (_editor: IJodit, _current: unknown, close: () => void) => {
          const url = window.prompt('Video URL');
          if (url) {
            editorRef.current?.s.insertHTML(`<p><video src="${safeAttribute(url)}" controls playsinline></video></p>`);
            if (editorRef.current) syncValue(editorRef.current.value);
          }
          close?.();
        },
      },
    },
  } as any), [folder]);

  return (
    <div className="tm-jodit-editor relative rounded-md border border-white/10 bg-zinc-950 shadow-none [&_.jodit-container]:!border-0 [&_.jodit-container]:!rounded-md [&_.jodit-icon]:!h-[18px] [&_.jodit-icon]:!w-[18px] [&_.jodit-status-bar]:!hidden [&_.jodit-toolbar-editor-collection]:!flex-wrap [&_.jodit-toolbar__box]:!overflow-visible [&_.jodit-toolbar__box]:!border-white/10 [&_.jodit-toolbar__box]:!bg-zinc-900 [&_.jodit-ui-button]:!min-h-[44px] [&_.jodit-ui-button]:!min-w-[44px] [&_.jodit-ui-button]:!px-2 [&_.jodit-ui-button__text]:!hidden [&_.jodit-toolbar-button_fontsize_.jodit-ui-button__text]:!inline-flex [&_.jodit-toolbar-button_fontsize_.jodit-ui-button__text]:!min-w-[44px] [&_.jodit-toolbar-button_fontsize_.jodit-ui-button__text]:!text-[13px] [&_.jodit-toolbar-button_fontsize_.jodit-ui-button__text]:!font-black [&_.jodit-wysiwyg]:!bg-zinc-950 [&_.jodit-wysiwyg]:!text-zinc-100 [&_.jodit-wysiwyg]:!caret-zinc-100 [&_.jodit-wysiwyg]:!px-4 [&_.jodit-wysiwyg]:!py-4 [&_.jodit-wysiwyg]:!leading-[2] [&_.jodit-wysiwyg_p]:!leading-[2] [&_.jodit-wysiwyg_span]:!leading-[2] [&_.jodit-wysiwyg_h1]:!my-4 [&_.jodit-wysiwyg_h1]:!text-4xl [&_.jodit-wysiwyg_h1]:!font-black [&_.jodit-wysiwyg_h1]:!leading-[1.25] [&_.jodit-wysiwyg_h2]:!my-3 [&_.jodit-wysiwyg_h2]:!text-3xl [&_.jodit-wysiwyg_h2]:!font-black [&_.jodit-wysiwyg_h2]:!leading-[1.32] [&_.jodit-wysiwyg_h3]:!my-3 [&_.jodit-wysiwyg_h3]:!text-2xl [&_.jodit-wysiwyg_h3]:!font-extrabold [&_.jodit-wysiwyg_h3]:!leading-[1.34] [&_.jodit-wysiwyg_h4]:!my-2 [&_.jodit-wysiwyg_h4]:!text-xl [&_.jodit-wysiwyg_h4]:!font-extrabold [&_.jodit-wysiwyg_h4]:!leading-[1.4] [&_.jodit-wysiwyg_blockquote]:!rounded-md [&_.jodit-wysiwyg_blockquote]:!border [&_.jodit-wysiwyg_blockquote]:!border-white/15 [&_.jodit-wysiwyg_blockquote]:!bg-zinc-900 [&_.jodit-wysiwyg_blockquote]:!px-4 [&_.jodit-wysiwyg_blockquote]:!py-3 [&_.jodit-wysiwyg_blockquote]:!font-bold [&_.jodit-wysiwyg_img]:!max-w-full [&_.jodit-wysiwyg_li]:!my-1 [&_.jodit-wysiwyg_li]:!leading-[2] [&_.jodit-wysiwyg_ol]:!pr-6 [&_.jodit-wysiwyg_ul]:!pr-6">
      <JoditEditor
        ref={editorRef}
        value={value}
        config={config}
        tabIndex={1}
        onBlur={syncValue}
        onChange={syncValue}
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={event => void insertInlineImages(event.target.files)}
      />
      {isUploading ? (
        <div className="absolute inset-x-3 top-3 z-10 rounded-md bg-[#131921] px-3 py-2 text-xs font-black text-white shadow-[0_16px_35px_-22px_rgba(19,25,33,0.65)]">
          جار رفع الصورة...
        </div>
      ) : null}
    </div>
  );
}
