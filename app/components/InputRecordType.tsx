import type { RECORD_TYPES } from '~/models/core.validations';

interface Props {
  value: (typeof RECORD_TYPES)[number];
}
export function InputRecordType(props: Props) {
  const { value } = props;
  return <input type="hidden" name="recordType" value={value} />;
}
