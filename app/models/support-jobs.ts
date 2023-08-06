import { z } from 'zod';

export const jobLayoutOptions = [
  'Alphabetical Order',
  'Group By Customer',
] as const;
export const JobLayoutOptionSchema = z.enum(jobLayoutOptions);
export type JobLayoutOption = z.infer<typeof JobLayoutOptionSchema>;

export const jobSortByOptions = ['Order #', 'Company Name', 'Status'] as const;
export const JobSortByOptionSchema = z.enum(jobSortByOptions);
export type JobSortByOption = z.infer<typeof JobSortByOptionSchema>;

export const jobSortOrderOptions = ['A to Z', 'Z to A'] as const;
export const JobSortOrderOptionSchema = z.enum(jobSortOrderOptions);
export type JobSortOrderOption = z.infer<typeof JobSortOrderOptionSchema>;

export const SUPPORT_JOB_TYPES = [
  'Telephone',
  'Email',
  'Remote',
  'Technical',
  'Inhouse',
  'Personal device',
  'In office',
  'Network',
] as const;
export type SupportJobType = (typeof SUPPORT_JOB_TYPES)[number];

export const SupportJobTypeSchema = z.enum(SUPPORT_JOB_TYPES, {
  required_error: 'Enter the type of work',
  invalid_type_error: 'Enter valid input for the type of work',
});

export const StrSupportJobTypeSchema = z.preprocess(
  (arg) => {
    if (typeof arg === 'string') {
      try {
        return JSON.parse(arg);
      } catch (error) {
        return undefined;
      }
    }
  },
  SupportJobTypeSchema.array(),
  {
    required_error: 'Enter the type of work',
    invalid_type_error: 'Enter valid input for the type of work',
  }
);

// "telephone and email support"
// "remote support"
// "email and telephone support"
// "telephone support"
// "technical support"
// "telephone and remote support"
// "inhouse consultation"
// "inhouse support"
// "personal machine consult"
// "in office technical support"
// "oinhouse support"
// "in office consultation support"
// "technical in office network support"
// "email support"

export const SUPPORT_JOB_STATUSES = [
  'Finalised',
  'Completed',
  'In progress',
] as const;
export type SupportJobStatus = (typeof SUPPORT_JOB_STATUSES)[number];

export const SupportJobStatusSchema = z.enum(SUPPORT_JOB_STATUSES, {
  required_error: 'Provide the support job status',
  invalid_type_error: 'Provide a valid support job status',
});

// "finalised"
// "completed"
// "in process however progress made with developer of screen reader"
// "in progress"
// "backup inprocess"
// "InProgress"
