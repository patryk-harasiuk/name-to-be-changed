import { marked } from 'marked';

export const parseToCanvas = (markdownText: string): string => {
  let panelIndex = 0;
  
  const renderer = {
    heading(text: string, level: number) {
      if (level === 2) {
        const closeTag = panelIndex > 0 ? '</section>' : '';
        const currentId = panelIndex;
        panelIndex++;
        
        return `${closeTag}<section class="panel" id="panel-${currentId}"><h2>${text}</h2>`;
      }
      return `<h${level}>${text}</h${level}>`;
    }
  };

  marked.use({ renderer });

  const rawHtml = marked.parse(markdownText) as string;
  return `<section class="marvel-panel" id="panel-0">${rawHtml}</section>`;
};