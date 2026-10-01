import type { GenerationViewItem } from "@/domain/generation/types";
import type { ShotDirectionDraft } from "@/domain/workspace/types";

const DB_NAME = "ai-cinematic-director";
const DB_VERSION = 1;
const STORE_NAME = "records";

type StoredRecord<T = unknown> = {
  key: string;
  value: T;
  updatedAt: string;
};

export type ProjectAspectRatio = "16:9" | "9:16" | "1:1";

export type LocalProjectDraft = {
  story: string;
  duration: number;
  aspectRatio: ProjectAspectRatio;
  genre: string;
  visualDirection: string;
};

export type LocalCharacter = {
  id: string;
  name: string;
  age?: number;
  description: string;
  createdAt: string;
};

export type LocalShotRecord = {
  draft: ShotDirectionDraft;
  rawOverrides: Record<string, unknown>;
};

export type LocalProjectBackup = {
  format: "ai-cinematic-director";
  version: 1;
  projectId: string;
  exportedAt: string;
  records: StoredRecord[];
};

function ensureBrowser() {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    throw new Error("이 브라우저에서는 로컬 저장소를 사용할 수 없습니다.");
  }
}

function openDatabase(): Promise<IDBDatabase> {
  ensureBrowser();
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("로컬 저장소를 열지 못했습니다."));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("로컬 저장 작업에 실패했습니다."));
  });
}

async function getRecord<T>(key: string): Promise<T | undefined> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const record = await requestResult(transaction.objectStore(STORE_NAME).get(key)) as StoredRecord<T> | undefined;
    return record?.value;
  } finally {
    database.close();
  }
}

async function putRecord<T>(key: string, value: T): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    await requestResult(transaction.objectStore(STORE_NAME).put({
      key,
      value,
      updatedAt: new Date().toISOString(),
    } satisfies StoredRecord<T>));
  } finally {
    database.close();
  }
}

async function getAllRecords(): Promise<StoredRecord[]> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readonly");
    return await requestResult(transaction.objectStore(STORE_NAME).getAll()) as StoredRecord[];
  } finally {
    database.close();
  }
}

const projectKey = (projectId: string) => `project:${projectId}`;
const shotKey = (projectId: string, shotId: string) => `shot:${projectId}:${shotId}`;
const generationsKey = (projectId: string) => `generations:${projectId}`;
const aspectKey = (projectId: string) => `aspect:${projectId}`;
const charactersKey = (projectId: string) => `characters:${projectId}`;

export async function requestPersistentStorage(): Promise<boolean | undefined> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return undefined;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return undefined;
  }
}

export function getLocalProject(projectId: string) {
  return getRecord<LocalProjectDraft>(projectKey(projectId));
}

export function saveLocalProject(projectId: string, value: LocalProjectDraft) {
  return putRecord(projectKey(projectId), value);
}

export function getLocalAspectRatio(projectId: string) {
  return getRecord<ProjectAspectRatio>(aspectKey(projectId));
}

export async function saveLocalAspectRatio(projectId: string, aspectRatio: ProjectAspectRatio): Promise<void> {
  await putRecord(aspectKey(projectId), aspectRatio);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("acd:aspect-ratio", { detail: { projectId, aspectRatio } }));
  }
}

export async function getLocalCharacters(projectId: string): Promise<LocalCharacter[]> {
  return (await getRecord<LocalCharacter[]>(charactersKey(projectId))) ?? [];
}

export async function addLocalCharacter(projectId: string, character: LocalCharacter): Promise<LocalCharacter[]> {
  const current = await getLocalCharacters(projectId);
  const next = [...current, character];
  await putRecord(charactersKey(projectId), next);
  return next;
}

export function getLocalShot(projectId: string, shotId: string) {
  return getRecord<LocalShotRecord>(shotKey(projectId, shotId));
}

export function saveLocalShot(projectId: string, shotId: string, value: LocalShotRecord) {
  return putRecord(shotKey(projectId, shotId), value);
}

export async function getLocalGenerations(projectId: string): Promise<GenerationViewItem[]> {
  return (await getRecord<GenerationViewItem[]>(generationsKey(projectId))) ?? [];
}

export async function saveLocalGeneration(projectId: string, item: GenerationViewItem): Promise<GenerationViewItem[]> {
  const current = await getLocalGenerations(projectId);
  const withoutSameId = current.filter((entry) => entry.id !== item.id);
  const next = [item, ...withoutSameId].slice(0, 100);
  await putRecord(generationsKey(projectId), next);
  return next;
}

export async function updateLocalGeneration(projectId: string, id: string, patch: Partial<GenerationViewItem>): Promise<GenerationViewItem[]> {
  const current = await getLocalGenerations(projectId);
  const next = current.map((entry) => entry.id === id ? { ...entry, ...patch } : entry);
  await putRecord(generationsKey(projectId), next);
  return next;
}

export async function selectLocalGeneration(projectId: string, id: string, shotId: string): Promise<GenerationViewItem[]> {
  const current = await getLocalGenerations(projectId);
  const next = current.map((entry) => entry.shotId === shotId ? { ...entry, selected: entry.id === id } : entry);
  await putRecord(generationsKey(projectId), next);
  return next;
}

export async function exportProjectBackup(projectId: string): Promise<LocalProjectBackup> {
  const all = await getAllRecords();
  const prefixes = [projectKey(projectId), aspectKey(projectId), charactersKey(projectId), `shot:${projectId}:`, generationsKey(projectId)];
  const records = all.filter((record) => prefixes.some((prefix) => record.key === prefix || record.key.startsWith(prefix)));
  return {
    format: "ai-cinematic-director",
    version: 1,
    projectId,
    exportedAt: new Date().toISOString(),
    records,
  };
}

export async function downloadProjectBackup(projectId: string): Promise<void> {
  const backup = await exportProjectBackup(projectId);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `ai-cinematic-director-${projectId}-${date}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function isBackup(value: unknown): value is LocalProjectBackup {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.format === "ai-cinematic-director"
    && record.version === 1
    && typeof record.projectId === "string"
    && Array.isArray(record.records);
}

export async function importProjectBackup(file: File, expectedProjectId?: string): Promise<string> {
  const parsed = JSON.parse(await file.text()) as unknown;
  if (!isBackup(parsed)) throw new Error("AI Cinematic Director 백업 파일이 아닙니다.");
  if (expectedProjectId && parsed.projectId !== expectedProjectId) {
    throw new Error("현재 프로젝트와 다른 프로젝트의 백업입니다.");
  }

  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    for (const record of parsed.records) {
      if (!record || typeof record.key !== "string") continue;
      store.put(record);
    }
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("백업을 가져오지 못했습니다."));
      transaction.onabort = () => reject(transaction.error ?? new Error("백업 가져오기가 중단되었습니다."));
    });
  } finally {
    database.close();
  }
  return parsed.projectId;
}
