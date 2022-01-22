import { diff } from 'just-diff';
import { ReactChild } from 'react';
import { atom, DefaultValue, useRecoilValue } from 'recoil';
import { recoilPersist } from 'recoil-persist';
import { IContentModule } from '../content/interface/content-module.interface';
import { toRestSysRoute } from '../content/util/schema-url';
import { IDatabase } from '../database';
import { IAccount } from '../identity/interface/account.interface';
import { decodeJWT } from '../identity/util/get-token-expiration';
import { IFindResponse } from '../rest/interface/find-reponse.interface';
import { ISchema } from '../schema';
import { SchemaRef } from '../schema/interface/system-ref.enum';
import { fSchema } from '../schema/util/filter-schema';
import { migrateSchema } from '../schema/util/migrate-schema';
import { useHttpClientSimple } from './library/http-client';

const { persistAtom } = recoilPersist();

export const lastViewedAtom = atom<[string, string]>({
  key: 'lastViewed',
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const jwtAtom = atom<string>({
  key: 'jwt',
  default: '',
  effects_UNSTABLE: [persistAtom],
});
export const pageSizeAtom = atom<number>({
  key: 'pageSize',
  default: 20,
  effects_UNSTABLE: [persistAtom],
});

export const pageDrawerAtom = atom<ReactChild>({
  key: 'pageDrawer',
  default: undefined,
});

export const schemasAtom = atom<ISchema[]>({
  key: 'schemas',
  default: [],
  effects_UNSTABLE: [
    ({ onSet }) => {
      const client = useHttpClientSimple();

      onSet((newSchemas, oldSchemas) => {
        if (!(oldSchemas instanceof DefaultValue)) {
          const path = toRestSysRoute(SchemaRef.SCHEMA);

          newSchemas.forEach(newSchema => {
            const oldSchema = oldSchemas.find(fSchema(newSchema));

            // New created
            if (!oldSchema) {
              client.post(path, newSchema);
            }
            // Schema changed
            else if (diff(newSchema, oldSchema).length) {
              client.patch(
                `${path}/${newSchema.database}/${newSchema.reference}`,
                newSchema,
              );
            }
          });

          // Deletes
          oldSchemas.forEach(oldSchema => {
            if (!newSchemas.find(fSchema(oldSchema))) {
              client.delete(
                `${path}/${oldSchema.database}/${oldSchema.reference}`,
              );
            }
          });
        }
      });
    },

    ({ setSelf }) => {
      setSelf(
        useHttpClientSimple()
          .get<IFindResponse<ISchema>>(
            toRestSysRoute(SchemaRef.SCHEMA, q =>
              q.top(1_000).orderBy('title'),
            ),
          )
          .then(r => r.data.data.map(migrateSchema)),
      );
    },
  ],
});

export const profileAtom = atom<Omit<IAccount, 'password'>>({
  key: 'profile',
  default: null,
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet((newState, oldState) => {
        //
      });
    },

    ({ setSelf }) => {
      const jwt = decodeJWT(useRecoilValue(jwtAtom));

      setSelf(
        useHttpClientSimple()
          .get(
            toRestSysRoute(SchemaRef.ACCOUNT, q =>
              q
                .select('id,email')
                .top(1)
                .filter(f => f.filterExpression('id', '=', jwt.aid)),
            ),
          )
          .then(r => r.data.data[0]),
      );
    },
  ],
});

export const databasesAtom = atom<IDatabase[]>({
  key: 'databases',
  default: null,
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet((newState, oldState) => {
        //
      });
    },

    ({ setSelf }) => {
      setSelf(
        useHttpClientSimple()
          .get(
            toRestSysRoute(SchemaRef.DATABASE, q =>
              q.top(1_000).orderBy('title'),
            ),
          )
          .then(r => r.data.data),
      );
    },
  ],
});

export const modulesAtom = atom<IContentModule[]>({
  key: 'modules',
  default: null,
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet((newState, oldState) => {
        //
      });
    },

    ({ setSelf }) => {
      setSelf(
        useHttpClientSimple()
          .get(
            toRestSysRoute(SchemaRef.MODULE, q => q.top(1_000).orderBy('name')),
          )
          .then(r => r.data.data),
      );
    },
  ],
});

// export const modulesAtom = selector<IContentModule[]>({
//   key: 'modules',
//   get: () => {
//     return useHttpClientSimple()
//       .get(toRestSysRoute('module'))
//       .then(r => r.data.data);
//   },
// });
