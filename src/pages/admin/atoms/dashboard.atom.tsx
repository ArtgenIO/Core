import { diff } from 'just-diff';
import { atom, DefaultValue } from 'recoil';
import { recoilPersist } from 'recoil-persist';
import { IFindResponse } from '../../../api/types/find-reponse.interface';
import { SchemaRef } from '../../../api/types/system-ref.enum';
import { IDashboard } from '../../../models/dashboard.interface';

import { toRestSysRoute } from '../library/schema-url';
import { useHttpClientSimple } from '../library/simple.http-client';

const { persistAtom } = recoilPersist();

export const lastViewedDashAtom = atom<string>({
  key: 'lastDashboard',
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const dashboardsAtom = atom<IDashboard[]>({
  key: 'dashboards',
  default: undefined,
  effects_UNSTABLE: [
    ({ onSet }) => {
      const client = useHttpClientSimple();

      onSet((newDashboards, oldDashboards) => {
        if (
          !(oldDashboards instanceof DefaultValue) &&
          oldDashboards !== undefined
        ) {
          const path = toRestSysRoute(SchemaRef.DASHBOARD);

          newDashboards.forEach(newDashboard => {
            const oldDashboard = oldDashboards.find(
              r => r.id === newDashboard.id,
            );

            // New created
            if (!oldDashboard) {
              client.post(path, newDashboard);
            }
            // Schema changed
            else if (diff(newDashboard, oldDashboard).length) {
              client.patch(`${path}/${newDashboard.id}`, newDashboard);
            }
          });

          // Deletes
          oldDashboards.forEach(oldSchema => {
            if (!newDashboards.find(r => r.id === oldSchema.id)) {
              client.delete(`${path}/${oldSchema.id}`);
            }
          });
        }
      });
    },

    ({ setSelf }) => {
      setSelf(
        useHttpClientSimple()
          .get<IFindResponse<IDashboard>>(
            toRestSysRoute(SchemaRef.DASHBOARD, q =>
              q.top(100).orderBy('order'),
            ),
          )
          .then(r => r.data.data),
      );
    },
  ],
});
