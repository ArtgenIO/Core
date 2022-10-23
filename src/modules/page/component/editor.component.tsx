// @ts-nocheck
import { Editor } from 'grapesjs';
import 'grapesjs-preset-webpage';
import { GrapesjsReact } from 'grapesjs-react';
import 'grapesjs/dist/css/grapes.min.css';
import cloneDeep from 'lodash.clonedeep';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useHttpClientSimple } from '../../admin/library/simple.http-client';
import { toRestSysRoute } from '../../content/util/schema-url';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
import { IPage } from '../interface/page.interface';
import './editor.component.less';

type Route = {
  id: string;
};

export default function PageEditorComponent() {
  const params: Route = useParams();
  const [editor, setEditor] = useState<Editor>(null);
  const [page, setPage] = useState<IPage>(null);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (params.id) {
      setUrl(toRestSysRoute(SchemaRef.PAGE) + '/' + params.id);
    }
  }, [params]);

  const httpClient = useHttpClientSimple();

  useEffect(() => {
    if (editor) {
      editor.StorageManager.add('artgen-storage', {
        load(keys, onDone, onErr) {
          console.log('Loading page', keys);
          const defaultObject = {};

          for (const key of keys) {
            defaultObject[key] = [];
          }

          httpClient
            .get<IPage>(url)
            .then(resp => {
              setPage(resp.data);

              const newData = Object.assign(defaultObject, resp.data.content);
              onDone(newData);

              console.log('Loaded', newData);
            })
            .catch(err => onErr(err));
        },
        store(content, onDone, onErr) {
          console.log('Storing page', content);

          setPage(oldState => {
            const newState = cloneDeep(oldState);
            newState.content = content;

            httpClient
              .patch(url, newState)
              .then(resp => {
                onDone();
              })
              .catch(err => onErr(err));

            return newState;
          });
        },
      });

      editor.load();
      editor.on('update', ar => {
        console.log('update', ar);
      });

      document.getElementById('page-editor').style.height = '100vh';
    }
  }, [editor]);

  return (
    <GrapesjsReact
      storageManager={{
        type: 'artgen-storage',
        autoload: true,
        autosave: true,
      }}
      fromElement={false}
      plugins={['gjs-preset-webpage', 'gjs-blocks-basic']}
      id="page-editor"
      onInit={e => setEditor(e)}
    ></GrapesjsReact>
  );
}
