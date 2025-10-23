import { Form, Input, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function UploadField({ field }) {
    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };
    return (
        <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={field.rules}
            tooltip={field.tooltip}
        >
            <Upload
                listType={field.listType || 'picture-card'}
                beforeUpload={field.beforeUpload || (() => false)}
                maxCount={field.maxCount || 1}
                accept={field.accept || 'image/*'}
                onPreview={field.onPreview}
                disabled={field.disabled}
                multiple={field.multiple}
                onRemove={field.onRemove}
                onChange={field.onChange}
                customRequest={field.customRequest}
            >
                {field.uploadButton || (
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>
                            {field.uploadText || 'Upload'}
                        </div>
                    </div>
                )}
            </Upload>
        </Form.Item>
    );
}
