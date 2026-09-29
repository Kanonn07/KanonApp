const STORAGE_KEY = "kanon-voice-diary-v2";
const LEGACY_STORAGE_KEY = "kanon-voice-diary-v1";

function normalizeEntry(value) {
  if (typeof value === "string") {
    return { text: value, title: "", titleEdited: false };
  }

  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new Error("日記データの形式が正しくありません。");
  }

  return {
    text: typeof value.text === "string" ? value.text : "",
    title: typeof value.title === "string" ? value.title : "",
    titleEdited: Boolean(value.titleEdited),
  };
}

export function loadDiaryEntries() {
  let serialized = localStorage.getItem(STORAGE_KEY);
  const migrateLegacy = serialized === null;

  if (migrateLegacy) {
    serialized = localStorage.getItem(LEGACY_STORAGE_KEY);
  }
  if (serialized === null) return {};

  const stored = JSON.parse(serialized);
  if (!stored || Array.isArray(stored) || typeof stored !== "object") {
    throw new Error("保存された日記の形式が正しくありません。");
  }

  const entries = {};
  for (const [dateKey, value] of Object.entries(stored)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      throw new Error(`日記の日付が正しくありません: ${dateKey}`);
    }
    entries[dateKey] = normalizeEntry(value);
  }

  if (migrateLegacy) saveDiaryEntries(entries);
  return entries;
}

export function saveDiaryEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
