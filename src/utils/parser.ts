import { marked } from 'marked';

export const parseToSlides = (markdownText: string): string[] => {
  const rawSlides = markdownText.split(/(?=## )/);
  
  return rawSlides
    .filter((slide: string) => slide.trim() !== '')
    .map((slide: string) => marked.parse(slide) as string);
};