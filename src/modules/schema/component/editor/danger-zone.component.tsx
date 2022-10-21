import { Divider, List, Switch, Typography } from 'antd';
import cloneDeep from 'lodash.clonedeep';
import upperFirst from 'lodash.upperfirst';
import { Dispatch, SetStateAction } from 'react';
import { ISchema } from '../../interface';

type Props = {
  schema: Partial<ISchema>;
  setSchema: Dispatch<SetStateAction<Partial<ISchema>>>;
};

export default function DangerZoneComponent({ schema, setSchema }: Props) {
  return (
    <>
      <h2 className="font-header">REST Authentication Protection</h2>

      <Typography>
        <Typography.Paragraph>
          You can customize the REST API access, by default every schema is
          protected by authentication. But if You wanna allow visitors to
          execute an action without valid authentication, then You can turn the
          endpoints public here.
        </Typography.Paragraph>
      </Typography>
      <List
        size="small"
        bordered
        dataSource={Object.entries(schema.access)}
        renderItem={([key, state], idx) => (
          <List.Item
            actions={[
              <Switch
                key={key}
                checked={state == 'protected'}
                onChange={newValue =>
                  setSchema(oldSchema => {
                    const newSchema = cloneDeep(oldSchema);
                    newSchema.access[key] = newValue ? 'protected' : 'public';

                    return newSchema;
                  })
                }
              />,
            ]}
          >
            <List.Item.Meta
              title={`Access for ${upperFirst(key)}`}
              description={`Protect the resource with authentication for [${key}] type access`}
            />
          </List.Item>
        )}
      />

      <Divider />

      <h2 className="font-header">Read Only Table Protection</h2>
      <p>
        Automatically imported schemas are read only by default, switching this
        off will enable Artgen to change the structure of the table. This can be
        unsafe if the table is used by other systems!
      </p>
      <Switch
        checked={schema.tags.includes('readonly')}
        onChange={checked =>
          setSchema(oldSchema => {
            const newSchema = cloneDeep(oldSchema);

            if (checked) {
              if (!newSchema.tags.includes('readonly')) {
                newSchema.tags.push('readonly');
              }
            } else {
              newSchema.tags = newSchema.tags.filter(t => t !== 'readonly');
            }

            return newSchema;
          })
        }
      />
    </>
  );
}
