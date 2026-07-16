import { Button, Checkbox, Form, Input } from 'antd';
import React, { useEffect } from 'react';
import { IoBus } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LoginFormValues {
  email: string;
  password: string;
  remember?: boolean;
}

const Login: React.FC = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const nav = useNavigate();
  const { login, authenticated } = useAuth();

  useEffect(() => {
    if (authenticated) {
      nav('/');
    }
  }, [authenticated, nav]);

  const onFinish = async (values: LoginFormValues): Promise<void> => {
    try {
      await login({ email: values.email, password: values.password });
    } catch (error) {
      form.setFields([
        {
          name: 'email',
          errors: [''],
        },
        {
          name: 'password',
          errors: ['Email or Password is incorrect'],
        },
      ]);
      setTimeout(() => {
        form.setFieldValue('password', '');
      }, 2000);
    }
  };

  return (
    <div className='bg-blue-100 h-screen flex items-center justify-center'>
      <Form
        form={form}
        onFinish={onFinish}
        layout='vertical'
        className='bg-white w-[400px] p-5 rounded-lg'
      >
        <p className='text-center font-bold text-3xl mb-4 text-[#1677ff] flex justify-center items-center gap-2'>
          <IoBus className="text-yellow-300 text-3xl" />BusBooker
        </p>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập email của bạn!',
            },
            {
              type: 'email',
              message: 'Vui lòng nhập một địa chỉ email hợp lệ!',
            },
          ]}
        >
          <Input placeholder='Nhập email của bạn' className='p-2' />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập mật khẩu của bạn!',
            },
            {
              min: 6,
              message: 'Mật khẩu phải có ít nhất 6 ký tự!',
            },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu của bạn" className='p-2' />
        </Form.Item>
        <Form.Item valuePropName="checked" label={null}>
          <div className='flex w-full items-center justify-between'>
            <Checkbox>Remember me</Checkbox>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className='w-full py-4'>
            Đăng nhập
          </Button>
        </Form.Item>
        <div className='flex items-center justify-center gap-2'>
          <p>Bạn chưa có tài khoản?</p>
          <Link className='text-[#1677ff]' to="/register">Đăng ký</Link>
        </div>
      </Form>
    </div>
  );
};

export default Login;

