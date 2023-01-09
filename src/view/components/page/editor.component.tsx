// @ts-nocheck
import { Editor } from 'grapesjs';
import 'grapesjs-preset-webpage';
import { GrapesjsReact } from 'grapesjs-react';
import 'grapesjs/dist/css/grapes.min.css';
import cloneDeep from 'lodash.clonedeep';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { IPage } from '../../../models/page.interface';
import { SchemaRef } from '../../../types/system-ref.enum';
import { toRestSysRoute } from '../../library/schema-url';
import { useHttpClientSimple } from '../../library/simple.http-client';
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
      editor.on('update', ar => {});

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
