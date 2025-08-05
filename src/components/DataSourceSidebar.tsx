'use client';

import React, { useState } from 'react';
import {
  Layout,
  Card,
  Button,
  Input,
  Select,
  Space,
  Typography,
  Divider,
  Popconfirm,
  ColorPicker,
  Form,
  InputNumber,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useDashboardStore } from '@/store/dashboardStore';
import { DataSource, ColorRule } from '@/types';

const { Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const DataSourceSidebar: React.FC = () => {
  const {
    dataSources,
    selectedDataSource,
    addDataSource,
    updateDataSource,
    deleteDataSource,
    setSelectedDataSource,
    addColorRule,
    updateColorRule,
    deleteColorRule,
  } = useDashboardStore();

  const [isAddingDataSource, setIsAddingDataSource] = useState(false);
  const [editingDataSource, setEditingDataSource] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<{ dataSourceId: string; ruleId: string } | null>(null);

  const [dataSourceForm] = Form.useForm();
  const [ruleForm] = Form.useForm();

  const handleAddDataSource = () => {
    setIsAddingDataSource(true);
    dataSourceForm.resetFields();
  };

  const handleDataSourceSubmit = (values: any) => {
    const newDataSource: DataSource = {
      id: Date.now().toString(),
      name: values.name,
      field: values.field,
      colorRules: [],
    };
    addDataSource(newDataSource);
    setIsAddingDataSource(false);
    dataSourceForm.resetFields();
  };

  const handleEditDataSource = (dataSource: DataSource) => {
    setEditingDataSource(dataSource.id);
    dataSourceForm.setFieldsValue({
      name: dataSource.name,
      field: dataSource.field,
    });
  };

  const handleDataSourceUpdate = (values: any) => {
    if (editingDataSource) {
      updateDataSource(editingDataSource, {
        name: values.name,
        field: values.field,
      });
      setEditingDataSource(null);
      dataSourceForm.resetFields();
    }
  };

  const handleDeleteDataSource = (id: string) => {
    deleteDataSource(id);
  };

  const handleAddColorRule = (dataSourceId: string) => {
    setEditingRule({ dataSourceId, ruleId: 'new' });
    ruleForm.resetFields();
  };

  const handleColorRuleSubmit = (values: any) => {
    if (editingRule) {
      const newRule: Omit<ColorRule, 'id'> = {
        operator: values.operator,
        value: values.value,
        color: values.color.toHexString(),
        label: values.label,
      };

      if (editingRule.ruleId === 'new') {
        addColorRule(editingRule.dataSourceId, newRule);
      } else {
        updateColorRule(editingRule.dataSourceId, editingRule.ruleId, newRule);
      }

      setEditingRule(null);
      ruleForm.resetFields();
    }
  };

  const handleEditColorRule = (dataSourceId: string, rule: ColorRule) => {
    setEditingRule({ dataSourceId, ruleId: rule.id });
    ruleForm.setFieldsValue({
      operator: rule.operator,
      value: rule.value,
      color: rule.color,
      label: rule.label,
    });
  };

  const handleDeleteColorRule = (dataSourceId: string, ruleId: string) => {
    deleteColorRule(dataSourceId, ruleId);
  };

  const renderColorRuleForm = () => {
    if (!editingRule) return null;

    const dataSource = dataSources.find(ds => ds.id === editingRule.dataSourceId);
    if (!dataSource) return null;

    return (
      <Card size="small" style={{ marginBottom: 16 }}>
        <Form form={ruleForm} onFinish={handleColorRuleSubmit} layout="vertical">
          <Form.Item
            name="operator"
            label="Operator"
            rules={[{ required: true, message: 'Please select an operator' }]}
          >
            <Select>
              <Option value="=">=</Option>
              <Option value="<">&lt;</Option>
              <Option value=">">&gt;</Option>
              <Option value="<=">&lt;=</Option>
              <Option value=">=">&gt;=</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="value"
            label="Value"
            rules={[{ required: true, message: 'Please enter a value' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="color"
            label="Color"
            rules={[{ required: true, message: 'Please select a color' }]}
          >
            <ColorPicker />
          </Form.Item>

          <Form.Item
            name="label"
            label="Label"
            rules={[{ required: true, message: 'Please enter a label' }]}
          >
            <Input placeholder="e.g., < 10°C" />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" size="small">
              {editingRule.ruleId === 'new' ? 'Add' : 'Update'}
            </Button>
            <Button size="small" onClick={() => setEditingRule(null)}>
              Cancel
            </Button>
          </Space>
        </Form>
      </Card>
    );
  };

  return (
    <Sider width={350} style={{ background: '#fff', padding: '16px' }}>
      <div style={{ height: '100%', overflowY: 'auto' }}>
        <Title level={4}>Data Sources</Title>

        {dataSources.map((dataSource) => (
          <Card
            key={dataSource.id}
            size="small"
            style={{ marginBottom: 16 }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>{dataSource.name}</Text>
                <Space>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEditDataSource(dataSource)}
                  />
                  <Popconfirm
                    title="Delete this data source?"
                    onConfirm={() => handleDeleteDataSource(dataSource.id)}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </Space>
              </div>
            }
          >
            {editingDataSource === dataSource.id ? (
              <Form form={dataSourceForm} onFinish={handleDataSourceUpdate} layout="vertical">
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Please enter a name' }]}
                >
                  <Input placeholder="Data source name" />
                </Form.Item>
                <Form.Item
                  name="field"
                  rules={[{ required: true, message: 'Please enter a field' }]}
                >
                  <Input placeholder="Field name (e.g., temperature_2m)" />
                </Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" size="small">
                    Update
                  </Button>
                  <Button size="small" onClick={() => setEditingDataSource(null)}>
                    Cancel
                  </Button>
                </Space>
              </Form>
            ) : (
              <div>
                <Text type="secondary">Field: {dataSource.field}</Text>
                <Divider style={{ margin: '8px 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong>Color Rules</Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddColorRule(dataSource.id)}
                  >
                    Add Rule
                  </Button>
                </div>

                {dataSource.colorRules.map((rule) => (
                  <div
                    key={rule.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 8px',
                      marginBottom: 4,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          backgroundColor: rule.color,
                          borderRadius: 2,
                        }}
                      />
                      <Text>{rule.label}</Text>
                    </div>
                    <Space>
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditColorRule(dataSource.id, rule)}
                      />
                      <Popconfirm
                        title="Delete this rule?"
                        onConfirm={() => handleDeleteColorRule(dataSource.id, rule.id)}
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    </Space>
                  </div>
                ))}

                {editingRule?.dataSourceId === dataSource.id && renderColorRuleForm()}
              </div>
            )}
          </Card>
        ))}

        {isAddingDataSource && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Form form={dataSourceForm} onFinish={handleDataSourceSubmit} layout="vertical">
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter a name' }]}
              >
                <Input placeholder="Data source name" />
              </Form.Item>
              <Form.Item
                name="field"
                label="Field"
                rules={[{ required: true, message: 'Please enter a field' }]}
              >
                <Input placeholder="Field name (e.g., temperature_2m)" />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" size="small">
                  Add
                </Button>
                <Button size="small" onClick={() => setIsAddingDataSource(false)}>
                  Cancel
                </Button>
              </Space>
            </Form>
          </Card>
        )}

        {!isAddingDataSource && (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddDataSource}
            style={{ width: '100%' }}
          >
            Add Data Source
          </Button>
        )}
      </div>
    </Sider>
  );
};

export default DataSourceSidebar; 