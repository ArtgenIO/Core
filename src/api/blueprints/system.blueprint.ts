import { IBlueprint } from '../../models/blueprint.interface';
import { FieldTag } from '../types/field-tags.enum';
import { FieldType } from '../types/field-type.enum';
import { RelationType } from '../types/relation.interface';

export const SystemBlueprint: IBlueprint = {
  id: 'c01c3f2d-84f5-4531-8bdc-938a982a8830',
  title: 'Artgen - System',
  version: '0.3.0',
  cover: 'https://via.placeholder.com/400x250/b5b9c2/0a0d10/?text=Artgen',
  description:
    'Provides the basic schemas and functionality for the Artgen Core instances.',
  source: 'offline',
  database: 'main',
  schemas: [
    {
      database: 'main',
      reference: 'Blueprint',
      moduleId: 'c2046325-9d0e-42a4-aa55-1116fdd97913',
      title: 'Blueprints',
      tableName: '__artgen_blueprints',
      fields: [
        {
          title: 'Identifier',
          reference: 'id',
          columnName: 'id',
          type: FieldType.UUID,
          args: {},
          tags: [FieldTag.PRIMARY],
          meta: {
            grid: {
              order: 0,
              hidden: false,
            },
          },
        },
        {
          reference: 'title',
          title: 'title',
          columnName: 'title',
          defaultValue: null,
          type: FieldType.TEXT,
          args: {},
          tags: [],
          meta: {
            grid: {
              order: 1,
              hidden: false,
            },
          },
        },
        {
          reference: 'cover',
          title: 'cover',
          columnName: 'cover',
          defaultValue:
            'https://via.placeholder.com/400x250/b5b9c2/0a0d10/?text=Missing+Cover',
          type: FieldType.TEXT,
          args: {},
          tags: [],
          meta: {
            grid: {
              order: 2,
              hidden: false,
            },
          },
        },
        {
          reference: 'description',
          title: 'description',
          columnName: 'description',
          defaultValue: 'Missing description',
          type: FieldType.TEXT,
          args: {},
          tags: [],
          meta: {
            grid: {
              order: 2,
              hidden: false,
            },
          },
        },
        {
          reference: 'version',
          title: 'Version',
          columnName: 'version',
          defaultValue: '0.0.1',
          type: FieldType.TEXT,
          args: {},
          tags: [],
          meta: {
            grid: {
              order: 4,
              hidden: false,
            },
          },
        },
        {
          reference: 'schemas',
          title: 'Schemas',
          columnName: 'schemas',
          defaultValue: [],
          type: FieldType.JSON,
          args: {},
          tags: [],
          meta: {
            grid: {
              order: 5,
              hidden: false,
            },
          },
        },
        {
          reference: 'installedAt',
          title: 'Installed At',
          columnName: 'installed_at',
          type: FieldType.DATETIME,
          args: {},
          tags: [FieldTag.CREATED],
          meta: {
            grid: {
              order: 7,
              hidden: false,
            },
          },
        },
        {
          reference: 'database',
          title: 'Database',
          columnName: 'database',
          defaultValue: null,
          type: FieldType.TEXT,
          args: {},
          tags: [FieldTag.INDEX],
          meta: {
            grid: {
              order: 8,
              hidden: false,
            },
          },
        },
        {
          reference: 'source',
          title: 'Source',
          columnName: 'source',
          defaultValue: 'offline',
          type: FieldType.ENUM,
          args: {
            values: ['cloud', 'offline'],
          },
          tags: [],
          meta: {
            grid: {
              order: 9,
              hidden: false,
            },
          },
        },
      ],
      indices: [],
      uniques: [],
      relations: [
        {
          kind: RelationType.BELONGS_TO_ONE,
          name: 'ofDatabase',
          target: 'Database',
          localField: 'database',
          remoteField: 'ref',
        },
      ],
      tags: ['active', 'system'],
      meta: {
        isFavorite: false,
        artboard: {
          position: {
            x: 0,
            y: 0,
          },
        },
      },
      access: {
        create: 'protected',
        read: 'protected',
        update: 'protected',
        delete: 'protected',
      },
    },
    {
      database: 'main',
      reference: 'Database',
      moduleId: 'c2046325-9d0e-42a4-aa55-1116fdd97913',
      title: 'Databases',
      tableName: '__artgen_databases',
      fields: [
        {
          reference: 'title',
          columnName: 'title',
          title: 'Title',
          type: FieldType.TEXT,
          tags: [FieldTag.UNIQUE],
          args: {},
          meta: {
            grid: {
              order: 1,
              hidden: false,
            },
          },
        },
        {
          reference: 'ref',
          columnName: 'ref',
          title: 'Reference',
          type: FieldType.TEXT,
          tags: [FieldTag.PRIMARY],
          args: {},
          meta: {
            grid: {
              order: 0,
              hidden: false,
            },
          },
        },
        {
          reference: 'dsn',
          columnName: 'dsn',
          title: 'Data Source Name (DSN)',
          type: FieldType.TEXT,
          tags: [],
          args: {},
          meta: {
            grid: {
              order: 2,
              hidden: true,
            },
          },
        },
      ],
      indices: [],
      uniques: [],
      relations: [
        {
          kind: RelationType.HAS_MANY,
          name: 'schemas',
          target: 'Schema',
          localField: 'ref',
          remoteField: 'database',
        },
      ],
      tags: ['system', 'active'],
      meta: {
        isFavorite: false,
        artboard: {
          position: {
            x: 0,
            y: 0,
          },
        },
      },
      access: {
        create: 'protected',
        read: 'protected',
        update: 'protected',
        delete: 'protected',
      },
    },
    {
      database: 'main',
      reference: 'Flow',
      moduleId: 'c2046325-9d0e-42a4-aa55-1116fdd97913',
      title: 'Flows',
      tableName: '__artgen_flows',
      fields: [
        {
          reference: 'id',
          columnName: 'id',
          title: 'Identifier',
          type: FieldType.UUID,
          tags: [FieldTag.PRIMARY],
          args: {},
          meta: {
            grid: {
              order: 0,
              hidden: false,
            },
          },
        },
        {
          reference: 'moduleId',
          columnName: 'moduleId',
          title: 'Module ID',
          type: FieldType.UUID,
          tags: [FieldTag.NULLABLE],
          args: {},
          defaultValue: null,
          meta: {
            grid: {
              order: 1,
              hidden: false,
              replace: 'name',
            },
          },
        },
        {
          reference: 'name',
          columnName: 'name',
          title: 'Name',
          type: FieldType.TEXT,
          tags: [FieldTag.UNIQUE],
          args: {},
          meta: {
            grid: {
              order: 2,
              hidden: false,
            },
          },
        },
        {
          reference: 'nodes',
          columnName: 'nodes',
          title: 'Nodes',
          type: FieldType.JSON,
          tags: [],
          defaultValue: [],
          args: {},
          meta: {
            grid: {
              order: 3,
              hidden: true,
            },
          },
        },
        {
          reference: 'edges',
          columnName: 'edges',
          title: 'Edges',
          type: FieldType.JSON,
          tags: [],
          defaultValue: [],
          args: {},
          meta: {
            grid: {
              order: 4,
              hidden: true,
            },
          },
        },
        {
          reference: 'isActive',
          columnName: 'isActive',
          title: 'Is Active',
          type: FieldType.BOOLEAN,
          defaultValue: true,
          meta: {
            grid: {
              order: 5,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [],
          searchable: false,
        },
        {
          reference: 'captureContext',
          columnName: 'capture_context',
          title: 'Capture Context',
          type: FieldType.BOOLEAN,
          defaultValue: false,
          meta: {
            grid: {
              order: 6,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [],
          searchable: false,
        },
      ],
      indices: [],
      uniques: [],
      relations: [
        {
          kind: RelationType.BELONGS_TO_ONE,
          name: 'module',
          target: 'Module',
          localField: 'moduleId',
          remoteField: 'id',
        },
      ],
      tags: ['active', 'system'],
      meta: {
        isFavorite: false,
        artboard: {
          position: {
            x: 0,
            y: 0,
          },
        },
      },
      access: {
        create: 'protected',
        read: 'protected',
        update: 'protected',
        delete: 'protected',
      },
    },
    {
      database: 'main',
      reference: 'KeyValueStorage',
      moduleId: 'c2046325-9d0e-42a4-aa55-1116fdd97913',
      title: 'Key-Value Storage',
      tableName: '__artgen_key_value_storage',
      fields: [
        {
          reference: 'key',
          title: 'Key',
          columnName: 'key',
          defaultValue: null,
          type: FieldType.TEXT,
          args: {},
          tags: [FieldTag.PRIMARY],
          meta: {
            grid: {
              order: 0,
              hidden: false,
            },
          },
        },
        {
          reference: 'value',
          title: 'Value',
          columnName: 'value',
          defaultValue: null,
          type: FieldType.TEXT,
          args: {},
          tags: [FieldTag.NULLABLE],
          meta: {
            grid: {
              order: 1,
              hidden: false,
            },
          },
          setters: [
            {
              reference: FieldType.JSON,
              config: {},
              priority: 0,
            },
          ],
          getters: [
            {
              reference: FieldType.JSON,
              config: {},
              priority: 0,
            },
          ],
        },
      ],
      indices: [],
      uniques: [],
      relations: [],
      tags: ['active', 'system'],
      meta: {
        isFavorite: false,
        artboard: {
          position: {
            x: 0,
            y: 0,
          },
        },
      },
      access: {
        create: 'protected',
        read: 'protected',
        update: 'protected',
        delete: 'protected',
      },
    },
    {
      database: 'main',
      reference: 'Module',
      moduleId: 'c2046325-9d0e-42a4-aa55-1116fdd97913',
      title: 'Modules',
      tableName: '__artgen_modules',
      fields: [
        {
          title: 'Identifier',
          reference: 'id',
          columnName: 'id',
          type: FieldType.UUID,
          args: {},
          tags: [FieldTag.PRIMARY],
          meta: {
            grid: {
              order: 0,
              hidden: false,
            },
          },
        },
        {
          reference: 'name',
          title: 'Name',
          columnName: 'name',
          type: FieldType.TEXT,
          args: {},
          tags: [FieldTag.UNIQUE],
          meta: {
            grid: {
              order: 1,
              hidden: false,
            },
          },
        },
        {
          title: 'Tags',
          reference: 'tags',
          columnName: 'tags',
          type: FieldType.JSON,
          tags: [FieldTag.TAGS],
          args: {},
          defaultValue: [],
          meta: {
            grid: {
              order: 2,
              hidden: false,
            },
          },
        },
      ],
      indices: [],
      uniques: [],
      relations: [],
      tags: ['active'],
      meta: {
        artboard: {
          position: {
            x: 670,
            y: 339,
          },
        },
        isFavorite: true,
      },
      access: {
        create: 'protected',
        read: 'protected',
        update: 'protected',
        delete: 'protected',
      },
    },
    {
      database: 'main',
      reference: 'Page',
      moduleId: 'c2046325-9d0e-42a4-aa55-1116fdd97913',
      title: 'Pages',
      tableName: '__artgen_pages',
      fields: [
        {
          reference: 'id',
          columnName: 'id',
          title: 'Identifier',
          type: FieldType.UUID,
          tags: [FieldTag.PRIMARY],
          args: {},
          meta: {
            grid: {
              order: 0,
              hidden: false,
            },
          },
        },
        {
          reference: 'title',
          columnName: 'title',
          title: 'Page Title',
          type: FieldType.TEXT,
          tags: [],
          args: {},
          meta: {
            grid: {
              order: 1,
              hidden: false,
            },
          },
        },
        {
          reference: 'path',
          columnName: 'path',
          title: 'Path',
          type: FieldType.TEXT,
          tags: [],
          defaultValue: '/page/x',
          args: {},
          meta: {
            grid: {
              order: 3,
              hidden: false,
            },
          },
        },
        {
          reference: 'content',
          columnName: 'content',
          title: 'Content',
          type: FieldType.JSON,
          tags: [],
          defaultValue: {},
          args: {},
          meta: {
            grid: {
              order: 4,
              hidden: false,
            },
          },
        },
        {
          reference: 'tags',
          columnName: '__artgen_tags',
          title: 'Tags',
          type: FieldType.JSON,
          tags: [FieldTag.TAGS],
          defaultValue: ['active'],
          args: {},
          meta: {
            grid: {
              order: 5,
              hidden: false,
            },
          },
        },
      ],
      indices: [],
      uniques: [],
      relations: [],
      tags: ['active', 'system'],
      meta: {
        isFavorite: false,
        artboard: {
          position: {
            x: 0,
            y: 0,
          },
        },
      },
      access: {
        create: 'protected',
        read: 'protected',
        update: 'protected',
        delete: 'protected',
      },
    },
    {
      database: 'main',
      reference: 'Schema',
      moduleId: 'c2046325-9d0e-42a4-aa55-1116fdd97913',
      title: 'Schemas',
      tableName: '__artgen_schemas',
      fields: [
        {
          reference: 'database',
          columnName: 'database',
          title: 'Database',
          type: FieldType.TEXT,
          tags: [FieldTag.PRIMARY],
          args: {},
          meta: {
            grid: {
              order: 0,
              hidden: false,
            },
          },
        },
        {
          reference: 'reference',
          columnName: 'reference',
          title: 'Rerefence',
          type: FieldType.TEXT,
          tags: [FieldTag.PRIMARY],
          args: {},
          meta: {
            grid: {
              order: 1,
              hidden: false,
            },
          },
        },
        {
          reference: 'moduleId',
          columnName: 'module_id',
          title: 'Module ID',
          type: FieldType.UUID,
          tags: [FieldTag.INDEX, FieldTag.NULLABLE],
          args: {},
          defaultValue: null,
          meta: {
            grid: {
              order: 2,
              hidden: false,
              replace: 'name',
            },
          },
        },
        {
          reference: 'title',
          columnName: 'title',
          title: 'Title',
          type: FieldType.TEXT,
          tags: [],
          args: {},
          meta: {
            grid: {
              order: 3,
              hidden: false,
            },
          },
        },
        {
          reference: 'tableName',
          columnName: 'tableName',
          title: 'Table Name',
          type: FieldType.TEXT,
          tags: [],
          args: {},
          meta: {
            grid: {
              order: 4,
              hidden: false,
            },
          },
        },
        {
          reference: 'fields',
          columnName: 'fields',
          title: 'Fields',
          type: FieldType.JSON,
          tags: [],
          defaultValue: [],
          args: {},
          meta: {
            grid: {
              order: 5,
              hidden: true,
            },
          },
        },
        {
          reference: 'indices',
          columnName: 'indices',
          title: 'Indices',
          type: FieldType.JSON,
          tags: [],
          defaultValue: [],
          args: {},
          meta: {
            grid: {
              order: 6,
              hidden: true,
            },
          },
        },
        {
          reference: 'uniques',
          columnName: 'uniques',
          title: 'Uniques',
          type: FieldType.JSON,
          tags: [],
          defaultValue: [],
          args: {},
          meta: {
            grid: {
              order: 7,
              hidden: true,
            },
          },
        },
        {
          reference: 'relations',
          columnName: 'relations',
          title: 'Relations',
          type: FieldType.JSON,
          tags: [],
          defaultValue: [],
          args: {},
          meta: {
            grid: {
              order: 8,
              hidden: true,
            },
          },
        },
        {
          reference: 'tags',
          columnName: '__artgen_tags',
          title: 'Tags',
          type: FieldType.JSON,
          tags: [FieldTag.TAGS],
          defaultValue: ['active'],
          args: {},
          meta: {
            grid: {
              order: 9,
              hidden: true,
            },
          },
        },
        {
          reference: 'meta',
          columnName: 'meta',
          title: 'Meta',
          type: FieldType.JSON,
          defaultValue: {},
          tags: [],
          args: {},
          meta: {
            grid: {
              order: 10,
              hidden: true,
            },
          },
        },
        {
          reference: 'access',
          columnName: 'access',
          title: 'Access Control',
          type: FieldType.JSON,
          tags: [],
          defaultValue: {
            create: 'protected',
            read: 'protected',
            update: 'protected',
            delete: 'protected',
          },
          args: {},
          meta: {
            grid: {
              order: 11,
              hidden: true,
            },
          },
        },
      ],
      indices: [],
      uniques: [],
      relations: [
        {
          kind: RelationType.BELONGS_TO_ONE,
          name: 'db',
          target: 'Database',
          localField: 'database',
          remoteField: 'ref',
        },
        {
          kind: RelationType.BELONGS_TO_ONE,
          name: 'module',
          target: 'Module',
          localField: 'moduleId',
          remoteField: 'id',
        },
      ],
      tags: ['active', 'system'],
      meta: {
        isFavorite: false,
        artboard: {
          position: {
            x: 0,
            y: 0,
          },
        },
      },
      access: {
        create: 'protected',
        read: 'protected',
        update: 'protected',
        delete: 'protected',
      },
    },
    {
      database: 'main',
      reference: 'Account',
      moduleId: 'd01ab3a7-8ffc-4dd3-b706-ef194e460535',
      title: 'Accounts',
      tableName: '__artgen_accounts',
      fields: [
        {
          reference: 'id',
          columnName: 'id',
          title: 'Identifier',
          tags: [FieldTag.PRIMARY],
          type: FieldType.UUID,
          args: {},
          meta: {
            grid: {
              order: 0,
              hidden: false,
            },
          },
        },
        {
          reference: 'email',
          columnName: 'email',
          title: 'Email Address',
          tags: [FieldTag.UNIQUE],
          type: FieldType.TEXT,
          args: {},
          meta: {
            grid: {
              order: 1,
              hidden: false,
            },
          },
        },
        {
          reference: 'roleId',
          columnName: 'role_id',
          title: 'Role Identifier',
          type: FieldType.UUID,
          defaultValue: '8cb4fe07-a7b1-4c0e-8a4c-8177be15866d',
          meta: {
            grid: {
              order: 1,
              hidden: false,
              replace: 'role',
            },
          },
          args: {},
          tags: [],
        },
        {
          reference: 'groupId',
          columnName: 'group_id',
          title: 'Group Identifier',
          type: FieldType.UUID,
          defaultValue: 'b0ea6d23-e62b-4f9b-b0ac-2e7110011342',
          meta: {
            grid: {
              order: 1,
              hidden: false,
              replace: 'name',
            },
          },
          args: {},
          tags: [],
        },
        {
          reference: 'password',
          columnName: 'password',
          title: 'Password Hash',
          tags: [],
          type: FieldType.TEXT,
          args: {},
          meta: {
            grid: {
              order: 2,
              hidden: true,
            },
          },
          setters: [
            {
              reference: 'passwordHash',
              config: {},
              priority: 0,
            },
          ],
        },
        {
          reference: 'signUpAt',
          columnName: 'signUpAt',
          title: 'Sign Up Date',
          type: FieldType.DATETIME,
          defaultValue: null,
          meta: {
            grid: {
              order: 4,
              hidden: false,
            },
          },
          args: {},
          tags: [FieldTag.CREATED],
        },
      ],
      indices: [],
      uniques: [],
      relations: [
        {
          kind: RelationType.HAS_MANY,
          name: 'accessKeys',
          target: 'AccessKey',
          localField: 'id',
          remoteField: 'accountId',
        },
        {
          kind: RelationType.BELONGS_TO_ONE,
          name: 'role',
          target: 'AccessRole',
          localField: 'roleId',
          remoteField: 'id',
        },
        {
          kind: RelationType.BELONGS_TO_ONE,
          name: 'group',
          target: 'AccountGroup',
          localField: 'groupId',
          remoteField: 'id',
        },
      ],
      tags: ['system', 'active'],
      meta: {
        artboard: {
          position: {
            x: 0,
            y: 0,
          },
        },
        isFavorite: true,
      },
      access: {
        create: 'protected',
        read: 'protected',
        update: 'protected',
        delete: 'protected',
      },
    },
    {
      database: 'main',
      reference: 'AccessKey',
      moduleId: 'd01ab3a7-8ffc-4dd3-b706-ef194e460535',
      title: 'Access Keys',
      tableName: '__artgen_access_keys',
      fields: [
        {
          title: 'Key',
          reference: 'key',
          columnName: 'key',
          type: FieldType.UUID,
          args: {},
          tags: [FieldTag.PRIMARY],
          meta: {
            grid: {
              order: 0,
              hidden: false,
            },
          },
        },
        {
          reference: 'issuedAt',
          title: 'Issued At',
          columnName: 'issued_at',
          type: FieldType.DATETIME,
          args: {},
          tags: [FieldTag.CREATED],
          meta: {
            grid: {
              order: 2,
              hidden: false,
            },
          },
        },
        {
          reference: 'accountId',
          title: 'Accound ID',
          columnName: 'account_id',
          type: FieldType.UUID,
          args: {},
          tags: [FieldTag.INDEX],
          meta: {
            grid: {
              order: 1,
              hidden: false,
              replace: 'email',
            },
          },
        },
      ],
      indices: [],
      uniques: [],
      relations: [
        {
          kind: RelationType.BELONGS_TO_ONE,
          name: 'account',
          target: 'Account',
          localField: 'accountId',
          remoteField: 'id',
        },
      ],
      tags: ['active', 'system'],
      meta: {
        isFavorite: false,
        artboard: {
          position: {
            x: 0,
            y: 0,
          },
        },
      },
      access: {
        create: 'protected',
        read: 'protected',
        update: 'protected',
        delete: 'protected',
      },
    },
    {
      database: 'main',
      title: 'Roles',
      reference: 'AccessRole',
      tableName: '__artgen_access_roles',
      fields: [
        {
          title: 'Identifier',
          reference: 'id',
          columnName: 'id',
          type: FieldType.UUID,
          meta: {
            grid: {
              order: 0,
              hidden: false,
            },
          },
          args: {},
          tags: [FieldTag.PRIMARY],
        },
        {
          title: 'Created Date',
          reference: 'createdAt',
          columnName: 'created_at',
          type: FieldType.DATETIME,
          args: {},
          meta: {
            grid: {
              order: 1,
              hidden: false,
            },
          },
          tags: [FieldTag.CREATED],
        },
        {
          reference: 'role',
          columnName: 'role',
          title: 'Role',
          type: FieldType.TEXT,
          defaultValue: '',
          meta: {
            grid: {
              order: 1,
              hidden: false,
            },
          },
          args: {},
          tags: [FieldTag.UNIQUE],
        },
      ],
      indices: [],
      uniques: [],
      relations: [],
      tags: ['active', 'system'],
      access: {
        create: 'protected',
        read: 'protected',
        update: 'protected',
        delete: 'protected',
      },
      meta: {
        isFavorite: false,
        artboard: {
          position: {
            x: 0,
            y: 0,
          },
        },
      },
      moduleId: 'd01ab3a7-8ffc-4dd3-b706-ef194e460535',
    },
    {
      database: 'main',
      title: 'Groups',
      reference: 'AccountGroup',
      tableName: '__artgen_account_groups',
      fields: [
        {
          title: 'Identifier',
          reference: 'id',
          columnName: 'id',
          type: FieldType.UUID,
          meta: {
            grid: {
              order: 0,
              hidden: false,
            },
          },
          args: {},
          tags: [FieldTag.PRIMARY],
        },
        {
          title: 'Created Date',
          reference: 'createdAt',
          columnName: 'created_at',
          type: FieldType.DATETIME,
          args: {},
          meta: {
            grid: {
              order: 1,
              hidden: false,
            },
          },
          tags: [FieldTag.CREATED],
        },
        {
          reference: 'name',
          columnName: 'name',
          title: 'Name',
          type: FieldType.TEXT,
          defaultValue: '',
          meta: {
            grid: {
              order: 1,
              hidden: false,
            },
          },
          args: {},
          tags: [FieldTag.UNIQUE],
        },
      ],
      indices: [],
      uniques: [],
      relations: [],
      tags: ['active', 'system'],
      access: {
        create: 'protected',
        read: 'protected',
        update: 'protected',
        delete: 'protected',
      },
      meta: {
        isFavorite: false,
        artboard: {
          position: {
            x: 0,
            y: 0,
          },
        },
      },
      moduleId: 'd01ab3a7-8ffc-4dd3-b706-ef194e460535',
    },
    {
      database: 'main',
      reference: 'AccessControl',
      moduleId: 'd01ab3a7-8ffc-4dd3-b706-ef194e460535',
      title: 'Rules',
      tableName: '__artgen_access_control',
      fields: [
        {
          title: 'Identifier',
          reference: 'id',
          columnName: 'id',
          type: FieldType.UUID,
          meta: {
            grid: {
              order: 0,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [FieldTag.PRIMARY],
        },
        {
          reference: 'accessRoleId',
          columnName: 'accessRoleId',
          title: 'Access Role ID',
          type: FieldType.UUID,
          meta: {
            grid: {
              order: 1,
              hidden: false,
              replace: 'role',
            },
          },
          args: {},
          tags: [],
        },
        {
          reference: 'operation',
          columnName: 'operation',
          title: 'Operation',
          type: FieldType.ENUM,
          meta: {
            grid: {
              order: 2,
              hidden: false,
              replace: null,
            },
          },
          args: {
            values: ['Create', 'Read', 'Update', 'Delete'],
          },
          tags: [],
        },
        {
          reference: 'action',
          columnName: 'action',
          title: 'Action',
          type: FieldType.ENUM,
          meta: {
            grid: {
              order: 3,
              hidden: false,
              replace: null,
            },
          },
          defaultValue: 'Allow',
          args: {
            values: ['Allow', 'Deny'],
          },
          tags: [],
        },
        {
          reference: 'database',
          columnName: 'database',
          title: 'Database',
          type: FieldType.TEXT,
          meta: {
            grid: {
              order: 4,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [FieldTag.INDEX],
        },
        {
          reference: 'schemaRef',
          columnName: 'schemaRef',
          title: 'Schema',
          type: FieldType.TEXT,
          meta: {
            grid: {
              order: 5,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [FieldTag.INDEX],
        },
        {
          title: 'Created Date',
          reference: 'createdAt',
          columnName: 'created_at',
          type: FieldType.DATETIME,
          args: {},
          meta: {
            grid: {
              order: 6,
              hidden: false,
              replace: null,
            },
          },
          tags: [FieldTag.CREATED],
        },
        {
          title: 'Updated Date',
          reference: 'updatedAt',
          columnName: 'updated_at',
          defaultValue: null,
          args: {},
          meta: {
            grid: {
              order: 4,
              hidden: false,
              replace: null,
            },
          },
          type: FieldType.DATETIME,
          tags: [FieldTag.UPDATED, FieldTag.NULLABLE],
        },
      ],
      indices: [],
      uniques: [],
      relations: [
        {
          kind: RelationType.BELONGS_TO_ONE,
          name: 'role',
          target: 'AccessRole',
          localField: 'accessRoleId',
          remoteField: 'id',
        },
      ],
      tags: ['active'],
      meta: {
        artboard: {
          position: {
            x: 0,
            y: 0,
          },
        },
      },
      access: {
        create: 'protected',
        read: 'protected',
        update: 'protected',
        delete: 'protected',
      },
    },
    {
      database: 'main',
      reference: 'Dashboard',
      moduleId: 'c2046325-9d0e-42a4-aa55-1116fdd97913',
      title: 'Dashboards',
      tableName: '__artgen_dashboards',
      fields: [
        {
          title: 'Identifier',
          reference: 'id',
          columnName: 'id',
          type: FieldType.UUID,
          meta: {
            grid: {
              order: 0,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [FieldTag.PRIMARY],
        },
        {
          reference: 'name',
          columnName: 'name',
          title: 'Name',
          type: FieldType.TEXT,
          meta: {
            grid: {
              order: 2,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [],
        },
        {
          reference: 'order',
          columnName: 'order',
          title: 'Sort Order',
          type: FieldType.INTEGER,
          defaultValue: 100,
          meta: {
            grid: {
              order: 3,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [],
        },
        {
          reference: 'widgets',
          columnName: 'widgets',
          title: 'Widgets',
          type: FieldType.JSON,
          defaultValue: [],
          meta: {
            grid: {
              order: 4,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [],
        },
      ],
      indices: [],
      uniques: [],
      relations: [],
      tags: ['active'],
      meta: {
        isFavorite: false,
        artboard: {
          position: {
            x: 0,
            y: 0,
          },
        },
      },
      access: {
        create: 'protected',
        read: 'protected',
        update: 'protected',
        delete: 'protected',
      },
    },
    {
      database: 'main',
      reference: 'FlowExecution',
      moduleId: 'c2046325-9d0e-42a4-aa55-1116fdd97913',
      title: 'Flow Executions',
      tableName: '__artgen_flow_executions',
      fields: [
        {
          title: 'Session ID',
          reference: 'id',
          columnName: 'id',
          type: FieldType.UUID,
          meta: {
            grid: {
              order: 0,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [FieldTag.PRIMARY],
          searchable: false,
        },
        {
          reference: 'flowId',
          columnName: 'flow_id',
          title: 'Flow ID',
          type: FieldType.UUID,
          defaultValue: null,
          meta: {
            grid: {
              order: 1,
              hidden: false,
              replace: 'name',
            },
          },
          args: {},
          tags: [],
          searchable: false,
        },
        {
          reference: 'elapsedTime',
          columnName: 'elapsedTime',
          title: 'Elapsed Time',
          type: FieldType.FLOAT,
          defaultValue: '0',
          meta: {
            grid: {
              order: 2,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [],
          searchable: false,
        },
        {
          reference: 'context',
          columnName: 'context',
          title: 'Context',
          type: FieldType.JSON,
          defaultValue: {},
          meta: {
            grid: {
              order: 3,
              hidden: true,
              replace: null,
            },
          },
          args: {},
          tags: [],
          searchable: false,
        },
        {
          title: 'Finished At',
          reference: 'createdAt',
          columnName: 'created_at',
          type: FieldType.DATETIME,
          args: {},
          meta: {
            grid: {
              order: 5,
              hidden: false,
              replace: null,
            },
          },
          tags: [FieldTag.CREATED],
          searchable: false,
        },
        {
          reference: 'debugTrace',
          columnName: 'debugTrace',
          title: 'Debug Trace',
          type: FieldType.JSON,
          defaultValue: [],
          meta: {
            grid: {
              order: 4,
              hidden: true,
              replace: null,
            },
          },
          args: {},
          tags: [],
          searchable: false,
        },
      ],
      indices: [],
      uniques: [],
      relations: [
        {
          kind: RelationType.BELONGS_TO_ONE,
          name: 'flow',
          target: 'Flow',
          localField: 'flowId',
          remoteField: 'id',
        },
      ],
      tags: ['active'],
      meta: {
        isFavorite: false,
        artboard: {
          position: {
            x: 0,
            y: 0,
          },
        },
      },
      access: {
        create: 'protected',
        read: 'protected',
        update: 'protected',
        delete: 'protected',
      },
    },
    {
      database: 'main',
      title: 'Reverse Proxy',
      reference: 'ReverseProxy',
      tableName: '__artgen_reverse_proxy',
      moduleId: 'c2046325-9d0e-42a4-aa55-1116fdd97913',
      fields: [
        {
          title: 'Identifier',
          reference: 'id',
          columnName: 'id',
          type: FieldType.UUID,
          meta: {
            grid: {
              order: 0,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [FieldTag.PRIMARY],
          searchable: false,
        },
        {
          reference: 'host',
          columnName: 'host',
          title: 'Host',
          type: FieldType.TEXT,
          defaultValue: null,
          meta: {
            grid: {
              order: 1,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [FieldTag.UNIQUE, FieldTag.NULLABLE],
          searchable: false,
        },
        {
          reference: 'path',
          columnName: 'path',
          title: 'Path',
          type: FieldType.TEXT,
          defaultValue: null,
          meta: {
            grid: {
              order: 2,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [FieldTag.NULLABLE],
          searchable: false,
        },
        {
          reference: 'hostRewrite',
          columnName: 'hostRewrite',
          title: 'Host Rewrite',
          type: FieldType.TEXT,
          defaultValue: null,
          meta: {
            grid: {
              order: 3,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [],
          searchable: false,
        },
        {
          reference: 'stripPath',
          columnName: 'stripPath',
          title: 'Strip Path',
          type: FieldType.BOOLEAN,
          defaultValue: false,
          meta: {
            grid: {
              order: 4,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [],
          searchable: false,
        },
        {
          reference: 'target',
          columnName: 'target',
          title: 'Target',
          type: FieldType.TEXT,
          meta: {
            grid: {
              order: 5,
              hidden: false,
              replace: null,
            },
          },
          args: {},
          tags: [],
          searchable: false,
        },
        {
          title: 'Created Date',
          reference: 'createdAt',
          columnName: 'created_at',
          type: FieldType.DATETIME,
          args: {},
          meta: {
            grid: {
              order: 6,
              hidden: false,
              replace: null,
            },
          },
          tags: [FieldTag.CREATED],
          searchable: false,
        },
        {
          title: 'Updated Date',
          reference: 'updatedAt',
          columnName: 'updated_at',
          defaultValue: null,
          args: {},
          meta: {
            grid: {
              order: 7,
              hidden: false,
              replace: null,
            },
          },
          type: FieldType.DATETIME,
          tags: [FieldTag.UPDATED, FieldTag.NULLABLE],
          searchable: false,
        },
      ],
      indices: [],
      uniques: [],
      relations: [],
      tags: ['active'],
      access: {
        create: 'protected',
        read: 'protected',
        update: 'protected',
        delete: 'protected',
      },
      meta: {
        artboard: {
          position: {
            x: 0,
            y: 0,
          },
        },
      },
    },
  ],
  content: {
    Module: [
      {
        id: 'c2046325-9d0e-42a4-aa55-1116fdd97913',
        name: 'System',
        tags: ['system'],
      },
      {
        id: 'd01ab3a7-8ffc-4dd3-b706-ef194e460535',
        name: 'Identity',
        tags: ['system'],
      },
    ],
    Flow: [
      {
        id: '2ecfd7bd-d051-46d4-9e8e-a1229dd1857f',
        moduleId: null,
        name: 'Lambda List',
        nodes: [
          {
            id: 'lambda.read.1',
            type: 'lambda.read',
            config: {},
            title: 'Lambda Read',
            position: [831.3333333333334, 208.66666666666669],
          },
          {
            id: 'terminate.http.1',
            type: 'terminate.http',
            config: {
              transform: '{{ $input.response | toJson }}',
              statusCode: '200',
            },
            title: 'HTTP Ok',
            position: [832, 331],
          },
          {
            id: 'trigger.http.1',
            type: 'trigger.http',
            config: {
              path: '/api/lambda',
              method: 'GET',
              statusCode: '200',
              authentication: 'protected',
              responseFormat: 'application/json',
              response: "{{ $nodes['lambda.read.1'].output.result | toJson }}",
              waitForLastNode: 'true',
            },
            title: 'HTTP Endpoint',
            position: [832.8333333333334, 86.91666666666669],
          },
        ],
        edges: [
          {
            id: 'de3aa052-5708-4320-aea0-3c72277be1ed',
            sourceNodeId: 'trigger.http.1',
            targetNodeId: 'lambda.read.1',
            sourceHandle: 'request',
            targetHandle: 'query',
            transform: '',
          },
          {
            id: 'cde658fc-b288-4df7-9b1e-3ac610348ca9',
            sourceNodeId: 'lambda.read.1',
            targetNodeId: 'terminate.http.1',
            sourceHandle: 'result',
            targetHandle: 'response',
            transform: '',
          },
        ],
      },
      {
        id: 'ced473f0-522c-47db-a88c-f0f981d93f9e',
        moduleId: null,
        name: 'Sign Up',
        nodes: [
          {
            id: 'terminate.http.182',
            type: 'terminate.http',
            config: {
              statusCode: '400',
            },
            title: 'HTTP Error',
            position: [388, -21.79166666666663],
          },
          {
            id: 'rest.create.1',
            type: 'rest.create',
            config: {
              database: 'main',
              schema: 'Account',
            },
            title: 'Create Account',
            position: [502.98025579572163, -157.7185463598183],
          },
          {
            id: 'terminate.http.127',
            type: 'terminate.http',
            config: {
              transform: '{{ $input.response | toJson }}',
              statusCode: '200',
            },
            title: 'HTTP Created',
            position: [684, 80.70833333333337],
          },
          {
            id: 'token.sign.1',
            type: 'token.sign',
            config: {
              expiresIn: '8h',
            },
            title: 'Sign JWT',
            position: [647, -29],
          },
          {
            id: 'trigger.http.26',
            type: 'trigger.http',
            config: {
              path: '/api/identity/signup',
              method: 'POST',
              statusCode: '200',
              authentication: 'public',
              responseFormat: 'application/json',
              response: '{"ack": true}',
              waitForLastNode: 'true',
            },
            title: 'SignUp EP',
            position: [497.5, -288.4166666666667],
          },
        ],
        edges: [
          {
            id: 'ccd1444c-5a31-4666-bd08-9d3fcc3bcfd1',
            sourceNodeId: 'trigger.http.26',
            targetNodeId: 'rest.create.1',
            sourceHandle: 'request',
            targetHandle: 'record',
            transform: '{{ $data.body | toJson }}',
          },
          {
            id: '99cb86e8-524f-4cfd-b896-930277803ea2',
            sourceNodeId: 'rest.create.1',
            targetNodeId: 'terminate.http.182',
            sourceHandle: 'error',
            targetHandle: 'response',
            transform: '',
          },
          {
            id: '6dfc8768-7ef0-410c-971f-61c1093bc9a7',
            sourceNodeId: 'rest.create.1',
            targetNodeId: 'token.sign.1',
            sourceHandle: 'result',
            targetHandle: 'accountId',
            transform: '{{ $output.result.id }}',
          },
          {
            id: '8d165757-851c-4690-8595-ac3077a29d9f',
            sourceNodeId: 'token.sign.1',
            targetNodeId: 'terminate.http.127',
            sourceHandle: 'token',
            targetHandle: 'response',
            transform: '{"accessToken": "{{ $output.token }}"}',
          },
        ],
      },
      {
        id: '51c0abf2-5924-4fdf-a920-a1b3487f6710',
        moduleId: null,
        name: 'Sign In',
        nodes: [
          {
            id: 'trigger.http.1',
            type: 'trigger.http',
            config: {
              path: '/api/authentication/jwt/sign-in',
              method: 'POST',
              statusCode: '200',
              authentication: 'public',
              responseFormat: 'application/json',
              response: '{"ack":true}',
              waitForLastNode: 'true',
            },
            title: 'HTTP Endpoint',
            position: [350.66666666666663, -197.66666666666666],
          },
          {
            id: 'compare.1',
            type: 'compare',
            config: {
              operator: '==',
              against: true,
              negate: false,
            },
            title: 'If Found',
            position: [515.4166666666666, 156.89583333333337],
          },
          {
            id: 'length.1',
            type: 'length',
            config: null,
            title: 'Count',
            position: [481.91666666666663, 35.95833333333337],
          },
          {
            id: 'terminate.http.2',
            type: 'terminate.http',
            config: {
              statusCode: '200',
            },
            title: 'Success',
            position: [994.4166666666665, 487.3564112248772],
          },
          {
            id: 'terminate.http.1',
            type: 'terminate.http',
            config: {
              transform:
                '{"success": false, "message": "Authentication failed"}',
              statusCode: '400',
            },
            title: 'Fail',
            position: [332.16666666666663, 481.08333333333337],
          },
          {
            id: 'hash.compare.1',
            type: 'hash.compare',
            config: null,
            title: 'CHK Passwd',
            position: [638.2326274056248, 315.1294891164211],
          },
          {
            id: 'token.sign.1',
            type: 'token.sign',
            config: {
              expiresIn: '8h',
            },
            title: 'Sign JWT',
            position: [859.1467175777061, 411.199012150488],
          },
          {
            id: 'rest.find.1',
            type: 'rest.find',
            config: {
              database: 'main',
              fields: ['id', 'password'],
              offset: 0,
              limit: 1,
              failOnEmpty: true,
              schema: 'Account',
            },
            title: 'Find Account',
            position: [367.66666666666663, -65.91666666666663],
          },
        ],
        edges: [
          {
            id: '0d418dc4-8339-4d54-9dab-6911ca84c164',
            sourceNodeId: 'trigger.http.1',
            targetNodeId: 'rest.find.1',
            sourceHandle: 'request',
            targetHandle: 'conditions',
            transform: '{"email": "{{ $data.body.email }}"}',
          },
          {
            id: '4086f863-9be2-40ed-a3ae-5054581d278b',
            sourceNodeId: 'rest.find.1',
            targetNodeId: 'length.1',
            sourceHandle: 'records',
            targetHandle: 'subject',
            transform: '',
          },
          {
            id: '33c08b27-fc56-4e1d-9c78-9ccffb629dfc',
            sourceNodeId: 'length.1',
            targetNodeId: 'compare.1',
            sourceHandle: 'length',
            targetHandle: 'subject',
            transform: '',
          },
          {
            id: '2a9a88d7-d876-4e53-82ed-c6c54cd0a79f',
            sourceNodeId: 'rest.find.1',
            targetNodeId: 'terminate.http.1',
            sourceHandle: 'error',
            targetHandle: 'response',
            transform: '',
          },
          {
            id: '12690074-0cac-4f33-ba78-a84b5a12c2a5',
            sourceNodeId: 'compare.1',
            targetNodeId: 'terminate.http.1',
            sourceHandle: 'no',
            targetHandle: 'response',
            transform: '',
          },
          {
            id: '6c369397-bf96-4ee4-8b81-7966823f0fb0',
            sourceNodeId: 'compare.1',
            targetNodeId: 'hash.compare.1',
            sourceHandle: 'yes',
            targetHandle: 'elements',
            transform:
              '{"hash": "{{ $nodes[\'rest.find.1\'].output.records[0].password  }}", "plain": "{{ $trigger.body.password }}"}',
          },
          {
            id: '27d6ee54-058e-4549-b7b9-41d9285e4dd1',
            sourceNodeId: 'hash.compare.1',
            targetNodeId: 'terminate.http.1',
            sourceHandle: 'no',
            targetHandle: 'response',
            transform: '',
          },
          {
            id: '82ba84f4-5f2c-4c53-b358-53ebfc37ac35',
            sourceNodeId: 'hash.compare.1',
            targetNodeId: 'token.sign.1',
            sourceHandle: 'yes',
            targetHandle: 'accountId',
            transform: "{{ $nodes['rest.find.1'].output.records[0].id }}",
          },
          {
            id: '3729c621-6181-4ee8-9962-afd890d9cf2a',
            sourceNodeId: 'token.sign.1',
            targetNodeId: 'terminate.http.2',
            sourceHandle: 'token',
            targetHandle: 'response',
            transform: '{"accessToken": "{{ $output.token }}"}',
          },
        ],
      },
    ],
    AccessRole: [
      {
        id: '8cb4fe07-a7b1-4c0e-8a4c-8177be15866d',
        role: 'System',
        createdAt: '2022-01-21 08:16:37.351',
      },
      {
        id: '18574f6a-9401-4bc7-93ad-7aab4f345b83',
        role: 'Staff',
        createdAt: '2022-01-21 08:16:37.351',
      },
    ],
    AccountGroup: [
      {
        id: 'b0ea6d23-e62b-4f9b-b0ac-2e7110011342',
        name: 'System',
        createdAt: '2022-04-07 20:17:21.521',
      },
    ],
    Dashboard: [
      {
        id: '9d22786a-010d-4a57-beda-35f6de62d4be',
        name: 'Telemetry Board',
        order: 102,
        widgets: [
          {
            h: 3,
            i: '75c1cbb1-76d6-4d6d-a8d7-96324fba165d',
            w: 3,
            x: 8,
            y: 0,
            minH: 2,
            minW: 3,
            widget: {
              id: 'note',
              config: {
                content:
                  "This widget's content can be configured.\nFor example, you can leave notes here!\n\n<3",
              },
              header: 'Just A NOTE',
            },
          },
          {
            h: 4,
            i: '3b5346da-f040-4501-990a-821b966f53cb',
            w: 8,
            x: 0,
            y: 0,
            minH: 2,
            minW: 4,
            widget: {
              id: 'telemetry.serie',
              config: {
                color: '#ff6000',
                serie: 'http.request',
                legend: 'Requests',
                refresh: 10,
              },
              header: 'HTTP REQUESTS',
            },
          },
          {
            h: 4,
            i: 'fd63a1a1-d125-4012-b3e9-a3fac3fd8186',
            w: 7,
            x: 0,
            y: 4,
            minH: 2,
            minW: 4,
            widget: {
              id: 'telemetry.serie',
              config: {
                color: '#fe1169',
                serie: 'flow.execution',
                legend: 'Executions',
                refresh: 10,
              },
              header: 'Flow Executions',
            },
          },
          {
            h: 4,
            i: 'c00b7a65-25d4-4a1e-8765-622311e45205',
            w: 7,
            x: 7,
            y: 4,
            minH: 2,
            minW: 4,
            widget: {
              id: 'telemetry.serie',
              config: {
                color: '#ccff00',
                serie: 'db.query',
                legend: 'Database Queries',
                refresh: 10,
              },
              header: 'DATABASE QUERIES',
            },
          },
          {
            h: 3,
            i: 'c8aa24c6-bee6-4255-9437-9792846b0cc7',
            w: 3,
            x: 11,
            y: 0,
            minH: 3,
            minW: 3,
            widget: {
              id: 'telemetry.uptime',
              config: {},
              header: ' Uptime',
            },
          },
        ],
      },
    ],
  },
};
