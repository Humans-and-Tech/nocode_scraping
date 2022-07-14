import { message } from 'antd';

export enum NotificationLevel {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

export const displayMessage = (level: NotificationLevel, content: string) => {
  if (level == NotificationLevel.SUCCESS) {
    message.success(content);
  } else if (level == NotificationLevel.WARNING) {
    message.warning(content);
  } else if (level == NotificationLevel.ERROR) {
    message.error(content);
  }
};
