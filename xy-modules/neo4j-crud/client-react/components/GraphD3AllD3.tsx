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
      properties: PropTypes.object.isRequired
    })
  ),
  links: PropTypes.arrayOf(
    PropTypes.shape({
      identity: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
      properties: PropTypes.object.isRequired
    })
  )
};

interface GraphProps {
  nodes: [NodeShape];
  links: [RelationshipShape];
}

interface LinkShape {
  identity: number;
  type: string;
  source: number;
  target: number;
  properties: object;
}

interface SimNode extends d3Force.SimulationNodeDatum {
  id: number;
  x: number;
  y: number;
}

interface SimLink extends d3Force.SimulationLinkDatum<SimNode> {
  source: SimNode;
  target: SimNode;
}

class Graph extends React.Component<GraphProps> {
  public static propTypes = dataProps;
  private gRef: React.RefObject<SVGSVGElement>;
  private nodesData: [NodeShape];
  private linksData: [LinkShape];
  private simulation: any;
  private graphNodes: d3.Selection<SVGGElement, NodeShape, any, any>;
  private graphLinks: d3.Selection<SVGGElement, LinkShape, any, any>;

  constructor(props: { nodes: [NodeShape]; links: [RelationshipShape] }) {
    super(props);
    this.gRef = React.createRef();
    this.nodesData = _.cloneDeep(this.props.nodes);
    const linksDataRaw = _.cloneDeep(this.props.links);
    linksDataRaw.forEach(function(data) {
      ((data as unknown) as LinkShape).source = data.start;
      delete data.start;
      ((data as unknown) as LinkShape).target = data.end;
      delete data.end;
    });
    this.linksData = (linksDataRaw as unknown) as [LinkShape];
    this.simulation;
    // this.graphNodes = [];
    // this.graphLinks = [];

    this.tickUpdate = this.tickUpdate.bind(this);
    this.drag_start = this.drag_start.bind(this);
    this.drag_drag = this.drag_drag.bind(this);
    this.drag_end = this.drag_end.bind(this);
  }

  public componentWillUnmount() {
    this.simulation.stop();
  }

  public componentDidMount() {
    this.initSim();
  }

  public render() {
    return <StyledSVG width={width} height={height} ref={this.gRef} />;
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

  private tickUpdate() {
    const nodes = d3.selectAll('.graph-nodes g');
    nodes
      .selectAll('text')
      .attr('x', function(d: d3Force.SimulationNodeDatum) {
        return d.x;
      })
      .attr('y', function(d: d3Force.SimulationNodeDatum) {
        return d.y;
      });
    nodes
      .selectAll('circle')
      .attr('cx', function(d: d3Force.SimulationNodeDatum) {
        return d.x;
      })
      .attr('cy', function(d: d3Force.SimulationNodeDatum) {
        return d.y;
      });

    const links = d3.selectAll('.graph-links g');
    links
      .selectAll('text')
      .attr('x', function(d: SimLink) {
        return (d.source.x + d.target.x) / 2;
      })
      .attr('y', function(d: SimLink) {
        return (d.source.y + d.target.y) / 2;
      });
    links
      .selectAll('line')
      .attr('x1', function(d: SimLink) {
        return d.source.x;
      })
      .attr('y1', function(d: SimLink) {
        return d.source.y;
      })
      .attr('x2', function(d: SimLink) {
        return d.target.x;
      })
      .attr('y2', function(d: SimLink) {
        return d.target.y;
      });
  }

  private initSim() {
    // Get g dom
    const d3Graph = d3.select(this.gRef.current);

    // Set up Simulation
    this.simulation = d3.forceSimulation().nodes(this.nodesData);
    this.simulation
      .force('charge_force', d3.forceManyBody().strength(-70))
      .force('center_force', d3.forceCenter(width / 2, height / 2))
      .force(
        'links',
        d3.forceLink(this.linksData).id(function(d: d3Force.SimulationNodeDatum & NodeShape) {
          return d.identity.toString();
        })
      );

    // Bind SVG shapes to data
    this.graphLinks = d3Graph
      .append('g')
      .attr('class', 'graph-links')
      .selectAll('line')
      .data(this.linksData)
      .enter()
      .append('g')
      .attr('class', 'link');
    this.graphLinks.append('text').text(function(d: SimLink & LinkShape) {
      return d.type;
    });
    // .attr('fill', 'black');
    this.graphLinks
      .append('line')
      .attr('stroke-width', 1)
      .style('stroke', 'black');

    this.graphNodes = d3Graph
      .append('g')
      .attr('class', 'graph-nodes')
      .selectAll('circle')
      .data(this.nodesData)
      .enter()
      .append('g')
      .attr('class', 'node');

    this.graphNodes
      .append('circle')
      .attr('r', 15)
      .attr('fill', '#d3d3d3');
    this.graphNodes.append('text').text(function(d: NodeShape) {
      return d.identity;
    });

    // Tick (frame render/ update in d3)
    this.simulation.on('tick', this.tickUpdate);

    const drag_handler = d3
      .drag()
      .on('start', this.drag_start)
      .on('drag', this.drag_drag)
      .on('end', this.drag_end);

    drag_handler(this.graphNodes);
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
