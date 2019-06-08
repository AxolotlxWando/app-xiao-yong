import gql from 'graphql-tag';

export const GET_ALL_NODES = gql`
`;

export const GET_ALL_NODES_AND_RELATIONSHIPS = gql`
  mutation {
    getAllNodesAndRelationships {
      nodes {
        identity
        labels
        properties
      }
      relationships {
        identity
        type
        start
        end
      }
  }
`;
