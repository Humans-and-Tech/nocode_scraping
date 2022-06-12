import React from "react";
import {
  Layout,
  Row,
  Col,
  Breadcrumb,
  PageHeader,
  Rate,
  Empty,
  List,
} from "antd";
import {
  HomeOutlined,
  FolderOpenOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { FiPackage } from "react-icons/fi";
import "../../style.css";

const { Header, Footer, Sider, Content } = Layout;

const ProductSheetElements: React.FC = () => {
  return (
    <Layout>
      <Header>
        Le header présentera les actions possibles sur cette page (url à
        scraper...)
      </Header>
      <Layout>
        <Sider theme="light">
          Le sider présenter ici les différents layouts possibles (Product
          sheet, category page)
        </Sider>
        <Content>
          <Row>
            <Col>
              <Breadcrumb>
                <Breadcrumb.Item href="">
                  <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item href="">
                  <FolderOpenOutlined />
                  <span>Category</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="">
                  <FolderOpenOutlined />
                  <span>Sub Category</span>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          <Row>
            <Col>
              <PageHeader title="Product Title" subTitle="This is a subtitle" />
            </Col>
          </Row>
          <Row>
            <Col>
              <Rate allowHalf defaultValue={2.5} /> Ratings
            </Col>
          </Row>
          <Row>
            <Col>
              <Row>
                <Col>
                  <Empty
                    image="assets/media-gallery.png"
                    imageStyle={{
                      height: 240,
                    }}
                  ></Empty>
                </Col>
                <Col>
                  <Row>
                    <Col>
                      <List
                        size="large"
                        header={
                          <div>
                            <DollarOutlined />
                            Prices
                          </div>
                        }
                        bordered
                        dataSource={[
                          "Discount Price",
                          "Recommeded Price",
                          "Unit",
                          "currency",
                        ]}
                        renderItem={(item) => <List.Item>{item}</List.Item>}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <List
                        size="large"
                        header={
                          <div>
                            <FiPackage />
                            Delivery info
                          </div>
                        }
                        bordered
                        dataSource={["Mode", "Delay", "Price", "currency"]}
                        renderItem={(item) => <List.Item>{item}</List.Item>}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Content>
      </Layout>
      <Footer>Footer</Footer>
    </Layout>
  );
};

export default ProductSheetElements;
