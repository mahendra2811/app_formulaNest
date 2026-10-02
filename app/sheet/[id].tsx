import { useState } from "react";
import { Share } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Button,
  ContentList,
  Empty,
  Label,
  QueryState,
  Screen,
} from "../../src/components/ui";
import { useDatabase } from "../../src/hooks/database";
import { useQuery } from "../../src/hooks/query";
export default function Sheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { repo, refresh } = useDatabase();
  const [error, setError] = useState("");
  const q = useQuery(async () => {
    const sheet = await repo.sheet(id);
    return {
      sheet,
      items: sheet
        ? (await Promise.all(sheet.contentIds.map((i) => repo.item(i)))).filter(
            (i) => i !== null,
          )
        : [],
      bookmarked: (await repo.bookmarkIds("sheet")).includes(id),
    };
  }, [id]);
  const act = async (fn: () => Promise<unknown>) => {
    try {
      setError("");
      await fn();
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    }
  };
  return (
    <Screen title={q.data?.sheet?.title ?? "Formula sheet"} scroll={false}>
      <QueryState loading={q.loading} error={q.error} retry={q.reload} />
      {q.data && !q.data.sheet ? (
        <Empty title="Formula sheet not found" />
      ) : (
        q.data?.sheet && (
          <ContentList
            items={q.data.items}
            header={
              <>
                <Label muted>{q.data.sheet.description}</Label>
                <Button
                  title={
                    q.data.bookmarked
                      ? "Remove sheet bookmark"
                      : "Bookmark sheet"
                  }
                  onPress={() => act(() => repo.toggleBookmark(id, "sheet"))}
                />
                <Button
                  secondary
                  title="Share formula sheet"
                  onPress={() =>
                    act(() =>
                      Share.share({
                        title: q.data?.sheet?.title,
                        message: [
                          q.data?.sheet?.title,
                          ...(q.data?.items.map(
                            (i) => `${i.title}\n${i.formula}`,
                          ) ?? []),
                          "Formula Learner",
                        ].join("\n\n"),
                      }),
                    )
                  }
                />
                {!!error && <Label>{error}</Label>}
              </>
            }
          />
        )
      )}
    </Screen>
  );
}
