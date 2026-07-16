import React, { ReactNode } from "react";
import { Spin } from "antd";

interface LoadingProps {
  /**
   * Whether the loading state is active
   */
  loading?: boolean;
  /**
   * Content to show when loading
   */
  children?: ReactNode;
  /**
   * Custom tip text to display below the spinner
   */
  tip?: string;
  /**
   * Size of the spinner: "small" | "default" | "large"
   */
  size?: "small" | "default" | "large";
  /**
   * Whether to show fullscreen overlay
   */
  fullscreen?: boolean;
  /**
   * Custom className for styling
   */
  className?: string;
}

/**
 * Loading component for API calls and async operations
 * Can be used as a wrapper or standalone spinner
 */
const Loading: React.FC<LoadingProps> = ({
  loading = true,
  children,
  tip,
  size = "default",
  fullscreen = false,
  className = "",
}) => {
  if (!children) {
    if (fullscreen) {
      return (
        <div className={`fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50 ${className}`}>
          <Spin size={size} tip={tip} />
        </div>
      );
    }
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Spin size={size} tip={tip} />
      </div>
    );
  }

  return (
    <Spin spinning={loading} tip={tip} size={size} className={className}>
      {children}
    </Spin>
  );
};

export default Loading;

