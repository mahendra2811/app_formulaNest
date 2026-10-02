import { useState } from "react";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import {
  Button,
  Card,
  Chips,
  ContentCard,
  Empty,
  FormulaRenderer,
  Label,
  ModeToggle,
  QueryState,
  Screen,
  Section,
} from "../../components/ui";
import { useDatabase } from "../../hooks/database";
import { useQuery } from "../../hooks/query";
import { usePreferences, audienceFilter } from "../../stores/preferences";
import { shareContent } from "../../utils/share";
import { ContentExtras } from "../../components/ContentExtras";
export function ContentDetail({ id }: { id: string }) {
  const { repo, refresh } = useDatabase();
  const mode = usePreferences((s) => s.learningMode);
  const filter = audienceFilter(usePreferences((s) => s.preferences));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const q = useQuery(async () => {
    const item = await repo.item(id);
    if (item) await repo.recent(id);
    const entities = (
      await Promise.all(
        ["subjects", "chapters", "classes", "exams"].map((k) =>
          repo.entities(k),
        ),
      )
    ).flat();
    return {
      item,
      bookmarked: (await repo.bookmarkIds()).includes(item?.id ?? id),
      status: await repo.status(id),
      related: item
        ? (await Promise.all(item.relatedIds.map((i) => repo.item(i)))).filter(
            (i) => i !== null,
          )
        : [],
      names: Object.fromEntries(entities.map((e) => [e.id, e.name])),
    };
  }, [id]);
  const action = async (fn: () => Promise<unknown>, success = "") => {
    try {
      setBusy(true);
      setMessage("");
      await fn();
      refresh();
      if (success) setMessage(success);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "This action could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  };
  const item = q.data?.item;
  return (
    <Screen title={item?.title ?? "Content"}>
      <QueryState loading={q.loading} error={q.error} retry={q.reload} />
      {q.data && !item && (
        <Empty
          title="Content not found"
          detail="This item may no longer be part of the installed content pack."
        />
      )}
      {item && q.data && (
        <>
          <Label muted>
            {item.subjects.map((i) => q.data?.names[i] ?? i).join(" · ")} ·{" "}
            {item.chapters.map((i) => q.data?.names[i] ?? i).join(" · ")}
          </Label>
          <ModeToggle />
          {item.formula && item.type !== "content_reference" && (
            <FormulaRenderer formula={item.formula} />
          )}
          <ContentExtras item={item} />
          <Label style={{ marginBottom: 18 }}>{item.summary}</Label>
          <Chips>
            {item.tags.map((tag) => (
              <Card key={tag}>
                <Label muted style={{ fontSize: 12 }}>
                  {tag}
                </Label>
              </Card>
            ))}
          </Chips>
          <Label muted style={{ fontSize: 13 }}>
            Importance {item.importance}/5 · {item.difficulty} ·{" "}
            {q.data.status === "learned"
              ? "Learned"
              : q.data.status === "revision"
                ? "Needs revision"
                : "Ready to learn"}
          </Label>
          <Button
            disabled={busy}
            title={q.data.bookmarked ? "Remove bookmark" : "Bookmark"}
            onPress={() => action(() => repo.toggleBookmark(id))}
          />
          <Button
            disabled={busy}
            secondary
            title={
              q.data.status === "revision"
                ? "Remove from revision"
                : "Mark for revision"
            }
            onPress={() =>
              action(() =>
                repo.revision(
                  id,
                  q.data?.status === "revision" ? null : "revision",
                ),
              )
            }
          />
          <Button
            disabled={busy}
            secondary
            title={
              q.data.status === "learned"
                ? "Mark as not learned"
                : "Mark as learned"
            }
            onPress={() =>
              action(() =>
                repo.revision(
                  id,
                  q.data?.status === "learned" ? null : "learned",
                ),
              )
            }
          />
          <Button
            disabled={busy}
            secondary
            title="Share"
            onPress={() => action(() => shareContent(item, q.data?.names))}
          />
          {item.formula && (
            <Button
              disabled={busy}
              secondary
              title="Copy formula"
              onPress={() =>
                action(
                  () => Clipboard.setStringAsync(item.formula),
                  "Formula copied.",
                )
              }
            />
          )}{" "}
          {!!message && <Label>{message}</Label>}
          {(mode === "learn" || item.type !== "formula") && (
            <>
              <Section title="Explanation">
                <Label>{item.explanation}</Label>
              </Section>
              {item.variables.length > 0 && (
                <Section title="Variables & units">
                  <Card>
                    {item.variables.map((v) => (
                      <Label key={v.symbol}>
                        {v.symbol} — {v.meaning}
                        {v.unit ? ` (${v.unit})` : ""}
                      </Label>
                    ))}
                    {item.units.length > 0 && (
                      <Label muted>Units: {item.units.join(", ")}</Label>
                    )}
                  </Card>
                </Section>
              )}
              {item.whenToUse && (
                <Section title="When to use">
                  <Label>{item.whenToUse}</Label>
                </Section>
              )}
              {item.example && (
                <Section title="Worked example">
                  <Card>
                    <Label>{item.example}</Label>
                  </Card>
                </Section>
              )}
              {item.commonMistake && (
                <Section title="Common mistake">
                  <Card>
                    <Label>{item.commonMistake}</Label>
                  </Card>
                </Section>
              )}
              {item.body.map((section, index) => (
                <Section
                  key={`${section.heading}-${index}`}
                  title={section.heading}
                >
                  {section.bullets.map((bullet, i) => (
                    <Label key={i} style={{ marginBottom: 8 }}>
                      • {bullet}
                    </Label>
                  ))}
                </Section>
              ))}
              {q.data.related.length > 0 && (
                <Section
                  title={
                    item.type === "short_note"
                      ? "Referenced formulas"
                      : "Related formulas"
                  }
                >
                  {q.data.related.map((related) => (
                    <ContentCard key={related.id} item={related} />
                  ))}
                </Section>
              )}
            </>
          )}
          <Section title="Study audiences">
            <Label muted>
              {[...item.classes, ...item.exams]
                .map((i) => q.data?.names[i] ?? i)
                .join(" · ")}
            </Label>
          </Section>
          <Button
            title="Practice this chapter"
            disabled={busy}
            onPress={() =>
              action(async () => {
                const a = await repo.createTest({
                  ...filter,
                  chapterId: item.chapters[0],
                  count: 5,
                  difficulty: "mixed",
                });
                if (!a)
                  throw new Error(
                    "No questions available for this chapter yet.",
                  );
                router.push({ pathname: "/test/[id]", params: { id: a.id } });
              })
            }
          />
        </>
      )}
    </Screen>
  );
}
