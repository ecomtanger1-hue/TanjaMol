import type { ReactNode } from 'react';
import type { ProductDetailBlock } from '../../storefrontRuntime';

const textAlignClass = {
  right: 'text-right',
  center: 'text-center',
  left: 'text-left',
} as const;

const copySizeClass = {
  sm: 'text-sm lg:text-lg xl:text-[1.22rem]',
  base: 'text-sm lg:text-lg xl:text-[1.28rem]',
  lg: 'text-base lg:text-xl xl:text-[1.38rem]',
} as const;

const titleSizeClass = {
  h2: 'text-[1.8rem] leading-[1.32] sm:text-3xl lg:text-[2.65rem] xl:text-5xl',
  h3: 'text-[1.65rem] leading-[1.34] sm:text-2xl lg:text-[2.15rem] xl:text-[2.35rem]',
} as const;

function renderInline(text: string, keyPrefix: string) {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*([^*]+)\*\*|_([^_]+)_|<u>(.*?)<\/u>|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    const key = `${keyPrefix}-${match.index}`;
    if (match[2]) nodes.push(<strong key={key}>{match[2]}</strong>);
    else if (match[3]) nodes.push(<em key={key}>{match[3]}</em>);
    else if (match[4]) nodes.push(<u key={key}>{match[4]}</u>);
    else if (match[5] && match[6]) {
      nodes.push(
        <a key={key} href={match[6]} className="font-black text-[#b45309] underline underline-offset-4" target="_blank" rel="noreferrer">
          {match[5]}
        </a>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function renderRichBlocks(text: string) {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.trim().startsWith('|') && lines[index + 1]?.includes('---')) {
      const tableLines: string[] = [];
      while (lines[index]?.trim().startsWith('|')) {
        tableLines.push(lines[index]);
        index += 1;
      }
      const rows = tableLines
        .filter(row => !row.includes('---'))
        .map(row => row.split('|').map(cell => cell.trim()).filter(Boolean));

      blocks.push(
        <div key={`table-${index}`} className="overflow-x-auto">
          <table className="mt-3 w-full overflow-hidden rounded-md border border-[#dbe4dd] bg-white text-sm">
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="border-t border-[#dbe4dd] first:border-t-0">
                  {row.map((cell, cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`} className={`px-3 py-2 ${rowIndex === 0 ? 'font-black text-[#17201b]' : 'font-semibold'}`}>
                      {renderInline(cell, `table-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (line.trim().startsWith('- ')) {
      const items: string[] = [];
      while (lines[index]?.trim().startsWith('- ')) {
        items.push(lines[index].trim().replace(/^-+\s*/, ''));
        index += 1;
      }
      blocks.push(
        <ul key={`list-${index}`} className="mt-3 grid list-disc gap-2 pr-5">
          {items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, `list-${index}-${itemIndex}`)}</li>)}
        </ul>,
      );
      continue;
    }

    const paragraph: string[] = [];
    while (lines[index]?.trim() && !lines[index].trim().startsWith('- ') && !lines[index].trim().startsWith('|')) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(<p key={`p-${index}`}>{renderInline(paragraph.join(' '), `p-${index}`)}</p>);
  }

  return blocks;
}

function sanitizeStyleAttribute(style: string) {
  const nextRules = style
    .split(';')
    .map(rule => rule.trim())
    .filter(Boolean)
    .filter(rule => {
      const [rawProperty, ...rawValue] = rule.split(':');
      const property = rawProperty.trim().toLowerCase();
      const value = rawValue.join(':').trim().toLowerCase();

      if (!property) return false;
      if (property.includes('background')) return false;
      if (property === 'caret-color') return false;
      if (property === 'line-height') return false;
      if (property === 'white-space') return false;
      if (property === 'overflow' || property === 'overflow-x' || property === 'overflow-y') return false;
      if (property === 'min-height') return false;
      if (property === 'font-family' && value.includes('monospace')) return false;
      if (property === 'color' && (value.includes('#f4f4f5') || value.includes('244, 244, 245') || value === 'white' || value === '#fff' || value === '#ffffff')) return false;

      return true;
    });

  return nextRules.join('; ');
}

function sanitizeRichHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/\sstyle="([^"]*)"/gi, (_match, style: string) => {
      const cleanStyle = sanitizeStyleAttribute(style);
      return cleanStyle ? ` style="${cleanStyle}"` : '';
    })
    .replace(/\sstyle='([^']*)'/gi, (_match, style: string) => {
      const cleanStyle = sanitizeStyleAttribute(style);
      return cleanStyle ? ` style="${cleanStyle}"` : '';
    })
    .replace(/<pre(\s[^>]*)?>/gi, '<p>')
    .replace(/<\/pre>/gi, '</p>')
    .replace(/<code(\s[^>]*)?>/gi, '<span>')
    .replace(/<\/code>/gi, '</span>')
    .replace(/javascript:/gi, '');
}

export function ProductDetailTitle({ detail }: { detail: ProductDetailBlock }) {
  return (
    <h3 className={`font-heading font-black [text-wrap:wrap] ${titleSizeClass[detail.headingSize || 'h3']} ${textAlignClass[detail.textAlign || 'right']}`} style={{ color: detail.textColor || undefined }}>
      {detail.title}
    </h3>
  );
}

export function ProductDetailRichText({ detail }: { detail: ProductDetailBlock }) {
  const style = {
    color: detail.textColor || undefined,
    fontWeight: detail.textBold ? 800 : undefined,
    fontStyle: detail.textItalic ? 'italic' : undefined,
    textDecoration: detail.textUnderline ? 'underline' : undefined,
  };

  if (detail.richTextHtml?.trim()) {
    return (
      <div
        className={`tm-product-rich-text tm-copy tm-text-muted mt-2 grid min-w-0 max-w-full gap-2 overflow-hidden whitespace-normal break-words font-medium leading-[2.13] [overflow-wrap:anywhere] [text-wrap:wrap] lg:mt-3 lg:gap-3 ${copySizeClass[detail.textSize || 'base']} ${textAlignClass[detail.textAlign || 'right']} [&_a]:font-extrabold [&_a]:text-[#b45309] [&_a]:underline [&_a]:underline-offset-4 [&_b]:font-extrabold [&_blockquote]:rounded-md [&_blockquote]:border [&_blockquote]:border-[#f0d8b4] [&_blockquote]:bg-[#fff7e8] [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:font-bold [&_font[size='2']]:text-xs lg:[&_font]:!text-[inherit] [&_font[size='3']]:text-sm [&_font[size='4']]:text-lg [&_font[size='5']]:text-2xl [&_font[size='6']]:text-3xl [&_h1]:tm-heading [&_h1]:font-heading [&_h1]:text-4xl [&_h1]:font-black [&_h1]:leading-tight lg:[&_h1]:!text-5xl [&_h2]:tm-heading [&_h2]:font-heading [&_h2]:text-3xl [&_h2]:font-black [&_h2]:leading-tight lg:[&_h2]:!text-4xl [&_h3]:tm-heading [&_h3]:font-heading [&_h3]:text-2xl [&_h3]:font-black lg:[&_h3]:!text-3xl [&_h4]:tm-heading [&_h4]:font-heading [&_h4]:text-xl [&_h4]:font-extrabold lg:[&_h4]:!text-2xl [&_hr]:my-4 [&_hr]:border-[#dbe4dd] [&_img]:my-3 [&_img]:max-h-[420px] [&_img]:w-full [&_img]:rounded-md [&_img]:object-contain [&_li]:leading-[2.13] lg:[&_li]:!text-[inherit] [&_mark]:rounded [&_mark]:px-1 [&_ol]:grid [&_ol]:list-decimal [&_ol]:gap-2 [&_ol]:pr-5 [&_p]:max-w-full [&_p]:break-words lg:[&_p]:!text-[inherit] [&_p]:[overflow-wrap:anywhere] [&_p]:[text-wrap:wrap] [&_span]:text-[inherit] lg:[&_span]:!text-[inherit] [&_strong]:font-extrabold [&_table]:mt-3 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-md [&_table]:border [&_table]:border-[#dbe4dd] [&_table]:bg-white [&_td]:border [&_td]:border-[#dbe4dd] [&_td]:px-3 [&_td]:py-2 lg:[&_td]:!text-base [&_th]:border [&_th]:border-[#dbe4dd] [&_th]:px-3 [&_th]:py-2 lg:[&_th]:!text-base [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-2 [&_ul]:pr-5 [&_video]:my-3 [&_video]:max-h-[420px] [&_video]:w-full [&_video]:rounded-md`}
        style={style}
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(detail.richTextHtml) }}
      />
    );
  }

  return (
    <div
      className={`tm-copy tm-text-muted mt-2 grid gap-2 whitespace-pre-line font-medium leading-[2.13] [text-wrap:wrap] lg:mt-3 lg:gap-3 ${copySizeClass[detail.textSize || 'base']} ${textAlignClass[detail.textAlign || 'right']}`}
      style={style}
    >
      {renderRichBlocks(detail.text)}
    </div>
  );
}

export function ProductDetailMedia({
  detail,
  src,
  className,
}: {
  detail: ProductDetailBlock;
  src: string;
  className: string;
}) {
  if (detail.mediaType === 'video' && src) {
    return <video src={src} className={className} controls playsInline preload="metadata" />;
  }

  return <img src={src} alt={detail.title} className={className} loading="lazy" decoding="async" width="900" height="640" sizes="(max-width: 768px) 100vw, 50vw" />;
}
