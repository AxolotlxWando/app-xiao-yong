import gql from 'graphql-tag';

export default gql`
  # Movie Sample
  type Movie {
    title: String!
    released: Int
    tagline: String
  }

  # Generic Neo4j Types
  type Node {
    identity: Int!
    labels: [String]!
    properties: JSON!
  }

  type Relationship {
    identity: Int!
    start: Int!
    end: Int!
    type: String!
    properties: JSON!
  }

  type NodesAndRelationships {
    nodes: [Node]!
    relationships: [Relationship]!
  }

  extend type Query {
    # Prewritten Queries
    neo4jMovies(searchKeyword: String): [Movie]!
    getAllNodes: [Node]
    getAllNodesAndRelationships: NodesAndRelationships

    # Neo4j CRUD - Read
    readNode(identity: Int!): Node
    readRelationship(identity: Int!): Relationship
  }

  input UpdateInput {
    labels: [String]
    properties: JSON
  }

  extend type Mutation {
    ### Neo4j CRUD - Node ###
    createNode(labels: [String], properties: JSON): Node

    updateNode(identity: Int!, data: UpdateInput!): Node

    deleteNode(identity: Int!): Boolean

    ### Neo4j CRUD -Relationship ###
    createRelationship(type: String, start: Int!, end: Int!, properties: JSON!): Relationship

    updateRelationship(identity: Int!, type: String, start: Int, end: Int, properties: JSON): Relationship

    deleteRelationship(identity: Int!): Boolean
  }
`;
