import React from 'react';
import { Button, Card, Divider, Form, Input, Modal, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import { useContractMutation, useContractQuery } from '../../utils/contract';

interface Company {
  id: string;
  name: string;
}

interface Employee {
  address: string;
  name: string;
  companyId: string;
}

export function AdminCompaniesComponent() {
  const [addCompanyForm] = Form.useForm<{ name: string }>();
  const [addEmployeeForm] =
    Form.useForm<{ address: string; companyId: string; name: string }>();

  const companies = useContractQuery<Company[]>('getCompanies');
  const employees = useContractQuery<Employee[]>('getEmployees');

  const { mutation: addEmployeeMutation } = useContractMutation('addEmployee');
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

  const handleAddEmployee = () => {
    addEmployeeForm.validateFields().then(({ address, companyId, name }) => {
      Modal.confirm({
        title: 'Are you sure to add this employee?',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          await addEmployeeMutation(address, companyId, name);
          await companies.refetch();
          addEmployeeForm.resetFields();
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
      <Divider />
      <pre>{JSON.stringify(employees.data, null, 4)}</pre>
      <Form
        form={addEmployeeForm}
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
          rules={[{ required: true }]}
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
