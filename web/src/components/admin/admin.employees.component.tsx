import React from 'react';
import { Modal, Select, Form, Button, Input, Table } from 'antd';

import { useContractMutation } from '../../utils/contract';

import type { ContractQuery } from '../../utils/contract';
import type { Company, Employee } from '../../types';

export function AdminEmployeesComponent({
  companies,
  employees,
}: {
  companies: ContractQuery<Company[]>;
  employees: ContractQuery<Employee[]>;
}) {
  const [form] =
    Form.useForm<{ address: string; companyId: string; name: string }>();

  const { mutation: addEmployeeMutation } = useContractMutation('addEmployee');

  const handleAddEmployee = () => {
    form.validateFields().then(({ address, companyId, name }) => {
      Modal.confirm({
        title: 'Are you sure to add this employee?',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          await addEmployeeMutation(address, companyId, name);
          await companies.refetch();
          form.resetFields();
        },
      });
    });
  };

  return (
    <div>
      <Table
        rowKey="addr"
        dataSource={employees.data || []}
        size="small"
        pagination={false}
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
          },
          {
            title: 'Company',
            dataIndex: 'companyId',
            render: (companyId: string) => {
              const company = companies.data?.find((_) => _.id === companyId);
              return company?.name;
            },
          },
          {
            title: 'Address',
            dataIndex: 'addr',
            align: 'right',
            render: (addr: string) => (
              <a href={`https://ropsten.etherscan.io/address/${addr}`}>
                {addr}
              </a>
            ),
          },
        ]}
      />
      <div className="h-8" />
      <Form
        form={form}
        name="add-employee"
        layout="inline"
        className="flex"
        onFinish={handleAddEmployee}
      >
        <Form.Item
          name="address"
          style={{ flex: 1 }}
          rules={[
            { required: true, message: 'Please input the employee address!' },
          ]}
        >
          <Input className="w-full" placeholder="Employee address" />
        </Form.Item>
        <Form.Item
          name="name"
          style={{ flex: 1 }}
          rules={[
            { required: true, message: 'Please input the employee name!' },
          ]}
        >
          <Input className="w-full" placeholder="Employee name" />
        </Form.Item>
        <Form.Item
          name="companyId"
          rules={[{ required: true, message: 'Company is required!' }]}
          style={{ marginRight: 0, width: 150 }}
        >
          <Select>
            {companies.data?.map((company) => (
              <Select.Option key={company.id} value={company.id}>
                {company.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Button htmlType="submit" className="w-full mt-2">
          Add employee
        </Button>
      </Form>
    </div>
  );
}
