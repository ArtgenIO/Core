import { Divider, Input, Typography } from 'antd';
import React, { Dispatch, SetStateAction } from 'react';
import { ISchema } from '../..';

export default function FinishComponent({
  schema,
  setSchema,
}: {
  schema: Partial<ISchema>;
  setSchema: Dispatch<SetStateAction<Partial<ISchema>>>;
}) {
  return (
    <>
      <Typography.Title>Finish</Typography.Title>
      <Divider />
      <Input.TextArea
        rows={24}
        className="text-sm font-mono"
        value={JSON.stringify(schema, null, 2)}
      ></Input.TextArea>
    </>
  );
}
