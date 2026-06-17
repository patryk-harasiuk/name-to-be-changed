import { marked } from 'marked';

export type ScriptStepKind =
  | 'heading'
  | 'paragraph'
  | 'blockquote'
  | 'code'
  | 'list'
  | 'table'
  | 'html'
  | 'thematic-break'
  | 'other';

export interface ScriptStep {
  id: string;
  pageId: string;
  index: number;
  pageIndex: number;
  kind: ScriptStepKind;
  html: string;
  raw: string;
  title?: string;
  depth?: number;
  zoom: number;
}

export interface ScriptPage {
  id: string;
  index: number;
  title: string;
  level?: number;
  steps: ScriptStep[];
}

export interface ParsedScript {
  title: string;
  pages: ScriptPage[];
  steps: ScriptStep[];
}

type MarkdownToken = {
  type: string;
  raw?: string;
  text?: string;
  depth?: number;
  lang?: string;
};

const pageHeadingDepth = 2;

const tokenKind = (token: MarkdownToken): ScriptStepKind => {
  switch (token.type) {
    case 'heading':
      return 'heading';
    case 'paragraph':
      return 'paragraph';
    case 'blockquote':
      return 'blockquote';
    case 'code':
      return 'code';
    case 'list':
      return 'list';
    case 'table':
      return 'table';
    case 'html':
      return 'html';
    case 'hr':
      return 'thematic-break';
    default:
      return 'other';
  }
};

const zoomForToken = (token: MarkdownToken): number => {
  if (token.type === 'blockquote') {
    return 1.14;
  }

  if (token.type === 'code') {
    return 1.08;
  }

  if (token.type === 'heading' && token.depth === 1) {
    return 1.04;
  }

  return 1;
};

const fallbackTitle = (pageNumber: number): string => `Page ${pageNumber}`;

const createPage = (index: number, title?: string, level?: number): ScriptPage => ({
  id: `page-${index}`,
  index,
  title: title?.trim() || fallbackTitle(index + 1),
  level,
  steps: [],
});

const renderToken = (token: MarkdownToken): string =>
  marked.parser([token] as never);

export const parseMarkdownScript = (markdownText: string): ParsedScript => {
  const tokens = marked.lexer(markdownText) as MarkdownToken[];
  const pages: ScriptPage[] = [];
  const steps: ScriptStep[] = [];

  let currentPage = createPage(0, 'Opening');
  pages.push(currentPage);

  tokens.forEach((token) => {
    if (token.type === 'space') {
      return;
    }

    const isPageHeading = token.type === 'heading' && (token.depth ?? 7) <= pageHeadingDepth;
    const title = token.text?.trim();

    if (isPageHeading && currentPage.steps.length > 0) {
      currentPage = createPage(pages.length, title, token.depth);
      pages.push(currentPage);
    } else if (isPageHeading && title) {
      currentPage.title = title;
      currentPage.level = token.depth;
    }

    const step: ScriptStep = {
      id: `step-${steps.length}`,
      pageId: currentPage.id,
      index: steps.length,
      pageIndex: currentPage.index,
      kind: tokenKind(token),
      html: renderToken(token),
      raw: token.raw ?? '',
      title,
      depth: token.depth,
      zoom: zoomForToken(token),
    };

    currentPage.steps.push(step);
    steps.push(step);
  });

  const nonEmptyPages = pages.filter((page) => page.steps.length > 0);

  return {
    title: steps.find((step) => step.kind === 'heading')?.title ?? 'Interactive Script',
    pages: nonEmptyPages,
    steps,
  };
};