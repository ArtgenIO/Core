import { SaveOutlined } from '@ant-design/icons';
import { Button, Input, notification } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 } from 'uuid';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { toRestSysRoute } from '../../content/util/schema-url';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
import { IFlow } from '../interface';

export default function ImportFlowComponent() {
  const [content, setContent] = useState<string>(null);
  const [isValid, setIsValid] = useState(false);
  const client = useHttpClientSimple();

  // Routing
  const navigate = useNavigate();

  useEffect(() => {
    if (content && content.length) {
      try {
        const temp = JSON.parse(content);
        const keys = Object.keys(temp);

        for (const req of [
          'name',
          'nodes',
          'edges',
          'isActive',
          'captureContext',
        ]) {
          if (!keys.includes(req)) {
            throw `Missing key [${req}]`;
          }
        }

        setIsValid(true);

        notification.info({
          key: 'flow-import',
          message: 'Flow seems to be valid',
        });
      } catch (error) {
        setIsValid(false);
        notification.error({
          key: 'flow-import',
          message: 'Flow validation failed',
          description: (error as Error)?.message,
        });
      }
    }
  }, [content]);

  const doImport = () => {
    const newFlow: IFlow = JSON.parse(content);

    if (!newFlow?.id) {
      (newFlow as any).id = v4();
    }

    client
      .post(toRestSysRoute(SchemaRef.FLOW), newFlow)
      .then(r => navigate(`/flow/artboard/${newFlow.id}`));

    notification.success({
      key: 'schema-import',
      message: 'Schema imported',
      description: 'Have fun!',
    });
  };

  return (
    <PageWithHeader header={<PageHeader title="Import Flow" />}>
      <Input.TextArea
        rows={16}
        showCount
        maxLength={65536 * 2}
        className="bg-midnight-750 mb-4"
        placeholder="Paste your flow JSON here"
        value={content}
        onChange={e => setContent(e.target.value)}
      ></Input.TextArea>

      <Button
        type="primary"
        icon={<SaveOutlined />}
        block
        disabled={!isValid}
        onClick={() => doImport()}
      >
        Create Flow
      </Button>
    </PageWithHeader>
  );
}
