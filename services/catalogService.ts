
export interface CatalogFile {
  path: string;
  description: string;
}

export interface CatalogData {
  project: string;
  version: string;
  files: CatalogFile[];
}

export const fetchCatalog = async (): Promise<CatalogData | null> => {
  try {
    const response = await fetch('./file-catalog.json');
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};
