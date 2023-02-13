import { JSDOM } from 'jsdom';

export const useJSDom = () => {
  const getArrayParagraphs = (html: string): string[] => {
    const fragment = JSDOM.fragment(html);
    const array = Array.from(fragment.childNodes);

    return array.map(node => {
      const dom = new JSDOM();
      const { window } = dom;
      const { document } = window;

      document.body.append(node);

      return document.body.innerHTML;
    });
  };

  return {
    getArrayParagraphs
  };
};
