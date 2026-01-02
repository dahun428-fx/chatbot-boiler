import { HTMLAttributes } from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remakrBreak from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import { cn, replaceNewlineWithBr } from '@/shared/lib/common';

import IntrinsicElements = React.JSX.IntrinsicElements;

const markdownComponents = {
  ul: (props: IntrinsicElements['ul']) => (
    <ul className="ms-4 list-disc whitespace-normal leading-relaxed first:my-0" {...props} />
  ),
  ol: (props: IntrinsicElements['ol']) => (
    <ol className="ms-5 list-decimal whitespace-normal leading-relaxed first:my-0" {...props} />
  ),
  table: (props: IntrinsicElements['table']) => (
    <table className="my-4 table-auto border-collapse first:my-0" {...props} />
  ),
  thead: (props: IntrinsicElements['thead']) => <thead className="bg-default-200" {...props} />,
  tr: (props: IntrinsicElements['tr']) => <tr className="border-b last:border-none" {...props} />,
  h1: (props: IntrinsicElements['h1']) => (
    <h1
      className="my-4 text-3xl font-bold after:mx-1 after:text-default-200 hover:after:content-['#']"
      {...props}
    />
  ),
  h2: (props: IntrinsicElements['h2']) => (
    <h2
      className="mb-2 text-2xl font-bold after:mx-1 after:text-default-200 hover:after:content-['#']"
      {...props}
    />
  ),
  h3: (props: IntrinsicElements['h3']) => (
    <h3
      className="mb-1 text-xl font-bold after:mx-1 after:text-default-200 hover:after:content-['#']"
      {...props}
    />
  ),
  h4: (props: IntrinsicElements['h4']) => (
    <h4
      className="mb-0.5 text-lg font-bold after:mx-1 after:text-default-200 hover:after:content-['#']"
      {...props}
    />
  ),
  h5: (props: IntrinsicElements['h5']) => (
    <h5
      className="mb-0.5 text-base font-semibold after:mx-1 after:text-default-200 hover:after:content-['#']"
      {...props}
    />
  ),
  h6: (props: IntrinsicElements['h6']) => (
    <h6
      className="mb-0.5 text-base font-semibold text-default-600 after:mx-1 after:text-default-200 hover:after:content-['#']"
      {...props}
    />
  ),
  // ⚠️ 문단에는 whitespace 주지 마세요. 루트에서 관리합니다.
  p: (props: IntrinsicElements['p']) => <p className="my-4 text-[16px]">{props.children}</p>,
  li: (props: IntrinsicElements['li']) => <li className="text-base leading-relaxed" {...props} />,
  strong: (props: IntrinsicElements['strong']) => (
    <strong className="font-bold leading-relaxed" {...props} />
  ),
  em: (props: IntrinsicElements['em']) => <em className="font-bold leading-relaxed" {...props} />,
  a: (props: IntrinsicElements['a']) => (
    <a
      className="text-base leading-relaxed text-secondary underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  th: (props: IntrinsicElements['th']) => (
    <th scope="col" className="px-6 py-1.5 font-semibold" {...props} />
  ),
  td: (props: IntrinsicElements['td']) => <td className="px-6 py-3" {...props} />,
};

const MarkdownContent: React.FC<TMarkdownContentProps> = ({ markdownContent, className }) => {
  const processedContent = replaceNewlineWithBr(markdownContent);

  return (
    <div className={cn('text-left', className)}>
      <Markdown
        components={markdownComponents}
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm, remakrBreak]}
        className={cn('prose max-w-none break-keep text-[16px]')}
      >
        {processedContent}
      </Markdown>
    </div>
  );
};

export default MarkdownContent;

type TMarkdownContentProps = {
  markdownContent: string;
} & HTMLAttributes<HTMLDivElement>;
