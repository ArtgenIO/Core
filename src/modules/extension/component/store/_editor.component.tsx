import { Button, Divider, Form, Input, Select, Transfer } from 'antd';
import { startCase } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useHttpClient } from '../../../admin/library/use-http-client';
import { routeCrudAPI } from '../../../content/util/schema-url';
import { ISchema } from '../../../schema';
import { IWorkflow } from '../../../workflow/interface';
import { IExtension } from '../../interface/extension.interface';

type TransferItem = {
  key: string;
  title: string;
  description: string;
};

type Props = {
  extension: IExtension;
  setExtension: Dispatch<SetStateAction<IExtension>>;
  onSave: () => void;
};

export default function ExtensionEdiorComponent({
  extension,
  setExtension,
  onSave,
}: Props) {
  if (!extension) {
    return <h1>Waiting....</h1>;
  }

  const [schemas, setSchemas] = useState<TransferItem[]>([]);
  const [workflows, setWorkflows] = useState<TransferItem[]>([]);
  const [databases, setDatabases] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>(
    extension.database,
  );

  const [selectedSchemas, setSelectedSchemas] = useState<string[]>(
    extension.schemas.map(s => s.reference),
  );
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>(
    extension.workflows.map(wf => wf.id),
  );

  const [{ data: schemasReply, loading: schemasLoading }] = useHttpClient<
    ISchema[]
  >(
    routeCrudAPI({
      database: 'system',
      reference: 'Schema',
    }),
  );

  const [{ data: workflowReply, loading: workflowLoading }] = useHttpClient<
    IWorkflow[]
  >(
    routeCrudAPI({
      database: 'system',
      reference: 'Workflow',
    }),
  );

  useEffect(() => {
    setExtension(ext => {
      ext.database = selectedDatabase;

      if (schemasReply) {
        ext.schemas = schemasReply.filter(s =>
          selectedSchemas.includes(s.reference),
        );
      }

      if (workflowReply) {
        ext.workflows = workflowReply.filter(wf =>
          selectedWorkflows.includes(wf.id),
        );
      }

      return ext;
    });
  }, [selectedSchemas, selectedWorkflows, selectedDatabase]);

  useEffect(() => {
    if (schemasReply) {
      const dbs = Array.from(
        new Set(schemasReply.map(s => s.database)).values(),
      );

      setDatabases(dbs);

      if (dbs.length === 1) {
        setSelectedDatabase(dbs[0]);
      }
    }
  }, [schemasReply]);

  useEffect(() => {
    if (workflowReply) {
      setWorkflows(
        workflowReply.map(wf => ({
          title: wf.name,
          key: wf.id,
          description: wf.name,
        })),
      );
    }
  }, [workflowReply]);

  useEffect(() => {
    if (schemasReply) {
      setSchemas(
        schemasReply
          .filter(c => c.database === selectedDatabase)
          .filter(c => !c.tags.includes('system'))
          .map(s => ({
            key: s.reference,
            title: s.label,
            description: '',
          })),
      );

      console.log(
        'Setting schemas',
        schemasReply
          .filter(c => c.database === selectedDatabase)
          .filter(c => !c.tags.includes('system'))
          .map(s => ({
            key: s.reference,
            title: s.label,
            description: '',
          })),
      );
    }
  }, [selectedDatabase, schemasReply]);

  if (schemasLoading || workflowLoading || !schemas) {
    return <h1>Loading...</h1>;
  }

  console.log({
    selectedDatabase,
    selectedSchemas,
    schemas,
  });

  return (
    <Form
      layout="vertical"
      initialValues={extension}
      onValuesChange={props => {
        const keys = Object.keys(props);

        for (const key of keys) {
          if (['id', 'label', 'version'].includes(key)) {
            setExtension(ext => {
              ext[key] = props[key];
              return ext;
            });
          }
        }
      }}
      onFinish={onSave}
    >
      <Form.Item label="Identifier" name="id">
        <Input readOnly disabled />
      </Form.Item>

      <Form.Item label="Label" name="label">
        <Input />
      </Form.Item>

      <Form.Item label="Version" name="version">
        <Input />
      </Form.Item>

      <Divider />

      <Form.Item label="Database" name="database">
        <Select
          placeholder="Select a database to pick schemas"
          size="middle"
          className="w-full mb-4"
          onChange={v => setSelectedDatabase(v.toString())}
        >
          {databases.map(db => (
            <Select.Option key={db} value={db}>
              {startCase(db)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Transfer
        dataSource={schemas}
        titles={['Available', 'Selected']}
        targetKeys={selectedSchemas}
        render={item => item.title}
        pagination
        onChange={selected => setSelectedSchemas(selected)}
      />

      <Divider />

      <Transfer
        dataSource={workflows}
        titles={['Available', 'Selected']}
        targetKeys={selectedWorkflows}
        render={item => item.title}
        pagination
        onChange={selected => setSelectedWorkflows(selected)}
      />

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Save
        </Button>
      </Form.Item>
    </Form>
  );
}
