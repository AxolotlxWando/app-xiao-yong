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

    // Set up Simulation
    this.simulation = d3
      .forceSimulation()
      .nodes(this.nodeData);
    this.simulation
      .force('charge_force', d3.forceManyBody().strength(-100))
      .force('center_force', d3.forceCenter(width / 2, height / 2))
      .force('links', d3.forceLink(this.linkData).id(function(d) { return d.name }));


    const linkData = this.linkData;
    const nodeData = this.nodeData;

    // Bind SVG shapes to data
    this.graphLinks = d3Graph
      .append('g')
        .attr('class', 'graph-links')
      .selectAll('line')
      .data(linkData)
      .enter()
      .append('line')
        .attr('stroke-width', 1)
        .style('stroke', 'black');
    this.graphNode = d3Graph
      .append('g')
        .attr('class', 'graph-nodes')
      .selectAll('circle')
      .data(nodeData)
      .enter()
      .append('circle')
        .attr('r', 15)
        .attr('fill', '#d3d3d3');

    // console.log(`this.graphLinks: ${JSON.stringify(this.graphLinks)}`);
    // console.log(`this.graphNodes: ${JSON.stringify(this.graphNodes)}`);

    const graphNodes = this.graphNodes;
    const graphLinks = this.graphLinks;

    function tickUpdate() {
      d3.selectAll('.graph-nodes circle')
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });
      d3.selectAll('line')
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

    drag_handler(this.graphNode);
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
      nodes: [
        {"name": "Lillian", "sex": "F"},
        {"name": "Gordon", "sex": "M"},
        {"name": "Sylvester", "sex": "M"},
        {"name": "Mary", "sex": "F"},
        {"name": "Helen", "sex": "F"},
        {"name": "Jamie", "sex": "M"},
        {"name": "Jessie", "sex": "F"},
        {"name": "Ashton", "sex": "M"},
        {"name": "Duncan", "sex": "M"},
        {"name": "Evette", "sex": "F"},
        {"name": "Mauer", "sex": "M"},
        {"name": "Fray", "sex": "F"},
        {"name": "Duke", "sex": "M"},
        {"name": "Baron", "sex": "M"},
        {"name": "Infante", "sex": "M"},
        {"name": "Percy", "sex": "M"},
        {"name": "Cynthia", "sex": "F"},
        {"name": "Feyton", "sex": "M"},
        {"name": "Lesley", "sex": "F"},
        {"name": "Yvette", "sex": "F"},
        {"name": "Maria", "sex": "F"},
        {"name": "Lexy", "sex": "F"},
        {"name": "Peter", "sex": "M"},
        {"name": "Ashley", "sex": "F"},
        {"name": "Finkler", "sex": "M"},
        {"name": "Damo", "sex": "M"},
        {"name": "Imogen", "sex": "F"}
      ],
      links: [
      	{"source": "Sylvester", "target": "Gordon", "type":"A" },
        {"source": "Sylvester", "target": "Lillian", "type":"A" },
        {"source": "Sylvester", "target": "Mary", "type":"A"},
        {"source": "Sylvester", "target": "Jamie", "type":"A"},
        {"source": "Sylvester", "target": "Jessie", "type":"A"},
        {"source": "Sylvester", "target": "Helen", "type":"A"},
        {"source": "Helen", "target": "Gordon", "type":"A"},
        {"source": "Mary", "target": "Lillian", "type":"A"},
        {"source": "Ashton", "target": "Mary", "type":"A"},
        {"source": "Duncan", "target": "Jamie", "type":"A"},
        {"source": "Gordon", "target": "Jessie", "type":"A"},
        {"source": "Sylvester", "target": "Fray", "type":"E"},
        {"source": "Fray", "target": "Mauer", "type":"A"},
        {"source": "Fray", "target": "Cynthia", "type":"A"},
        {"source": "Fray", "target": "Percy", "type":"A"},
        {"source": "Percy", "target": "Cynthia", "type":"A"},
        {"source": "Infante", "target": "Duke", "type":"A"},
        {"source": "Duke", "target": "Gordon", "type":"A"},
        {"source": "Duke", "target": "Sylvester", "type":"A"},
        {"source": "Baron", "target": "Duke", "type":"A"},
        {"source": "Baron", "target": "Sylvester", "type":"E"},
        {"source": "Evette", "target": "Sylvester", "type":"E"},
        {"source": "Cynthia", "target": "Sylvester", "type":"E"},
        {"source": "Cynthia", "target": "Jamie", "type":"E"},
        {"source": "Mauer", "target": "Jessie", "type":"E"},
        {"source": "Duke", "target": "Lexy", "type":"A"},
        {"source": "Feyton", "target": "Lexy", "type":"A"},
        {"source": "Maria", "target": "Feyton", "type":"A"},
        {"source": "Baron", "target": "Yvette", "type":"E"},
        {"source": "Evette", "target": "Maria", "type":"E"},
        {"source": "Cynthia", "target": "Yvette", "type":"E"},
        {"source": "Maria", "target": "Jamie", "type":"E"},
        {"source": "Maria", "target": "Lesley", "type":"E"},
        {"source": "Ashley", "target": "Damo", "type":"A"},
        {"source": "Damo", "target": "Lexy", "type":"A"},
        {"source": "Maria", "target": "Feyton", "type":"A"},
        {"source": "Finkler", "target": "Ashley", "type":"E"},
        {"source": "Sylvester", "target": "Maria", "type":"E"},
        {"source": "Peter", "target": "Finkler", "type":"E"},
        {"source": "Ashley", "target": "Gordon", "type":"E"},
        {"source": "Maria", "target": "Imogen", "type":"E"}
      ]
    }
  }

  updateData() {
    // var newState = randomData(this.state.nodes, width, height);
    const newState = {
      nodes: [
        {"name": "Lillian", "sex": "F"},
        {"name": "Gordon", "sex": "M"},
        {"name": "Sylvester", "sex": "M"},
        {"name": "Mary", "sex": "F"},
        {"name": "Helen", "sex": "F"},
        {"name": "Jamie", "sex": "M"},
        {"name": "Jessie", "sex": "F"},
        {"name": "Ashton", "sex": "M"},
        {"name": "Duncan", "sex": "M"},
        {"name": "Evette", "sex": "F"},
        {"name": "Mauer", "sex": "M"},
        {"name": "Fray", "sex": "F"},
        {"name": "Duke", "sex": "M"},
        {"name": "Baron", "sex": "M"},
        {"name": "Infante", "sex": "M"},
        {"name": "Percy", "sex": "M"},
        {"name": "Cynthia", "sex": "F"},
        {"name": "Feyton", "sex": "M"},
        {"name": "Lesley", "sex": "F"},
        {"name": "Yvette", "sex": "F"},
        {"name": "Maria", "sex": "F"},
        {"name": "Lexy", "sex": "F"},
        {"name": "Peter", "sex": "M"},
        {"name": "Ashley", "sex": "F"},
        {"name": "Finkler", "sex": "M"},
        {"name": "Damo", "sex": "M"},
        {"name": "Imogen", "sex": "F"}
      ],
      links: [
      	{"source": "Sylvester", "target": "Gordon", "type":"A" },
        {"source": "Sylvester", "target": "Lillian", "type":"A" },
        {"source": "Sylvester", "target": "Mary", "type":"A"},
        {"source": "Sylvester", "target": "Jamie", "type":"A"},
        {"source": "Sylvester", "target": "Jessie", "type":"A"},
        {"source": "Sylvester", "target": "Helen", "type":"A"},
        {"source": "Helen", "target": "Gordon", "type":"A"},
        {"source": "Mary", "target": "Lillian", "type":"A"},
        {"source": "Ashton", "target": "Mary", "type":"A"},
        {"source": "Duncan", "target": "Jamie", "type":"A"},
        {"source": "Gordon", "target": "Jessie", "type":"A"},
        {"source": "Sylvester", "target": "Fray", "type":"E"},
        {"source": "Fray", "target": "Mauer", "type":"A"},
        {"source": "Fray", "target": "Cynthia", "type":"A"},
        {"source": "Fray", "target": "Percy", "type":"A"},
        {"source": "Percy", "target": "Cynthia", "type":"A"},
        {"source": "Infante", "target": "Duke", "type":"A"},
        {"source": "Duke", "target": "Gordon", "type":"A"},
        {"source": "Duke", "target": "Sylvester", "type":"A"},
        {"source": "Baron", "target": "Duke", "type":"A"},
        {"source": "Baron", "target": "Sylvester", "type":"E"},
        {"source": "Evette", "target": "Sylvester", "type":"E"},
        {"source": "Cynthia", "target": "Sylvester", "type":"E"},
        {"source": "Cynthia", "target": "Jamie", "type":"E"},
        {"source": "Mauer", "target": "Jessie", "type":"E"},
        {"source": "Duke", "target": "Lexy", "type":"A"},
        {"source": "Feyton", "target": "Lexy", "type":"A"},
        {"source": "Maria", "target": "Feyton", "type":"A"},
        {"source": "Baron", "target": "Yvette", "type":"E"},
        {"source": "Evette", "target": "Maria", "type":"E"},
        {"source": "Cynthia", "target": "Yvette", "type":"E"},
        {"source": "Maria", "target": "Jamie", "type":"E"},
        {"source": "Maria", "target": "Lesley", "type":"E"},
        {"source": "Ashley", "target": "Damo", "type":"A"},
        {"source": "Damo", "target": "Lexy", "type":"A"},
        {"source": "Maria", "target": "Feyton", "type":"A"},
        {"source": "Finkler", "target": "Ashley", "type":"E"},
        {"source": "Sylvester", "target": "Maria", "type":"E"},
        {"source": "Peter", "target": "Finkler", "type":"E"},
        {"source": "Ashley", "target": "Gordon", "type":"E"},
        {"source": "Maria", "target": "Imogen", "type":"E"}
      ]
    }
    this.setState(newState);
  }

  componentDidMount() {
    this.updateData();
  }

  render() {
    return (
      <div>
        <div className="update" onClick={this.updateData}>update</div>
        <Graph nodes={this.state.nodes} links={this.state.links} />
      </div>
    );
  }
}

<div class="update" onClick="update()">update</update>

export default GraphContainer;
