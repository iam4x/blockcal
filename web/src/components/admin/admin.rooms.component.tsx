import React from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Form, Card, Divider, Modal, Select, Input, Button } from 'antd';

import { useContractMutation } from '../../utils/contract';

import type { ContractQuery } from '../../utils/contract';
import type { Company, Room } from '../../types';

export function AdminRoomsComponent({
  companies,
  rooms,
}: {
  companies: ContractQuery<Company[]>;
  rooms: ContractQuery<Room[]>;
}) {
  const [form] = Form.useForm();

  const { mutation: removeRoomMutation } = useContractMutation('removeRoom');
  const { mutation: addRoomsMutation } = useContractMutation('addRooms');

  const roomsWithCompany = rooms.data?.map((room) => {
    const company = companies.data?.find((c) => c.id === room.companyId);
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
      <h1>Rooms ({roomsWithCompany?.length})</h1>
      <div className="flex flex-wrap">
        {roomsWithCompany?.map((room) => (
          <div
            className="w-1/4 p-2"
            key={`${room.room.id}_${room.room.companyId}`}
          >
            <Card
              className="w-full"
              actions={[
                <DeleteOutlined
                  key="remove"
                  onClick={() => handleRemoveRoom(room.room.companyId)}
                />,
              ]}
            >
              <Card.Meta
                title={
                  <>
                    {room.company?.name?.[0].toUpperCase() || '?'}
                    {room.room.id}
                  </>
                }
                description={
                  <div className="font-mono text-xs">
                    <p>Room: {room.room.id}</p>
                    <p>Company: {room.room.companyId}</p>
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
                <Select.Option key={company.id} value={company.id}>
                  {company.name}
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
