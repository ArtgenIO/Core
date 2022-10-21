import { List, Switch, Typography } from 'antd';

import cloneDeep from 'lodash.clonedeep';
import { Dispatch, SetStateAction } from 'react';
import { FieldTag, FieldType, ISchema } from '../..';
import { RelationType } from '../../interface/relation.interface';
import { migrateField } from '../../util/migrate-field';

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
  const hasTenant = !!schema.fields.find(f => f.tags.includes(FieldTag.TENANT));

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
            title={<span className="font-header text-lg">Identifiable</span>}
            description="Makes the table identifiable with an UUID this allows the faster creation of records even in cluster mode."
            avatar={
              <span className="material-icons-outlined bg-midnight-800 behavior-option p-2.5 rounded-sm">
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
                  update.fields.unshift(
                    migrateField(
                      {
                        title: 'Identifier',
                        reference: 'id',
                        columnName: 'id',
                        type: FieldType.UUID,
                        meta: {},
                        args: {},
                        tags: [FieldTag.PRIMARY],
                      },
                      update.fields.length,
                    ),
                  );
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

        <List.Item key="created">
          <List.Item.Meta
            title={
              <span className="font-header text-lg">
                Creation Time Tracking
              </span>
            }
            description="Track when each new record are created, useful for analytics and logic building."
            avatar={
              <span className="material-icons-outlined bg-midnight-800 p-2.5 rounded-sm">
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
                  update.fields.push(
                    migrateField(
                      {
                        title: 'Created Date',
                        reference: 'createdAt',
                        columnName: 'created_at',
                        type: FieldType.DATETIME,
                        args: {},
                        meta: {},
                        tags: [FieldTag.CREATED],
                      },
                      update.fields.length,
                    ),
                  );
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
            title={
              <span className="font-header text-lg">
                Last Update Time Tracking
              </span>
            }
            description="Track when each record was last changed."
            avatar={
              <span className="material-icons-outlined bg-midnight-800 p-2.5 rounded-sm">
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
                  update.fields.push(
                    migrateField(
                      {
                        title: 'Updated Date',
                        reference: 'updatedAt',
                        columnName: 'updated_at',
                        defaultValue: null,
                        args: {},
                        meta: {},
                        type: FieldType.DATETIME,
                        tags: [FieldTag.UPDATED, FieldTag.NULLABLE],
                      },
                      update.fields.length,
                    ),
                  );
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
            title={<span className="font-header text-lg">Soft Deleting</span>}
            description="Prevents accidental data loss, and provides a recoverability to every row in the schema."
            avatar={
              <span className="material-icons-outlined bg-midnight-800 p-2.5 rounded-sm">
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
                  update.fields.push(
                    migrateField(
                      {
                        title: 'Deleted Date',
                        reference: 'deletedAt',
                        columnName: 'deleted_at',
                        defaultValue: null,
                        args: {},
                        meta: {},
                        type: FieldType.DATETIME,
                        tags: [FieldTag.DELETED, FieldTag.NULLABLE],
                      },
                      update.fields.length,
                    ),
                  );
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
            title={
              <span className="font-header text-lg">Overwrite Protection</span>
            }
            description="Protection against accidental overwriting, this allows multiple people to edit the data in the same time."
            avatar={
              <span className="material-icons-outlined bg-midnight-800 p-2.5 rounded-sm">
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
                  update.fields.push(
                    migrateField(
                      {
                        title: 'Revision',
                        reference: 'Revision',
                        columnName: 'revision',
                        args: {},
                        meta: {},
                        type: FieldType.INTEGER,
                        tags: [FieldTag.VERSION],
                        defaultValue: 1,
                      },
                      update.fields.length,
                    ),
                  );
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

        <List.Item key="tags">
          <List.Item.Meta
            title={<span className="font-header text-lg">Tag Logic</span>}
            description="You can build advanced logic with the built in tag engine, this eradicates the need for a lot of extra field."
            avatar={
              <span className="material-icons-outlined bg-midnight-800 p-2.5 rounded-sm">
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
                  update.fields.push(
                    migrateField(
                      {
                        title: 'Tags',
                        reference: 'tags',
                        columnName: 'tags',
                        type: FieldType.JSON,
                        tags: [FieldTag.TAGS],
                        meta: {},
                        args: {},
                        defaultValue: [],
                      },
                      update.fields.length,
                    ),
                  );
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

        <List.Item key="tenant">
          <List.Item.Meta
            title={<span className="font-header text-lg">Multi Tenant</span>}
            description="Applies a tenant level limitation, and each interaction will be limited to the tenant's group."
            avatar={
              <span className="material-icons-outlined bg-midnight-800 p-2.5 rounded-sm">
                local_offer
              </span>
            }
          ></List.Item.Meta>
          <Switch
            defaultChecked={hasTenant}
            onChange={isOn => {
              setSchema(current => {
                const update = cloneDeep(current);

                if (isOn) {
                  update.fields.push(
                    migrateField(
                      {
                        title: 'Tenant ID',
                        reference: 'tenantId',
                        columnName: 'tenant_id',
                        type: FieldType.UUID,
                        tags: [FieldTag.TENANT],
                        meta: {
                          grid: {
                            order: update.fields.length,
                            hidden: false,
                            replace: 'name',
                          },
                        },
                        args: {},
                      },
                      update.fields.length,
                    ),
                  );

                  update.relations.push({
                    kind: RelationType.BELONGS_TO_ONE,
                    localField: 'tenantId',
                    remoteField: 'id',
                    name: 'tenant',
                    target: 'AccountGroup',
                  });
                } else {
                  update.fields = update.fields.filter(
                    f => !f.tags.includes(FieldTag.TENANT),
                  );
                  update.relations = update.relations.filter(
                    r => r.name !== 'tenant',
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
