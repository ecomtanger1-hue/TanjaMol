import { useRef, useState } from 'react';
import type { ProductDetailBlock } from '../../../storefrontRuntime';

type ToolbarButton = {
  label: string;
  title: string;
  command: string;
  value?: string;
};

const blockButtons: ToolbarButton[] = [
  { label: 'P', title: 'فقرة', command: 'formatBlock', value: 'p' },
  { label: 'H2', title: 'عنوان كبير', command: 'formatBlock', value: 'h2' },
  { label: 'H3', title: 'عنوان متوسط', command: 'formatBlock', value: 'h3' },
];

const inlineButtons: ToolbarButton[] = [
  { label: 'B', title: 'غامق', command: 'bold' },
  { label: 'I', title: 'مائل', command: 'italic' },
  { label: 'U', title: 'تحته خط', command: 'underline' },
  { label: '•', title: 'قائمة نقطية', command: 'insertUnorderedList' },
  { label: '1.', title: 'قائمة مرقمة', command: 'insertOrderedList' },
];

function plainTextToHtml(text: string) {
  return text
    .split('\n')
    .map(line => line.trim() ? `<p>${escapeHtml(line)}</p>` : '<p><br></p>')
    .join('');
}

function htmlToPlainText(html: string) {
  if (!html.trim()) return '';
  const element = document.createElement('div');
  element.innerHTML = html;
  return element.innerText.trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function safeAttribute(value: string) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

function readableUploadError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '');
  return message || 'Unknown upload error';
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
  const editorRef = useRef<HTMLDivElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const initialHtml = detail.richTextHtml || plainTextToHtml(detail.text);

  const syncValue = () => {
    const html = editorRef.current?.innerHTML || '';
    onChange(html, htmlToPlainText(html));
  };

  const focusEditor = () => editorRef.current?.focus();

  const runCommand = (command: string, value?: string) => {
    focusEditor();
    document.execCommand(command, false, value);
    syncValue();
  };

  const insertHtml = (html: string) => {
    focusEditor();
    document.execCommand('insertHTML', false, html);
    syncValue();
  };

  const insertLink = () => {
    const url = window.prompt('Link URL');
    if (!url) return;
    runCommand('createLink', url);
  };

  const insertVideo = () => {
    const url = window.prompt('Video URL');
    if (!url) return;
    insertHtml(`<p><video src="${safeAttribute(url)}" controls playsinline preload="metadata"></video></p>`);
  };

  const insertInlineImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsUploading(true);
    try {
      const { uploadProductImages } = await import('../../../lib/supabaseStorage');
      const urls = await uploadProductImages(Array.from(files), folder);
      if (!urls.length) {
        window.alert('تعذر رفع الصورة: لم يرجع Supabase رابطا للصورة.');
        return;
      }

      urls.forEach(url => {
        insertHtml(`<p><img src="${safeAttribute(url)}" alt="" loading="lazy" decoding="async" /></p>`);
      });
    } catch (error) {
      console.error('Failed to upload editor image', error);
      window.alert(`تعذر رفع الصورة: ${readableUploadError(error)}`);
    } finally {
      setIsUploading(false);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
  };

  return (
    <div className="tm-rich-editor relative overflow-hidden rounded-md border border-[var(--tm-border)] bg-[var(--tm-surface-white)] shadow-[var(--tm-shadow-control)]">
      <div className="flex flex-wrap gap-1 border-b border-[var(--tm-border)] bg-[var(--tm-surface-soft)] p-2" role="toolbar" aria-label="محرر تفاصيل المنتج">
        {[...blockButtons, ...inlineButtons].map(button => (
          <button
            key={`${button.command}-${button.value || ''}`}
            type="button"
            title={button.title}
            aria-label={button.title}
            onClick={() => runCommand(button.command, button.value)}
            className="tm-admin-press grid min-h-[44px] min-w-[44px] place-items-center rounded-md border border-[var(--tm-border-strong)] bg-[var(--tm-surface-white)] px-2 text-sm font-black text-[var(--tm-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus)]"
          >
            {button.label}
          </button>
        ))}
        <button type="button" onClick={insertLink} className="tm-admin-press min-h-[44px] rounded-md border border-[var(--tm-border-strong)] bg-[var(--tm-surface-white)] px-3 text-xs font-black text-[var(--tm-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus)]">
          رابط
        </button>
        <button type="button" onClick={() => uploadInputRef.current?.click()} className="tm-admin-press min-h-[44px] rounded-md border border-[var(--tm-border-strong)] bg-[var(--tm-surface-white)] px-3 text-xs font-black text-[var(--tm-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus)]">
          صورة
        </button>
        <button type="button" onClick={insertVideo} className="tm-admin-press min-h-[44px] rounded-md border border-[var(--tm-border-strong)] bg-[var(--tm-surface-white)] px-3 text-xs font-black text-[var(--tm-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus)]">
          فيديو
        </button>
      </div>

      <div
        key={detail.id}
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="تفاصيل المنتج"
        className="tm-rich-editor-body min-h-[280px] bg-[var(--tm-surface-soft)] px-4 py-4 text-right text-base font-semibold leading-8 text-[var(--tm-ink)] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus)]"
        onInput={syncValue}
        onBlur={syncValue}
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: initialHtml }}
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
        <div className="absolute inset-x-3 top-3 z-10 rounded-md bg-[var(--tm-header)] px-3 py-2 text-xs font-black text-white shadow-[var(--tm-shadow-md)]" role="status">
          جار رفع الصورة...
        </div>
      ) : null}
    </div>
  );
}
