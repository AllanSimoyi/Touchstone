import { z } from 'zod';

export const layoutOptions = ['Alphabetical Order', 'Group By Area'] as const;
export const LayoutOptionSchema = z.enum(layoutOptions);
export type LayoutOption = z.infer<typeof LayoutOptionSchema>;

export const sortByOptions = ['Account #', 'Company Name', 'License'] as const;
export const SortByOptionSchema = z.enum(sortByOptions);
export type SortByOption = z.infer<typeof SortByOptionSchema>;

export const sortOrderOptions = ['A to Z', 'Z to A'] as const;
export const SortOrderOptionSchema = z.enum(sortOrderOptions);
export type SortOrderOption = z.infer<typeof SortOrderOptionSchema>;

interface Props {
  basicUsd: number;
  addedPercentage: number;
  numDatabases: number;
}
export function calcGross(props: Props) {
  const { basicUsd, addedPercentage, numDatabases } = props;
  const percentageOfBasicUsd = (addedPercentage / 100) * basicUsd;
  return Number((basicUsd + percentageOfBasicUsd * numDatabases).toFixed(2));
}

export function calcNet(gross: number) {
  return Number(((gross / 115) * 100).toFixed(2));
}

export function calcVat(gross: number) {
  return Number(((gross / 115) * 15).toFixed(2));
}
