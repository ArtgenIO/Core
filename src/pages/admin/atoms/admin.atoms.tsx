import { diff } from 'just-diff';
import { atom, DefaultValue, useRecoilValue } from 'recoil';
import { recoilPersist } from 'recoil-persist';
import { fSchema } from '../../../api/library/filter-schema';
import { migrateSchema } from '../../../api/library/migrate-schema';
import { IContentModule } from '../../../api/types/content-module.interface';
import { IFindResponse } from '../../../api/types/find-reponse.interface';
import { SchemaRef } from '../../../api/types/system-ref.enum';
import { IAccount } from '../../../models/account.interface';
import { IDatabase } from '../../../models/database.interface';
import { ISchema } from '../../../models/schema.interface';
import { decodeJWT } from '../library/get-token-expiration';
import { toRestSysRoute } from '../library/schema-url';
import { useHttpClientSimple } from '../library/simple.http-client';

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

export const profileAtom = atom<Omit<IAccount, 'password'> | null>({
  key: 'profile',
  default: null,
  effects_UNSTABLE: [
    ({ setSelf }) => {
      const jwtString = useRecoilValue(jwtAtom);

      if (jwtString) {
        const jwt = decodeJWT(jwtString);

        setSelf(
          useHttpClientSimple()
            .get(
              toRestSysRoute(SchemaRef.ACCOUNT, q =>
                q
                  .select('id,email')
                  .top(1)
                  .filter(f => f.filterExpression('id', 'eq', jwt.aid)),
              ),
            )
            .then(r => r.data.data[0]),
        );
      }
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
