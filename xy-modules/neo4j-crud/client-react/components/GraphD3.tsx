import React from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import _ from 'lodash';

function randomData(nodes) {
  let oldNodes = nodes;
  // generate some data randomly
  nodes = _.chain(_.range(_.random(10, 20)))
    .map(function() {
      var node = {};
      node.key = _.random(0, 30);
      node.weight = _.random(4, 10);

      return node;
    }).uniq(function(node) {
      return node.key
    }).value();

  if (oldNodes) {
    var add = _.initial(oldNodes, _.random(0, oldNodes.length));
    add = _.drop(add, _.random(0, add.length));

    nodes = _.union(nodes, add);
  }

  let links = _.map(_.range(_.random(15, 25)), function() {
      var link = {};
      link.source = _.random(0, nodes.length - 1);
      link.target = _.random(0, nodes.length - 1);
      link.weight = _.random(1, 3);

      return link;
  });

  return { nodes, links };
}

var width = 960;
var height = 500;

const StyledSVG = styled.svg`
  .graph-links line {
    stroke: #999;
    stroke-opacity: 0.6;
  }

  .graph-nodes circle {
    stroke: black	;
    stroke-width: 0px;
  }
`;

class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.gRef = React.createRef();
    this.nodeData = _.cloneDeep(props.nodes);
    this.linkData = _.cloneDeep(props.links);
    this.simulation;
    this.graphNodes = [];
    this.graphLinks = [];
  }

  componentDidMount() {
    // Get g dom
    let d3Graph = d3.select(this.gRef.current);
    // console.log(`###### gRef is nulll?????? ${this.gRef}, ${this.gRef.current}`);
    // console.log(`###### d3Graph is nulll?????? ${d3Graph}`);

    this.linkData.forEach( function(data) {
      data['source'] = data['start'];
      delete data['start'];
      data['target'] = data['end'];
      delete data['end'];
    });
        const linkData = this.linkData;
        const nodeData = this.nodeData;

        console.log(`this.props: ${JSON.stringify(this.props)}`);
        console.log(`this.nodeNata: ${JSON.stringify(this.nodeData)}`);
        console.log(`nodeData: ${JSON.stringify(nodeData)}`);
        console.log(`this.linkData: ${JSON.stringify(this.linkData)}`);
        console.log(`linkData: ${JSON.stringify(linkData)}`);

    // Set up Simulation
    this.simulation = d3
      .forceSimulation()
      .nodes(this.nodeData);
    this.simulation
      .force('charge_force', d3.forceManyBody().strength(-100))
      .force('center_force', d3.forceCenter(width / 2, height / 2))
      .force('links', d3.forceLink(linkData).id(function(d) { return d.identity }));

    // Bind SVG shapes to data
    this.graphLinks = d3Graph
      .append('g')
        .attr('class', 'graph-links')
      .selectAll('line')
      .data(linkData)
      .enter()
      .append('g')
      .attr('class', 'link');
    this.graphLinks
      .append('text').text(function (d) {return d.type});
      //.attr('fill', 'black');
    this.graphLinks
      .append('line')
        .attr('stroke-width', 1)
        .style('stroke', 'black');

    this.graphNodes = d3Graph
      .append('g')
        .attr('class', 'graph-nodes')
      .selectAll('circle')
      .data(nodeData)
      .enter()
      .append('g')
      .attr('class', 'node');

    this.graphNodes
      .append('circle')
        .attr('r', 15)
        .attr('fill', '#d3d3d3');
    this.graphNodes
      .append('text').text(function (d) {return d.identity});
      //.attr('fill', 'black');

    // console.log(`this.graphLinks: ${JSON.stringify(this.graphLinks)}`);
    // console.log(`this.graphNodes: ${JSON.stringify(this.graphNodes)}`);

    const graphNodes = this.graphNodes;
    const graphLinks = this.graphLinks;

    function tickUpdate() {
      const nodes = d3.selectAll('.graph-nodes');
      nodes.selectAll('text')
        .attr('x', function(d) { return d.x; })
        .attr('y', function(d) { return d.y; });
      nodes.selectAll('circle')
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });

      const links = d3.selectAll('.graph-links g');
      links.selectAll('text')
        .attr('x', function(d) { return (d.source.x + d.target.x) / 2; })
        .attr('y', function(d) { return (d.source.y + d.target.y) / 2; });
      links.selectAll('line')
        .attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });
    }

    // Tick (frame render/ update in d3)
    this.simulation.on('tick', tickUpdate)

    const drag_handler = d3.drag()
      .on('start', drag_start.bind(this))
      .on('drag', drag_drag.bind(this))
      .on('end', drag_end.bind(this));

    //Drag functions
    //d is the node
    function drag_start(d) {
     if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    //make sure you can't drag the circle outside the box
    function drag_drag(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function drag_end(d) {
      if (!d3.event.active) this.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    drag_handler(this.graphNodes);
  }

  componentWillUnmount() {
    this.simulation.stop();
  }

  render() {
    return (
      <StyledSVG width={width} height={height} ref={this.gRef}>
      </StyledSVG>
    );
  }
}

class GraphContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      links: []
    };
  }

  updateData() {
    // var newState = randomData(this.state.nodes, width, height);
    const newState = {
      nodes: [],
      links: []
    };
    this.setState(newState);
  }

  componentDidMount() {
    this.updateData();
  }

  render() {
    return (
      <div>
        <Graph nodes={this.props.nodes} links={this.props.links} />
        <div className="update" onClick={this.updateData}>update</div>
        <div>
          Query Result:
          Props: {JSON.stringify(this.props, null, '  ')}
          Nodes: {JSON.stringify(this.props.nodes, null, '  ')}
          Links: {JSON.stringify(this.props.links, null, '  ')}
        </div>
      </div>
    );
  }
}

// <div class="update" onClick="update()">update</update>

export default GraphContainer;
