import React from 'react';
import { Button, Card, Divider, Form, Input, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import { useContractMutation } from '../../utils/contract';

import type { ContractQuery } from '../../utils/contract';
import type { Company } from '../../types';

export function AdminCompaniesComponent({
  companies,
}: {
  companies: ContractQuery<Company[]>;
}) {
  const [addCompanyForm] = Form.useForm<{ name: string }>();

  const { mutation: addCompanyMutation } = useContractMutation('addCompany');
  const { mutation: removeCompanyMutation } =
    useContractMutation('removeCompany');

  const handleRemoveCompany = (companyId: string) => {
    if (companyId) {
      Modal.confirm({
        title: 'Are you sure to remove this company?',
        content:
          'This action cannot be undone, all rooms, employees and booked slots linked to this company will be removed.',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          await removeCompanyMutation(companyId);
          await companies.refetch();
        },
      });
    }
  };

  const handleAddCompany = () => {
    addCompanyForm.validateFields().then(({ name }) => {
      Modal.confirm({
        title: 'Are you sure to add this company?',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          await addCompanyMutation(name);
          await companies.refetch();
          addCompanyForm.resetFields();
        },
      });
    });
  };

  return (
    <div>
      <h1>Companies</h1>
      <div className="flex flex-wrap">
        {companies.data?.map(({ id, name }) => (
          <div key={id} className="w-1/3 p-2">
            <Card
              className="w-full"
              actions={[
                <DeleteOutlined
                  key="remove"
                  onClick={() => handleRemoveCompany(id)}
                />,
              ]}
            >
              <Card.Meta title={name} description={<p>ID {id}</p>} />
            </Card>
          </div>
        ))}
      </div>
      <Divider />
      <Form
        form={addCompanyForm}
        name="add-company"
        layout="inline"
        className="flex"
        onFinish={handleAddCompany}
      >
        <Form.Item
          name="name"
          style={{ flex: 1 }}
          rules={[
            { required: true, message: 'Please input the company name!' },
          ]}
        >
          <Input className="w-full" placeholder="Company name" />
        </Form.Item>
        <Button htmlType="submit" className="ml-auto">
          Add company
        </Button>
      </Form>
    </div>
  );
}
