import React from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Form, Card, Divider, Modal, Select, Input, Button } from 'antd';

import { useContractMutation, useContractQuery } from '../../utils/contract';

export function AdminRoomsComponent() {
  const [form] = Form.useForm();

  const companies = useContractQuery<Array<[string, string]>>('getCompanies');
  const rooms = useContractQuery<Array<[string, string]>>('getRooms');

  const { mutation: removeRoomMutation } = useContractMutation('removeRoom');
  const { mutation: addRoomsMutation } = useContractMutation('addRooms');

  const roomsWithCompany = rooms.data?.map((room) => {
    const company = companies.data?.find((c) => c[0] === room[1]);
    return { room, company };
  });

  const handleRemoveRoom = (roomId: string) => {
    if (roomId) {
      Modal.confirm({
        title: 'Are you sure to delete this room?',
        content:
          'This action cannot be undone, all slots booked will be removed.',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          await removeRoomMutation(roomId);
          await rooms.refetch();
        },
      });
    }
  };

  const handleAddRooms = () => {
    form.validateFields().then((values) => {
      Modal.confirm({
        title: 'Are you sure rooms?',
        content: `You are about to add ${values.count} rooms.`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          await addRoomsMutation(values.companyId, values.count);
          await rooms.refetch();
        },
      });
    });
  };

  return (
    <div>
      <h1>Rooms</h1>
      <div className="flex flex-wrap">
        {roomsWithCompany?.map((room) => (
          <div className="w-1/4 p-2" key={room.room[0] + room.room[1]}>
            <Card
              className="w-full"
              actions={[
                <DeleteOutlined
                  key="remove"
                  onClick={() => handleRemoveRoom(room.room[0])}
                />,
              ]}
            >
              <Card.Meta
                title={
                  <>
                    {room.company?.[1]?.[0].toUpperCase() || '?'}
                    {room.room[0]}
                  </>
                }
                description={
                  <div className="font-mono text-xs">
                    <p>Room: {room.room[0]}</p>
                    <p>Company: {room.room[1]}</p>
                  </div>
                }
              />
            </Card>
          </div>
        ))}
      </div>
      <Divider />
      <div>
        <Form
          form={form}
          name="add-rooms"
          layout="inline"
          onFinish={handleAddRooms}
        >
          <Form.Item
            name="companyId"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Select>
              {companies.data?.map((company) => (
                <Select.Option key={company[0]} value={company[0]}>
                  {company[1]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="count" rules={[{ required: true }]} initialValue={1}>
            <Input type="number" min={1} max={10} />
          </Form.Item>
          <Button htmlType="submit" className="ml-auto">
            Add rooms
          </Button>
        </Form>
      </div>
    </div>
  );
}
