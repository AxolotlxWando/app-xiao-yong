import React from 'react';
import ForceGraphWithDrag from './ForceGraphWithDrag';
import ForceGraphNodeWithDrag from './ForceGraphNodeWithDrag';
// import { ForceGraph, ForceGraphNode, ForceGraphLink } from 'react-vis-force';
import { ForceGraphLink } from 'react-vis-force';

import { NodeShape, RelationshipShape } from '../graphql/types';

const width = 960;
const height = 500;

interface D4NodeData {
  id: number;
}

interface D4LinkData {
  source: number;
  target: number;
}

interface IProps {
  nodes: [NodeShape];
  links: [RelationshipShape];
  setSelectedNode(id: number): void;
}

const GraphD4: React.FC<IProps> = (props: IProps) => {
  const [d4NodesData, setD4NodesData] = React.useState([]);
  const [d4LinksData, setD4LinksData] = React.useState([]);

  React.useEffect(() => {
    setD4NodesData(
      props.nodes.map((node: NodeShape) => {
        return { id: node.identity.toString() };
      })
    );
    setD4LinksData(
      props.links.map((link: RelationshipShape) => {
        return { source: link.start, target: link.end, value: 1 };
      })
    );
    return;
  }, [props.nodes, props.links]);

  // console.log(`nodes: ${JSON.stringify(d4NodesData, null, 2)}`);
  // console.log(`links: ${JSON.stringify(d4LinksData, null, 2)}`);

  if (d4NodesData.length === 0 || d4LinksData.length === 0) {
    return <p>Loading data</p>;
  }

  return (
    <ForceGraphWithDrag
      simulationOptions={{
        /* height: height, width: width, */
        animate: true
      }}
    >
      {d4NodesData.map((d4NodeData: D4NodeData, index: number) => {
        return (
          <ForceGraphNodeWithDrag key={index} node={d4NodeData} setSelectedNode={props.setSelectedNode} fill="grey" />
        );
      })}
      {d4LinksData.map((d4LinkData: D4LinkData, index: number) => {
        return <ForceGraphLink key={index} link={d4LinkData} />;
      })}
    </ForceGraphWithDrag>
  );
};

export default GraphD4;
