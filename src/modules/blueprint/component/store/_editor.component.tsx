import { Button, Divider, Form, Input, Select, Transfer } from 'antd';
import { startCase } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useHttpClient } from '../../../admin/library/use-http-client';
import { toRestSysRoute } from '../../../content/util/schema-url';
import { IFlow } from '../../../flow/interface';
import { IFindResponse } from '../../../rest/interface/find-reponse.interface';
import { ISchema } from '../../../schema';
import { SchemaRef } from '../../../schema/interface/system-ref.enum';
import { IBlueprint } from '../../interface/blueprint.interface';

type TransferItem = {
  key: string;
  title: string;
  description: string;
};

type Props = {
  blueprint: IBlueprint;
  setExtension: Dispatch<SetStateAction<IBlueprint>>;
  onSave: () => void;
};

export default function ExtensionEdiorComponent({
  blueprint: extension,
  setExtension,
  onSave,
}: Props) {
  if (!extension) {
    return <h1>Waiting....</h1>;
  }

  const [schemas, setSchemas] = useState<TransferItem[]>([]);
  const [flows, setFlows] = useState<TransferItem[]>([]);
  const [databases, setDatabases] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>(
    extension.database,
  );

  const [selectedSchemas, setSelectedSchemas] = useState<string[]>(
    extension.schemas.map(s => s.reference),
  );
  const [selectedFlows, setSelectedFlows] = useState<string[]>(
    extension.flows.map(wf => wf.id),
  );

  const [{ data: schemasReply, loading: schemasLoading }] = useHttpClient<
    IFindResponse<ISchema>
  >(toRestSysRoute(SchemaRef.SCHEMA));

  const [{ data: flowReply, loading: flowLoading }] = useHttpClient<
    IFindResponse<IFlow>
  >(toRestSysRoute(SchemaRef.FLOW));

  useEffect(() => {
    setExtension(ext => {
      ext.database = selectedDatabase;

      if (schemasReply) {
        ext.schemas = schemasReply.data.filter(s =>
          selectedSchemas.includes(s.reference),
        );
      }

      if (flowReply) {
        ext.flows = flowReply.data.filter(wf => selectedFlows.includes(wf.id));
      }

      return ext;
    });
  }, [selectedSchemas, selectedFlows, selectedDatabase]);

  useEffect(() => {
    if (schemasReply) {
      const dbs = Array.from(
        new Set(schemasReply.data.map(s => s.database)).values(),
      );

      setDatabases(dbs);

      if (dbs.length === 1) {
        setSelectedDatabase(dbs[0]);
      }
    }
  }, [schemasReply]);

  useEffect(() => {
    if (flowReply) {
      setFlows(
        flowReply.data.map(wf => ({
          title: wf.name,
          key: wf.id,
          description: wf.name,
        })),
      );
    }
  }, [flowReply]);

  useEffect(() => {
    if (schemasReply) {
      setSchemas(
        schemasReply.data
          .filter(c => c.database === selectedDatabase)
          .filter(c => !c.tags.includes('system'))
          .map(s => ({
            key: s.reference,
            title: s.title,
            description: '',
          })),
      );
    }
  }, [selectedDatabase, schemasReply]);

  if (schemasLoading || flowLoading || !schemas) {
    return <h1>Loading...</h1>;
  }

  return (
    <Form
      layout="vertical"
      initialValues={extension}
      onValuesChange={props => {
        const keys = Object.keys(props);

        for (const key of keys) {
          if (['id', 'title', 'version'].includes(key)) {
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

      <Form.Item label="Title" name="title">
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
        dataSource={flows}
        titles={['Available', 'Selected']}
        targetKeys={selectedFlows}
        render={item => item.title}
        pagination
        onChange={selected => setSelectedFlows(selected)}
      />

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Save
        </Button>
      </Form.Item>
    </Form>
  );
}
