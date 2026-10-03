import { Share } from "react-native";
import type { ContentItem } from "../types/content";
export function contentShareText(
  item: ContentItem,
  names: Record<string, string> = {},
) {
  const metadata = new Set([
    "id",
    "type",
    "title",
    "summary",
    "classes",
    "boards",
    "exams",
    "streams",
    "tags",
    "keywords",
    "difficulty",
    "importance",
    "needs_review",
    "explanation",
    "sections",
    "formula_plain",
    "variables",
    "when_to_use",
    "common_mistakes",
  ]);
  const details = Object.entries(item.details ?? {})
    .filter(
      ([key]) =>
        !metadata.has(key) &&
        !key.endsWith("_id") &&
        !key.endsWith("_ids") &&
        !key.endsWith("_latex") &&
        !key.startsWith("source") &&
        !key.includes("review") &&
        key !== "asset_required",
    )
    .map(([key, value]) => `${key.replaceAll("_", " ")}: ${shareValue(value)}`);
  const sources =
    item.sourceVariants?.map(
      (source) => `Source files: ${source.files.join(", ") || "Not recorded"}`,
    ) ?? [];
  return [
    item.title,
    item.type === "content_reference"
      ? `Content reference · ${item.summary}`
      : item.formula || item.summary,
    item.explanation,
    ...item.body.map(
      (s) => `${s.heading}\n${s.bullets.map((b) => `• ${b}`).join("\n")}`,
    ),
    ...details,
    item.needsReview
      ? `Needs review${item.reviewReasons?.length ? `: ${item.reviewReasons.join("; ")}` : ""}`
      : "",
    ...sources,
    item.subjects.map((id) => names[id] ?? id).join(", "),
    item.chapters.map((id) => names[id] ?? id).join(", "),
    "Formula Nest · Your offline revision companion",
  ]
    .filter(Boolean)
    .join("\n\n");
}
function shareValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (Array.isArray(value)) return value.map(shareValue).join("; ");
  if (value && typeof value === "object")
    return Object.entries(value)
      .map(
        ([key, entry]) => `${key.replaceAll("_", " ")}: ${shareValue(entry)}`,
      )
      .join(", ");
  return "";
}
export async function shareContent(
  item: ContentItem,
  names: Record<string, string> = {},
) {
  await Share.share({
    title: item.title,
    message: contentShareText(item, names),
  });
}
