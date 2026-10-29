import type { FAQ } from '@/data/pageFaqs';

/** Batch 10: turn a hand-written FAQPage JSON-LD object into PageFAQ items, so pages that
 *  only shipped the schema can render the same Q&As visibly (PageFAQ re-emits the JSON-LD
 *  from exactly these items — one source, no drift between schema and page). */
export function faqItemsFromSchema(schema: { mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }> }): FAQ[] {
  return schema.mainEntity.map(q => ({ question: q.name, answer: q.acceptedAnswer.text }));
}
