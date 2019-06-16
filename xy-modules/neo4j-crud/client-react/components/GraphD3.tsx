import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import * as d3 from 'd3';
import * as d3Force from 'd3-force';
import _ from 'lodash';

import { NodeShape, RelationshipShape } from '../graphql/types';

const width = 960;
const height = 500;

const StyledSVG = styled.svg`
  .graph-links line {
    stroke: #999;
    stroke-opacity: 0.6;
  }

  .graph-nodes circle {
    stroke: black;
    stroke-width: 0px;
  }
`;

const dataProps = {
  nodes: PropTypes.arrayOf(
    PropTypes.shape({
      identity: PropTypes.number.isRequired,
      labels: PropTypes.arrayOf(PropTypes.string.isRequired),
      properties: PropTypes.object
    })
  ),
  links: PropTypes.arrayOf(
    PropTypes.shape({
      identity: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
      properties: PropTypes.object
    })
  )
};

// Node and Link Shape Datum
interface LinkShape {
  identity: number;
  type: string;
  source: number;
  target: number;
  properties?: object;
}

// Node and Link Shpae from d3 for force sim and positions
interface SimNode extends d3Force.SimulationNodeDatum {
  id: number;
  x: number;
  y: number;
}

interface SimLink extends d3Force.SimulationLinkDatum<SimNode> {
  source: SimNode;
  target: SimNode;
}

interface NodeProps {
  data: NodeShape & SimNode;
  simulation: any;
  setNodeState: any;
}

interface NodeStates {
  isDragging: boolean;
}

interface LinkProps {
  data: LinkShape & SimLink;
}

interface GraphProps {
  nodes: [NodeShape];
  links: [RelationshipShape];
}

interface GraphStates {
  nodes: [NodeShape & SimNode];
  links: [LinkShape & SimLink];
}

class Node extends React.Component<NodeProps, NodeStates> {
  constructor(props: NodeProps) {
    super(props);

    this.state = {
      isDragging: false
    };

    this.drag_start = this.drag_start.bind(this);
    this.drag_drag = this.drag_drag.bind(this);
    this.drag_end = this.drag_end.bind(this);
  }

  public componentDidMount() {}

  public componentDidUpdate() {}

  public render() {
    return (
      <g className="node">
        <circle
          r="15"
          fill="#d3d3d3"
          cx={this.props.data.x}
          cy={this.props.data.y}
          onMouseDown={e => {
            this.drag_start(e);
          }}
          onMouseMove={e => {
            this.drag_drag(e);
          }}
          onMouseUp={e => {
            this.drag_end(e);
          }}
        />
        <text x={this.props.data.x} y={this.props.data.y}>
          {this.props.data.identity}
        </text>
      </g>
    );
  }
  private drag_start(e: any) {
    const d: d3Force.SimulationNodeDatum = _.cloneDeep(this.props.data);
    this.setState({
      isDragging: true
    });
    d.fx = this.props.data.x;
    d.fy = this.props.data.y;
    this.props.setNodeState(this.props.data.identity, d);
    console.log(`Mouse down: e.clientX, e.clientY: ${e.clientX}, ${e.clientY}`);
  }

  // make sure you can't drag the circle outside the box
  private drag_drag(e: any) {
    if (this.state.isDragging) {
      const d: d3Force.SimulationNodeDatum = _.cloneDeep(this.props.data);
      d.fx = e.clientX;
      d.fy = e.clientY;
      this.props.setNodeState(this.props.data.identity, d);
      console.log(`Mouse move: e.clientX, e.clientY: ${e.clientX}, ${e.clientY}`);
    }
    console.log(`Mouse move: this.state.isDragging: ${this.state.isDragging}`);
  }

  private drag_end(e: any) {
    const d: d3Force.SimulationNodeDatum = _.cloneDeep(this.props.data);
    this.setState({
      isDragging: false
    });
    d.fx = null;
    d.fy = null;
    this.props.setNodeState(this.props.data.identity, d);
    console.log(`Drag end: e.clientX, e.clientY: ${e.clientX}, ${e.clientY}`);
  }
}

class Link extends React.Component<LinkProps> {
  public componentDidMount() {}

  public componentDidUpdate() {}

  public render() {
    return (
      <g className="link">
        <line
          x1={this.props.data.source.x}
          y1={this.props.data.source.y}
          x2={this.props.data.target.x}
          y2={this.props.data.target.y}
        />
        <text
          x={(this.props.data.source.x + this.props.data.target.x) / 2}
          y={(this.props.data.source.y + this.props.data.target.y) / 2}
        >
          {this.props.data.type}
        </text>
      </g>
    );
  }
}

class Graph extends React.Component<GraphProps, GraphStates> {
  public static propTypes = dataProps;
  private nodesData: [NodeShape & SimNode];
  private linksData: [LinkShape & SimLink];
  private simulation: any;

  constructor(props: { nodes: [NodeShape]; links: [RelationshipShape] }) {
    super(props);
    const nodesDataRaw = _.cloneDeep(this.props.nodes);
    nodesDataRaw.forEach(function(data) {
      ((data as unknown) as NodeShape & SimNode).x = 0;
      ((data as unknown) as NodeShape & SimNode).y = 0;
    });
    const linksDataRaw = _.cloneDeep(this.props.links);
    linksDataRaw.forEach(function(data) {
      ((data as unknown) as LinkShape).source = data.start;
      delete data.start;
      ((data as unknown) as LinkShape).target = data.end;
      delete data.end;
    });
    this.nodesData = (nodesDataRaw as unknown) as [NodeShape & SimNode];
    this.linksData = (linksDataRaw as unknown) as [LinkShape & SimLink];

    this.state = {
      nodes: this.nodesData,
      links: this.linksData
    };
    this.initSim();

    this.initSim = this.initSim.bind(this);
    this.setNodeState = this.setNodeState.bind(this);
    this.drag_start = this.drag_start.bind(this);
    this.drag_drag = this.drag_drag.bind(this);
    this.drag_end = this.drag_end.bind(this);
  }

  public componentWillUnmount() {
    this.simulation.stop();
  }

  public componentDidMount() {}

  public render() {
    const nodes = _.map(this.state.nodes, (node, index) => {
      return <Node data={node} key={node.identity} setNodeState={this.setNodeState} simulation={this.simulation} />;
    });
    const links = _.map(this.state.links, (link, index) => {
      return <Link data={link} key={link.identity} />;
    });
    return (
      <StyledSVG width={width} height={height}>
        <g className="graph-links">{links}</g>
        <g className="graph-nodes">{nodes}</g>
      </StyledSVG>
    );
  }

  private setNodeState(id: number, data: NodeShape & SimNode) {
    this.state.nodes[id] = data;
    this.setState({
      nodes: this.state.nodes
    });
  }

  private drag_start(d: d3Force.SimulationNodeDatum) {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  }

  // make sure you can't drag the circle outside the box
  private drag_drag(d: d3Force.SimulationNodeDatum) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  private drag_end(d: d3Force.SimulationNodeDatum) {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  }

  private initSim() {
    // Set up Simulation
    this.simulation = d3.forceSimulation().nodes(this.state.nodes);
    this.simulation
      .force('charge_force', d3.forceManyBody().strength(-40))
      .force('center_force', d3.forceCenter(width / 2, height / 2))
      .force(
        'links',
        d3.forceLink(this.state.links).id(function(d: d3Force.SimulationNodeDatum & NodeShape) {
          return d.identity.toString();
        })
      );

    // Tick (frame render/ update in d3)
    this.simulation.on('tick', () => {
      this.setState({
        nodes: this.state.nodes,
        links: this.state.links
      });
    });

    /* const drag_handler = d3
      .drag()
      .on('start', this.drag_start)
      .on('drag', this.drag_drag)
      .on('end', this.drag_end);

    drag_handler(this.graphNodes); */
  }
}

class GraphContainer extends React.Component<GraphProps> {
  public static propTypes = dataProps;

  constructor(props: { nodes: [NodeShape]; links: [RelationshipShape] }) {
    super(props);
  }

  public updateData() {}

  public componentDidMount() {}

  public render() {
    return (
      <div>
        <Graph nodes={this.props.nodes} links={this.props.links} />
        <div className="update" onClick={this.updateData}>
          update
        </div>
      </div>
    );
  }
}

// <div class="update" onClick="update()">update</update>

export default GraphContainer;
