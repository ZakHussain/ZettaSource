export type DocId = string;
export type NoteId = string;

export type PageAnchor = {
  page: number;
  rect?: [number, number, number, number]; // [x, y, width, height] normalized 0-1
};

export type Note = {
  id: NoteId;
  docId: DocId;
  body: string;
  tags?: string[];
  anchor: PageAnchor;
  createdAt: string;
  updatedAt: string;
};

export type DocSource = 
  | { 
      kind: "upload"; 
      name: string; 
      size: number; 
      mime: string; 
      localUrl: string; // Object URL from uploaded file
    }
  | { 
      kind: "url"; 
      url: string; 
      title?: string; 
    };

export type Doc = {
  id: DocId;
  projectId: string;
  title: string;
  source: DocSource;
  lastViewedPage?: number;
  createdAt: string;
};