import { GithubFilled, MediumOutlined, SmileOutlined } from '@ant-design/icons';
import { Alert, Button, message } from 'antd';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import { useEffect, useState } from 'react';
import GridLayout from 'react-grid-layout';
import { toRestSysRoute } from '../../content/util/schema-url';
import { IFindResponse } from '../../rest/interface/find-reponse.interface';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
import { IDashGridElement } from '../interface/dash-grid.interface';
import { IDashboard } from '../interface/dashboard.interface';
import PageHeader from '../layout/page-header.component';
import PageWithHeader from '../layout/page-with-header.component';
import { useHttpClientSimple } from '../library/http-client';
import { useHttpClient } from '../library/use-http-client';
import './dashboard.component.less';
import RenderWidgetComponent from './widgets.collection';

export default function DashboardPage() {
  const client = useHttpClientSimple();

  const [dashboards, setDashboards] = useState<IDashboard[]>([]);
  const [elements, setElements] = useState<IDashGridElement[]>(null);
  const [selected, setSelected] = useState<string>(null);
  const [title, setTitle] = useState('Dashboard');

  const [{ data: response, loading, error }] = useHttpClient<
    IFindResponse<IDashboard>
  >(toRestSysRoute(SchemaRef.DASHBOARD, q => q.top(100)));

  useEffect(() => {
    if (response) {
      if (response.data.length) {
        setDashboards(response.data);
        setSelected(response.data[0].id);
      } else {
        message.warn('No dashboard?!');
      }
    }
  }, [response]);

  useEffect(() => {
    if (selected) {
      const dash = dashboards.find(d => d.id === selected);

      setTitle(dash.name);
      setElements(dash.widgets);
    }
  }, [selected]);

  const onLayoutChange = (currentGridState, allLayouts) => {
    if (currentGridState) {
      const original = dashboards.find(d => d.id === selected);
      const dashboard = cloneDeep(original);

      dashboard.widgets.forEach(widget => {
        const el = currentGridState.find(e => e.i === widget.i);
        widget.w = el.w;
        widget.h = el.h;
        widget.x = el.x;
        widget.y = el.y;
      });

      if (!isEqual(original, dashboard)) {
        client
          .patch(
            toRestSysRoute(SchemaRef.DASHBOARD) + `/${dashboard.id}`,
            dashboard,
          )
          .then(() => message.success('Dashboard updated'))
          .catch(() => message.warning('Could not save the dashboard state!'));
      }
    }
  };

  return (
    <PageWithHeader
      header={
        <PageHeader
          title={title}
          actions={
            <>
              <a
                key="github"
                href="https://github.com/ArtgenIO/Core"
                target="_blank"
              >
                <Button icon={<GithubFilled />}>Star it on Github ❤️</Button>
              </a>
              <a key="blog" href="https://blog.artgen.io/" target="_blank">
                <Button icon={<MediumOutlined />}>Read more in our blog</Button>
              </a>
              <a key="site" href="https://artgen.io/" target="_blank">
                <Button icon={<SmileOutlined />}>Check Out Our Website</Button>
              </a>
            </>
          }
        />
      }
    >
      <Alert
        type="info"
        className="mb-1 ml-2"
        icon={<SmileOutlined className="text-xl mr-4" />}
        showIcon
        message={
          <>
            Artgen Core is in&nbsp;
            <strong className="font-bold">beta preview</strong> status, You can
            go around and test the current state, but please don't try to deploy
            it in production environment. If You have any feedback, don't be shy
            to share with us on our GitHub page.{' '}
            <i className="bold text-primary-400">Have a nice day!</i>
          </>
        }
      />

      {elements && (
        <GridLayout
          width={window.innerWidth - 100}
          cols={14}
          className="text-center"
          layout={elements}
          rowHeight={60}
          onLayoutChange={onLayoutChange}
        >
          {elements.map(el => (
            <div key={el.i}>
              <RenderWidgetComponent widget={el.widget} />
            </div>
          ))}
        </GridLayout>
      )}
    </PageWithHeader>
  );
}
