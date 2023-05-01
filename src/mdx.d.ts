declare module '*.mdx' {
  import type {FC} from 'react';

  const MarkdownComponent: FC;

  export default MarkdownComponent;
}

declare module '*.md' {
  import type {FC} from 'react';

  const MarkdownComponent: FC;

  export default MarkdownComponent;
}
