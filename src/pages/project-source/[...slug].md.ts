import { getCollection } from "astro:content";
export async function getStaticPaths() {
  const readmes = await getCollection("projectReadmes");
  const docs = await getCollection("documents");
  return [...readmes.map((entry) => ({ params: { slug: `readmes/${entry.id}` }, props: { body: entry.body ?? "" } })),
    ...docs.map((entry) => ({ params: { slug: `docs/${entry.id}` }, props: { body: entry.body ?? "" } }))];
}
export function GET({ props }: { props: { body: string } }) {
  return new Response(props.body, { headers: { "Content-Type": "text/markdown; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
}
