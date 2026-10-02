import data from "./generated/content.json";
import type { Dataset } from "../types/content";
export const bundledData = data as unknown as Dataset;
