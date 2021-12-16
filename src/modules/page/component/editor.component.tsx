// @ts-nocheck
import { Skeleton } from 'antd';
import 'grapesjs-preset-webpage';
import { GrapesjsReact } from 'grapesjs-react';
import 'grapesjs/dist/css/grapes.min.css';
import { QueryBuilder } from 'odata-query-builder';
import { useState } from 'react';
import { useParams } from 'react-router';
import { useHttpClientOld } from '../../admin/library/http-client';
import { useHttpClient } from '../../admin/library/use-http-client';
import { routeCrudAPI } from '../../content/util/schema-url';
import { IPage } from '../interface/page.interface';
import './editor.component.less';

type Route = {
  id: string;
};

export default function PageEditorComponent() {
  const route: Route = useParams();
  const [editor, setEditor] = useState(null);
  const httpClient = useHttpClientOld();

  // Load schema
  const storeURL =
    routeCrudAPI({ database: 'main', reference: 'Page' }) +
    new QueryBuilder()
      .filter(f => f.filterExpression('id', 'eq', route.id))
      .top(1)
      .toQuery();

  const [{ data: pages, loading: isPagesLoading }] =
    useHttpClient<IPage[]>(storeURL);

  const storageManager = {
    type: 'artgen-storage',
    autoload: false,
  };

  if (editor) {
    (editor as any).StorageManager.add('artgen-storage', {
      load(keys, onDone, onErr) {
        httpClient
          .get(storeURL)
          .then(resp => {
            const content = resp.data[0].content;

            onDone(content);
          })
          .catch(err => onErr(err));
      },
      store(data, onDone, onErr) {
        const page = pages[0];
        page.content = data;

        httpClient
          .patch(storeURL, page)
          .then(resp => {
            onDone();
          })
          .catch(err => onErr(err));
      },
    });

    document.getElementById('page-editor').style.height = '100vh';
  }

  const editorRef = (
    <GrapesjsReact
      storageManager={storageManager}
      fromElement={false}
      plugins={['gjs-preset-webpage', 'gjs-blocks-basic']}
      id="page-editor"
      onInit={e => setEditor(e)}
    ></GrapesjsReact>
  );

  return <Skeleton loading={isPagesLoading}>{editorRef}</Skeleton>;
}
