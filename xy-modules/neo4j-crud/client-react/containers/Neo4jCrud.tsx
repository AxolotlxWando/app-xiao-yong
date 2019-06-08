import React from 'react';
import Helmet from 'react-helmet';
import { Query } from 'react-apollo';
import { Row, Col } from 'antd';
import styled from 'styled-components';

import { PageLayout } from '@gqlapp/look-client-react';
import { translate, TranslateFunction } from '@gqlapp/i18n-client-react';
import settings from '@gqlapp/config';

import { GET_ALL_NODES_AND_RELATIONSHIPS } from '../graphql/PredefinedQueries';
import GraphD3 from '../components/GraphD3';

interface CounterProps {
  t: TranslateFunction;
}

const MyRow = (props) => {
  return (
    <Row className={props.className} type={props.type} justify={props.justify}>
      { props.children }
    </Row>
  );
}

const StyledRow = styled(MyRow)`
  > .ant-col:nth-of-type(even) {
    padding: 16px 0;
    background: #00a0e9;
  }
  > .ant-col:nth-of-type(odd) {
    padding: 16px 0;
    background: #4CBCEF;
  }
`;

let FlexGrowCol = styled.div`
  flex: 1;
`;

const Counter = ({ t }: CounterProps) => (
  <PageLayout>
    <Helmet
      title={`${settings.app.name} - ${t('title')}`}
      meta={[
        {
          name: 'description',
          content: `${settings.app.name} - ${t('meta')}`
        }
      ]}
    />
    Hello Neo4j CRUD

    <Query query={ GET_ALL_NODES_AND_RELATIONSHIPS }>
      {({ data, loading, error }) => {
        if (loading) return <p>Content is loading...</p>;
        if (error) return <p>ERROR</p>;
        return <GraphD3 nodes={data.getAllNodesAndRelationships.nodes} links={data.getAllNodesAndRelationships.relationships}/>;
      }}
    </Query>

    <div>
      <p>with a flex: 1 (grow) col</p>
      <StyledRow type="flex">
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <FlexGrowCol className={"ant-col"}>flex: 1</FlexGrowCol>
      </StyledRow>

      <p>nested span=4 and flex: 1 (grow) columns</p>
      <StyledRow type="flex">
        <Col span={4}>col-4</Col>
        <FlexGrowCol className={"ant-col"}>
          <StyledRow type="flex">
            <Col span={4}>col-4</Col>
            <FlexGrowCol className={"ant-col"}>flex: 1</FlexGrowCol>
            <Col span={4}>col-4</Col>
            <Col span={4}>col-4</Col>
          </StyledRow>
        </FlexGrowCol>
      </StyledRow>

      <p>sub-element not specifying justification</p>
      <StyledRow type="flex">
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
      </StyledRow>

      <p>sub-element align left</p>
      <StyledRow type="flex" justify="start">
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
      </StyledRow>

      <p>sub-element align center</p>
      <StyledRow type="flex" justify="center">
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
      </StyledRow>

      <p>sub-element align right</p>
      <StyledRow type="flex" justify="end">
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
      </StyledRow>

      <p>sub-element monospaced arrangement</p>
      <StyledRow type="flex" justify="space-between">
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
      </StyledRow>

      <p>sub-element align full</p>
      <StyledRow type="flex" justify="space-around">
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
      </StyledRow>
    </div>,
  </PageLayout>
);

export default translate('counter')(Counter);
