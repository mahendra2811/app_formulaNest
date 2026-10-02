import { useState } from "react";
import { router } from "expo-router";
import {
  Button,
  Card,
  Chip,
  Chips,
  ContentCard,
  Empty,
  EntityCard,
  Label,
  QueryState,
  Screen,
} from "../../src/components/ui";
import { useDatabase } from "../../src/hooks/database";
import { useQuery } from "../../src/hooks/query";
import { audienceFilter, usePreferences } from "../../src/stores/preferences";
import { scoreAttempt } from "../../src/utils/scoring";
type Tab =
  "bookmarks" | "recent" | "revision" | "learned" | "sheets" | "history";
export default function Library() {
  const { repo, refresh } = useDatabase();
  const p = usePreferences((s) => s.preferences);
  const [tab, setTab] = useState<Tab>("bookmarks");
  const [type, setType] = useState<"all" | "formula" | "short_note">("all");
  const [error, setError] = useState("");
  const [limit,setLimit]=useState(100);
  const q = useQuery(
    async () => ({
      items: ["bookmarks", "recent", "revision", "learned"].includes(tab)
        ? await repo.collection(
            tab as "bookmarks" | "recent" | "revision" | "learned",
            type === "all" ? {limit} : { type,limit },
          )
        : [],
      sheets: await repo.sheets(audienceFilter(p)),
      savedSheets: await repo.bookmarkIds("sheet"),
      attempts: await repo.attempts(),
    }),
    [tab, type, p,limit],
  );
  const action = async (id: string, status: "learned" | null) => {
    try {
      setError("");
      await repo.revision(id, status);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update revision.");
    }
  };
  return (
    <Screen
      title="Your learning library"
      subtitle="Saved on this device, ready whenever you are."
    >
      <Chips>
        {(
          [
            "bookmarks",
            "revision",
            "learned",
            "recent",
            "sheets",
            "history",
          ] as const
        ).map((t) => (
          <Chip
            key={t}
            title={t[0].toUpperCase() + t.slice(1)}
            selected={tab === t}
            onPress={() => setTab(t)}
          />
        ))}
      </Chips>
      {["bookmarks", "recent", "revision", "learned"].includes(tab) && (
        <Chips>
          {(["all", "formula", "short_note"] as const).map((t) => (
            <Chip
              key={t}
              title={
                t === "all"
                  ? "All types"
                  : t === "formula"
                    ? "Formulas"
                    : "Notes"
              }
              selected={type === t}
              onPress={() => setType(t)}
            />
          ))}
        </Chips>
      )}
      <QueryState loading={q.loading} error={q.error} retry={q.reload} />
      {!!error && <Label>{error}</Label>}
      {q.data && (
        <>
          {["bookmarks", "recent", "revision", "learned"].includes(tab) && (
            <>
              {q.data.items.map((item) => (
                <Card key={item.id}>
                  <ContentCard item={item} />
                  {tab === "revision" && (
                    <>
                      <Button
                        title="Mark learned"
                        onPress={() => action(item.id, "learned")}
                      />
                      <Button
                        secondary
                        title="Remove from revision"
                        onPress={() => action(item.id, null)}
                      />
                    </>
                  )}
                </Card>
              ))}
              {!q.data.items.length && (
                <Empty
                  title={`No ${tab === "recent" ? "recent items" : tab === "learned" ? "learned items" : tab === "revision" ? "revision items" : "bookmarks"} yet`}
                  detail="Open a formula or note to build your library."
                />
              )}
              {q.data.items.length===limit&&!q.loading&&<Button title="Load more saved items" secondary onPress={()=>setLimit(n=>n+100)}/>}
              {tab === "bookmarks" &&
                q.data.savedSheets.map((id) => (
                  <EntityCard
                    key={id}
                    entity={{
                      id,
                      name:
                        q.data?.sheets.find((s) => s.id === id)?.title ??
                        "Saved formula sheet",
                    }}
                    onPress={() =>
                      router.push({ pathname: "/sheet/[id]", params: { id } })
                    }
                  />
                ))}
            </>
          )}
          {tab === "sheets" && (
            <>
              {q.data.sheets.map((s) => (
                <EntityCard
                  key={s.id}
                  entity={{ id: s.id, name: s.title }}
                  detail={
                    q.data?.savedSheets.includes(s.id)
                      ? "Bookmarked"
                      : s.description
                  }
                  onPress={() =>
                    router.push({
                      pathname: "/sheet/[id]",
                      params: { id: s.id },
                    })
                  }
                />
              ))}
              {!q.data.sheets.length && (
                <Empty title="No formula sheets for this study plan" />
              )}
            </>
          )}
          {tab === "history" && (
            <>
              {q.data.attempts.map((a) => (
                <EntityCard
                  key={a.id}
                  entity={{
                    id: a.id,
                    name: a.finished
                      ? `${scoreAttempt(a).correct}/${a.questions.length} correct`
                      : "Continue unfinished test",
                  }}
                  detail={new Date(a.createdAt).toLocaleString()}
                  onPress={() =>
                    router.push({
                      pathname: a.finished ? "/test-result/[id]" : "/test/[id]",
                      params: { id: a.id },
                    })
                  }
                />
              ))}
              {!q.data.attempts.length && (
                <Empty
                  title="No test attempts yet"
                  detail="Take a quick quiz from Practice."
                />
              )}
            </>
          )}
        </>
      )}
    </Screen>
  );
}
