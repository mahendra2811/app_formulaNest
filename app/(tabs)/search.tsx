import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import {
  Chip,
  Chips,
  ContentList,
  Empty,
  Input,
  Label,
  QueryState,
  Screen,
} from "../../src/components/ui";
import { useDatabase } from "../../src/hooks/database";
import { useQuery } from "../../src/hooks/query";
import { audienceFilter, usePreferences } from "../../src/stores/preferences";
import type { ContentFilter, ContentType } from "../../src/types/content";
export default function Search() {
  const preferences = usePreferences((s) => s.preferences);
  return <SearchContent key={JSON.stringify(preferences)} />;
}
function SearchContent() {
  const { repo } = useDatabase();
  const p = usePreferences((s) => s.preferences);
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [customFilters, setFilters] = useState<ContentFilter | null>(null);
  const filters = customFilters ?? audienceFilter(p);
  const [page, setPage] = useState(100);
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(text);
      setPage(100);
    }, 150);
    return () => clearTimeout(timer);
  }, [text]);
  const meta = useQuery(
    async () => ({
      classes: await repo.entities("classes"),
      exams: await repo.entities("exams"),
      subjects: await repo.availableEntities("subjects", {
        ...filters,
        subjectIds: undefined,
        chapterId: undefined,
        topicId: undefined,
      }),
      chapters: await repo.availableEntities("chapters", {
        ...filters,
        chapterId: undefined,
        topicId: undefined,
      }),
      contentTypes: await repo.contentTypes(),
    }),
    [
      filters.mode,
      filters.classId,
      filters.examId,
      filters.boardId,
      filters.streamId,
      filters.subjectIds,
    ],
  );
  const q = useQuery(
    () => repo.content({ ...filters, query, limit: page }),
    [filters, query, page],
  );
  const update = (f: Partial<ContentFilter>) => {
    setFilters((s) => ({ ...(s ?? audienceFilter(p)), ...f }));
    setPage(100);
  };
  return (
    <Screen
      title="Find it offline"
      subtitle="Search supplied study content, notes and keywords."
      scroll={false}
    >
      <Input
        value={text}
        onChangeText={setText}
        placeholder="Search, e.g. sin or Ohm"
      />
      <Chips>
        <Chip
          title={expanded ? "Hide filters" : "Filters"}
          selected={expanded}
          onPress={() => setExpanded((v) => !v)}
        />
        <Chip title="My study plan" onPress={() => setFilters(null)} />
        <Chip
          title="All supplied content"
          selected={!filters.mode}
          onPress={() => setFilters({})}
        />
      </Chips>
      {expanded && (
        <ScrollView style={{ maxHeight: 310, flexGrow: 0 }}>
          <Label>Audience</Label>
          <Chips>
            <Chip
              title="School"
              selected={filters.mode === "school"}
              onPress={() =>
                update({
                  mode: "school",
                  classId: p.classId,
                  examId: undefined,
                  boardId: undefined,
                  streamId: undefined,
                })
              }
            />
            <Chip
              title="Competitive"
              selected={filters.mode === "competitive"}
              onPress={() =>
                update({
                  mode: "competitive",
                  examId: p.examId,
                  classId: undefined,
                  boardId: undefined,
                  streamId: undefined,
                })
              }
            />
          </Chips>
          <Chips>
            {(filters.mode === "school"
              ? meta.data?.classes
              : filters.mode === "competitive"
                ? meta.data?.exams
                : []
            )?.map((e) => (
              <Chip
                key={e.id}
                title={e.name}
                selected={
                  (filters.mode === "school"
                    ? filters.classId
                    : filters.examId) === e.id
                }
                onPress={() =>
                  update(
                    filters.mode === "school"
                      ? { classId: e.id }
                      : { examId: e.id },
                  )
                }
              />
            ))}
          </Chips>
          <Label>Subject</Label>
          <Chips>
            <Chip
              title="All subjects"
              selected={!filters.subjectIds?.length}
              onPress={() => update({ subjectIds: [], chapterId: undefined })}
            />
            {meta.data?.subjects.map((e) => (
              <Chip
                key={e.id}
                title={e.name}
                selected={filters.subjectIds?.includes(e.id)}
                onPress={() =>
                  update({ subjectIds: [e.id], chapterId: undefined })
                }
              />
            ))}
          </Chips>
          <Label>Chapter</Label>
          <Chips>
            <Chip
              title="All chapters"
              selected={!filters.chapterId}
              onPress={() => update({ chapterId: undefined })}
            />
            {meta.data?.chapters.map((e) => (
              <Chip
                key={e.id}
                title={e.name}
                selected={filters.chapterId === e.id}
                onPress={() => update({ chapterId: e.id })}
              />
            ))}
          </Chips>
        </ScrollView>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginBottom: 14 }}
      >
        <Chips>
          {[
            { id: "all", name: "All types" },
            ...(meta.data?.contentTypes ?? []).map((type: ContentType) => ({
              id: type,
              name: type.replaceAll("_", " "),
            })),
          ].map(({ id: type, name }) => (
            <Chip
              key={type}
              title={name}
              selected={(filters.type ?? "all") === type}
              onPress={() =>
                update({
                  type: type === "all" ? undefined : (type as ContentType),
                })
              }
            />
          ))}
        </Chips>
      </ScrollView>
      <QueryState loading={q.loading} error={q.error} retry={q.reload} />
      {q.data?.length === 0 ? (
        <Empty
          title="No matching content"
          detail="Try a shorter search or change the filters."
        />
      ) : (
        q.data && (
          <ContentList
            items={q.data}
            onLoadMore={
              q.data.length === page && !q.loading
                ? () => setPage((p) => p + 100)
                : undefined
            }
            header={
              <Label muted style={{ fontSize: 13, marginBottom: 10 }}>
                {q.data.length} results
                {q.data.length === page
                  ? " · refine your filters to narrow results"
                  : ""}
              </Label>
            }
          />
        )
      )}
    </Screen>
  );
}
