import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { mapOf, orderedMapOf } from 'react-immutable-proptypes';
import invariant from 'invariant';

import { setZoom } from '../actions/flow.actions';
import ZoomHandler from './ZoomHandler.component';
import { NodeType, PortType } from '../constants/flowdesigner.proptypes';
import NodesRenderer from './node/NodesRenderer.component';
import LinksRenderer from './link/LinksRenderer.component';
import PortsRenderer from './port/PortsRenderer.component';

import { moveNodeTo, moveNodeToEnd } from '../actions/node.actions';
import { setNodeTypes } from '../actions/nodeType.actions';


export class FlowDesigner extends React.Component {
	static propTypes = {
		children: PropTypes.node,
		setNodeTypes: PropTypes.func.isRequired,
		moveNodeTo: PropTypes.func.isRequired,
		nodes: mapOf(NodeType).isRequired,
		ports: orderedMapOf(PortType).isRequired,
		links: mapOf(PropTypes.object).isRequired,
	}

	constructor(props) {
		super(props);
		this.state = {
			nodeTypeMap: {},
			linkTypeMap: {},
			portTypeMap: {},
		};
	}

	componentWillMount() {
		const { children } = this.props;
		let nodeTypeMap = {};
		let linkTypeMap = {};
		let portTypeMap = {};
		if (children) {
			children.forEach((element) => {
				switch (element.type.displayName) {
				case 'NodeType':
					nodeTypeMap = Object.assign(
						{},
						nodeTypeMap,
						{
							[element.props.type]: {
								component: element.props.component,
							},
						},
					);
					break;
				case 'LinkType':
					linkTypeMap = Object.assign(
						{},
						linkTypeMap,
						{
							[element.props.type]: {
								component: element.props.component,
							},
						},
					);
					break;
				case 'PortType':
					portTypeMap = Object.assign(
						{},
						portTypeMap,
						{
							[element.props.type]: {
								component: element.props.component,
							},
						},
					);
					break;
				default:
					invariant(
					false,
					`<${element.type.displayName} /> is an unknown component configuration`,
				);
				}
			});
		} else {
			invariant(false, '<FlowDesigner /> should have configuration component as child');
		}

		this.props.setNodeTypes(nodeTypeMap);
		this.setState({ nodeTypeMap, linkTypeMap, portTypeMap });
	}

	render() {
		return (
			<svg onClick={this.props.onClick} ref={c => (this.node = c)} width="100%">
				<defs>
					<filter id="blur-filter" width="1.5" height="1.5" x="-.25" y="-.25">
						<feFlood floodColor="#01A7CF" result="COLOR" />
						<feComposite in="COLOR" in2="SourceGraphic" operator="in" result="shadow" />
						<feGaussianBlur in="shadow" stdDeviation="3" />
						<feOffset dx="0" dy="0" />
						<feMerge>
							<feMergeNode />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>
				<ZoomHandler
					transform={this.props.transform}
					transformToApply={this.props.transformToApply}
					setZoom={this.props.setZoom}
				>
					<NodesRenderer
						nodeTypeMap={this.state.nodeTypeMap}
						moveNodeTo={this.props.moveNodeTo}
						moveNodeToEnd={this.props.moveNodeToEnd}
						nodes={this.props.nodes}
					/>
					<PortsRenderer
						portTypeMap={this.state.portTypeMap}
						ports={this.props.ports}
					/>
					<LinksRenderer
						linkTypeMap={this.state.linkTypeMap}
						links={this.props.links}
						ports={this.props.ports}
					/>
				</ZoomHandler>
			</svg>
		);
	}
}

const mapStateToProps = state => ({
	nodes: state.flowDesigner.get('nodes'),
	links: state.flowDesigner.get('links'),
	ports: state.flowDesigner.get('ports'),
	transform: state.flowDesigner.get('transform'),
	transformToApply: state.flowDesigner.get('transformToApply'),
});


const mapDispatchToProps = dispatch => ({
	setNodeTypes: nodeTypeMap => dispatch(setNodeTypes(nodeTypeMap)),
	moveNodeTo: (nodId, nodePosition) => (dispatch(moveNodeTo(nodId, nodePosition))),
	moveNodeToEnd: (nodId, nodePosition) => (dispatch(moveNodeToEnd(nodId, nodePosition))),
	setZoom: transform => dispatch(setZoom(transform)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FlowDesigner);
