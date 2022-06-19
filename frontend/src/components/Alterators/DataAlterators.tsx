import React from "react";
import { Space } from "antd";
import { RemoveCharAlterator } from './RemoveCharAlterator';

import './Alterators.scoped.css';

/**
 * Alterators are meant to slightly transform
 * data scraped  
 * 
 * @returns a JSX.Element
 */
export const DataAlterators = (): JSX.Element => {


    return (
        <Space direction="vertical" size="middle">

            <RemoveCharAlterator />

        </Space>
    );
}


