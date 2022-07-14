import React from 'react';
import { message } from 'antd';

const success = () => {
  message.success('This is a success message');
};

const error = () => {
  message.error('This is an error message');
};

const warning = () => {
  message.warning('This is a warning message');
};

export enum NotificationLevel {
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "error"
}


export const displayMessage = (level: NotificationLevel, content: string) => {

    if (level==NotificationLevel.SUCCESS) {
        message.success(content);
    } else if (level==NotificationLevel.WARNING) {
        message.warning(content);
    } else if (level==NotificationLevel.ERROR) {
        message.error(content);
    }

};