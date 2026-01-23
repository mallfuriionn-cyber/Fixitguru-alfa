/**
 * Služba pro asynchronní načítání obsahu stránek z externích HTML souborů.
 */
export const fetchPageContent = async (pageId: string): Promise<string> => {
  try {
    const response = await fetch(`./pages/${pageId}.html`);
    if (!response.ok) {
      return `<p class="text-red-400">Chyba: Stránka "${pageId}" nebyla nalezena.</p>`;
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading page ${pageId}:`, error);
    return `<p class="text-red-400">Došlo k chybě při načítání obsahu stránky.</p>`;
  }
};
