import gql from 'graphql-tag';

/* export const CREATE_NODE = gql`
`; */

export const READ_NODE = gql`
  query readNode($identity: Int!) {
    readNode(identity: $identity) {
      identity
      labels
      properties
    }
  }
`;

export const UPDATE_NODE = gql`
  mutation updateNode($identity: Int!, $data: UpdateInput!) {
    updateNode(identity: $identity, data: $data) {
      identity
      labels
      properties
    }
  }
`;

/* export const DELETE_NODE = gql`
`; */
