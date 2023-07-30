import { z } from 'zod';

export enum EventKind {
  Create = 'Create',
  Update = 'Update',
  Delete = 'Delete',
}

export const EVENT_KINDS = [
  EventKind.Create,
  EventKind.Update,
  EventKind.Delete,
];

const EventFieldValueSchema = z.string().or(z.number()).or(z.date());
export type EventFieldValue = z.infer<typeof EventFieldValueSchema>;

export const EventSchema = {
  CreateOrDelete: z.record(EventFieldValueSchema),
  Update: z.record(
    z.object({
      from: EventFieldValueSchema,
      to: EventFieldValueSchema,
    })
  ),
};
export type CreateOrDeleteEventDetails = z.infer<
  typeof EventSchema.CreateOrDelete
>;
export type UpdateEventDetails = z.infer<typeof EventSchema.Update>;

export const EventKindDetailsSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal(EventKind.Create),
    details: EventSchema.CreateOrDelete,
  }),
  z.object({
    kind: z.literal(EventKind.Delete),
    details: EventSchema.CreateOrDelete,
  }),
  z.object({
    kind: z.literal(EventKind.Update),
    details: EventSchema.Update,
  }),
]);
export type EventKindDetails = z.infer<typeof EventKindDetailsSchema>;
