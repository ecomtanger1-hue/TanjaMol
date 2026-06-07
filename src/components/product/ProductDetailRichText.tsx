import type { ReactNode } from 'react';
import type { ProductDetailBlock } from '../../storefrontRuntime';

const textAlignClass = {
  right: 'text-right',
  center: 'text-center',
  left: 'text-left',
} as const;

const copySizeClass = {
  sm: 'text-sm lg:text-base',
  base: 'text-sm lg:text-base',
  lg: 'text-base lg:text-lg',
} as const;

const titleSizeClass = {
  h2: 'text-3xl lg:text-4xl',
  h3: 'text-2xl lg:text-3xl',
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

function sanitizeRichHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

export function ProductDetailTitle({ detail }: { detail: ProductDetailBlock }) {
  return (
    <h3 className={`tm-heading font-heading font-black ${titleSizeClass[detail.headingSize || 'h3']} ${textAlignClass[detail.textAlign || 'right']}`}>
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
        className={`tm-copy tm-text-muted mt-3 grid gap-3 whitespace-normal font-medium leading-8 ${copySizeClass[detail.textSize || 'base']} ${textAlignClass[detail.textAlign || 'right']} [&_a]:font-extrabold [&_a]:text-[#b45309] [&_a]:underline [&_a]:underline-offset-4 [&_b]:font-extrabold [&_font[size='2']]:text-xs [&_font[size='3']]:text-sm [&_font[size='4']]:text-lg [&_font[size='5']]:text-2xl [&_font[size='6']]:text-3xl [&_h2]:tm-heading [&_h2]:font-heading [&_h2]:text-3xl [&_h2]:font-black [&_h3]:tm-heading [&_h3]:font-heading [&_h3]:text-2xl [&_h3]:font-black [&_li]:leading-8 [&_ol]:grid [&_ol]:list-decimal [&_ol]:gap-2 [&_ol]:pr-5 [&_strong]:font-extrabold [&_table]:mt-3 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-md [&_table]:border [&_table]:border-[#dbe4dd] [&_table]:bg-white [&_td]:border [&_td]:border-[#dbe4dd] [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-[#dbe4dd] [&_th]:px-3 [&_th]:py-2 [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-2 [&_ul]:pr-5`}
        style={style}
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(detail.richTextHtml) }}
      />
    );
  }

  return (
    <div
      className={`tm-copy tm-text-muted mt-3 grid gap-3 whitespace-pre-line font-medium leading-8 ${copySizeClass[detail.textSize || 'base']} ${textAlignClass[detail.textAlign || 'right']}`}
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
