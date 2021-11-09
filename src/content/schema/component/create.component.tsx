import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Divider, message, Steps } from 'antd';
import { useState } from 'react';
import { useHistory } from 'react-router';
import { useResetRecoilState } from 'recoil';
import { FieldTag, FieldType, ISchema } from '..';
import PageHeader from '../../../management/backoffice/layout/PageHeader';
import PageWithHeader from '../../../management/backoffice/layout/PageWithHeader';
import { useHttpClientOld } from '../../../management/backoffice/library/http-client';
import { schemasAtom } from '../schema.atoms';
import CapabilitiesComponent from './create/capabilities.component';
import CustomFieldsComponent from './create/custom-fields.component';
import FinishComponent from './create/finish.component';
import IndexesComponent from './create/indexes.component';
import NamingComponent from './create/naming.component';
import RelationsComponent from './create/relations.component';
import SelectDatabaseComponent from './create/select-database.component';

export default function CreateSchemaComponent() {
  const history = useHistory();
  const resetSchemas = useResetRecoilState(schemasAtom);
  const httpClient = useHttpClientOld();
  const [step, setStep] = useState(0);
  const [schema, setSchema] = useState<ISchema>({
    icon: 'table',
    permission: 'rw',
    version: 2,
    database: null,
    label: null,
    reference: null,
    tableName: null,
    fields: [
      {
        label: 'Identifier',
        reference: 'id',
        columnName: 'id',
        type: FieldType.UUID,
        typeParams: {
          values: [],
        },
        tags: [FieldTag.PRIMARY],
      },
      {
        label: 'Tags',
        reference: 'tags',
        columnName: 'tags',
        type: FieldType.JSON,
        tags: [FieldTag.TAGS],
        typeParams: {
          values: [],
        },
        defaultValue: [],
      },
    ],
    indices: [],
    uniques: [],
    relations: [],
    tags: ['active'],
  });

  const doCreateSchema = async () => {
    const response = await httpClient.post<ISchema>(
      '/api/$system/content/schema',
      schema,
    );

    resetSchemas();

    return response.data;
  };

  const proceed = () => {
    setStep(s => {
      if (s < 6) {
        return s + 1;
      } else {
        doCreateSchema()
          .then(record => {
            message.success('Schema is created <3, redirecting...');

            setTimeout(() => {
              history.push(
                `/backoffice/content/schema/${record.database}/${record.reference}`,
              );
            }, 1000);
          })
          .catch(e => message.error(e.message));

        return s;
      }
    });
  };

  const previous = () => setStep(s => Math.max(0, s - 1));

  const steps = [
    <SelectDatabaseComponent schema={schema} setSchema={setSchema} />,
    <NamingComponent schema={schema} setSchema={setSchema} />,
    <CapabilitiesComponent schema={schema} setSchema={setSchema} />,
    <CustomFieldsComponent schema={schema} setSchema={setSchema} />,
    <RelationsComponent schema={schema} setSchema={setSchema} />,
    <IndexesComponent schema={schema} setSchema={setSchema} />,
    <FinishComponent schema={schema} setSchema={setSchema} />,
  ];

  return (
    <PageWithHeader header={<PageHeader title="Schema Creation Wizard" />}>
      <div className="content-box px-12 py-12 w-full mx-auto">
        <div className="flex flex-row">
          <div className="flex-initial" style={{ minWidth: 260 }}>
            <Steps direction="vertical" current={step}>
              <Steps.Step
                title="Select Database"
                description="Choose target database."
              />
              <Steps.Step title="Naming" description="Name the schema." />
              <Steps.Step
                title="Capabilities"
                description="Add predefined capabilities."
              />
              <Steps.Step
                title="Custom Fields"
                description="Manage custom fields."
              />
              <Steps.Step
                title="Relations"
                description="Setup data relation network."
              />
              <Steps.Step title="Indexes" description="Configure indexes." />
              <Steps.Step title="Finish" description="Finalize the schema." />
            </Steps>
          </div>
          <div className="flex-auto pl-8">{steps[step]}</div>
        </div>
        <Divider />
        <div className="flex flex-row">
          <div className="text-left flex-auto">
            <Button icon={<LeftOutlined />} disabled={!step} onClick={previous}>
              Previous
            </Button>
          </div>
          <div className="text-right flex-auto">
            <Button type="primary" onClick={proceed}>
              {step < 5 ? 'Proceed' : 'Finish'} <RightOutlined />
            </Button>
          </div>
        </div>
      </div>
    </PageWithHeader>
  );
}
