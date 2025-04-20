import React, { useState, useRef } from 'react';
import {
  Upload,
  Button,
  message,
  Table,
  Tabs,
  Typography,
  Modal,
  Space,
  Tag,
  Tooltip,
  Input,
  Form,
  DatePicker,
  InputNumber,
  Select,
  Popconfirm,
  Divider
} from 'antd';
import {
  UploadOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SaveOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  UndoOutlined
} from '@ant-design/icons';
import ApiClient from '../../services/ApiClient';
import { format, parse, isValid } from 'date-fns';
import moment from 'moment';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  let inputNode;

  switch (inputType) {
    case 'number':
      inputNode = <InputNumber />;
      break;
    case 'date':
      inputNode = <DatePicker format="DD/MM/YYYY" />;
      break;
    case 'select':
      inputNode = (
        <Select>
          <Select.Option value="NEW SLOT">NEW SLOT</Select.Option>
          <Select.Option value="OLD SLOT">OLD SLOT</Select.Option>
        </Select>
      );
      break;
    default:
      inputNode = <Input />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const ImportBooking = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [importResults, setImportResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [editingKey, setEditingKey] = useState('');
  const [form] = Form.useForm();
  const [currentTab, setCurrentTab] = useState('all');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [newRecordId, setNewRecordId] = useState(-1); // For new records
  const [undoing, setUndoing] = useState(false);

  const isEditing = (record) => record.rowNumber.toString() === editingKey;

  const handleUndo = async (bookingIds) => {
    setUndoing(true);
    try {
      const response = await ApiClient.post('/Booking/Undo', bookingIds);

      // Update the status of undone items
      const updatedResults = importResults.map(item => {
        if (bookingIds.includes(item.id)) {
          return {
            ...item,
            isSuccess: false,
            errorMessage: 'Booking was undone',
            status: 'UNDO'
          };
        }
        return item;
      });

      setImportResults(updatedResults);
      updateCounts(updatedResults);

      message.success(`Successfully undid ${bookingIds.length} booking(s)`);
    } catch (error) {
      console.error('Error undoing bookings:', error);
      message.error(`Failed to undo: ${error.response?.data || error.message}`);
    } finally {
      setUndoing(false);
    }
  };

  const handleUndoSingle = (record) => {
    if (!record.id) {
      message.error("Cannot undo: No booking ID found");
      return;
    }
    handleUndo([record.id]);
  };

  const handleUndoAll = () => {
    const successfulRecords = importResults.filter(r => r.isSuccess);

    if (successfulRecords.length === 0) {
      message.info('There are no successful bookings to undo');
      return;
    }

    const bookingIds = successfulRecords
      .map(r => r.id)
      .filter(id => id); // Filter out any undefined IDs

    if (bookingIds.length === 0) {
      message.error('No valid booking IDs found to undo');
      return;
    }

    handleUndo(bookingIds);
  };

  const edit = (record) => {
    // Convert date string to moment object for DatePicker
    let dateValue = null;
    try {
      if (record.date && typeof record.date === 'string' && record.date !== '0001-01-01T00:00:00') {
        // Extract only the date part if it contains T
        const datePart = record.date.includes('T') ? record.date.split('T')[0] : record.date;
        dateValue = moment.utc(datePart, 'YYYY-MM-DD'); // Chuyển sang UTC
        if (!dateValue.isValid()) {
          dateValue = null;
        }
      }
    } catch (err) {
      console.error("Error parsing date:", err);
      dateValue = null;
    }

    form.setFieldsValue({
      ...record,
      date: dateValue,
    });
    setEditingKey(record.rowNumber.toString());
  };
  const cleanInputData = (data) => {
    const cleanedData = {};

    // Lặp qua tất cả thuộc tính của đối tượng
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string') {
        // Loại bỏ tab, xuống dòng và cắt bỏ khoảng trắng thừa
        cleanedData[key] = data[key].replace(/[\t\r\n]+/g, '').trim();
      } else {
        cleanedData[key] = data[key];
      }
    });

    return cleanedData;
  };

  const cancel = () => {
    // If canceling a new record edit, also remove the record
    if (parseInt(editingKey) < 0) {
      setImportResults(prevResults => prevResults.filter(r => r.rowNumber.toString() !== editingKey));
    }
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...importResults];
      const index = newData.findIndex(item => key === item.rowNumber.toString());

      if (index > -1) {
        // Format date from moment object
        console.log('Before format:', row.date.toString()); // Giá trị trước khi format
        row.date = row.date.format('YYYY-MM-DD');
        console.log('After format:', row.date); // Giá trị sau khi format
        // Làm sạch dữ liệu input
        const cleanedRow = cleanInputData(row);

        const item = newData[index];
        const updatedItem = { ...item, ...cleanedRow };

        // For newly added records, mark them as not successful yet
        if (parseInt(key) < 0) {
          updatedItem.isSuccess = false;
          updatedItem.errorMessage = "New record not saved to server";
        }

        newData.splice(index, 1, updatedItem);
        setImportResults(newData);
        setEditingKey('');

        // Update success/error counts
        updateCounts(newData);
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };


  const updateCounts = (data) => {
    const successItems = data.filter(item => item.isSuccess).length;
    const errorItems = data.length - successItems;
    setSuccessCount(successItems);
    setErrorCount(errorItems);
  };

  const addNewRecord = () => {
    // Don't allow adding if already editing
    if (editingKey !== '') {
      message.warning('Please save or cancel the current edit first');
      return;
    }

    // Create a new empty record with Time as N/A
    const newRecord = {
      rowNumber: newRecordId,
      groupName: '',
      subjectCode: '',
      date: moment().format('YYYY-MM-DD'), // Use noon UTC
      startTime: '00:00:00', // Set to 00:00:00 to display N/A
      endTime: '00:00:00', // Set to 00:00:00 to display N/A
      roomNo: '',
      lecturer: '',
      slotTypeCode: '',
      statusSlot: 'OFF',
      slotType: 'NEW SLOT',
      slot: 1,
      isSuccess: false,
      errorMessage: 'New record not saved to server',
    };

    // Add to the list and start editing
    const newData = [...importResults, newRecord];
    setImportResults(newData);
    setEditingKey(newRecordId.toString());

    // Decrement for next new record ID
    setNewRecordId(prevId => prevId - 1);

    // Update counts
    updateCounts(newData);
  };

  const deleteRecord = (key) => {
    const newData = importResults.filter(item => item.rowNumber.toString() !== key);
    setImportResults(newData);

    // If currently editing this record, cancel the edit
    if (editingKey === key) {
      setEditingKey('');
    }

    // Update counts
    updateCounts(newData);

    message.success('Record deleted');
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('excelFile', fileList[0]);

    setUploading(true);

    try {
      const response = await ApiClient.post('/Booking/ImportExcel', formData);

      // Process results - ensure dates are in proper format
      const results = response.data.map(item => ({
        ...item,
        date: item.date ? item.date.split('T')[0] : null // Keep only YYYY-MM-DD part
      }));

      setImportResults(results);

      // Count success and errors
      const successItems = results.filter(item => item.isSuccess).length;
      const errorItems = results.length - successItems;

      setSuccessCount(successItems);
      setErrorCount(errorItems);
      setShowResults(true);

      message.success(`Import completed: ${successItems} successful, ${errorItems} failed`);
    } catch (error) {
      console.error('Error importing Excel file:', error);
      message.error(`Failed to import: ${error.response?.data || error.message}`);
    } finally {
      setUploading(false);
      setFileList([]);
    }
  };

  const handleSaveToServer = async () => {
    // Collect failed or edited records
    const failedRecords = importResults.filter(record => !record.isSuccess);

    if (failedRecords.length === 0) {
      message.info('There are no failed records to save');
      return;
    }

    setSaving(true);

    try {

      const cleanedRecords = failedRecords.map(record => {
        const newRecord = { ...record };

        // Làm sạch các trường dạng string
        Object.keys(newRecord).forEach(key => {
          if (typeof newRecord[key] === 'string') {
            newRecord[key] = newRecord[key].replace(/[\t\r\n]+/g, '').trim();
          }
        });

        return newRecord;
      });

      const response = await ApiClient.post('/Booking/ImportFromClient', cleanedRecords);

      // Update results
      const updatedResults = [...importResults];

      response.data.forEach(newRecord => {
        const index = updatedResults.findIndex(
          record => record.rowNumber === newRecord.rowNumber
        );

        if (index !== -1) {
          // Ensure date is in a consistent format
          if (newRecord.date) {
            newRecord.date = newRecord.date.split('T')[0]; // Keep only YYYY-MM-DD part
          }
          updatedResults[index] = newRecord;
        }
      });

      setImportResults(updatedResults);

      // Update counts
      updateCounts(updatedResults);

      message.success(`Save completed: ${successCount} successful, ${errorCount} failed`);
    } catch (error) {
      console.error('Error saving records:', error);
      message.error(`Failed to save: ${error.response?.data || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadExcel = async () => {
    // Get successful records
    const records = importResults;;

    if (records.length === 0) {
      message.info('There are no successful records to download');
      return;
    }

    setDownloading(true);

    try {
      // Call API with POST and handle the response as a file download
      const response = await ApiClient.post('/Booking/ExportExcel', records, {
        responseType: 'blob'
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'schedule_import_results.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success(`Downloaded ${records.length} records to Excel file`);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      message.error(`Failed to download: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const uploadProps = {
    onRemove: file => {
      setFileList([]);
    },
    beforeUpload: file => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';

      if (!isExcel) {
        message.error('You can only upload Excel files (.xlsx or .xls)');
        return Upload.LIST_IGNORE;
      }

      setFileList([file]);
      return false;
    },
    fileList,
  };

  const closeModal = () => {
    setShowResults(false);
    setImportResults([]);
    setEditingKey('');
    setCurrentTab('all');
    setNewRecordId(-1);
  };

  const columns = [
    {
      title: 'Row',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      width: 70,
      editable: false,
      render: (rowNumber) => (
        <span>{rowNumber < 0 ? 'New' : rowNumber}</span>
      ),
    },
    {
      title: 'Group',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 100,
      editable: true,
    },
    {
      title: 'Subject',
      dataIndex: 'subjectCode',
      key: 'subjectCode',
      width: 100,
      editable: true,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      editable: true,
      render: (date) => {
        if (!date) return <Text type="danger">Invalid Date</Text>;

        try {
          // Check if date has a time component and remove it
          if (typeof date === 'string') {
            // Handle ISO format with T separator
            if (date.includes('T')) {
              date = date.split('T')[0];
            }

            // For YYYY-MM-DD format
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
              return format(new Date(date), 'dd/MM/yyyy');
            }
          }

          // Try to parse as-is if not recognized format
          const dateObj = new Date(date);
          if (isNaN(dateObj.getTime())) {
            return <Text type="danger">Invalid Date</Text>;
          }
          return format(dateObj, 'dd/MM/yyyy');
        } catch (err) {
          console.error("Error rendering date:", date, err);
          return <Text type="danger">Invalid Date</Text>;
        }
      }
    },
    {
      title: 'Time',
      key: 'time',
      width: 150,
      editable: false,
      render: (_, record) => (
        <span>
          {record.startTime && record.startTime !== '00:00:00'
            ? `${record.startTime.substring(0, 5)} - ${record.endTime.substring(0, 5)}`
            : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Room',
      dataIndex: 'roomNo',
      key: 'roomNo',
      width: 120,
      editable: true,
    },
    {
      title: 'Lecturer',
      dataIndex: 'lecturer',
      key: 'lecturer',
      width: 120,
      editable: true,
    },
    {
      title: 'Slot',
      dataIndex: 'slot',
      key: 'slot',
      width: 80,
      editable: true,
    },
    {
      title: 'Slot Type',
      dataIndex: 'slotType',
      key: 'slotType',
      width: 120,
      editable: true,
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      editable: false,
      render: (_, record) => (
        <Tag color={record.isSuccess ? 'success' : (record.status === 'UNDO' ? 'warning' : 'error')}>
          {record.isSuccess
            ? <><CheckCircleOutlined /> Success</>
            : (record.status === 'UNDO'
              ? <><UndoOutlined /> Undone</>
              : <><CloseCircleOutlined /> Failed</>)}
        </Tag>
      ),
    },
    {
      title: 'Error',
      dataIndex: 'errorMessage',
      key: 'errorMessage',
      width: 200,
      editable: false,
      render: (error) => {
        if (!error) return '-';
        return (
          <Tooltip title={error}>
            <Text type="danger" ellipsis={true} style={{ maxWidth: 180 }}>
              {error}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 150, // Increased width to accommodate undo button
      render: (_, record) => {
        const editable = isEditing(record);

        if (editable) {
          return (
            <span>
              <Button
                onClick={() => save(record.rowNumber.toString())}
                type="link"
                style={{ marginRight: 8 }}
              >
                Save
              </Button>
              <Popconfirm
                title={parseInt(record.rowNumber) < 0 ? "Cancel and delete this new record?" : "Cancel editing?"}
                onConfirm={cancel}
              >
                <Button type="link">Cancel</Button>
              </Popconfirm>
            </span>
          );
        }

        return (
          <Space>
            {record.isSuccess && record.id && (
              <Popconfirm
                 title="Are you sure you want to undo this booking?"
                onConfirm={() => handleUndoSingle(record)}
              >
                <Button
                  type="link"
                  icon={<UndoOutlined />}
                >
                  Undo
                </Button>
              </Popconfirm>
            )}
            {!record.isSuccess && (
              <Button
                disabled={editingKey !== ''}
                onClick={() => edit(record)}
                type="link"
                icon={<EditOutlined />}
              >
                Edit
              </Button>
            )}
            <Popconfirm
              title="Are you sure you want to delete this record?"
              onConfirm={() => deleteRecord(record.rowNumber.toString())}
            >
              <Button
                disabled={editingKey !== ''}
                type="link"
                danger
                icon={<DeleteOutlined />}
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];


  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'date' ? 'date' :
          col.dataIndex === 'slot' ? 'number' :
            col.dataIndex === 'slotType' ? 'select' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 hover:shadow-md transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <Title level={2} className="!text-slate-800 !text-2xl !font-bold !m-0">
              Import Bookings from Excel
            </Title>
            <Text type="secondary" className="mt-1 block">
              Upload an Excel file (.xlsx or .xls) containing booking information
            </Text>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-grow">
              <Upload 
                {...uploadProps} 
                maxCount={1} 
                className="upload-list-inline"
              >
                <Button 
                  icon={<UploadOutlined />} 
                  size="large"
                  className="flex items-center border-slate-300 h-12 px-5"
                >
                  Select Excel File
                </Button>
              </Upload>
              <Text type="secondary" className="mt-2 block text-sm">
                {fileList.length > 0 
                  ? `Selected: ${fileList[0].name}`
                  : "Supported formats: .xlsx, .xls"
                }
              </Text>
            </div>

            <Button
              type="primary"
              onClick={handleUpload}
              disabled={fileList.length === 0}
              loading={uploading}
              size="large"
              className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 min-w-[140px]"
              icon={uploading ? null : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>}
            >
              {uploading ? 'Uploading...' : 'Start Upload'}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 text-sm">
          <div className="flex items-center text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
            <span>Make sure your Excel file follows the required format</span>
          </div>
          <div className="flex items-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            <span>You can review and edit records after import</span>
          </div>
        </div>
      </div>

      <Modal
        title={
          <div className="flex items-center">
            <FileExcelOutlined className="mr-2 text-green-600" />
            <span>Import Results</span>
          </div>
        }
        open={showResults}
        onCancel={closeModal}
        width={1400}
        footer={[
          <Button
            key="undoAll"
            type="default"
            icon={<UndoOutlined />}
            onClick={handleUndoAll}
            loading={undoing}
            disabled={successCount === 0 || editingKey !== ''}
          >
            Undo All Successful
          </Button>,
          <Button
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveToServer}
            loading={saving}
            disabled={errorCount === 0}
          >
            Save Failed Records
          </Button>,
          <Button
            key="download"
            type="default"
            icon={<DownloadOutlined />}
            onClick={handleDownloadExcel}
            loading={downloading}
            disabled={importResults.length === 0}
          >
            Download Excel
          </Button>,
          <Button key="back" onClick={closeModal}>
            Close
          </Button>
        ]}
      >
        <div className="mb-4">
          <Space>
            <Tag color="success"><CheckCircleOutlined /> {successCount} successful</Tag>
            <Tag color="error"><CloseCircleOutlined /> {errorCount} failed</Tag>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addNewRecord}
              disabled={editingKey !== ''}
            >
              Add New Record
            </Button>
          </Space>
        </div>

        <Tabs
          defaultActiveKey="all"
          onChange={(key) => setCurrentTab(key)}
        >
          <TabPane tab="All Records" key="all">
            <Form form={form} component={false}>
              <Table
                components={{
                  body: {
                    cell: EditableCell,
                  },
                }}
                columns={mergedColumns}
                dataSource={importResults}
                rowKey="rowNumber"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1300 }}
                rowClassName={(record) => {
                  if (record.rowNumber < 0) return 'bg-blue-50'; // New records
                  return record.isSuccess ? 'bg-green-50' : 'bg-red-50';
                }}
                size="small"
              />
            </Form>
          </TabPane>
          <TabPane tab="Successful" key="success">
            <Table
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              columns={columns} // Use full columns including actions instead of filtering out action column
              dataSource={importResults.filter(r => r.isSuccess)}
              rowKey="rowNumber"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1300 }}
              rowClassName={() => 'bg-green-50'}
              size="small"
            />
          </TabPane>
          <TabPane tab="Failed" key="failed">
            <Form form={form} component={false}>
              <Table
                components={{
                  body: {
                    cell: EditableCell,
                  },
                }}
                columns={mergedColumns}
                dataSource={importResults.filter(r => !r.isSuccess)}
                rowKey="rowNumber"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1300 }}
                rowClassName={(record) => record.rowNumber < 0 ? 'bg-blue-50' : 'bg-red-50'}
                size="small"
              />
            </Form>
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default ImportBooking;