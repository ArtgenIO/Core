import { MediumOutlined } from '@ant-design/icons';
import { Avatar, Badge, List, Popover, Skeleton } from 'antd';
import useAxios from 'axios-hooks';
import { useEffect, useState } from 'react';

export default function NewsComponent() {
  const [newsCount, setNewsCount] = useState(0);

  const [{ data, loading, error }] = useAxios(
    'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@artgen',
  );

  useEffect(() => {
    if (data) {
      setNewsCount(data.items.length);
    }
  }, [data]);

  // Hide on error
  if (error) {
    return <></>;
  }

  return (
    <div className="w-full absolute" style={{ bottom: 51 }}>
      <Popover
        overlayStyle={{
          minWidth: 360,
          width: 420,
        }}
        title={
          <a
            href={data ? data.feed.link : '#'}
            target={data ? '_blank' : '_top'}
            className="font-header text-midnight-100 text-lg"
          >
            Artgen News / Updates
          </a>
        }
        content={
          <Skeleton loading={loading}>
            {data && (
              <List
                itemLayout="horizontal"
                size="small"
                className="bg-midnight-800"
                dataSource={data.items}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={item.thumbnail.replace(
                            /(\/max\/\d+)/,
                            '/max/64',
                          )}
                        />
                      }
                      title={<a href={item.link}>{item.title}</a>}
                      description={`${item.pubDate} by ${item.author}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </Skeleton>
        }
        placement="rightBottom"
      >
        <div className="text-center cursor-pointer hover:bg-midnight-600 transition-colors duration-600 pt-4 pb-2">
          <Badge count={newsCount} color="lime" size="small">
            <MediumOutlined className="text-xl hover:text-yellow-400 transition-colors duration-600" />
          </Badge>
        </div>
      </Popover>
    </div>
  );
}
