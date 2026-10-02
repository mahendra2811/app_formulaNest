import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import type { ContentItem } from "../types/content";
import { Card, Label, Section, useTheme } from "./ui";

const text = (value: unknown): string | null => {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  )
    return String(value);
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(", ");
  return null;
};
const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
const label = (key: string) =>
  key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function RawValue({ value }: { value: unknown }) {
  const object = record(value);
  if (object) {
    return (
      <View style={{ gap: 5 }}>
        {Object.entries(object).map(([key, entry]) => (
          <View key={key}>
            <Label style={{ fontWeight: "700" }}>{label(key)}</Label>
            <RawValue value={entry} />
          </View>
        ))}
      </View>
    );
  }
  if (Array.isArray(value))
    return (
      <View style={{ gap: 6 }}>
        {value.map((entry, index) => (
          <Card key={`${index}-${text(entry) ?? "entry"}`}>
            <RawValue value={entry} />
          </Card>
        ))}
      </View>
    );
  return <Label>{text(value) ?? ""}</Label>;
}

function Table({ headers, rows }: { headers: unknown[]; rows: unknown[] }) {
  const t = useTheme();
  const cells = (row: unknown) =>
    Array.isArray(row) ? row : Object.values(record(row) ?? {});
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View style={{ borderColor: t.border, borderWidth: 1 }}>
        {headers.length > 0 && (
          <View style={{ flexDirection: "row" }}>
            {headers.map((header, index) => (
              <Label
                key={index}
                style={{
                  width: 150,
                  padding: 10,
                  fontWeight: "700",
                  backgroundColor: t.soft,
                }}
              >
                {text(header)}
              </Label>
            ))}
          </View>
        )}
        {rows.map((row, index) => (
          <View key={index} style={{ flexDirection: "row" }}>
            {cells(row).map((cell, cellIndex) => (
              <Label key={cellIndex} style={{ width: 150, padding: 10 }}>
                {text(cell) ?? ""}
              </Label>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export function ContentExtras({ item }: { item: ContentItem }) {
  const t = useTheme();
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const details = item.details ?? {};
  const represented = new Set(
    item.body
      .flatMap((section) => [section.heading, ...section.bullets])
      .map((value) => value.trim().toLowerCase()),
  );
  const baseFields = new Set([
    "id",
    "type",
    "subject_id",
    "unit_id",
    "chapter_id",
    "topic_id",
    "classes",
    "exams",
    "boards",
    "streams",
    "tags",
    "keywords",
    "difficulty",
    "importance",
    "summary",
    "title",
    "formula_plain",
    "formula_latex",
    "variables",
    "explanation",
    "example",
    "when_to_use",
    "common_mistakes",
    "sections",
    "formula_ids",
    "needs_review",
    "review_reasons",
    "needsReview",
    "reviewReasons",
  ]);
  const stripBodyDuplicates = (value: unknown): unknown => {
    const scalar = text(value)?.trim().toLowerCase();
    if (scalar && represented.has(scalar)) return undefined;
    if (Array.isArray(value)) {
      const remaining = value
        .map(stripBodyDuplicates)
        .filter((entry) => entry !== undefined);
      return remaining.length ? remaining : undefined;
    }
    const object = record(value);
    if (object) {
      const remaining = Object.fromEntries(
        Object.entries(object)
          .filter(([key]) => !represented.has(label(key).toLowerCase()))
          .map(([key, entry]) => [key, stripBodyDuplicates(entry)])
          .filter(([, entry]) => entry !== undefined),
      );
      return Object.keys(remaining).length ? remaining : undefined;
    }
    return value;
  };
  const forcedDetails = new Set([
    "headers",
    "columns",
    "rows",
    "entries",
    "events",
    "dimensions",
    "labels_required",
  ]);
  const detailEntries = Object.entries(details).flatMap(([key, value]) => {
    const normalizedKey = key.toLowerCase();
    if (
      baseFields.has(normalizedKey) ||
      normalizedKey.endsWith("_latex") ||
      normalizedKey === "asset_required" ||
      normalizedKey.startsWith("related_") ||
      normalizedKey.startsWith("source_") ||
      normalizedKey.startsWith("source") ||
      normalizedKey.includes("review") ||
      normalizedKey.includes("provenance") ||
      value === null ||
      value === undefined ||
      value === ""
    )
      return [];
    const headingDuplicate = represented.has(label(key).toLowerCase());
    const displayValue =
      forcedDetails.has(key) || headingDuplicate
        ? value
        : stripBodyDuplicates(value);
    return displayValue === undefined
      ? []
      : [[key, displayValue] as [string, unknown]];
  });
  const tableHeaders = details.headers ?? details.columns;
  const tableRows = details.rows ?? details.entries;
  const specialized = new Set([
    "headers",
    "columns",
    "rows",
    "entries",
    "events",
    "dimensions",
    "labels_required",
    "x_axis",
    "y_axis",
    "relationship",
  ]);
  const events = Array.isArray(details.events) ? details.events : [];
  const assetRequired =
    details.asset_required === true || details.assetRequired === true;
  const labels = details.labels_required ?? details.labels;
  const xAxis = text(details.x_axis);
  const yAxis = text(details.y_axis);
  const relationship = text(details.relationship);
  return (
    <>
      {item.needsReview && (
        <Section title="Review status">
          <Card>
            <Label style={{ color: t.danger, fontWeight: "700" }}>
              Needs review
            </Label>
            {item.reviewReasons?.map((reason, index) => (
              <Label key={`${reason}-${index}`}>• {reason}</Label>
            ))}
          </Card>
        </Section>
      )}
      {item.type === "graph" && (xAxis || yAxis || relationship) && (
        <Section title="Graph description">
          <Card>
            {xAxis && (
              <Label>
                <Label style={{ fontWeight: "700" }}>X axis: </Label>
                {xAxis}
              </Label>
            )}
            {yAxis && (
              <Label>
                <Label style={{ fontWeight: "700" }}>Y axis: </Label>
                {yAxis}
              </Label>
            )}
            {relationship && (
              <Label>
                <Label style={{ fontWeight: "700" }}>Relationship: </Label>
                {relationship}
              </Label>
            )}
            <Label muted style={{ marginTop: 6 }}>
              Graph image not supplied.
            </Label>
          </Card>
        </Section>
      )}
      {["diagram_reference", "map_reference"].includes(item.type) && (
        <Section
          title={
            item.type === "map_reference"
              ? "Map reference"
              : "Diagram reference"
          }
        >
          <Card>
            {(text(details.description) ?? item.summary) && (
              <Label>{text(details.description) ?? item.summary}</Label>
            )}
            {labels !== undefined && (
              <>
                <Label style={{ fontWeight: "700", marginTop: 8 }}>
                  Labels
                </Label>
                <RawValue value={labels} />
              </>
            )}
            {assetRequired && (
              <Label muted style={{ marginTop: 8 }}>
                Illustration not supplied.
              </Label>
            )}
          </Card>
        </Section>
      )}
      {item.type === "table" && Array.isArray(tableRows) && (
        <Section title="Table">
          <Table
            headers={Array.isArray(tableHeaders) ? tableHeaders : []}
            rows={tableRows}
          />
        </Section>
      )}
      {item.type === "comparison" && Array.isArray(details.dimensions) && (
        <Section title="Comparison">
          {details.dimensions.map((dimension, index) => {
            const values = record(dimension) ?? {};
            return (
              <Card key={index}>
                <Label style={{ fontWeight: "700" }}>
                  {text(
                    values.dimension ??
                      values.aspect ??
                      values.name ??
                      values.label,
                  ) ?? `Dimension ${index + 1}`}
                </Label>
                {Object.entries(values)
                  .filter(
                    ([key]) =>
                      !["dimension", "aspect", "name", "label"].includes(key),
                  )
                  .map(([key, value]) => (
                    <View key={key}>
                      <Label muted>{label(key)}</Label>
                      <RawValue value={value} />
                    </View>
                  ))}
              </Card>
            );
          })}
        </Section>
      )}
      {events.length > 0 && (
        <Section title="Timeline">
          {events.map((event, index) => {
            const entry = record(event) ?? {};
            return (
              <Card key={index}>
                <Label style={{ fontWeight: "700" }}>
                  {text(entry.date_or_period ?? entry.date ?? entry.period) ??
                    "Event"}
                </Label>
                <Label>{text(entry.event ?? entry.description) ?? ""}</Label>
              </Card>
            );
          })}
        </Section>
      )}
      {detailEntries
        .filter(([key]) => !specialized.has(key))
        .map(([key, value]) => (
          <Section key={key} title={label(key)}>
            <RawValue value={value} />
          </Section>
        ))}
      {item.sourceVariants && item.sourceVariants.length > 0 && (
        <Section title="Source information">
          <Card>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: sourcesOpen }}
              onPress={() => setSourcesOpen((open) => !open)}
            >
              <Label style={{ fontWeight: "700" }}>
                Supplied source records · {sourcesOpen ? "Hide" : "Show"}
              </Label>
            </Pressable>
            {sourcesOpen && (
              <>
                <Label muted style={{ marginTop: 6 }}>
                  Source information is supplied metadata and has not been
                  independently verified.
                </Label>
                {item.sourceVariants.map((source, index) => (
                  <View
                    key={`${source.sourceId}-${index}`}
                    style={{ marginTop: 8 }}
                  >
                    <Label>Source ID: {source.sourceId}</Label>
                    <Label>
                      Files: {source.files.join(", ") || "Not recorded"}
                    </Label>
                    <Label>
                      Source type: {text(source.record.type) ?? item.type}
                    </Label>
                  </View>
                ))}
              </>
            )}
          </Card>
        </Section>
      )}
    </>
  );
}
