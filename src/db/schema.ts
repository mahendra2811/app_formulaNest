export const migration = `
CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS entities(kind TEXT NOT NULL,id TEXT NOT NULL,name TEXT NOT NULL,parent_id TEXT,PRIMARY KEY(kind,id));
CREATE TABLE IF NOT EXISTS content(id TEXT PRIMARY KEY,type TEXT NOT NULL,title TEXT NOT NULL,formula TEXT NOT NULL,search_text TEXT NOT NULL,data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS questions(id TEXT PRIMARY KEY,difficulty TEXT NOT NULL,data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS formula_sheets(id TEXT PRIMARY KEY,title TEXT NOT NULL,data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS mappings(owner_kind TEXT NOT NULL,owner_id TEXT NOT NULL,kind TEXT NOT NULL,target_id TEXT NOT NULL,PRIMARY KEY(owner_kind,owner_id,kind,target_id));
CREATE INDEX IF NOT EXISTS mapping_lookup ON mappings(kind,target_id,owner_kind,owner_id);
CREATE TABLE IF NOT EXISTS placement_mappings(owner_kind TEXT NOT NULL,owner_id TEXT NOT NULL,placement INTEGER NOT NULL,kind TEXT NOT NULL,target_id TEXT NOT NULL,PRIMARY KEY(owner_kind,owner_id,placement,kind,target_id));
CREATE INDEX IF NOT EXISTS placement_lookup ON placement_mappings(kind,target_id,owner_kind,owner_id,placement);
CREATE TABLE IF NOT EXISTS content_aliases(alias TEXT PRIMARY KEY,content_id TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS content_type ON content(type,title);
CREATE INDEX IF NOT EXISTS questions_difficulty ON questions(difficulty);
CREATE TABLE IF NOT EXISTS bookmarks(kind TEXT NOT NULL,item_id TEXT NOT NULL,created_at INTEGER NOT NULL,PRIMARY KEY(kind,item_id));
CREATE TABLE IF NOT EXISTS recent_items(item_id TEXT PRIMARY KEY,viewed_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS revision_items(item_id TEXT PRIMARY KEY,status TEXT NOT NULL CHECK(status IN ('revision','learned')),updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS test_attempts(id TEXT PRIMARY KEY,data TEXT NOT NULL,created_at INTEGER NOT NULL);
PRAGMA user_version=2;
`;
