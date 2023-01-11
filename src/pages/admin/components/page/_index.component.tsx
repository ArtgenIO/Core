import {
  DeleteOutlined,
  EditOutlined,
  PlusSquareOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, List, message, Popconfirm, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IFindResponse } from '../../../../api/types/find-reponse.interface';
import { SchemaRef } from '../../../../api/types/system-ref.enum';
import { IPage } from '../../../../models/page.interface';
import PageHeader from '../../layout/page-header.component';
import PageWithHeader from '../../layout/page-with-header.component';
import { useHttpClient } from '../../library/hook.http-client';
import { toRestSysRoute } from '../../library/schema-url';
import { useHttpClientSimple } from '../../library/simple.http-client';
import CreatePageComponent from './create.component';

export default function PageIndexComponent() {
  const navigate = useNavigate();
  const client = useHttpClientSimple();

  const [pages, setPages] = useState<IPage[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const [{ data: reply, loading, error }, refetch] = useHttpClient<
    IFindResponse<IPage>
  >(
    toRestSysRoute(SchemaRef.PAGE, q =>
      q.select('id,title,path,tags').orderBy('id').top(100),
    ),
  );

  useEffect(() => {
    if (reply) {
      setPages(reply.data);
    }
  }, [reply]);

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Page Builder"
          actions={
            <Button
              type="primary"
              icon={<PlusSquareOutlined />}
              onClick={() => setShowCreate(true)}
            >
              Create New
            </Button>
          }
        />
      }
    >
      <List
        grid={{ gutter: 4, column: 4 }}
        size="large"
        className="bg-transparent"
        dataSource={pages}
        renderItem={(page, key) => (
          <List.Item key={`p-${key}`}>
            <Card
              cover={
                <img
                  src={`https://via.placeholder.com/400x250/b5b9c2/0a0d10/?text=${page.title}`}
                />
              }
              actions={[
                <Button
                  key="edit"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/admin/page/${page.id}`)}
                  className="rounded-md mr-1 hover:text-blue-500 hover:border-blue-500"
                ></Button>,
                <Popconfirm
                  key="delete"
                  title="Are You sure to delete this page?"
                  okText="Yes, delete it"
                  cancelText="No"
                  placement="left"
                  icon={<QuestionCircleOutlined />}
                  onConfirm={() =>
                    client
                      .delete(`${toRestSysRoute(SchemaRef.PAGE)}/${page.id}`)
                      .then(() => message.warn('Page deleted'))
                      .then(() => refetch())
                  }
                >
                  <Tooltip title="Delete" placement="leftBottom">
                    <Button
                      icon={<DeleteOutlined />}
                      className="rounded-md hover:text-red-500 hover:border-red-500"
                    ></Button>
                  </Tooltip>
                </Popconfirm>,
              ]}
            >
              <Card.Meta title={page.title}></Card.Meta>
            </Card>
          </List.Item>
        )}
      ></List>
      {showCreate && (
        <CreatePageComponent onClose={() => setShowCreate(false)} />
      )}
    </PageWithHeader>
  );
}
