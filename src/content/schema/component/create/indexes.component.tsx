import { Divider, Typography } from 'antd';
import React, { Dispatch, SetStateAction } from 'react';
import { ISchema } from '../..';

export default function IndexesComponent({
  schema,
  setSchema,
}: {
  schema: Partial<ISchema>;
  setSchema: Dispatch<SetStateAction<Partial<ISchema>>>;
}) {
  return (
    <>
      <Typography.Title>Indexes</Typography.Title>
      <Divider />
      Soon
    </>
  );
}
