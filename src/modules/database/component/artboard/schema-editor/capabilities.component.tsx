import { List, Switch, Typography } from 'antd';
import { cloneDeep } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { FieldTag, FieldType, ISchema } from '../../../../schema';

export default function SchemaEditorCapabilitiesComponent({
  schema,
  setSchema,
}: {
  schema: Partial<ISchema>;
  setSchema: Dispatch<SetStateAction<Partial<ISchema>>>;
}) {
  const hasIdentity = !!schema.fields.find(
    f => f.type == FieldType.UUID && f.tags.includes(FieldTag.PRIMARY),
  );
  const hasCreated = !!schema.fields.find(f =>
    f.tags.includes(FieldTag.CREATED),
  );
  const hasUpdated = !!schema.fields.find(f =>
    f.tags.includes(FieldTag.UPDATED),
  );
  const hasDeleted = !!schema.fields.find(f =>
    f.tags.includes(FieldTag.DELETED),
  );
  const hasVersion = !!schema.fields.find(f =>
    f.tags.includes(FieldTag.VERSION),
  );
  const hasTags = !!schema.fields.find(f => f.tags.includes(FieldTag.TAGS));

  return (
    <>
      <Typography>
        <Typography.Paragraph>
          Configure what kind of system backed behaviors you would like to use.
          You can smarten up your schema with predefined functionality, this
          will influence the user interface and the data management. You can
          always add those behaviors later or remove it, but some of them only
          useful if they are present at the creation of the schema.
        </Typography.Paragraph>
      </Typography>

      <List bordered size="small" className="mt-6">
        <List.Item key="identifiable">
          <List.Item.Meta
            title="Identifiable"
            description="Makes the table identifiable with an universal unique identifier (UUID) this allows the faster creation of records even in cluster mode."
            avatar={
              <span className="material-icons-outlined bg-dark behavior-option">
                key
              </span>
            }
          ></List.Item.Meta>
          <Switch
            defaultChecked={hasIdentity}
            onChange={isOn => {
              setSchema(current => {
                const update = cloneDeep(current);

                if (isOn) {
                  update.fields.unshift({
                    label: 'Identifier',
                    reference: 'id',
                    columnName: 'id',
                    type: FieldType.UUID,
                    typeParams: {
                      values: [],
                    },
                    tags: [FieldTag.PRIMARY],
                  });
                } else {
                  update.fields = update.fields.filter(
                    f =>
                      !(
                        f.type == FieldType.UUID &&
                        f.tags.includes(FieldTag.PRIMARY)
                      ),
                  );
                }

                return update;
              });
            }}
          />
        </List.Item>

        <List.Item key="tags">
          <List.Item.Meta
            title="Tag Logic"
            description="You can build advanced logic with the built in tag engine, this eradicates the need for a lot of extra field."
            avatar={
              <span className="material-icons-outlined bg-dark behavior-option">
                local_offer
              </span>
            }
          ></List.Item.Meta>
          <Switch
            defaultChecked={hasTags}
            onChange={isOn => {
              setSchema(current => {
                const update = cloneDeep(current);

                if (isOn) {
                  update.fields.push({
                    label: 'Tags',
                    reference: 'tags',
                    columnName: 'tags',
                    type: FieldType.JSON,
                    tags: [FieldTag.TAGS],
                    typeParams: {
                      values: [],
                    },
                    defaultValue: [],
                  });
                } else {
                  update.fields = update.fields.filter(
                    f => !f.tags.includes(FieldTag.TAGS),
                  );
                }

                return update;
              });
            }}
          />
        </List.Item>

        <List.Item key="created">
          <List.Item.Meta
            title="Creation Time Tracking"
            description="Track when each new record are created, useful for analytics and logic building."
            avatar={
              <span className="material-icons-outlined bg-dark behavior-option">
                event_available
              </span>
            }
          ></List.Item.Meta>
          <Switch
            defaultChecked={hasCreated}
            onChange={isOn => {
              setSchema(current => {
                const update = cloneDeep(current);

                if (isOn) {
                  update.fields.push({
                    label: 'Created Date',
                    reference: 'createdAt',
                    columnName: 'created_at',
                    type: FieldType.DATETIME,
                    typeParams: {
                      values: [],
                    },
                    tags: [FieldTag.CREATED],
                  });
                } else {
                  update.fields = update.fields.filter(
                    f => !f.tags.includes(FieldTag.CREATED),
                  );
                }

                return update;
              });
            }}
          />
        </List.Item>

        <List.Item key="updated">
          <List.Item.Meta
            title="Last Update Time Tracking"
            description="Track when each record was last changed."
            avatar={
              <span className="material-icons-outlined bg-dark behavior-option">
                edit_calendar
              </span>
            }
          ></List.Item.Meta>
          <Switch
            defaultChecked={hasUpdated}
            onChange={isOn => {
              setSchema(current => {
                const update = cloneDeep(current);

                if (isOn) {
                  update.fields.push({
                    label: 'Updated Date',
                    reference: 'updatedAt',
                    columnName: 'updated_at',
                    typeParams: {
                      values: [],
                    },
                    type: FieldType.DATETIME,
                    tags: [FieldTag.UPDATED],
                  });
                } else {
                  update.fields = update.fields.filter(
                    f => !f.tags.includes(FieldTag.UPDATED),
                  );
                }

                return update;
              });
            }}
          />
        </List.Item>

        <List.Item key="deleted">
          <List.Item.Meta
            title="Soft Deleting"
            description="Prevents accidental data loss, and provides a recoverability to every row in the schema."
            avatar={
              <span className="material-icons-outlined bg-dark behavior-option">
                folder_delete
              </span>
            }
          ></List.Item.Meta>
          <Switch
            defaultChecked={hasDeleted}
            onChange={isOn => {
              setSchema(current => {
                const update = cloneDeep(current);

                if (isOn) {
                  update.fields.push({
                    label: 'Deleted Date',
                    reference: 'deletedAt',
                    columnName: 'deleted_at',
                    typeParams: {
                      values: [],
                    },
                    type: FieldType.DATETIME,
                    tags: [FieldTag.DELETED],
                  });
                } else {
                  update.fields = update.fields.filter(
                    f => !f.tags.includes(FieldTag.DELETED),
                  );
                }

                return update;
              });
            }}
          />
        </List.Item>

        <List.Item key="version">
          <List.Item.Meta
            title="Overwrite Protection"
            description="Protection against accidental overwriting, this allows multiple people to edit the data in the same time."
            avatar={
              <span className="material-icons-outlined bg-dark behavior-option">
                lock_clock
              </span>
            }
          ></List.Item.Meta>
          <Switch
            defaultChecked={hasVersion}
            onChange={isOn => {
              setSchema(current => {
                const update = cloneDeep(current);

                if (isOn) {
                  update.fields.push({
                    label: 'Revision',
                    reference: 'Revision',
                    columnName: 'revision',
                    typeParams: {
                      values: [],
                    },
                    type: FieldType.INTEGER,
                    tags: [FieldTag.VERSION],
                    defaultValue: 1,
                  });
                } else {
                  update.fields = update.fields.filter(
                    f => !f.tags.includes(FieldTag.VERSION),
                  );
                }

                return update;
              });
            }}
          />
        </List.Item>
      </List>
    </>
  );
}
