import { diff } from 'just-diff';
import { atom, DefaultValue } from 'recoil';
import { recoilPersist } from 'recoil-persist';
import { toRestSysRoute } from '../../content/util/schema-url';
import { IFindResponse } from '../../rest/interface/find-reponse.interface';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
import { IDashboard } from '../interface/dashboard.interface';
import { useHttpClientSimple } from '../library/http-client';

const { persistAtom } = recoilPersist();

export const lastViewedDashAtom = atom<string>({
  key: 'lastDashboard',
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const dashboardsAtom = atom<IDashboard[]>({
  key: 'dashboards',
  default: [],
  effects_UNSTABLE: [
    ({ onSet }) => {
      const client = useHttpClientSimple();

      onSet((newDashboards, oldDashboards) => {
        if (!(oldDashboards instanceof DefaultValue)) {
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
