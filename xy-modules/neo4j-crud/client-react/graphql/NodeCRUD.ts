import gql from 'graphql-tag';

/* export const CREATE_NODE = gql`
`; */

export const READ_NODE = gql`
  query readNode($input: Int!) {
    readNode(identity: $input) {
      identity
      labels
      properties
    }
  }
`;

/* export const UPDATE_NODE = gql`
`;

export const DELETE_NODE = gql`
`; */
