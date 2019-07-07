import React from 'react';
import Helmet from 'react-helmet';
import { Query, Mutation } from 'react-apollo';
import { Row, Col } from 'antd';
import styled from 'styled-components';

import { Formik, Field, Form, ErrorMessage } from 'formik';

import { PageLayout } from '@gqlapp/look-client-react';
import { translate, TranslateFunction } from '@gqlapp/i18n-client-react';
import settings from '@gqlapp/config';

import { GET_ALL_NODES_AND_RELATIONSHIPS } from '../graphql/PredefinedQueries';
import { READ_NODE, UPDATE_NODE } from '../graphql/NodeCRUD';
import GraphD4 from '../components/GraphD4';

interface CounterProps {
  t: TranslateFunction;
}

const MyRow = (props: any) => {
  return (
    <Row className={props.className} type={props.type} justify={props.justify}>
      {props.children}
    </Row>
  );
};

const StyledRow = styled(MyRow)`
  > .ant-col:nth-of-type(even) {
    padding: 16px 0;
    background: #00a0e9;
  }
  > .ant-col:nth-of-type(odd) {
    padding: 16px 0;
    background: #4cbcef;
  }
`;

const FlexGrowCol = styled.div`
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
    <Query query={READ_NODE} variables={{ identity: 0 }}>
      {({ data, loading, error }: any) => {
        if (loading) {
          return <p>Content is loading...</p>;
        }
        if (error) {
          return <p>`ERROR: ${error.message}`</p>;
        }
        const node = data.readNode;
        const message = `identity: ${node.identity}, labels: ${JSON.stringify(
          node.labels
        )}}, properties: ${JSON.stringify(node.properties)}`;

        return (
          <div>
            {message}
            <Mutation mutation={UPDATE_NODE}>
              {(updateNode, { data }) => (
                <Formik
                  initialValues={node /* { identity, labels, properties } */}
                  onSubmit={(values, actions) => {
                    console.log(`node: ${JSON.stringify(node)}`);
                    node.labels.push(`${node.labels[0]}${node.labels.length}`);
                    // node.labels = ['Movie'];
                    updateNode({
                      variables: {
                        identity: node.identity,
                        data: {
                          labels: node.labels
                        }
                      }
                    });
                  }}
                  render={({ errors, status, touched, isSubmitting }) => (
                    <Form>
                      <Field type="number" name="identity" />
                      <ErrorMessage name="identity" component="div" />
                      <Field type="text" className="error" name="labels" />
                      <ErrorMessage name="labels">
                        {errorMessage => <div className="error">{errorMessage}</div>}
                      </ErrorMessage>
                      <Field type="text" name="properties" />
                      <ErrorMessage name="properties" className="error" component="div" />
                      {status && status.msg && <div>{status.msg}</div>}
                      <button type="submit" disabled={isSubmitting}>
                        Submit
                      </button>
                    </Form>
                  )}
                />
              )}
            </Mutation>
          </div>
        );
      }}
    </Query>
    Hello Neo4j CRUD
    <Query query={GET_ALL_NODES_AND_RELATIONSHIPS}>
      {({ data, loading, error }: any) => {
        if (loading) {
          return <p>Content is loading...</p>;
        }
        if (error) {
          return <p>ERROR</p>;
        }
        return (
          <GraphD4
            nodes={data.getAllNodesAndRelationships.nodes}
            links={data.getAllNodesAndRelationships.relationships}
          />
        );
      }}
    </Query>
    <div>
      <p>with a flex: 1 (grow) col</p>
      <StyledRow type="flex">
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <Col span={4}>col-4</Col>
        <FlexGrowCol className={'ant-col'}>flex: 1</FlexGrowCol>
      </StyledRow>

      <p>nested span=4 and flex: 1 (grow) columns</p>
      <StyledRow type="flex">
        <Col span={4}>col-4</Col>
        <FlexGrowCol className={'ant-col'}>
          <StyledRow type="flex">
            <Col span={4}>col-4</Col>
            <FlexGrowCol className={'ant-col'}>flex: 1</FlexGrowCol>
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
    </div>
    ,
  </PageLayout>
);

export default translate('counter')(Counter);
